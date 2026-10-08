# Tern

Tern is the terminal for Luft. Built with Sabine and Svelte.

## Features

- Tabs and split panes with draggable dividers
- New tabs and panes open in the current folder
- Jump between prompts, and a notification when a long command finishes in the background
- Find with match case and regular expressions
- `Ctrl`+click opens links, including ones programs mark up themselves such as `ls --hyperlink`
- Programs can copy to the clipboard; reading it is off until allowed in Preferences
- Multi-line or risky pastes ask first, and closing a running program asks too
- A soft flash instead of a bell sound
- Follows the desktop accent, style, monospace font and text size, with an optional see-through background
- Uses Kestrel's wallpaper-based terminal colors, and its own Luft colors elsewhere

## Build and run

Install dependencies once from the repository root with `bun install`, then from this directory:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # Sabine bundle
```

The interface only runs inside the native window.

## Install

```sh
sabine install --bundle .
```

This registers Tern as a terminal, so `xdg-terminal-exec` and Rover's "open in terminal" find it.

## Command line

| Option | Effect |
|--------|--------|
| `--working-directory DIR`, `--working-directory=DIR` | Start in `DIR` |
| `-e`, `-x`, `--` | Run everything after it instead of your shell |

```sh
tern --working-directory ~/Projects
tern -e ssh example.org
```

When Tern is already running, these open a new tab in the existing window.

## Shell integration

Tern starts your login shell, or the one chosen in Preferences, with `TERM=xterm-256color` and `COLORTERM=truecolor`. For bash, zsh and fish it adds prompt hooks without touching your configuration files, which enable prompt jumping, finished-command notifications and opening new tabs in the current folder.

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+T` | New tab |
| `Ctrl+Shift+W` | Close pane |
| `Ctrl+Shift+D` / `Ctrl+Shift+E` | Split right, split down |
| `Alt`+arrows | Move between panes |
| `Ctrl+Page Up` / `Ctrl+Page Down` | Previous, next tab |
| `Ctrl+Shift+Page Up` / `Ctrl+Shift+Page Down` | Move the tab left, right |
| `Alt+1` … `Alt+9` | Go to a tab; `Alt+9` is the last |
| `Ctrl+Shift+C` | Copy |
| `Ctrl+Shift+V` / `Shift+Insert` | Paste |
| `Ctrl+Shift+A` | Select all |
| `Ctrl+Shift+F` | Find |
| `Ctrl+Shift+Up` / `Ctrl+Shift+Down` | Previous, next prompt |
| `Ctrl+Shift+Home` / `Ctrl+Shift+End` | Top, bottom of the history |
| `Ctrl+Shift+K` | Clear the history |
| `Ctrl++` / `Ctrl+-` / `Ctrl+0` | Larger, smaller, default text |
| `Ctrl+,` | Preferences |

## License

MIT. Maple Mono and Open Runde are licensed under the SIL Open Font License, included in [`packages/ui/fonts`](../../packages/ui/fonts).
