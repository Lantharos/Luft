# Keys

Keys makes your own keyboard layouts, dead keys and input methods for Luft, and imports and exports them in the usual formats. Using it is described in [the docs](https://docs.luft.computer/apps/keys/).

## Build and run

Install dependencies once from the repository root with `bun install`, then from this folder:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # release bundle
sabine install --bundle .
```

Installing registers the `kestrel-keys:` link scheme, which Settings and Kestrel [open Keys with](https://docs.luft.computer/developers/links/#keys).

Where your layouts and input methods are kept, and the input method format, are in [the Keys reference](../../docs/components/keys.md). Opening a layout or input method file with Keys imports it.

## License

MIT. Open Runde and Maple Mono are under the SIL Open Font License, in `packages/web/ui/fonts`.
