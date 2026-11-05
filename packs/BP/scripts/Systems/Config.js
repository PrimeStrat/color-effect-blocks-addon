import { world } from "@minecraft/server";
import { COLOR_IDS } from "../Data/Colors.js";
import { DEFAULT_EFFECTS, NO_EFFECT } from "../Data/Effects.js";
import { MODE_CLOSEST } from "./ColorResolver.js";

const STORAGE_KEY = "ceb:config";

/**
 * @typedef {Object} ColorMapping
 * @property {string} effect Effect type identifier, or NO_EFFECT when unmapped.
 * @property {number} amplifier Effect amplifier, 0 means level one.
 * @property {boolean} particles Whether the effect shows particles.
 */

/**
 * @typedef {Object} AddonConfig
 * @property {boolean} enabled Whether the tracker applies effects at all.
 * @property {string} mode Detection mode, MODE_CLOSEST or MODE_PRIMARY.
 * @property {number} interval Ticks between checks for each player.
 * @property {Object<string, ColorMapping>} mappings Effect mapping per color ID.
 */

/** @type {AddonConfig} */
let config = buildDefaults();

/**
 * Builds a config with every color mapped to its default effect.
 * @returns {AddonConfig} A fresh default configuration.
 */
function buildDefaults() {
    const mappings = {};
    for (const colorId of COLOR_IDS) {
        mappings[colorId] = { effect: DEFAULT_EFFECTS[colorId], amplifier: 0, particles: true };
    }
    return { enabled: true, mode: MODE_CLOSEST, interval: 10, mappings };
}

/**
 * Loads the stored configuration, filling in anything missing with defaults.
 * @returns {void}
 */
export function loadConfig() {
    const defaults = buildDefaults();
    const raw = world.getDynamicProperty(STORAGE_KEY);
    if (typeof raw !== "string") {
        config = defaults;
        return;
    }

    const stored = JSON.parse(raw);
    config = {
        enabled: stored.enabled ?? defaults.enabled,
        mode: stored.mode ?? defaults.mode,
        interval: stored.interval ?? defaults.interval,
        mappings: defaults.mappings
    };
    for (const colorId of COLOR_IDS) {
        const mapping = stored.mappings?.[colorId];
        if (mapping !== undefined) {
            config.mappings[colorId] = {
                effect: mapping.effect ?? NO_EFFECT,
                amplifier: mapping.amplifier ?? 0,
                particles: mapping.particles ?? true
            };
        }
    }
}

/**
 * Writes the current configuration to world storage.
 * @returns {void}
 */
export function saveConfig() {
    world.setDynamicProperty(STORAGE_KEY, JSON.stringify(config));
}

/**
 * Returns the live configuration object.
 * @returns {AddonConfig} The current configuration.
 */
export function getConfig() {
    return config;
}

/**
 * Returns the effect mapping for a color.
 * @param {string} colorId Color ID to look up.
 * @returns {ColorMapping} The mapping for that color.
 */
export function getMapping(colorId) {
    return config.mappings[colorId];
}

/**
 * Replaces the effect mapping for a color and saves.
 * @param {string} colorId Color ID to update.
 * @param {string} effect Effect type identifier, or NO_EFFECT to clear it.
 * @param {number} amplifier Effect amplifier, 0 means level one.
 * @param {boolean} particles Whether the effect shows particles.
 * @returns {void}
 */
export function setMapping(colorId, effect, amplifier, particles) {
    config.mappings[colorId] = { effect, amplifier, particles };
    saveConfig();
}

/**
 * Updates the global tracker settings and saves.
 * @param {boolean} enabled Whether the tracker applies effects.
 * @param {string} mode Detection mode, MODE_CLOSEST or MODE_PRIMARY.
 * @param {number} interval Ticks between checks for each player.
 * @returns {void}
 */
export function setSettings(enabled, mode, interval) {
    config.enabled = enabled;
    config.mode = mode;
    config.interval = interval;
    saveConfig();
}

/**
 * Clears every color mapping and saves.
 * @returns {void}
 */
export function resetMappings() {
    for (const colorId of COLOR_IDS) {
        config.mappings[colorId] = { effect: NO_EFFECT, amplifier: 0, particles: true };
    }
    saveConfig();
}
