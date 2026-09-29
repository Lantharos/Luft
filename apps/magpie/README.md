# Magpie

Magpie shows photos, videos, music and PDFs on the Luft desktop. It is built with Sabine and SvelteKit and lives at `apps/magpie` in the Luft monorepo; run the commands below from that directory unless noted otherwise.

## Two ways in

Opening a file, from Rover or as the default app, shows just that file. The rest of its folder is one arrow key away, and a strip of thumbnails can be shown along the bottom. Nothing else sits around it.

Starting Magpie on its own opens your Pictures folder with Pictures, Videos, Music and Documents in the sidebar, plus any other folder you pick. The sidebar follows what you are looking at: other photos in the folder, the pages of a PDF or the music queue.

Opening another file while Magpie is running switches to it. Songs opened while music is playing join the queue instead.

## Photos

- JPEG, PNG, WebP, AVIF, GIF, SVG, BMP and icons open directly; HEIC, JPEG XL, TIFF, TGA, QOI, OpenEXR, JPEG 2000 and PNM are decoded by the system's image loaders and kept in a cache, so they open instantly the next time
- Animated GIF, WebP and PNG play
- Zoom with the wheel, a pinch or the zoom controls, drag to pan, and double-click to switch between fitting the window and actual size
- Rotate, flip, copy, and set as wallpaper, which copies the picture into Pictures/Wallpapers and uses it for the current light or dark style
- Details with dimensions, camera, lens, exposure, date and location, with a link to the location on a map
- Slideshow
- The next and previous photos load in the background

## Videos

- Play, position with frame previews, volume, speed, picture in picture and fullscreen
- Subtitles from `.srt` and `.vtt` files next to the video (`Movie.srt`, `Movie.en.vtt`) and text subtitles inside MKV and MP4 files
- Each video remembers where you stopped
- VP9, AV1, VP8 and Theora play with Opus, Vorbis, FLAC and MP3 sound. For anything else, such as H.264, HEVC or AAC, Magpie names the format it can't play and offers the other apps that can

## Music

- The folder becomes the queue, in album order when the files are tagged
- Title, artist, album and cover from the file's tags, or `cover.jpg` and similar files in the folder
- Shuffle, repeat one or all, and the next song starts right as the current one ends
- Kestrel's media controls and other MPRIS clients see what is playing and can control it

## Documents

- PDFs with selectable text, links, search, zoom, fit width and fit page
- Page thumbnails in the sidebar, or in a panel you can show when a PDF was opened directly

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Left` / `Right` | Previous and next photo; seek in videos and music |
| `Page Up` / `Page Down` | Previous and next item |
| `Ctrl+Left` / `Ctrl+Right` | Previous and next video or song |
| `Space` | Play or pause |
| `+` / `-` / `0` / `1` | Zoom in, zoom out, fit, actual size |
| `R` / `Shift+R` | Rotate right and left |
| `H` | Flip |
| `F5` | Slideshow |
| `Up` / `Down` / `M` | Volume and mute |
| `S` | Shuffle |
| `Ctrl+F` | Find in a PDF |
| `Ctrl+C` | Copy the photo |
| `Alt+Enter` | Photo details |
| `F9` | Sidebar, thumbnail strip, queue or pages |
| `F` / `F11` | Fullscreen |
| `Ctrl+O` | Open a file |
| `Escape` | Leave fullscreen or the slideshow |

## Development

Magpie's controls, styles and native setup come from `packages/ui` and `packages/app`, so install dependencies once from the repository root:

```bash
bun install              # from the repository root
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
```

Local files are only readable from the packaged app, so photos, videos and music show up in production builds and bundles, not while running against the Vite dev server. Opening the Vite server in a regular browser shows the interface with real files instead: set `MAGPIE_OPEN` to a file to open it, or `MAGPIE_PLACES` to a folder to browse.

Formats beyond what Chromium shows need the `glycin-loaders` package and `bwrap`, which GNOME's image viewer relies on too.

## Install

```bash
sabine install .
```

The desktop entry registers Magpie for the image, video, audio and PDF types it can show.

## Project layout

```
magpie/
├── src/
│   ├── lib/
│   │   ├── api.ts, bridge.ts   bridge commands and the browser preview fallback
│   │   ├── app/                window state, shortcuts and opening files
│   │   ├── browse/             sidebar, places, folder gallery and thumbnail strip
│   │   ├── document/           PDF viewer, search and page thumbnails
│   │   ├── library/            the open folder, navigation and thumbnails
│   │   ├── music/              player, queue and music view
│   │   ├── photo/              loading, WebGL drawing, zoom and gestures, details
│   │   ├── playback/           shared volume and the media session
│   │   ├── shell/              header, stage and shared messages
│   │   └── video/              player, subtitles, frame previews and positions
│   └── routes/+page.svelte     window layout
├── vite/                       PDF assets and the browser preview
└── desktop/src/
    ├── folder/                 listing, kinds, places and folder watching
    ├── media/                  tags, covers, video streams and subtitles
    ├── mpris/                  MPRIS player
    ├── photo/                  native decoding, metadata and wallpaper
    └── bridge/                 bridge command registration
```

## License

MIT. Open Runde is licensed under the SIL Open Font License, included in `packages/ui/fonts/OFL.txt`.
