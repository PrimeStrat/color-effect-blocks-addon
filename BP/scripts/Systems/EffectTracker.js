import { world, system, Player } from "@minecraft/server";
import { NO_EFFECT } from "../Data/Effects.js";
import { getConfig, getMapping } from "./Config.js";
import { resolveBlockColor } from "./ColorResolver.js";

const EFFECT_DURATION = 40;

let runId = undefined;
let lastInterval = 0;

/**
 * Finds the color of the block a player is standing on.
 * @param {Player} player Player to test.
 * @param {string} mode Detection mode, MODE_CLOSEST or MODE_PRIMARY.
 * @returns {string | undefined} Resolved color ID, or undefined when there is none.
 */
function getStandingColor(player, mode) {
    const dimension = player.dimension;
    const location = player.location;
    const feet = dimension.getBlock({ x: location.x, y: location.y - 0.1, z: location.z });
    if (feet !== undefined && !feet.isAir) {
        const color = resolveBlockColor(feet, mode);
        if (color !== undefined) {
            return color;
        }
    }

    const below = dimension.getBlock({ x: location.x, y: location.y - 1.1, z: location.z });
    if (below !== undefined && !below.isAir) {
        return resolveBlockColor(below, mode);
    }
    return undefined;
}

/**
 * Applies the mapped effect to every player standing on a colored block.
 * @returns {void}
 */
function tick() {
    const config = getConfig();
    if (!config.enabled) {
        return;
    }

    for (const player of world.getAllPlayers()) {
        const colorId = getStandingColor(player, config.mode);
        if (colorId === undefined) {
            continue;
        }

        const mapping = getMapping(colorId);
        if (mapping === undefined || mapping.effect === NO_EFFECT) {
            continue;
        }

        player.addEffect(mapping.effect, EFFECT_DURATION, {
            amplifier: mapping.amplifier,
            showParticles: mapping.particles
        });
    }
}

/**
 * Starts the tracker loop, restarting it when the configured interval changed.
 * @returns {void}
 */
export function startTracker() {
    const interval = getConfig().interval;
    if (runId !== undefined) {
        if (interval === lastInterval) {
            return;
        }
        system.clearRun(runId);
    }
    lastInterval = interval;
    runId = system.runInterval(tick, interval);
}
