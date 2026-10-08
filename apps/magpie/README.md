# Magpie

Magpie shows photos, videos, music, PDFs and fonts on Luft. It is built with Sabine and Svelte.

Opening a file shows just that file, with the rest of its folder an arrow key away. Started on its own, Magpie opens Pictures with Pictures, Videos, Music and Documents in the sidebar and a button to open any other folder.

## Features

- Photos: common formats directly, plus HEIC, JPEG XL, TIFF, OpenEXR, JPEG 2000 and more through the system's image loaders; animated GIF, WebP and PNG play
- Zoom, pan, rotate, flip, copy, slideshow, camera details with a map link, and set as wallpaper
- Videos with frame previews, speed, picture in picture, subtitles from `.srt`/`.vtt` files or inside MKV and MP4, and resume where you stopped
- Formats the page can't decode, such as H.264 and HEVC, play through GStreamer with the same controls; Magpie offers other apps when a video can't play at all
- Music: the folder becomes the queue, with tags and covers, shuffle and repeat; Kestrel's media controls and other MPRIS clients can control it
- PDFs with selectable text, links, search, zoom and page thumbnails
- Fonts (TrueType, OpenType, collections, WOFF, WOFF2) with samples, a character grid, details, variable font axes and collection faces
- Install fonts to `~/.local/share/fonts`, remove your own, or make one the system or monospace font
- Opening another file switches to it; songs opened during playback join the queue
- Drop files on the window to open them, and drag thumbnails out to put the files in other apps

## Build and run

Install dependencies once from the repository root with `bun install`, then from this directory:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # release bundle
```

Local files are only readable from the packaged app, so media shows up in production builds and bundles, not in the Vite dev server. `bun run dev` in a regular browser reads real files instead: set `MAGPIE_OPEN` to a file to open it, or `MAGPIE_PLACES` to a folder to browse.

Formats beyond what Chromium shows need the `glycin-loaders` package and `bwrap`.

## Install

```sh
sabine install --bundle .
```

Installing registers Magpie for the image, video, audio, PDF and font types it can show.

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Left` / `Right` | Previous and next photo or font; seek 5 seconds in videos and music |
| `J` / `L` | Seek 10 seconds back or forward in videos |
| `Home` | Back to the start of a video |
| `Page Up` / `Page Down` | Previous and next item |
| `Ctrl+Left` / `Ctrl+Right` | Previous and next video or song |
| `Space` | Play or pause; `K` also works in videos |
| `+` / `-` / `0` / `1` | Zoom in, zoom out, fit (fit width in PDFs), actual size |
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
| `Escape` | Leave the slideshow, search or fullscreen |

## Files

| Path | Contents |
|------|----------|
| `~/Pictures/Wallpapers/` | Pictures set as wallpaper |
| `~/.local/share/fonts/` | Installed fonts |

## License

MIT. Open Runde is licensed under the SIL Open Font License, included in `packages/ui/fonts/OFL.txt`.
