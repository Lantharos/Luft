# Easel

Easel is Luft's image editor and whiteboard: quick edits for a picture opened from Rover, layers, selections and brushes in the editor, and an endless board for sketches and diagrams. Using it is described in [the docs](https://docs.luft.computer/apps/easel/), and its file format and renderer in [Easel's documents and rendering](https://docs.luft.computer/developers/desktop/easel/).

## Build and run

Install dependencies once from the repository root with `bun install`, then from this folder:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # release bundle
sabine install --bundle .
```

Opening files needs a build or bundle, since Sabine's local file access only works from the packaged app. TIFF and HEIC need the `glycin-loaders` package and `bwrap`.

| Path | Contents |
|------|----------|
| `~/.config/easel/settings.json` | Settings |
| `~/.config/easel/recent.json` | Recent files |

## License

GPL-3.0-or-later. Open Runde is under the SIL Open Font License, in `packages/web/ui/fonts/OFL.txt`.
