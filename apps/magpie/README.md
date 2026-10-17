# Magpie

Magpie shows photos, videos, music, PDFs and fonts on Luft. Opening a file shows just that file, with the rest of its folder an arrow key away; started on its own, it browses Pictures, Videos, Music and Documents. Using it is described in [the docs](https://docs.luft.lanth.me/apps/magpie/).

## Build and run

Install dependencies once from the repository root with `bun install`, then from this folder:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # release bundle
sabine install --bundle .
```

Installing registers Magpie for the image, video, audio, PDF and font types it can show.

Local files are only readable from the packaged app, so media shows up in builds and bundles, not in the Vite dev server. `bun run dev` in a regular browser reads real files instead: set `MAGPIE_OPEN` to a file to open it, or `MAGPIE_PLACES` to a folder to browse.

Formats beyond what Chromium shows, such as HEIC and JPEG XL, need the `glycin-loaders` package and `bwrap`. Videos Chromium can't decode play through GStreamer.

## License

MIT. Open Runde is under the SIL Open Font License, in `packages/ui/fonts/OFL.txt`.
