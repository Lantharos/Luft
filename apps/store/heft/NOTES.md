# Heft notes

How Heft is put together and why. Using it is in the docs site, the file format in `docs/components/heft.md`.

## Where it lives

Heft is a store app (`apps/store/heft`), like Draft, Magpie and Convertible: the image workflow publishes it to schelf.store, and it isn't part of the image. It runs in Sabine's app sandbox with Documents (the library) and read-only Downloads and Pictures (to drop PDFs and pictures in), and never goes online.

## Architecture

- **Native side** (`desktop/`, Rust): a thin, careful file layer. Every path the page names is resolved inside `~/Documents/Heft` and refused if it would leave it. Appends and replacements are synced before they answer (`library/disk.rs`), so an acknowledged stroke survives a power cut. It also scans the library, keeps the trash (30 days), takes a daily backup (hard links for files that are only ever replaced, copies for journals) and talks to the file chooser portal. Binary data travels as raw bridge bodies, never JSON or base64.
- **Page** (`src/`, Svelte 5, `@luft/ui`, Tailwind): everything else, including the file format, so it has one implementation.

| Folder | Holds |
| --- | --- |
| `ink/` | Strokes, their geometry, smoothing, pressure, the binary codec, the eraser and shape recognition |
| `page/` | A page's document (strokes, objects, undo) and its journaled storage |
| `canvas/` | The notebook view: layout, viewport, the live ink layer, tiles, pointer routing, gestures, lasso and text picking |
| `library/` | Subjects, notebooks and their folders |
| `pdf/` | pdf.js: loading, page backgrounds, text and outlines, import |
| `objects/` | Text boxes and pictures |
| `search/`, `export/` | The search index and command palette; PDF and PNG output |
| `home/`, `rail/`, `shell/`, `tools/`, `settings/`, `paper/`, `selection/`, `drag/`, `app/`, `input/` | Screens and their state |

## Ink

- Pen events come from Sabine as Chromium pointer events (`pointerType` pen, pressure). Sabine 0.79 added `events.pen` with what touch events can't carry: whether the pen is near, its barrel buttons and tilt. Heft ignores touch while the pen is near or was seen in the last 450 ms (palm rejection), and uses the barrel buttons as configurable tools (eraser by default). Sabine 0.80 gave the pen a touch id no finger can take, so a palm can't join a stroke inside Chromium.
- Samples are handled in `pointerrawupdate`, as soon as they reach the page instead of at the next animation frame, with every coalesced sample, so fast strokes keep all of the pen's points. `getPredictedEvents` draws a short predicted tail on a second canvas, the only thing cleared while the pen moves.
- A stroke is the union of a circle at each point and the tangent quad between neighbours, filled once with the nonzero rule. The live canvas draws only each new segment; committing draws the same geometry into the page's tiles, so nothing moves when the pen lifts. New pen strokes are drawn on top of existing tiles without redrawing them; erasing redraws only the tiles it touched.
- Committed ink lives in 256-pixel tiles per page at the current zoom, created for what's visible and released when far away. Pinch and Ctrl+wheel zoom scale the content with CSS while the gesture lasts and redraw tiles once it settles.
- Smoothing is a One Euro filter (steady when slow, close behind when fast); the raw last point ends the stroke. Width is computed per point from pressure through the curve setting and stored, so settings never change old writing.
- Templates are SVG backgrounds, sharp at any zoom and free to scroll. Dark paper flips ink lightness in OKLab and keeps hue and chroma.

## Books

pdf.js (as in Magpie), reading only the byte ranges it needs, so a 300-page book opens as fast as a short one. Pages render lazily per zoom (capped at 4096 pixels wide), thumbnails are cached as bitmaps, text comes from `getTextContent` for picking, highlights and search, and `getOutline` gives the contents. Text highlights are stored as straight highlighter strokes along each line, so they erase, undo and export like any ink.

## Latency

Measured with Sabine's input trace (`SABINE_TRACE=1`): from the winit event to the compositor presenting the first frame after it, on a hidden 60 Hz display, mouse strokes from `peek drag` through the same path as the pen.

| Build | p50 | p95 |
| --- | --- | --- |
| Heft, drawing at `pointermove` (debug) | 21–24 ms | 32–34 ms |
| Heft, drawing at `pointerrawupdate` (debug) | 16–20 ms | 24–48 ms |
| Heft, drawing at `pointerrawupdate` (release) | 13–17 ms | 21–23 ms (one run 40 ms) |
| Sabine's own minimal pen page (debug) | 12–18 ms | 25–34 ms |

So Heft adds next to nothing over the platform; the rest is one or two display frames through Chromium's off-screen rendering and the compositor. Not included: the time from the digitizer to the app and the display's own scanout.

## Should move into @luft/ui

- The pdf.js asset plugin (`vite/pdfjs.ts`), copied from Magpie.
- The drag and drop helpers in `drag/` (pen and touch friendly, with a hold for fingers).
- A colour swatch grid, the pressure curve editor, the page thumbnail rail and `focusField` for dialogs.
- `Switch` has no visible label of its own; every app wraps it the same way.

## Milestone log

1. **Ink core**: done. Pen, highlighter, both erasers, pressure and curve, smoothing, prediction, palm rejection, undo across pages, pinch and wheel zoom, kinetic pan, templates, sizes and paper colours, journaled autosave.
2. **Organization**: done. Subjects, notebooks, sections, home with recent pages, tabs, the page rail with thumbnails, dragging pages, notebooks and subjects, archive, trash and deleted pages.
3. **Books**: done. PDF import (menu, drop, opening PDFs with Heft), writing on books, text picking with clean highlights and copying, contents, a notebook beside the book remembered per subject, quotes into the notes beside.
4. **Tools**: mostly. Shapes (line, arrow, triangle, rectangle, ellipse), lasso (move, resize, rotate, recolour, copy, cut, duplicate, delete, paste), text boxes with headings, bold and lists, pictures (choose, paste), pens and their colours, two- and three-finger taps. Not yet: the ruler, taking a photo with the webcam, cropping pictures, dragging a lasso selection between the panes.
5. **Search and export**: done. Search over typed text, section, notebook and subject names and book text, accents ignored, grouped with where each hit is; command palette; PDF (vector ink, with or without the paper) of a page, section or notebook, and PNG of a page. Hits don't show thumbnails yet.
6. **Polish**: partly. English and Serbian (Cyrillic, and Latin through `bun run transliterate`), settings for pen and touch, full-screen writing. Not yet: tablet mode (Kestrel doesn't tell apps about it; it would need a property on its D-Bus interface), a side toolbar, an infinite page that grows as you write, the single-page mode.
7. **Later**: handwriting recognition. The search index already keeps a kind per entry (`typed`, `book`, `ink`), so recognized text from the device can be added as `ink` entries without changing search.
