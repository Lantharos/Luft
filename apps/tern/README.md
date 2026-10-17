# Tern

Tern is Luft's terminal: tabs and split panes, jumping between prompts, a notification when a long command finishes in the background, and colors that follow the wallpaper. Using it is described in [the docs](https://docs.luft.lanth.me/apps/tern/).

## Build and run

Install dependencies once from the repository root with `bun install`, then from this folder:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # Sabine bundle
sabine install --bundle .
```

The interface only runs inside the native window. Installing registers Tern as a terminal, so `xdg-terminal-exec` and Rover's "Open in terminal" find it.

| Option | Effect |
|--------|--------|
| `--working-directory DIR` | Start in `DIR` |
| `-e`, `-x`, `--` | Run everything after it instead of your shell |

When Tern is already running, these open a new tab in the existing window.

Tern starts your login shell with `TERM=xterm-256color` and `COLORTERM=truecolor`. For bash, zsh and fish it adds prompt hooks without touching your configuration files.

## License

MIT. Open Runde and Maple Mono are under the SIL Open Font License, in [`packages/ui/fonts`](../../packages/ui/fonts).
