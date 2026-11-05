import { system, Player } from "@minecraft/server";
import { ActionFormData, ModalFormData, MessageFormData } from "@minecraft/server-ui";
import { COLORS, COLORS_BY_ID } from "../Data/Colors.js";
import { EFFECTS, EFFECT_IDS, NO_EFFECT } from "../Data/Effects.js";
import { getConfig, getMapping, setMapping, setSettings, resetMappings } from "../Systems/Config.js";
import { startTracker } from "../Systems/EffectTracker.js";
import { MODE_CLOSEST, MODE_PRIMARY } from "../Systems/ColorResolver.js";

const EFFECT_CHOICES = ["None", ...EFFECTS.map((effect) => effect.name)];
const EFFECT_VALUES = [NO_EFFECT, ...EFFECT_IDS];
const MODE_CHOICES = ["Closest Color", "Primary Color"];
const MODE_VALUES = [MODE_CLOSEST, MODE_PRIMARY];

/**
 * Shows a form, retrying while the player is busy with another screen.
 * @param {ActionFormData | ModalFormData | MessageFormData} form Form to display.
 * @param {Player} player Player to show the form to.
 * @returns {Promise<Object>} The form response.
 */
export async function showSafe(form, player) {
    let response = await form.show(player);
    while (response.canceled && response.cancelationReason === "UserBusy") {
        await new Promise((resolve) => system.run(resolve));
        response = await form.show(player);
    }
    return response;
}

/**
 * Builds the summary line shown on a color button.
 * @param {string} colorId Color ID to summarize.
 * @returns {string} Button label text.
 */
function describeColor(colorId) {
    const color = COLORS_BY_ID.get(colorId);
    const mapping = getMapping(colorId);
    if (mapping.effect === NO_EFFECT) {
        return `${color.code}${color.name}§r\n§8No effect§r`;
    }
    const effect = EFFECTS.find((entry) => entry.id === mapping.effect);
    const name = effect === undefined ? "???" : effect.name;
    return `${color.code}${color.name}§r\n§8${name} ${mapping.amplifier + 1}§r`;
}

/**
 * Opens the editor for a single color mapping.
 * @param {Player} player Player editing the mapping.
 * @param {string} colorId Color ID being edited.
 * @returns {Promise<void>}
 */
async function openColorEditor(player, colorId) {
    const color = COLORS_BY_ID.get(colorId);
    const mapping = getMapping(colorId);
    const selected = EFFECT_VALUES.indexOf(mapping.effect);

    const form = new ModalFormData()
        .title(`${color.name} Effect`)
        .dropdown("Effect", EFFECT_CHOICES, { defaultValueIndex: selected < 0 ? 0 : selected })
        .slider("Level", 1, 5, { defaultValue: mapping.amplifier + 1, valueStep: 1 })
        .toggle("Show particles", { defaultValue: mapping.particles });

    const response = await showSafe(form, player);
    if (response.canceled) {
        await openColorList(player);
        return;
    }

    const [effectIndex, level, particles] = response.formValues;
    setMapping(colorId, EFFECT_VALUES[effectIndex], level - 1, particles);
    player.sendMessage(`§aSaved ${color.code}${color.name}§a effect.§r`);
    await openColorList(player);
}

/**
 * Opens the list of the 16 colors.
 * @param {Player} player Player viewing the list.
 * @returns {Promise<void>}
 */
async function openColorList(player) {
    const form = new ActionFormData().title("Color Effects").body("Pick a color to set its effect.");
    for (const color of COLORS) {
        form.button(describeColor(color.id));
    }
    form.button("§8Back§r");

    const response = await showSafe(form, player);
    if (response.canceled) {
        return;
    }
    if (response.selection === COLORS.length) {
        await openMainMenu(player);
        return;
    }
    await openColorEditor(player, COLORS[response.selection].id);
}

/**
 * Opens the global settings form.
 * @param {Player} player Player editing settings.
 * @returns {Promise<void>}
 */
async function openSettings(player) {
    const config = getConfig();
    const form = new ModalFormData()
        .title("Settings")
        .toggle("Enabled", { defaultValue: config.enabled })
        .dropdown("Detection mode", MODE_CHOICES, {
            defaultValueIndex: MODE_VALUES.indexOf(config.mode)
        })
        .slider("Check interval (ticks)", 5, 40, { defaultValue: config.interval, valueStep: 5 });

    const response = await showSafe(form, player);
    if (response.canceled) {
        await openMainMenu(player);
        return;
    }

    const [enabled, modeIndex, interval] = response.formValues;
    setSettings(enabled, MODE_VALUES[modeIndex], interval);
    startTracker();
    player.sendMessage("§aSettings saved.§r");
    await openMainMenu(player);
}

/**
 * Asks for confirmation, then clears every color mapping.
 * @param {Player} player Player performing the reset.
 * @returns {Promise<void>}
 */
async function openReset(player) {
    const form = new MessageFormData()
        .title("Clear All")
        .body("Remove the effect from every color?")
        .button1("§8Cancel§r")
        .button2("§4Clear§r");

    const response = await showSafe(form, player);
    if (!response.canceled && response.selection === 1) {
        resetMappings();
        player.sendMessage("§aAll color effects cleared.§r");
    }
    await openMainMenu(player);
}

/**
 * Opens the root configuration menu.
 * @param {Player} player Player opening the menu.
 * @returns {Promise<void>}
 */
export async function openMainMenu(player) {
    const config = getConfig();
    const modeName = MODE_CHOICES[MODE_VALUES.indexOf(config.mode)];
    const status = config.enabled ? "§aOn§r" : "§cOff§r";

    const form = new ActionFormData()
        .title("Color Effects")
        .body(`Status: ${status}\n§7Mode: ${modeName}§r`)
        .button("Set Color Effects")
        .button("Settings")
        .button("§4Clear All§r");

    const response = await showSafe(form, player);
    if (response.canceled) {
        return;
    }
    if (response.selection === 0) {
        await openColorList(player);
    } else if (response.selection === 1) {
        await openSettings(player);
    } else {
        await openReset(player);
    }
}
