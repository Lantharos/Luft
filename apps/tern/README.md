# Tern

Tern is the terminal for the Luft desktop, built with Sabine and SvelteKit. In the Luft monorepo it lives at `apps/tern`; run the commands below from that directory unless noted otherwise.

## Features

- Tabs, and panes split side by side or on top of each other, with draggable dividers
- New tabs and panes open in the folder you were working in
- Jump between prompts, and a notification when a long command finishes while you're looking elsewhere
- Find with match case and regular expressions, with every match highlighted
- Links in the output open with `Ctrl` and a click, including links that programs mark up themselves, such as `ls --hyperlink`
- Programs can copy to the clipboard, which editors and multiplexers over SSH rely on
- Programs can also read the clipboard once you allow it in Preferences; it stays off because programs on other computers can ask too
- Pasting text with several lines, or text that looks risky, asks first and shows what is about to be pasted
- Before closing a tab or pane with a program still running, Tern asks
- A bell shows as a soft flash instead of a sound
- The desktop accent, light or dark style and a see-through, blurred background
- Maple Mono with Nerd Font symbols, emoji and wide characters

Tern keeps up with heavy output such as a large `cat`, `yes` or a long build: output is drawn at most once per frame, and when a program writes faster than it can be shown, the program waits instead of the window freezing.

## Development

Tern uses Sabine's shared Chromium runtime. Its controls, fonts and window setup come from `packages/ui` and `packages/app`, so install dependencies once from the repository root:

```bash
bun install              # from the repository root
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
```

The interface only runs inside the native window, since every terminal is backed by the native side.

## Install

```bash
sabine install .
```

Installing registers Tern as a terminal, so the Start menu files it with system tools and finds it when you search for a console or shell, and launchers that look for a terminal, such as `xdg-terminal-exec`, find it. Rover opens folders in Tern when it is installed.

## Command line

```bash
tern --working-directory ~/Projects
tern -e htop
tern -e ssh example.org
```

`--working-directory` (also `--working-directory=DIR`) chooses the starting folder, and everything after `-e` runs instead of your shell. When Tern is already running, these open a new tab in the existing window.

## Shell integration

Tern starts your login shell from the user database, or the one chosen in Preferences, with `TERM=xterm-256color` and `COLORTERM=truecolor`. For bash, zsh and fish it adds a few prompt hooks without touching your configuration files: your usual startup files still run, and the hooks tell Tern where the prompt starts, when a command runs and finishes, and which folder you are in. Other shells work as before, without those extras.

## Colors

Tern uses the terminal colors Kestrel makes from the wallpaper: sixteen colors tuned toward the accent, each readable against the background, with a cursor and selection in the accent. They follow wallpaper and style changes right away. Outside Kestrel, Tern uses its own Luft colors. With the see-through background on, the desktop shows through the whole window behind a tint of the background color, and Preferences sets how strong the tint is.

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+T` | New tab |
| `Ctrl+Shift+W` | Close pane |
| `Ctrl+Shift+D` / `Ctrl+Shift+E` | Split right, split down |
| `Alt+Arrow keys` | Move between panes |
| `Ctrl+Page Up` / `Ctrl+Page Down` | Previous and next tab |
| `Ctrl+Shift+Page Up` / `Ctrl+Shift+Page Down` | Move the tab left or right |
| `Alt+1` … `Alt+9` | Go to a tab, `Alt+9` for the last one |
| `Ctrl+Shift+C` / `Ctrl+Shift+V` | Copy and paste |
| `Ctrl+Shift+A` | Select all |
| `Ctrl+Shift+F` | Find |
| `Ctrl+Shift+Up` / `Ctrl+Shift+Down` | Previous and next prompt |
| `Ctrl+Shift+Home` / `Ctrl+Shift+End` | Top and bottom of the history |
| `Ctrl+Shift+K` | Clear the history |
| `Ctrl++` / `Ctrl+-` / `Ctrl+0` | Larger, smaller and default text |
| `Ctrl+,` | Preferences |

## Project layout

```
tern/
├── src/
│   ├── lib/
│   │   ├── api.ts            bridge commands and events
│   │   ├── components/       tab bar, panes, split dividers, find bar and dialogs
│   │   ├── state/            preferences and the terminal look derived from them
│   │   ├── terminal/         terminal sessions, output stream, colors, shell integration and paste checks
│   │   └── workspace/        tabs, pane layout and shortcuts
│   ├── routes/+page.svelte   window layout
│   └── styles/               terminal and tab styles
└── desktop/src/
    ├── desktop/              notifications, links and the desktop entry
    ├── pty/                  pseudo terminals, reading with flow control, writing and resizing
    ├── shell/                shell selection, environment and prompt hooks
    ├── bridge.rs
    ├── launch.rs
    ├── settings.rs
    └── state.rs
```

## License

MIT. Maple Mono and Open Runde are licensed under the SIL Open Font License, included in `packages/ui/fonts`.
