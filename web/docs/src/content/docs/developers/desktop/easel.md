---
title: Easel's documents and rendering
description: The .easel file format, version 1, and how Easel draws images and boards with WebGPU.
sidebar:
  order: 13.5
---

[Easel](/apps/easel/) keeps layered images and whiteboards in one format, and draws both on the GPU from the page. This page describes format version 1 and the renderer.

## The .easel format

An `.easel` file is a ZIP archive, so ordinary tools can look inside one:

```
mimetype                  application/vnd.lantharos.easel, stored, always first
document.json             what the document is
layers/<id>.tiles         an image layer's pixels
masks/<id>.tiles          a layer's mask
assets/<id>               a picture placed on a board, exactly as it was imported
preview.png               the whole document, at most 512 pixels on its longest side
```

The first entry is `mimetype`, stored without compression, the way OpenDocument and OpenRaster files start, so a file can be recognised from its first bytes. Pixel data is compressed tile by tile before it goes into the archive and is stored as it is, so opening a document never inflates one huge stream, and saving only compresses what changed when it is written again. `preview.png` is what Rover and the recent files show; Luft's thumbnailer reads it without opening the rest.

### document.json

Images and boards share the format and differ in `kind`. Both have `format`, 1 for this version.

```json
{
  "format": 1, "kind": "image", "width": 2400, "height": 1350,
  "layers": [
    { "id": "m3x1a0", "name": "Photo", "kind": "raster", "visible": true, "locked": false, "opacity": 1, "blend": "normal" },
    { "id": "m3x1a1", "name": "Golden hour", "kind": "text", "visible": true, "locked": false, "opacity": 1, "blend": "normal",
      "text": { "content": "Golden hour", "x": 120, "y": 1100, "font": "Open Runde", "size": 140, "weight": 600, "color": "#fff8ec", "align": "left" } }
  ]
}
```

Layers are listed from the bottom up. `kind` is `raster`, `text`, `adjustment` or `group`; a layer with a `parent` belongs to that group, which composites its layers on their own before blending the result with the group's opacity and blend mode. An adjustment layer has `adjustment`, with its `type` (`curves`, `levels`, `hue`, `balance`, `mono`, `brightness`, `exposure` or `vibrance`) and the settings for every type, and no pixels. `effects` holds a `shadow` (`enabled`, `x`, `y`, `blur`, `color`, `opacity`) and a `stroke` (`enabled`, `size`, `color`, `opacity`). `mask` says that the layer has a mask in `masks/<id>.tiles` and whether it's `enabled`. `guides` lists guides as `{ "axis": "x", "at": 640 }`. `blend` is one of `normal`, `multiply`, `screen`, `overlay`, `darken`, `lighten`, `color-dodge`, `color-burn`, `hard-light`, `soft-light`, `difference` and `add`, with the separable formulas of the W3C compositing specification. A text layer keeps its `text` and also its pixels, so other programs and older Easels can show it; Easel draws it again from `text` when it's edited. Layer kinds Easel doesn't know are kept as raster layers.

```json
{
  "format": 1, "kind": "board",
  "objects": [
    { "id": "…", "kind": "shape", "shape": "rectangle", "x": 0, "y": 0, "w": 180, "h": 80, "color": "ink", "fill": null, "text": "Sign in" },
    { "id": "…", "kind": "arrow", "from": { "x": 180, "y": 40, "attach": "<shape id>" }, "to": { "x": 400, "y": 40 }, "route": "elbow", "color": "ink", "width": 2.5, "head": true },
    { "id": "…", "kind": "frame", "x": -40, "y": -120, "w": 1200, "h": 640, "text": "Sign-in flow" },
    { "id": "…", "kind": "stroke", "tool": "pen", "color": "#e8a25a", "width": 3, "points": [12, 40, 0.5, 14, 41, 0.62] },
    { "id": "…", "kind": "note", "x": 300, "y": 200, "w": 180, "h": 180, "color": "#f3d88a", "text": "Fewer than 5 screens" },
    { "id": "…", "kind": "text", "x": 0, "y": -60, "text": "First start", "size": 22, "color": "ink" },
    { "id": "…", "kind": "picture", "x": 600, "y": 0, "w": 320, "h": 240, "asset": "<asset id>", "group": "<group id>" }
  ],
  "assets": { "<asset id>": "image/png" }
}
```

Board coordinates are unbounded and grow down and to the right. Objects are listed from the back to the front. A stroke's `points` are its x, y and pen pressure, three numbers each. `ink` is the colour that contrasts with the board: light on a dark board, dark on a light one and in exports. An arrow end with `attach` follows that object. A `straight` arrow ends where the line between the two ends crosses the object's outline; an `elbow` arrow leaves and enters through the middle of the sides facing each other along the longer axis and bends twice halfway between them. A frame's `text` is its name, drawn above it, and frames come before the objects they hold, so they're drawn behind them. Objects sharing a `group` are selected and moved together. `assets` maps each picture to its type.

### Tiles

An image layer's pixels are in 512 × 512 tiles, numbered row by row from the top left. Edge tiles are stored whole; what lies past the image is transparent. A tile that was never painted isn't stored at all. All numbers are little endian.

| Bytes | Holds |
| --- | --- |
| 4 | `ETIL` |
| 2 | Version, 1 |
| 2 | Tile size, 512 |
| 4 | Number of tiles |
| 8 for each tile | Its number and the length of its data, both 32-bit |
| … | Each tile's data, in the same order |

A tile's data is one zstd frame holding 512 × 512 pixels of 8-bit RGBA with premultiplied alpha, the form Easel composites in. A mask's tiles hold one byte for each pixel; a mask tile that isn't stored is white. `preview.png` and exports have straight alpha, as PNG expects.

## Rendering

Easel draws with WebGPU in its page. On Linux, Sabine offers WebGPU through Dawn's OpenGL ES backend inside Chromium's GPU sandbox, as a [compatibility-mode](https://github.com/gpuweb/gpuweb/blob/main/proposals/compatibility-mode.md) adapter, so Easel's shaders keep to its limits.

### Images

Every layer is a grid of 512 × 512 textures, created only where something is painted. A change marks the tiles it touched; before the next frame, each dirty tile is composited from the layers that have that tile, bottom up, each pass blending one layer onto the result with its opacity, blend mode, and mask, then copied into the composite and halved four times into smaller versions. The view draws the composite tiles on screen at the version closest to the zoom, so a 6000 × 4000 picture zoomed out samples a fraction of its pixels, and an unchanged picture costs one draw per visible tile.

Painting never changes a layer in place. A brush stroke stamps soft round dabs into a single-channel stroke mask, with maximum blending so overlapping dabs don't build up; while the stroke lasts, the compositor blends the mask over the layer in the brush colour, clipped by the selection. When the stroke ends, the touched tiles are drawn into new textures, and the old ones become the undo step. Undo swaps textures back without copying, and the history keeps at most 300 steps and 1.5 GB of replaced tiles, dropping the oldest first.

Masks are single-channel tile grids the blend pass multiplies the layer by, and painting on a mask goes through the same stroke mask. An adjustment layer is a pass over what's under it: curves, levels, colour balance, brightness and exposure become a 256-entry lookup per channel, generated when the settings change, and hue, black and white and vibrance are computed in the shader. Groups composite into a scratch tile of their own. Effects are drawn from the layer's alpha once per change, blurred and coloured on the whole layer, and composited under it as extra layers.

Filters and effects work on the whole layer at once: its tiles are copied into one texture, so a blur reaches across tile edges. Large blur radii halve the texture first and blur the smaller copy, which keeps a 100-pixel blur of a 24-megapixel picture to a few milliseconds. A filter's preview replaces the layer's tiles in the compositor until it's applied. The clone stamp and the healing brush sample a copy of the layer taken when the stroke starts; healing adds the difference between heavily blurred copies of the target and the source, so the copied texture takes on the surrounding light. Smudge works on a copy of the layer, picking up the area under the previous dab and laying it down under the next. Quick mask draws the selection as an overlay and paints into it with the brush's stroke mask. Distorting with the move tool maps the selection's rectangle onto four corners with a perspective matrix, drawn with perspective-correct sampling.

A selection is another single-channel tile grid. Rectangles, ellipses and lassos are filled with the canvas 2D API tile by tile, with a blur for feathering; the magic wand and the fill bucket read the layer back and flood it in a worker. Moving and scaling draw the source into the target tiles through a matrix, halving it first when it shrinks a lot so it doesn't alias. Decoding and encoding run in Rust: glycin decodes TIFF and HEIC, and PNG, JPEG, WebP and AVIF are written from the composite with Lanczos resizing.

### Boards

Board objects are immutable; changing one replaces it, and each undo step is the list of objects before and after. Because steps share every object they didn't change, a board keeps its whole history. Moving a frame moves everything whose bounds lie inside it, and exporting a frame renders the board clipped to the frame's rectangle. Each object is turned into triangles once, in board coordinates, and kept in a GPU buffer until it changes. Text and note labels are drawn with the canvas 2D API into textures at the nearest power of two of the zoom, and pictures are kept at most 2048 pixels on a side for drawing. A frame draws the dot grid in one pass, then only the objects whose bounds meet the view, with four-sample antialiasing, and only when something changed.

Drawing recognises shapes when the pen pauses at the end of a stroke: the stroke is simplified to its corners, and a closed path with four right angles becomes a box or a diamond, other closed paths an ellipse, two corners a line, and a line with a head an arrow.

## Raw photos and Photoshop files

Raw photos are decoded in Rust with [rawler](https://github.com/dnglab/dnglab): demosaicing, the camera's as-shot white balance and its colour matrix give linear light in sRGB primaries, turned to the camera's orientation and handed to the page as 16-bit floats. The page keeps those as a tile grid of `rgba16float` textures while **Develop** is open, and one shader pass per tile writes the layer: white balance and exposure in linear light, then sRGB encoding, highlights and shadows as a luminance shift weighted towards each end, and a soft shoulder that rolls highlights off instead of clipping them. Closing **Develop** frees the linear tiles. Photoshop files are read with the [psd](https://github.com/chinedufn/psd) crate, one full-size RGBA buffer per layer, with blend modes Easel has kept and the rest drawn as normal.

## On-device AI

The models run in the desktop process with [ONNX Runtime](https://onnxruntime.ai), loaded from the system's library, on worker threads so the page never waits. `data/models.json` lists each model's pinned source, size and SHA-256; the models workflow mirrors them to `get.luft.computer/models`, and Easel downloads them from there into `~/.local/share/easel/models` the first time they're needed, checking both.

The page reads a layer or the composite back, sends it in chunks, and gets a file back. **Remove background** and **Select subject** run BiRefNet lite at 1024 × 1024 on a copy at most 1536 pixels on a side, and the mask is scaled back up on the GPU into a layer mask or the selection. **Remove and fill in** crops the selection with a margin of 30% on each side, runs LaMa at 512 × 512, and bakes the result through the selection, so pixels outside it never change. **Upscale** runs Real-ESRGAN's compact general model, which enlarges four times, on 256-pixel tiles with 16 pixels of overlap across up to four sessions at once; ×2 scales each enlarged tile down by half before it's placed. Transparent pixels keep the alpha of the pixel they came from.
