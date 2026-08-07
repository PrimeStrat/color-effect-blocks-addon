# Color Effect Blocks

Gives players a potion effect based on the color of the block they stand on.
You choose which effect each of the 16 colors gives. Everything is set from an
in-game menu.

## How to use

1. Add both packs to your world (Behavior Pack and Resource Pack).
2. Run `/ceb:menu` in chat to open the menu.
3. Pick "Set Color Effects", choose a color, and pick the effect you want.
4. Stand on a block of that color to get the effect.

You need operator permission to open the menu.

## The menu

**Set Color Effects** lists all 16 colors. Each button shows the effect that
color gives right now. Open a color to change three things:

- Effect: which effect to give, or "None" to turn that color off.
- Level: effect strength, 1 to 5.
- Show particles: whether the effect shows swirls around the player.

**Settings** has the options that apply to the whole addon:

- Enabled: turn all effects on or off.
- Detection mode: how the addon decides a block's color. See below.
- Check interval: how often the addon looks at each player, in ticks. 20 ticks
  is one second. A bigger number is lighter on the server.

**Clear All** removes the effect from every color.

## The two modes

**Closest Color** looks at the real color of the block and picks whichever of
the 16 colors looks nearest. This works on almost every block, including plain
ones like stone, dirt, and grass. Grass and leaves follow their biome color, so
swamp grass and jungle grass can give different effects.

**Primary Color** only looks at the block name. A block counts only if its name
contains a color word, like `blue_wool` or `pink_concrete`. Plain blocks such as
stone and dirt give nothing. Use this mode if you only want dyed blocks to
count.

Both modes read `light_blue` and `light_gray` correctly, so light blue wool does
not count as blue.

## Standing rules

The addon checks the block at your feet first, then the block below you. This
means carpets, slabs, and snow layers count as the block you are standing on.

The effect is refreshed while you stand there and wears off a couple of seconds
after you step away.

## Checking a block

`/ceb:check` tells you the color of the block you are standing on. It shows the
block name, its color numbers, and which of the 16 colors it resolved to. This
is the fastest way to see why a block gives the effect it does.

`/ceb:debug` turns on logging. Every color the addon works out gets written to
the content log. Run it again to turn it off.

## Notes

- Settings are saved in the world, so they survive a restart.
- The addon reads each block's map color through the normal script API. No
  experimental toggles are needed.
- Magenta is not a natural block color. In Closest Color mode you will only get
  magenta from dyed blocks such as magenta wool.
