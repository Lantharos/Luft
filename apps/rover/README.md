# Rover

Rover is the file manager of Luft. Built with Sabine and Svelte.

## Features

- Tabs, and list, grid and column views remembered per folder, with sortable, resizable and reorderable list columns
- A sidebar with your folders, Recent, Trash, Favorites, drives and network locations
- A details pane and Quick Look for images, video, audio, text, code, Markdown and PDFs
- Thumbnails through the standard thumbnail cache and your installed thumbnailers
- Search by name or contents, narrowed by kind, date and size
- Background copy and move with pause, cancel and conflict handling, plus undo and redo for file operations
- Batch rename, compress to zip or tar.zst, and extract zip, tar, 7z and single compressed files
- Network locations over SFTP, SMB, FTP, WebDAV and NFS, with passwords kept in your keyring
- Git and Pig status, diffs, commits and sync for the current folder
- A file chooser portal backend and `org.freedesktop.FileManager1` for "Show in folder"

Network locations need GVfs with `gvfs-fuse` and the backend for each protocol, such as `gvfs-smb`.

## Build and run

Install dependencies once from the repository root with `bun install`, then from this directory:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # Sabine bundle
```

Thumbnails only load from the packaged app origin, so they show in builds and bundles, not against the Vite dev server. Opening the Vite server in a regular browser shows the interface with sample data.

## Install

```sh
sabine install --bundle .
```

The desktop entry opens folders, and `sftp://`, `smb://`, `dav://`, `davs://` and `nfs://` links. Opening a file shows its folder with the file selected; if Rover is running, the path opens in a new tab.

## Command line

| Flag | Effect |
|------|--------|
| `--install-file-chooser-portal` | Register Rover as the xdg-desktop-portal FileChooser backend for this user |
| `--install-file-manager-bus` | Register Rover as `org.freedesktop.FileManager1` for this user |
| `--portal-backend` | Run the file chooser portal service (started by D-Bus) |
| `--file-manager-bus` | Run the FileManager1 service (started by D-Bus) |

The install flags point at the executable that ran them, so they work from a bundle or a local build:

```sh
desktop/target/debug/rover --install-file-chooser-portal
systemctl --user restart xdg-desktop-portal.service
desktop/target/debug/rover --install-file-manager-bus
```

Kestrel already prefers Rover for file dialogs. On other desktops, add `org.freedesktop.impl.portal.FileChooser=rover;*` under `[preferred]` in `~/.config/xdg-desktop-portal/portals.conf`. To hand "Show in folder" back to another file manager, remove `~/.local/share/dbus-1/services/org.freedesktop.FileManager1.service`.

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | Copy, cut, paste |
| `Ctrl+A` | Select all |
| Arrows, `Home`, `End`, `Page Up`, `Page Down` | Move through files; hold `Shift` to select a range |
| Typing a name | Jump to the first matching file |
| `Enter` | Open |
| `Space` | Quick Look |
| `Ctrl+Space` | Toggle the focused file in the selection |
| `Ctrl+1` / `Ctrl+2` / `Ctrl+3` | List, grid, column view |
| `Ctrl++` / `Ctrl+-` / `Ctrl+0`, `Ctrl`+wheel | Grid icon size |
| `Alt+P` | Toggle the details pane |
| `Ctrl+L` | Type a location |
| `Tab` / `Shift+Tab` in the path bar | Complete a folder name, or step through matches |
| `Ctrl+H` | Show hidden files |
| `Ctrl+Shift+N` | New folder |
| `Alt+Left` / `Alt+Right` / `Alt+Up` | Back, forward, parent folder |
| `Alt+Down` | Open the focused folder |
| `Ctrl+F` | Filter the current folder |
| `Ctrl+Shift+F` | Search this folder and everything inside it |
| `Ctrl+Z` / `Ctrl+Shift+Z` or `Ctrl+Y` | Undo, redo |
| `Ctrl+T` / `Ctrl+W` | New tab, close tab |
| `F2` | Rename, or batch rename a selection |
| `Alt+Enter` | Properties |
| `F5` | Refresh |
| `Delete` | Move to trash, or delete for good inside Trash |
| `Backspace` | Parent folder |
| `Esc` | Clear the selection |
| Mouse back / forward | Folder history |

## License

MIT. Open Runde and Maple Mono are licensed under the SIL Open Font License, included in [`packages/ui/fonts/OFL.txt`](../../packages/ui/fonts/OFL.txt) and [`packages/ui/fonts/MapleMono-OFL.txt`](../../packages/ui/fonts/MapleMono-OFL.txt).
