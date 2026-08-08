/**
 * @typedef {Object} ColorDefinition
 * @property {string} id Color key used in config and lookups.
 * @property {string} name Display name shown in menus.
 * @property {string} code Minecraft section color code for menu text.
 * @property {number[]} rgb Reference RGB triplet, 0-255, used for closest matching.
 * @property {string[]} words Words that identify this color inside a block type ID.
 */

/** @type {ColorDefinition[]} */
export const COLORS = [
    { id: "white", name: "White", code: "§f", rgb: [233, 236, 236], words: ["white"] },
    { id: "light_gray", name: "Light Gray", code: "§8", rgb: [142, 142, 134], words: ["light_gray", "silver"] },
    { id: "gray", name: "Gray", code: "§8", rgb: [62, 68, 71], words: ["gray"] },
    { id: "black", name: "Black", code: "§0", rgb: [20, 21, 25], words: ["black"] },
    { id: "brown", name: "Brown", code: "§6", rgb: [114, 71, 40], words: ["brown"] },
    { id: "red", name: "Red", code: "§c", rgb: [176, 46, 38], words: ["red"] },
    { id: "orange", name: "Orange", code: "§6", rgb: [240, 118, 19], words: ["orange"] },
    { id: "yellow", name: "Yellow", code: "§e", rgb: [248, 197, 39], words: ["yellow"] },
    { id: "lime", name: "Lime", code: "§a", rgb: [112, 185, 25], words: ["lime"] },
    { id: "green", name: "Green", code: "§2", rgb: [84, 109, 27], words: ["green"] },
    { id: "cyan", name: "Cyan", code: "§3", rgb: [21, 137, 145], words: ["cyan"] },
    { id: "light_blue", name: "Light Blue", code: "§b", rgb: [58, 175, 217], words: ["light_blue"] },
    { id: "blue", name: "Blue", code: "§9", rgb: [44, 46, 143], words: ["blue"] },
    { id: "purple", name: "Purple", code: "§5", rgb: [121, 42, 172], words: ["purple"] },
    { id: "magenta", name: "Magenta", code: "§d", rgb: [189, 68, 179], words: ["magenta"] },
    { id: "pink", name: "Pink", code: "§d", rgb: [237, 141, 172], words: ["pink"] }
];

export const COLOR_IDS = COLORS.map((color) => color.id);

/** @type {Map<string, ColorDefinition>} */
export const COLORS_BY_ID = new Map(COLORS.map((color) => [color.id, color]));

/**
 * Color words ordered longest-first so "light_blue" wins over "blue".
 * @type {{ word: string, colorId: string }[]}
 */
export const COLOR_WORDS = COLORS
    .flatMap((color) => color.words.map((word) => ({ word, colorId: color.id })))
    .sort((a, b) => b.word.length - a.word.length);
