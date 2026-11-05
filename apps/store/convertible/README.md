# Convertible

Convertible converts pictures, videos, music, documents, archives and fonts, and edits them in the same window: crop, resize, trim, mark up, redact and compress to a file size, one file or a whole folder at a time. Everything happens on your computer. Using it is described in [the docs](https://docs.luft.computer/apps/convertible/).

## Build and run

Install dependencies once from the repository root with `bun install`, then from this folder:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # release bundle
cargo test -p convertible
```

Every conversion, probe and preview runs in a process of its own, started from the same program with `--convertible-worker`. It runs at low priority and is cut off from the network, so pausing, cancelling and crashing never touch the window. `desktop/src/engine` holds the conversions and `desktop/src/queue` decides how many run at once.

The formats a computer can write depend on what's installed: video and sound go through GStreamer and a few picture formats through glycin's loaders, so both are probed when the app starts, and formats without an encoder are shown as unavailable, with the reason.

| Path | Contents |
|------|----------|
| `~/.config/convertible/presets.json` | Saved presets |
| `~/.config/convertible/preferences.json` | Where results go |
| `~/.cache/com.lantharos.convertible/` | Previews and what the computer can encode |

## License

GPL-3.0-or-later, like the rest of Luft, which libimagequant needs as well. Everything else built into the program is under MIT, Apache-2.0, BSD, Zlib, ISC, Unicode or similar licences; glycin is under MPL-2.0 or LGPL-2.1-or-later. Open Runde and Maple Mono, used for text in pictures and PDFs, are under the SIL Open Font License, in `packages/web/ui/fonts`.

GStreamer and glycin's loaders are the system's and aren't bundled, so no patented codec ships with Convertible. On Luft those encoders come from the image.
