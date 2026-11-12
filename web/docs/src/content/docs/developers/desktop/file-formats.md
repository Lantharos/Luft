---
title: Heft's file format
description: The folders, JSON files and binary page format Heft keeps its library in, version 1.
sidebar:
  order: 13
---

[Heft](/apps/heft/) keeps its library as ordinary files, so Rover shows them, backups copy them and other tools can read them. This is format version 1.

```
~/Documents/Heft/
  Matematika/                      a subject, named after it
    subject.json
    Beleške.heft/                  a notebook, named after it
      notebook.json
      search.json                  typed text by page, for search
      handwriting.json             handwriting read on this computer, for search
      recordings/<id>.opus         a recorded class
      recordings/<id>.json         what was said in it and the notes made of it
      pages/<id>.page              a page's ink, text and pictures
      pages/<id>.journal           changes since the .page was last written
      assets/<id>.<ext>            pictures placed on pages
      sources/<id>-<name>.pdf      PDFs, exactly as they were imported
      sources/<…>.pdf.text.json    each PDF page's text, for search
  .trash/                          trashed subjects and notebooks, for 30 days
```

Folder names are what people typed, so renaming a subject or notebook renames its folder. Everything inside refers to things by ID: random 52-bit numbers written in base 36, which never change.

## Subjects and notebooks

```json
{ "format": 1, "id": "…", "name": "Matematika", "color": "#3d6fb6", "icon": "book", "order": 0, "archived": false }
```

```json
{
  "format": 1, "id": "…", "name": "Beleške", "kind": "notes", "subject": "<subject id>",
  "paper": { "template": "lined", "size": "a4", "landscape": false, "color": "white", "spacing": 8 },
  "typed": false,
  "pages": [{ "id": "…", "created": 1794142000000, "paper": { "template": "grid" } },
            { "id": "…", "created": 1794142000000, "pdf": { "source": "<file in sources>", "index": 0, "width": 793.7, "height": 1122.5 } }],
  "sections": [{ "id": "…", "title": "Lekcija 4", "page": "<page id>" }],
  "trashed": [{ "page": { … }, "index": 3, "at": 1794142000000 }],
  "recordings": [{ "id": "…", "file": "recordings/<id>.opus", "page": "<page id>", "processing": "charger",
                   "spans": [{ "at": 1794142000000, "from": 0 }, { "at": 1794142900000, "from": 600000 }], "length": 2712000 }],
  "created": 1794142000000, "modified": 1794142000000
}
```

`kind` is `notes` or `book`. A page's own `paper` overrides the notebook's. `typed` marks a notebook made for typing, where text that reaches the bottom of a page carries on at the top of the next. Templates are `blank`, `lined`, `grid`, `dotted`, `cornell` and `staff`; sizes `a4`, `a5`, `letter` and `infinite`; colours `white`, `cream` and `dark`; `spacing` is in millimetres. An infinite page also has `height`, how far it has grown in page units: it grows by 160 mm whenever something is written within 120 mm of its end. Times are milliseconds since 1970.

## Pages

Page coordinates are CSS pixels at 96 per inch, from the page's top left corner, so A4 is 793.7 × 1122.5. All numbers are little endian.

A `.page` file is a 12-byte header, the strokes, then the page's text boxes and pictures:

| Bytes | Holds |
| --- | --- |
| 4 | `HEFT` |
| 2 | Format version, 1 |
| 2 | Reserved |
| 4 | Number of strokes |
| … | Each stroke |
| 4 | Length of what follows |
| … | The objects as JSON |

A stroke is a 40-byte header and 14 bytes for each point:

| Bytes | Holds |
| --- | --- |
| 8 | ID, as a float64 |
| 8 | Order on the page, as a float64; higher is on top |
| 1 | Tool: 0 pen, 1 highlighter |
| 1 | Nib: 0 fountain, 1 ballpoint |
| 2 | Reserved |
| 4 | Colour, `0xRRGGBB` |
| 4 | Width, float32 |
| 4 | Number of points |
| 8 | When the stroke started, float64 milliseconds |
| 4 + 4 | Each point's x and y, float32 |
| 2 | Its width, in hundredths |
| 2 | Pressure, 0 to 65535 |
| 2 | Milliseconds since the previous point |

Each point keeps the width it was drawn with, so a later change of settings never changes old writing. A stroke's outline is a circle at every point, joined to its neighbours by their common tangents. Highlighter strokes are drawn under pen strokes, at 38% opacity.

Objects are `{ id, kind, x, y, width, height }`. Text boxes add `html`, `text` and `typedAt`, when the text was first typed or written, and their HTML only uses `b`, `strong`, `i`, `em`, `u`, `h2`, `h3`, `ul`, `ol`, `li`, `br`, `div`, `p` and `blockquote`. Pictures add `asset`, and a cropped one `crop`, `{ x, y, width, height }` as shares of the picture's full size; the asset itself never changes.

Text typed on the paper's lines also has `line`, its line height, and `size`, its type size, both in page units: its first baseline sits on a line of the paper and every line after it on the next. Text without them is set at 16 with a line height of 1.45. `flow` marks the text a notebook made for typing carries from page to page. Text turned from handwriting keeps what was read in `written`, one `{ text, glyphs }` for each line read, where `glyphs` has four numbers for each character of `text`: the left, top, right and bottom of the ink it was read from. Editing the text doesn't change `written`.

## Journals

A `.journal` is a list of records, each `[length u32][crc32 u32][op u8][payload]`, where the length and CRC cover the op and the payload:

- Op 1 replaces strokes: the number of removed IDs, those IDs as float64, the number of added strokes, and the strokes.
- Op 2 changes objects: JSON `{ "put": [objects], "drop": [ids] }`.

Reading a page means reading its `.page` and applying its journal in order. A record whose length runs past the end, or whose CRC doesn't match, was cut short by a power cut, and it and everything after it are ignored. Every record is on the disk before Heft goes on. When the journal grows past 256 KB, when a page leaves memory and when Heft closes, the whole page is written to a new `.page` and the journal emptied. Replaying a journal over a page that already has its changes gives the same page.

## Handwriting

`handwriting.json` holds what was read from each page's handwriting while handwriting search is on:

```json
{
  "format": 1,
  "pages": { "<page id>": { "ink": "1x2k9q", "lines": [{ "text": "Kvadratna jednačina", "box": { "left": 72, "top": 140, "width": 410, "height": 38 } }] } },
  "changed": ["<page id>"]
}
```

`ink` names the set of pen strokes the page was read with, so a page whose ink comes back as it was isn't read again. `lines` are in reading order, each with where on the page it was written. `changed` lists pages whose ink changed since; they're read again at the next pause in writing. Deleting the file only means everything is read again.

## Recordings

A recorded class is listed in `recordings` in its `notebook.json` and kept in `recordings/<id>.opus`: Ogg Opus, mono, 48 kHz, 24 kbit/s, about 11 MB an hour. It's written as it's made, one second to an Ogg page, each on the disk before the next, so a crash or power cut loses at most the last second and leaves a file any player opens. `length` is set when recording stops; a recording without one was cut short, and its length comes from the last page in the file.

`spans` maps the clock to the recording: from `at`, in milliseconds since 1970, the recording is `from` milliseconds in, and each pause that ended adds a span. Something written between a span's `at` and the start of the next span was written while that moment was recorded, and writing during a pause belongs to the moment it paused at. That is how a stroke's start time, or a text box's `typedAt`, finds what was said as it was written. `page` is the page in view when recording started. `processing` is `now` or `charger`: whether the transcript and notes wait until the computer is plugged in.

`recordings/<id>.json` holds what Heft made of the recording, through the [on-device models](/developers/desktop/models/):

```json
{
  "format": 1,
  "said": [{ "start": 4000, "end": 6200, "language": "sr", "text": "Danas nastavljamo sa kvadratnim jednačinama." }],
  "next": 2712000, "transcribed": true,
  "notes": {
    "parts": [{ "points": [{ "text": "…", "at": 27000 }], "definitions": [{ "term": "…", "meaning": "…", "at": 61000 }],
                "homework": [{ "task": "…", "due": "…", "at": 248000 }], "questions": [{ "question": "…", "answer": "…", "at": 151000 }] }],
    "next": 412, "heading": { "title": "…", "summary": "…" }, "done": true
  }
}
```

`said` is in order, with times in milliseconds from the start of the recording and the language of each piece. `next` is how far the recording is transcribed, and `notes.next` the first piece of `said` without notes yet, so both go on from where they stopped. Each item's `at` is when it was said. Editing the notes in Heft changes them here. Deleting the file only means the recording is transcribed again.
