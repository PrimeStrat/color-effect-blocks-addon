import { Player } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { showSafe } from "./ConfigMenu.js";

const INTRO_BODY = [
    "§fWelcome to §eColor Effect Blocks§f!§r",
    "",
    "§7Every colored block gives you an effect while you stand on it.§r",
    "§7Half of the colors help you, and half of them hurt you.§r",
    "",
    "§7Watch your step and learn which colors are safe.§r",
    "",
    "§aYou have 1 minute of grace before the blocks affect you.§r"
].join("\n");

/**
 * Shows the how-to-play intro form to a player.
 * @param {Player} player Player to show the intro to.
 * @returns {Promise<void>}
 */
export async function openIntro(player) {
    const form = new ActionFormData().title("How to Play").body(INTRO_BODY).button("§2Got it§r");
    await showSafe(form, player);
}
