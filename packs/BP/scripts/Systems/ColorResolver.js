import { BlockComponentTypes, Block } from "@minecraft/server";
import { COLORS, COLOR_WORDS } from "../Data/Colors.js";
import { BLOCK_COLORS } from "../Data/BlockColors.js";

export const MODE_CLOSEST = "closest";
export const MODE_PRIMARY = "primary";

const primaryCache = new Map();
const closestCache = new Map();

let debugLogging = false;

/**
 * Turns diagnostic logging of color resolution on or off.
 * @param {boolean} enabled Whether resolution results are logged to the content log.
 * @returns {void}
 */
export function setDebugLogging(enabled) {
    debugLogging = enabled;
}

/**
 * Converts an RGB triplet to CIE Lab, where straight-line distance
 * tracks how different two colors look to a person.
 * @param {number[]} rgb Source color as [red, green, blue], each 0-255.
 * @returns {number[]} The color as [lightness, a, b].
 */
function toLab(rgb) {
    const linear = (value) => {
        const scaled = value / 255;
        return scaled <= 0.04045 ? scaled / 12.92 : Math.pow((scaled + 0.055) / 1.055, 2.4);
    };
    const red = linear(rgb[0]);
    const green = linear(rgb[1]);
    const blue = linear(rgb[2]);

    const pivot = (value) => (value > 0.008856 ? Math.cbrt(value) : 7.787 * value + 16 / 116);
    const x = pivot((red * 0.4124 + green * 0.3576 + blue * 0.1805) / 0.95047);
    const y = pivot(red * 0.2126 + green * 0.7152 + blue * 0.0722);
    const z = pivot((red * 0.0193 + green * 0.1192 + blue * 0.9505) / 1.08883);

    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

const PALETTE_LAB = COLORS.map((color) => ({ id: color.id, lab: toLab(color.rgb) }));

/**
 * Finds the palette color that looks nearest to an RGB triplet.
 * @param {number[]} rgb Source color as [red, green, blue], each 0-255.
 * @returns {string} ID of the nearest palette color.
 */
function matchNearestColor(rgb) {
    const target = toLab(rgb);
    let bestId = COLORS[0].id;
    let bestDistance = Infinity;
    for (const entry of PALETTE_LAB) {
        const deltaLight = entry.lab[0] - target[0];
        const deltaA = entry.lab[1] - target[1];
        const deltaB = entry.lab[2] - target[2];
        const distance = deltaLight * deltaLight + deltaA * deltaA + deltaB * deltaB;
        if (distance < bestDistance) {
            bestDistance = distance;
            bestId = entry.id;
        }
    }
    return bestId;
}

/**
 * Finds the color word contained in a block type ID.
 * @param {string} typeId Block type identifier.
 * @returns {string | undefined} Matching color ID, or undefined when no color word is present.
 */
function matchColorWord(typeId) {
    for (const entry of COLOR_WORDS) {
        if (typeId.includes(entry.word)) {
            return entry.colorId;
        }
    }
    return undefined;
}

/**
 * Reads a block's map color component and converts it to 0-255 RGB.
 * Uses the tinted color so grass and leaves follow their biome.
 * @param {Block} block Block to read.
 * @returns {number[] | undefined} The map color, or undefined when the block has no map color.
 */
function readMapColor(block) {
    const component = block.getComponent(BlockComponentTypes.MapColor);
    if (component === undefined) {
        return undefined;
    }

    const color = component.tintedColor ?? component.color;
    if (color === undefined) {
        return undefined;
    }
    return [Math.round(color.red * 255), Math.round(color.green * 255), Math.round(color.blue * 255)];
}

/**
 * Resolves the color of a block for the given mode.
 * Primary mode reads the color word in the type ID. Closest mode reads the
 * block's map color, falling back to the bundled table and then the type ID.
 * @param {Block} block Block the player is standing on.
 * @param {string} mode Detection mode, MODE_CLOSEST or MODE_PRIMARY.
 * @returns {string | undefined} Resolved color ID, or undefined when the block has no color.
 */
export function resolveBlockColor(block, mode) {
    const typeId = block.typeId;

    if (mode === MODE_PRIMARY) {
        const cached = primaryCache.get(typeId);
        if (cached !== undefined) {
            return cached === "" ? undefined : cached;
        }
        const colorId = matchColorWord(typeId);
        primaryCache.set(typeId, colorId ?? "");
        if (debugLogging) {
            console.warn(`[ceb] primary ${typeId} -> ${colorId ?? "none"}`);
        }
        return colorId;
    }

    const rgb = readMapColor(block);
    if (rgb !== undefined) {
        const colorId = matchNearestColor(rgb);
        if (debugLogging) {
            console.warn(`[ceb] map_color ${typeId} rgb(${rgb.join(",")}) -> ${colorId}`);
        }
        return colorId;
    }

    const cached = closestCache.get(typeId);
    if (cached !== undefined) {
        return cached === "" ? undefined : cached;
    }

    const tableRgb = BLOCK_COLORS[typeId];
    const colorId = tableRgb !== undefined ? matchNearestColor(tableRgb) : matchColorWord(typeId);
    closestCache.set(typeId, colorId ?? "");
    if (debugLogging) {
        const source = tableRgb !== undefined ? "table" : "name";
        console.warn(`[ceb] ${source} ${typeId} -> ${colorId ?? "none"}`);
    }
    return colorId;
}
