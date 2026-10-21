# Barometer

Barometer is Luft's system monitor and task manager: apps and processes with their processor, memory, disk and graphics use, and live graphs for the hardware. Kestrel opens it with `Ctrl+Shift+Esc`. Using it is described in [the docs](https://docs.luft.computer/apps/barometer/).

## Build and run

Install dependencies once from the repository root with `bun install`, then from this folder:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # release bundle
sabine install --bundle .
```

With `LUFT_SAMPLE_SYSTEM` set, Barometer shows sample hardware and processes instead of this computer's. Preferences are saved to `~/.config/barometer/settings.json`.

## License

MIT. Open Runde and Maple Mono are under the SIL Open Font License, in `packages/ui/fonts`.
