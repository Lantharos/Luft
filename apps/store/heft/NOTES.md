# Heft notes

Working notes on how Heft is put together and why. The user-facing docs live in the docs site.

## Where it lives

Heft is a store app (`apps/store/heft`), like Draft, Magpie and Convertible: it is published to schelf.store by the image workflow, not built into the image. It runs in Sabine's app sandbox with the Documents folder (where the library lives) and read-only Downloads and Pictures (for dropping PDFs and pictures in). It never goes online.

## Architecture

- **Native side** (`desktop/`, Rust): a thin file layer over the library folder. Every path the page names is resolved inside `~/Documents/Heft` and refused if it would leave it. Appends and replacements are synced to the disk before they answer (`library/disk.rs`), so an acknowledged stroke survives a power cut. It also scans the library, keeps the trash (30 days), takes a daily backup and talks to the file chooser portal. Binary data travels as raw bridge bodies, never JSON or base64.
- **Page** (`src/`, Svelte 5, `@luft/ui`, Tailwind): everything else, including the file format, so the format has one implementation.

## Data model and format (version 1)

```
~/Documents/Heft/
  Matematika/                      a subject: a folder named after it
    subject.json                   { format, id, name, color, icon, order, archived }
    Beleške.heft/                  a notebook: a folder named after it
      notebook.json                { format, id, name, kind, paper, pages[], sections[], ... }
      pages/<page id>.page         compacted page: strokes and objects
      pages/<page id>.journal      changes since the last compaction, appended and synced
      assets/                      pictures, by content hash
      sources/                     imported PDFs, untouched
  .trash/                          trashed subjects and notebooks, with a .trashed.json beside each
```

- IDs are random 52-bit integers written as base-36 strings: stable across renames and moves, so sync can match them later.
- A `.page` file is `HEFT` + format version + a binary stroke section + a JSON section for objects (text, pictures, shapes). A stroke is its id, tool, color, width, flags and points; a point is x, y (float32 page units), width (uint16, 1/100 unit), pressure (uint16) and time since the previous point (uint16 ms).
- A `.journal` is a sequence of records `[length u32][crc32 u32][op u8][payload]`. Loading reads the page file and replays the journal; a torn last record (power cut mid-write) fails its CRC and is dropped. Ops: add strokes, remove strokes, replace strokes (partial erase, lasso edits), set objects.
- Compaction rewrites the `.page` atomically and then removes the journal, when the journal passes 256 KB, when a page leaves memory and when the app closes. A crash between the two steps replays ops whose effects are already in the page; ops are idempotent (adding an existing id replaces it, removing a missing id does nothing).
- Page units are CSS pixels at 100 % (96 per inch): A4 is 793.7 × 1122.5.
- Per-page change tracking for sync later: each page keeps a revision counter and the journal is a list of ops with ids, so merging is a matter of replaying both sides' ops.

## Ink

- Input: Pointer Events with `touch-action: none`. Pen and mouse draw, touch pans and zooms (two fingers; one finger optionally). Sabine 0.79 adds `events.pen` with the pen's proximity, barrel buttons and tilt, which Chromium's touch events can't carry; Heft ignores touch while the pen is near or touching (palm rejection), and the barrel button is a temporary eraser by default.
- Every coalesced sample is used (`getCoalescedEvents`), so fast strokes keep all of the pen's points. `getPredictedEvents` draws a short predicted tail that is replaced on the next frame.
- Width: `width × curve(pressure)`, with a pressure curve setting and per-pen pressure range (fountain pen varies a lot, ballpoint a little). The width at each point is computed when it's drawn and stored, so changing settings later never changes old strokes.
- Smoothing: a One Euro filter on position (smooths slow, careful writing, follows fast writing closely), strength from the stabilization setting. The last raw point is added on lift so the stroke ends where the pen did.
- Geometry: a stroke is the union of a circle at every point and the tangent quad between neighbours, filled once with the nonzero rule. The live stroke draws only its new segments; committing it draws the same geometry into the page, so nothing moves when the pen lifts.
- Layers: the live stroke has its own canvas over the visible area, never cleared during a stroke except for the predicted tail. Committed ink is drawn into tiles per page (512 device pixels, at the zoom rounded to a step of √2), created for what's visible and evicted least recently used. A new stroke is drawn into the tiles it touches; an erase redraws only the tiles under it. During pinch zoom tiles are scaled by CSS and redrawn once the zoom settles.
- Highlighter: drawn under ink inside each tile, each stroke one translucent fill; the live highlighter canvas is drawn opaque at the highlighter's opacity, which matches.
- Paper templates (lined, grid, dots, Cornell, staff) are SVG backgrounds of the page element: sharp at any zoom and cost nothing to scroll.
- Dark paper flips ink lightness in OKLab and keeps hue and chroma, so blue stays blue and black becomes white.

## Latency

Measured with Sabine's input trace (`SABINE_TRACE`): from the winit event to the compositor's presentation of the first frame after it. Numbers are in the milestone log below.

## PDF approach

pdf.js (as in Magpie), in its worker: pages render lazily to a per-page background canvas sized to the zoom, the text layer gives selection, text highlights and search, `getOutline` the table of contents. The original PDF is copied into the notebook's `sources/` and never written.

## Pieces that should probably move into @luft/ui

- The pdf.js asset plugin (`vite/pdfjs.ts`), now copied from Magpie.
- Color swatch picker, pen preset bar, pressure curve editor, page thumbnail rail.

## Milestone log

1. Ink core: in progress.
