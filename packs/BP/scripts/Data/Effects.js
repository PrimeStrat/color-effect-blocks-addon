/**
 * @typedef {Object} EffectDefinition
 * @property {string} id Effect type identifier passed to addEffect.
 * @property {string} name Display name shown in menus.
 */

/** @type {EffectDefinition[]} */
export const EFFECTS = [
    { id: "minecraft:absorption", name: "Absorption" },
    { id: "minecraft:blindness", name: "Blindness" },
    { id: "minecraft:conduit_power", name: "Conduit Power" },
    { id: "minecraft:darkness", name: "Darkness" },
    { id: "minecraft:fire_resistance", name: "Fire Resistance" },
    { id: "minecraft:haste", name: "Haste" },
    { id: "minecraft:health_boost", name: "Health Boost" },
    { id: "minecraft:hunger", name: "Hunger" },
    { id: "minecraft:instant_damage", name: "Instant Damage" },
    { id: "minecraft:instant_health", name: "Instant Health" },
    { id: "minecraft:invisibility", name: "Invisibility" },
    { id: "minecraft:jump_boost", name: "Jump Boost" },
    { id: "minecraft:levitation", name: "Levitation" },
    { id: "minecraft:mining_fatigue", name: "Mining Fatigue" },
    { id: "minecraft:nausea", name: "Nausea" },
    { id: "minecraft:night_vision", name: "Night Vision" },
    { id: "minecraft:poison", name: "Poison" },
    { id: "minecraft:regeneration", name: "Regeneration" },
    { id: "minecraft:resistance", name: "Resistance" },
    { id: "minecraft:saturation", name: "Saturation" },
    { id: "minecraft:slow_falling", name: "Slow Falling" },
    { id: "minecraft:slowness", name: "Slowness" },
    { id: "minecraft:speed", name: "Speed" },
    { id: "minecraft:strength", name: "Strength" },
    { id: "minecraft:water_breathing", name: "Water Breathing" },
    { id: "minecraft:weakness", name: "Weakness" },
    { id: "minecraft:wither", name: "Wither" }
];

export const EFFECT_IDS = EFFECTS.map((effect) => effect.id);

export const NO_EFFECT = "none";

/** @type {Object<string, string>} */
export const DEFAULT_EFFECTS = {
    white: "minecraft:levitation",
    light_gray: "minecraft:slowness",
    gray: "minecraft:weakness",
    black: "minecraft:blindness",
    brown: "minecraft:hunger",
    red: "minecraft:strength",
    orange: "minecraft:fire_resistance",
    yellow: "minecraft:mining_fatigue",
    lime: "minecraft:jump_boost",
    green: "minecraft:poison",
    cyan: "minecraft:conduit_power",
    light_blue: "minecraft:speed",
    blue: "minecraft:night_vision",
    purple: "minecraft:nausea",
    magenta: "minecraft:regeneration",
    pink: "minecraft:health_boost"
};
