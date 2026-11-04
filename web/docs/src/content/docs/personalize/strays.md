---
title: Strays
description: Small creatures who live on your desktop, and how to make your own.
sidebar:
  order: 6
---

Strays is an extension from [Schelf](/apps/schelf/). It puts a few small creatures on your desktop: Tuft, who walks, climbs and jumps, Pip, who flies, and slow, round Dollop. They wander on their own between the taskbar, its islands, the tops of windows and the screen's edges, wherever they like best, and spend most of their time sitting and sleeping.

Move a window and whoever's on it rides along. Close or minimize it and they fall to whatever's below. Bring a window close and they may well hop on. You can pick one up with the mouse, carry it anywhere and let go: it falls from there, Pip stays in the air for a bit and flies off, and over a window it lands on top.

They live behind your windows, so they never cover anything in them. They sleep while something's full screen, during calls, with the power saver on and with reduced motion, and use next to nothing while they rest.

Settings › Extensions › Strays has how many there are, one to six, how big, and who comes by.

## Make your own

A stray is a folder with two files: a picture of its frames and `pack.json`, which says which frames do what. Tuft, Pip and Dollop are made exactly this way.

1. In Settings › Extensions › Strays, press **Get the template**, and copy the folder that opens somewhere of your own. You can also get it from [GitHub](https://github.com/Lantharos/Luft/tree/main/extensions/strays/template).
2. Draw on `sheet.png`, with `guide.png` beside you. `example` holds a finished one to copy from.
3. Change the name in `pack.json`.
4. Back in Settings, press **Add a stray** and pick your folder. It plays in the list right away, and if something's off, Settings says what.

To change a stray, remove it, fix the folder and add it again.

[Piskel](https://www.piskelapp.com) is free and runs in your browser. [LibreSprite](https://libresprite.github.io) and [Pixelorama](https://pixelorama.org) are free programs to install. Any editor that saves a PNG with see-through pixels works.

### The sheet

Frames are square and sit in a grid with no gaps. 24 by 24 pixels looks at home next to the others, and anything from 8 to 128 works: Luft draws each pixel of your sheet as a whole number of screen pixels, so it stays crisp at every display scale. Draw creatures facing right, with their feet on the bottom row of the frame, and Luft mirrors them to walk left. The template's sheet is 96 by 168: four frames across, seven rows down.

### pack.json

```json
{
  "name": "Biscuit",
  "description": "Likes the taskbar",
  "frame": 24,
  "sheet": "sheet.png",
  "states": {
    "idle": { "row": 0, "frames": 4 },
    "walk": { "row": 1, "frames": 4 },
    "sit": { "row": 2, "frames": 2 },
    "sleep": { "row": 3, "frames": 2 },
    "fall": { "row": 4, "frames": 3 },
    "land": { "row": 4, "start": 3, "frames": 1 },
    "climb": { "row": 5, "frames": 4 }
  },
  "abilities": { "walks": true, "climbs": true, "jumps": 5, "flies": false },
  "likes": { "window": 3, "taskbar": 2, "ground": 1, "edges": 0.3 },
  "temper": { "stride": 1.6, "gravity": 1, "sleepiness": 0.6 }
}
```

`name` and `frame` are required, and `sheet` is `sheet.png` unless it says otherwise. Each state says which `row` of the sheet it's on, counting from 0, how many `frames` it has, and optionally the column to `start` from, so two states can share a row.

| State | Needed | What it's for |
| --- | --- | --- |
| `idle` | Yes | The first frame is standing still. The others are looking around |
| `walk` | Yes | Loops while it walks |
| `sit` | Yes | Plays once as it sits down, and holds the last frame |
| `sleep` | Yes | Plays once as it lies down, and holds the last frame |
| `fall` | Yes | Loops while it falls |
| `land` | No | Plays once as it lands. Without it, the last `fall` frame shows |
| `jump` | No | Loops in the air on a jump. Without it, `fall` plays |
| `climb` | No | Loops going up a wall, facing the wall on the right. Without it, it doesn't climb unless `abilities` says so, and then `walk` plays |
| `fly` | No | Loops while it flies. Without it, `fall` plays |
| `held` | No | Loops while someone carries it. Without it, `fall` plays |

The rest is optional too.

| Field | Means | Default |
| --- | --- | --- |
| `abilities.walks` | It walks. One that doesn't has to fly | `true` |
| `abilities.climbs` | It climbs the sides of windows, and clings to the screen's edges | Whether it has `climb` |
| `abilities.jumps` | How far it can jump, across or up, in lengths of its own frame | `0` |
| `abilities.flies` | It flies straight to anywhere it likes, and hovers where it's let go | `false` |
| `likes` | How much it wants to be on a `window`, the `taskbar`, the `ground`, or on the screen's `edges`, against each other | `2`, `2`, `1`, `0.3` |
| `temper.stride` | How far it steps, in pixels of a 24 pixel frame | `1.4` |
| `temper.gravity` | How fast it falls, where 1 is Tuft and 0.35 is Pip | `1` |
| `temper.sleepiness` | How likely it is to doze off when sitting, from 0 to 1 | `0.5` |

### Sharing

A stray is just its folder, so zip it and send it, or put it in a Git repository where people can see the sheet and suggest changes. Whoever gets it unzips it and adds the folder. A pack holds no code, only a picture and a list of numbers, so there's nothing to be careful of when adding one from someone else.
