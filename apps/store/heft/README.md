# Heft

Heft is a notebook for writing with a pen: subjects, notebooks and PDF textbooks you can write and highlight in, side by side, searchable, with classes recorded and turned into notes on the computer. Using it is described in [the docs](https://docs.luft.computer/apps/heft/), its file format in [docs/components/heft.md](../../../docs/components/heft.md), and how it's built in [NOTES.md](NOTES.md).

## Build and run

Install dependencies once from the repository root with `bun install`, then from this folder:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # release bundle
```

`SABINE_TRACE=1` prints how long pen, touch and mouse moves take to reach the screen.

Installed from the store it runs in a sandbox that reaches Documents, reads Downloads and Pictures, and records from the microphone only while you record a class, so its settings and backups are inside `~/.var/app/com.lantharos.heft`.

| Path | Contents |
|------|----------|
| `~/Documents/Heft/` | The library: a folder per subject, a `.heft` folder per notebook |
| `~/.config/com.lantharos.heft/` | Settings, pens, open tabs and where each notebook was left |
| `~/.local/state/com.lantharos.heft/backups/` | A copy of the library for each of the last 14 days |

## License

GPL-3.0-or-later, like the rest of Luft. Open Runde and Maple Mono are under the SIL Open Font License, in `packages/web/ui/fonts`.
