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
| `objects/` | Text boxes and pictures, cropping and the camera |
| `typing/` | Typing anywhere: the caret, Markdown-like line starts and text carrying on to the next page |
| `handwriting/` | Reading handwriting for search, in the background |
| `convert/` | Turning writing into text when the pen pauses, and pen corrections of that text |
| `recording/` | Recording classes, playing them in step with the writing, and their transcripts and notes |
| `search/`, `export/` | The search index and command palette; PDF and PNG output |
| `canvas/ruler/` | The ruler and keeping strokes on its edge |
| `home/`, `rail/`, `shell/`, `tools/`, `settings/`, `paper/`, `selection/`, `drag/`, `app/`, `input/` | Screens and their state |

## Ink

- Pen events come from Sabine as Chromium pointer events (`pointerType` pen, pressure). Sabine 0.79 added `events.pen` with what touch events can't carry: whether the pen is near, which end is down and tilt. Heft ignores touch while the pen is near or was seen in the last 450 ms (palm rejection). Sabine 0.80 gave the pen a touch id no finger can take, so a palm can't join a stroke inside Chromium.
- The pen's side buttons are Luft's, set once for every app in Settings → Pen, and Heft doesn't map them again: a button set to erase makes the compositor swap the pen for its eraser end while held, which Heft erases with like the real other end, with the eraser options chosen in Heft. A button set to click clicks. Heft once had its own button choices, but with the compositor already turning the button into a click, a key or a screenshot, both acted at once.
- Samples are handled in `pointerrawupdate`, as soon as they reach the page instead of at the next animation frame, with every coalesced sample, so fast strokes keep all of the pen's points. `getPredictedEvents` draws a short predicted tail on a second canvas, the only thing cleared while the pen moves.
- A stroke is the union of a circle at each point and the tangent quad between neighbours, filled once with the nonzero rule. The live canvas draws only each new segment; committing draws the same geometry into the page's tiles, so nothing moves when the pen lifts. New pen strokes are drawn on top of existing tiles without redrawing them; erasing redraws only the tiles it touched.
- Committed ink lives in 256-pixel tiles per page at the current zoom, created for what's visible and released when far away. Pinch and Ctrl+wheel zoom scale the content with CSS while the gesture lasts and redraw tiles once it settles.
- Smoothing is a One Euro filter (steady when slow, close behind when fast); the raw last point ends the stroke. Width is computed per point from pressure through the curve setting and stored, so settings never change old writing.
- Templates are SVG backgrounds, sharp at any zoom and free to scroll. Dark paper flips ink lightness in OKLab and keeps hue and chroma.

## Ruler, carrying and pictures

- The ruler lives in screen pixels per pane, so pages scroll and zoom under it. A stroke that starts within 26 px of a long edge, or on the ruler, has every sample projected onto that edge, offset by the pen's radius, before smoothing; shape recognition is off for it.
- Lasso selections and picked book text can be carried to the other pane. A lasso on a book page also keeps the looped area itself, and across panes it lands as a picture of that part of the page (pdf.js at twice the size, plus the ink); ink from notes pages is copied as strokes.
- Crops are stored with the picture (`crop`, shares of the full picture), so the asset is never rewritten and a crop can be undone or changed later.
- The camera goes through the camera portal: Heft's native side opens the PipeWire remote the portal hands it, asks for MJPG or raw YUY2/RGB, keeps only the newest frame, and the page pulls frames one at a time, so a slow page never queues frames.

## Handwriting search

The page sorts each page's pen strokes into lines (`handwriting/lines.ts`) and sends them one at a time to `luft-handwriting` over D-Bus, which reads them with Qwen3-VL 2B (see `docs/components/handwriting.md`). It waits until nobody has written for 15 s and the pen isn't near, checks again before every line, and the service itself runs at idle priority and refuses while the battery is low. Results go to `handwriting.json` per notebook and into the search index as `ink` entries with each line's box, which search previews mark.

## Typing

Typing is for a real keyboard, so neither a finger nor the pen ever focuses text. A mouse click puts a caret where it landed: into text that's there, or into a text box that exists only until something is typed in it, so a stray click leaves nothing behind and nothing to undo. With the mouse, a press that doesn't move is the click; anything longer draws. A tap with a finger, or with the pen while **Type** is picked, only marks the spot (`editing.aim`), and only while Kestrel says a keyboard is there to type on (`appearance.keyboard`, the settings portal's `keyboard-attached`); the next letter typed starts typing there and goes in as its first letter (`shell/keyboard.ts`).

Text boxes are `inputmode="none"`. Chromium reports that to Sabine as no text input at all, so Sabine turns the window's text input off and the compositor never brings up its on-screen keyboard, and Mutter's habit of showing it for an enabled text input after a tap has nothing to act on. The cost is that input methods that compose, like Chinese, don't work in text boxes; layouts and dead keys do. Dialogs' fields, such as renaming a notebook, are ordinary fields and still bring up the on-screen keyboard when tapped. The box sits on the paper's lines (`paper/lines.ts`): lined paper's rules, every grid line or every other one on squared and dotted paper (never closer than 5.5 mm), an unprinted 8 mm grid on blank pages, and the line height text always had on book pages. The type size follows the line height. Where a line's baseline falls is measured once per size from the font itself, so the text sits on the rules whatever the font's metrics. Boxes run to the page's right margin and wrap. Their CSS is global (`objects/text-box.css`), so measuring, the page and the PDF picture of a box all use the same rules.

A notebook made for typing (`typed`) has one flowing box a page; when its lines pass the bottom margin, the lines that don't fit move to the next page's flowing box, onto an empty page, or onto a new page put after this one, and the caret moves with them.

## Turning writing into text

`convert/converter.svelte.ts` collects each page's new pen strokes and waits until the pen has rested (0.8 s at first, a setting). Strokes over text that came from handwriting are corrections (`marks.ts` reads each stroke's shape against the line under it: through the words, a tap or caret, a small stroke above, through or under a letter, or writing); the rest are sorted into lines with the same code search uses and read with `RecognizeNow`, which goes ahead of background reading in the service. On the RTX 3060 of the development PC a line takes about 0.2 s, so text appears a little over a second after the last stroke, most of it the pause.

What the model reads is tidied for the person's languages (`normalize.ts`): words it read as look-alike Cyrillic come back as Latin when they write in Latin letters, and an accent none of their languages use becomes the one they do when the base letter has only one, like ē for ë. Accents drawn over letters are placed by `diacritics.ts`: the mark's shape gives a combining character, Unicode composition says which letters exist with it, and letters of the person's languages win over others, so a caron over `c` makes `č` but over `e` still makes `ě`. Writing over words is read on its own and replaces the run of covered words that matches it best, since handwriting is wider than type; when it reads as another script than the text, it stays ink.

On the synthetic samples (`services/handwriting/tools/samples.py`), words wrong after each step:

| Lines | Read | Tidied | Accents drawn over wrong letters | Words still wrong written again |
| --- | --- | --- | --- | --- |
| German, English | 0% | 0% | 0% | 0% |
| Serbian | 11.4% | 11.4% | 5.7% | 2.9% |
| Albanian | 43.6% | 43.6% | 41.0% | 28.2% |

Tidying matters most for words read on their own, as when one is written again: Serbian words wrong fall from 37% to 26% and Albanian from 67% to 46%. Albanian stays weak because the model reads ë as ä, ö or i, with the wrong letter under the dots, which an accent can't fix. Each converted line keeps where every character's ink was (`written`), and with the setting on, corrections go to `corrections.jsonl` in Heft's data folder with the strokes, never anywhere else.

## Recording classes

- **Recording** belongs to the native side (`desktop/src/recording/`), not the page: a PipeWire stream from the default microphone at 48 kHz mono, opened only while recording and closed while paused, feeds a thread that encodes 20 ms Opus frames at 24 kbit/s into Ogg pages of one second, each synced before the next. Heft is a Sabine background app, so closing the window during a recording leaves the process recording. It quits when the window closes with nothing recording: a closed window has left the bridge by the time it's reported hidden, so an event sent then reaches no one, while a minimized window still hears it. The PipeWire client is Heft's own process, so Kestrel's microphone indicator names Heft.
- **Sync** needs nothing new from ink: strokes already carry the clock time they started and each point's delay. A recording keeps `spans`, clock time to recording time for every stretch between pauses, so any stroke maps to its moment. Text boxes gained `written`. While a recording is open, tiles fade what the playhead hasn't reached: `TileLayer.setUnwritten` redraws only the tiles of strokes that crossed it since the last frame. A tap that doesn't move with the player open goes to `SurfaceHost.tapped` instead of drawing a dot, and plays from the nearest point of ink, three seconds early.
- **Transcripts** come from `luft-speech --transcription` (`com.lantharos.Transcription1`), handed the open file, two minutes per request; **notes** from `luft-language` (`com.lantharos.Language1`) in parts of twelve minutes. Both run at idle priority and refuse below 30% battery. `recording/processing.svelte.ts` drives them one recording at a time: only after 15 s without writing and with the pen away, for `charger` recordings only on mains power (UPower's `OnBattery`, followed by signal), saving after every piece to `recordings/<id>.json` so nothing is redone after unplugging, closing or a power cut. A recording still being made is transcribed as it grows when it's set to `now`.
- whisper.cpp and llama.cpp each bring their own ggml, which can't be linked into one binary, so notes are a service of their own rather than part of speech. Handwriting runs llama.cpp too; it and the language model could become one local-model service later.

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

## Tools over the page

Folded or upright, and on a laptop when **Floating** is picked, the tools are a dock floating over the paper (`tools/Dock.svelte`), not a bar that takes room from it: a bar above the page is a long reach on a tablet, and a page shorter than the window was centred under it, which left an empty band. The dock is the same `Toolbar` turned vertical, so every tool works the same in each place. It starts on the side away from the writing hand, read once from Kestrel's settings portal (`pen-hand` in `com.lantharos.kestrel`, from `com.lantharos.kestrel.pen hand`), since Heft's sandbox can't read GSettings; dragging its handle snaps it to the nearer side, and the side and height are kept in Heft's state (`tools/dock.svelte.ts`). A pen stroke that starts away from the dock and comes within 64 px of it fades the dock and turns off its hit testing until 0.9 s after the pen lifts, so writing carries on under it and a stroke starting on it in that time lands on the page. Pen, eraser and menu options open beside it (`Popover`'s `side`). Formatting for text being typed floats just above the text box (`objects/FormatBar.svelte`), so nothing in the tools changes size while typing.

## Should move into @luft/ui

- The pdf.js asset plugin (`vite/pdfjs.ts`), copied from Magpie.
- The drag and drop helpers in `drag/` (pen and touch friendly, with a hold for fingers).
- A colour swatch grid, the pressure curve editor, the page thumbnail rail and `focusField` for dialogs.
- `Switch` has no visible label of its own; every app wraps it the same way.

## Milestone log

1. **Ink core**: done. Pen, highlighter, both erasers, pressure and curve, smoothing, prediction, palm rejection, undo across pages, pinch and wheel zoom, kinetic pan, templates, sizes and paper colours, journaled autosave.
2. **Organization**: done. Subjects, notebooks, sections, home with recent pages, tabs, the page rail with thumbnails, dragging pages, notebooks and subjects, archive, trash and deleted pages.
3. **Books**: done. PDF import (menu, drop, opening PDFs with Heft), writing on books, text picking with clean highlights and copying, contents, a notebook beside the book remembered per subject, quotes into the notes beside.
4. **Tools**: done. Shapes (line, arrow, triangle, rectangle, ellipse), lasso (move, resize, rotate, recolour, copy, cut, duplicate, delete, paste), the ruler, text boxes with headings, bold and lists, pictures (choose, paste, take with the camera, crop), pens and their colours, two- and three-finger taps, carrying lasso selections and book text between the panes.
5. **Search and export**: done. Search over typed text, section, notebook and subject names and book text, accents ignored, grouped with where each hit is; command palette; PDF (vector ink, with or without the paper) of a page, section or notebook, and PNG of a page. Hits show their page small with the hit marked.
6. **Polish**: done. English and Serbian (Cyrillic, and Latin through `bun run transliterate`), settings for pen and touch, full-screen writing, tools along the top or down the side, pages one at a time, an infinite page that grows as you write, and tablet mode: Kestrel publishes it as `tablet-mode` in the settings portal and `luft-app` hands it to every app as `appearance.posture`; folded, or in a window taller than it is wide (`app/arrangement.svelte.ts`), the page fills the width edge to edge with no margin above it, the tools float over it as a dock and the page rail is remembered apart and starts hidden, so turning the screen changes nothing but the page's size; folded, targets are bigger too.
7. **Handwriting search**: done, as an opt-in download.
8. **Typing and writing into text**: done. Typing anywhere on the paper's lines, notebooks made for typing, paper per page, writing turned into text on a pause or from the lasso, and pen corrections. Not yet: sync, and reading trained on corrections.
9. **Recording classes**: done. Recording that outlives the window, pause and resume, a reminder to ask before recording in each subject, playback that fills in the writing as it plays, tapping ink or text to hear it, transcripts in mixed languages and notes with their moments, searchable, editable and put on a page, waiting for the charger when asked to.
