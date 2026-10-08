# Draft

Draft is the text and code editor for Luft, built with Sabine, Svelte and CodeMirror.

## Features

- A folder tree in the sidebar when started on its own; just the editor and tabs when opened with files
- Syntax highlighting for over a hundred languages, picked from the file name or `#!` line and changeable from the status bar
- Multiple cursors, rectangular selection (`Alt`+drag), folding, bracket matching and auto-indent
- Find and replace with case, whole word and regular expression options
- Detected indentation, encoding and line endings, kept on save and changeable from the status bar
- Reloads files changed on disk, and asks first when you have unsaved changes
- Restores the open folder, tabs, cursors and unsaved changes, including untitled documents, on the next start
- Large files open quickly; files over 10 MB open as plain text until you pick a language
- Command palette, fuzzy quick open, and a Markdown preview that follows the editor
- Drop files on the window to open them, and drag tabs or files in the tree to other apps
- Light and dark styles that follow the desktop, with syntax colors from the wallpaper and accent

## Build and run

Install dependencies once from the repository root with `bun install`, then from this directory:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # release bundle
```

Opening files needs a production build or bundle, since Sabine's local file access only works from the packaged app. `bun run dev` serves the interface in a regular browser with a sample project; add `?log=50` to the address to include a generated 50 MB log.

## Install

```sh
sabine install --bundle .
```

Installing registers Draft for plain text, Markdown, logs, JSON, YAML, TOML and common source code types. Files open as tabs and a folder opens in the sidebar, in the running window if Draft is already open.

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New file |
| `Ctrl+O` / `Ctrl+Shift+O` | Open files, open a folder |
| `Ctrl+S` / `Ctrl+Shift+S` / `Ctrl+Alt+S` | Save, save as, save all |
| `Ctrl+W` | Close the tab |
| `Ctrl+Tab` / `Ctrl+Shift+Tab`, `Ctrl+Page Down` / `Ctrl+Page Up` | Next and previous tab |
| `Alt+1` … `Alt+9` | Go to a tab, `Alt+9` for the last |
| `Ctrl+P` | Go to a file; type `>` for commands or `:` for a line |
| `Ctrl+Shift+P` | All commands |
| `Ctrl+G` | Go to a line, or `line:column` |
| `Ctrl+F` / `Ctrl+H` | Find, find and replace |
| `Enter` / `Shift+Enter` in Find | Next and previous match |
| `Ctrl+Enter` in Replace | Replace all |
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
| `Ctrl+=` / `Ctrl+-` / `Ctrl+0` | Larger, smaller and default text size; `Ctrl`+scroll or a pinch also works |

## Files

| Path | Contents |
|------|----------|
| `~/.config/draft/settings.json` | Settings |
| `~/.config/draft/session.json` | The app's open folder and tabs |
| `~/.config/draft/files-session.json` | Tabs of windows opened for files |
| `~/.local/state/draft/backups/` | Unsaved changes |

## License

MIT. Open Runde and Maple Mono are licensed under the SIL Open Font License, included in `packages/ui/fonts`.
