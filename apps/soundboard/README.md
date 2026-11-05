# Soundboard

Soundboard plays sounds into games and calls. It gives the computer a second microphone called Soundboard, which carries your voice and your sounds together, and it plays them from a grid of tiles or with global hotkeys. Using it is described in [the docs](https://docs.luft.computer/apps/soundboard/), and how it works in [docs/components/soundboard.md](../../docs/components/soundboard.md).

## Build and run

Install dependencies once from the repository root with `bun install`, then from this folder:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # release bundle
```

`cargo test -p soundboard` starts a sound server and session manager of its own, so it needs `pipewire`, `wireplumber` and `pw-dump`, and never touches the computer's real sound.

Installed from the store it runs in a sandbox, where these are inside `~/.var/app/com.lantharos.soundboard`.

| Path | Contents |
|------|----------|
| `~/.config/com.lantharos.soundboard/settings.json` | Levels and settings |
| `~/.local/share/com.lantharos.soundboard/library.json` | Boards and sounds |
| `~/.local/share/com.lantharos.soundboard/sounds/` | Copied files, and the same sounds decoded for playing |

## License

GPL-3.0-or-later, like the rest of Luft. Open Runde and Maple Mono are under the SIL Open Font License, in `packages/web/ui/fonts`.
