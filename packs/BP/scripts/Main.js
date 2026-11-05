import { world, system, BlockComponentTypes, CommandPermissionLevel, CustomCommandStatus, Player } from "@minecraft/server";
import { loadConfig, getConfig } from "./Systems/Config.js";
import { startTracker, startGrace } from "./Systems/EffectTracker.js";
import { resolveBlockColor, setDebugLogging } from "./Systems/ColorResolver.js";
import { openMainMenu } from "./Menus/ConfigMenu.js";
import { openIntro } from "./Menus/IntroMenu.js";

const INTRODUCED_KEY = "ceb:introduced";

let debugEnabled = false;

/**
 * Gives a first-time player the grace period and the intro form.
 * @param {Player} player Player who just joined the world.
 * @returns {void}
 */
function onFirstSpawn(player) {
    if (player.getDynamicProperty(INTRODUCED_KEY) === true) {
        return;
    }
    player.setDynamicProperty(INTRODUCED_KEY, true);
    startGrace(player);
    openIntro(player);
}

/**
 * Reports the map color and resolved color of the block under a player.
 * @param {Player} player Player to inspect.
 * @returns {string} A summary line for the command result.
 */
function describeStandingBlock(player) {
    const location = player.location;
    const feet = player.dimension.getBlock({ x: location.x, y: location.y - 0.1, z: location.z });
    const block = feet !== undefined && !feet.isAir
        ? feet
        : player.dimension.getBlock({ x: location.x, y: location.y - 1.1, z: location.z });

    if (block === undefined || block.isAir) {
        return "§7Not standing on a block.§r";
    }

    const component = block.getComponent(BlockComponentTypes.MapColor);
    const mode = getConfig().mode;
    const resolved = resolveBlockColor(block, mode) ?? "none";

    if (component === undefined) {
        return `§e${block.typeId}§r\n§7No map_color component. Resolved: ${resolved}§r`;
    }

    const base = component.color;
    const tinted = component.tintedColor;
    const show = (rgba) => rgba === undefined
        ? "???"
        : `${Math.round(rgba.red * 255)}, ${Math.round(rgba.green * 255)}, ${Math.round(rgba.blue * 255)}`;

    return `§e${block.typeId}§r\n§7base: ${show(base)}§r\n§7tinted: ${show(tinted)}§r\n§7tint method: ${component.tintMethod}§r\n§aResolved: ${resolved}§r`;
}

system.beforeEvents.startup.subscribe(({ customCommandRegistry }) => {
    customCommandRegistry.registerCommand(
        {
            name: "ceb:menu",
            description: "Open the color effect configuration menu.",
            permissionLevel: CommandPermissionLevel.GameDirectors
        },
        (origin) => {
            const player = origin.sourceEntity;
            if (player === undefined || player.typeId !== "minecraft:player") {
                return { status: CustomCommandStatus.Failure, message: "Only a player can open the menu." };
            }
            system.run(() => openMainMenu(player));
            return { status: CustomCommandStatus.Success };
        }
    );

    customCommandRegistry.registerCommand(
        {
            name: "ceb:check",
            description: "Show the map color of the block you are standing on.",
            permissionLevel: CommandPermissionLevel.GameDirectors
        },
        (origin) => {
            const player = origin.sourceEntity;
            if (player === undefined || player.typeId !== "minecraft:player") {
                return { status: CustomCommandStatus.Failure, message: "Only a player can run this." };
            }
            system.run(() => player.sendMessage(describeStandingBlock(player)));
            return { status: CustomCommandStatus.Success };
        }
    );

    customCommandRegistry.registerCommand(
        {
            name: "ceb:debug",
            description: "Toggle color resolution logging to the content log.",
            permissionLevel: CommandPermissionLevel.GameDirectors
        },
        () => {
            debugEnabled = !debugEnabled;
            setDebugLogging(debugEnabled);
            return {
                status: CustomCommandStatus.Success,
                message: debugEnabled ? "Color logging on." : "Color logging off."
            };
        }
    );
});

world.afterEvents.playerSpawn.subscribe((ev) => {
    if (ev.initialSpawn) {
        onFirstSpawn(ev.player);
    }
});

world.afterEvents.worldLoad.subscribe(() => {
    loadConfig();
    startTracker();
});
