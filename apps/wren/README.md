# Wren

Wren is a text and code editor for Luft, built with Sabine and SvelteKit on top of CodeMirror. It lives at `apps/wren`; run the commands below from that directory unless noted otherwise.

## Features

- Started on its own, Wren shows a folder as a tree in the sidebar, with a field to jump to any file in it. Hide it with `Ctrl+B` when you want the whole window for text
- Opened with files, for example as the default editor or from Rover, it is just the editor and its tabs. Opening a folder later brings the sidebar in
- Syntax highlighting for well over a hundred languages, each loaded the first time you open a file that needs it. Wren picks the language from the file name or, for scripts without an extension, from the `#!` line, and you can change it from the status bar
- Line numbers, a highlighted current line, matching brackets, automatic indentation, closing brackets and folding
- Multiple cursors: `Ctrl`-click to add one, `Ctrl+Alt+↑`/`↓` to add them above or below, `Ctrl+D` to select the next occurrence and `Ctrl+Shift+L` to select them all. Hold `Alt` and drag for a rectangular selection
- Find and replace with case, whole word and regular expression options and a running count of matches
- Indentation is detected from each file's content and shown in the status bar, where you can switch between tabs and spaces or change the width. New files use the default you pick with Change Default Indentation
- Tabs you can reorder by dragging, with a dot on the ones that have unsaved changes
- Save and Save As through the desktop's file chooser. Files are written in place of the old one only once they are complete, keeping their permissions, and saving through a link writes to the file it points to
- Files that change on disk reload on their own when you have no unsaved changes. When you do, Wren asks whether to reload or keep your version, and tells you when a file was deleted
- The open folder, open files, cursors and scroll positions come back the next time you start Wren, with windows opened for files keeping their own set of tabs. Unsaved changes, including untitled documents, are kept too, so closing the window never loses work
- Large files such as 50 MB logs open in well under a second and stay smooth to scroll and edit. Files over 10 MB open as plain text, and picking a language from the status bar highlights them anyway
- The encoding and line endings of every file are detected and kept when saving. The status bar shows both and lets you reopen a file in another encoding, save it in one, or switch between LF and CRLF
- A command palette on `Ctrl+Shift+P` and quick open on `Ctrl+P`, both with fuzzy matching. Type `>` in quick open for commands or `:` for a line number
- A side by side preview for Markdown with highlighted code blocks, following the editor as you scroll
- Light and dark styles that follow the desktop, with syntax colors taken from the wallpaper palette and accent
- Opening a file from Rover or anywhere else adds a tab to the running window, and dropping files or a folder on the window opens them

The sidebar uses the compositor's background blur on Wayland compositors that support `ext-background-effect-v1`, and falls back to a solid surface elsewhere.

## Development

Wren shares its controls, fonts, syntax colors and window setup with the other Luft apps through `packages/ui` and `packages/app`, so install dependencies once from the repository root:

```bash
bun install              # from the repository root
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
```

Files are read through Sabine's local file access, which only works from the packaged app origin, so opening files needs a production build or a bundle rather than the Vite dev server.

Opening the Vite server in a regular browser shows the interface with a sample project, which is handy for styling work. Add `?log=50` to the address to include a generated 50 MB log.

## Install

```bash
sabine install .
```

The installed desktop entry registers Wren for plain text, Markdown, logs, JSON, YAML, TOML and the common source code types. It accepts files and folders: files open in tabs and a folder becomes the one shown in the sidebar. If Wren is already running, they open in the existing window.

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New file |
| `Ctrl+O` / `Ctrl+Shift+O` | Open files, open a folder |
| `Ctrl+S` / `Ctrl+Shift+S` / `Ctrl+Alt+S` | Save, save as, save all |
| `Ctrl+W` | Close the tab |
| `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+Page Down` / `Ctrl+Page Up` | Next and previous tab |
| `Alt+1` … `Alt+9` | Go to a tab, `Alt+9` for the last |
| `Ctrl+P` | Go to a file |
| `Ctrl+Shift+P` | All commands |
| `Ctrl+G` | Go to a line, or `line:column` |
| `Ctrl+F` / `Ctrl+H` | Find, find and replace |
| `Enter` / `Shift+Enter` in Find | Next and previous match |
| `Alt+C` / `Alt+W` / `Alt+R` in Find | Match case, whole word, regular expression |
| `Ctrl+D` / `Ctrl+Shift+L` | Select the next occurrence, select all occurrences |
| `Ctrl+Alt+↑` / `Ctrl+Alt+↓` | Add a cursor above or below |
| `Ctrl+/` | Toggle comment |
| `Alt+↑` / `Alt+↓` | Move lines up or down |
| `Ctrl+[` / `Ctrl+]`, `Tab` / `Shift+Tab` | Indent less or more |
| `Ctrl+Shift+[` / `Ctrl+Shift+]` | Fold and unfold |
| `Ctrl+B` | Show or hide the sidebar |
| `Alt+Z` | Word wrap |
| `Ctrl+Shift+V` | Markdown preview |
| `Ctrl+=` / `Ctrl+-` / `Ctrl+0` | Larger, smaller and default text size |

## Project layout

```
wren/
├── src/
│   ├── lib/
│   │   ├── app.svelte.ts      startup and the actions shared by the interface
│   │   ├── bridge/            native commands and the browser sample project
│   │   ├── commands/          commands and keyboard shortcuts
│   │   ├── components/        sidebar, tabs, editor pane, status bar, palette, preview and dialogs
│   │   ├── documents/         open documents, decoding, saving, disk changes, backups and sessions
│   │   ├── editor/            CodeMirror setup, theme, indentation, languages and find and replace
│   │   ├── files/             folder tree, file index and context menus
│   │   ├── palette/           fuzzy matching, quick open and pickers
│   │   ├── preview/           Markdown rendering
│   │   └── utils/             paths and timing helpers
│   └── routes/+page.svelte    startup
└── desktop/src/
    ├── bridge.rs              bridge command registration
    ├── desktop.rs             file chooser, links and showing files in Rover
    ├── files/                 listing, the quick open index, encodings, saving and watching
    ├── launch.rs              folders passed on the command line
    ├── state.rs
    └── store.rs               settings, session and unsaved change backups
```

## License

MIT. Open Runde and Maple Mono are licensed under the SIL Open Font License, included in `packages/ui/fonts`.
