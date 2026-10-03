# Rover

Rover is a file manager for Linux built with Sabine and SvelteKit. In the Luft monorepo it lives at `apps/rover`; run the commands below from that directory unless noted otherwise.

## Features

- Tabs with their own back and forward history that brings back each folder's scroll position and selection; the tab bar shows up once a second tab is open
- List, grid and column views, remembered per folder. The list sorts from its column headers, whose columns can be resized, dragged into a different order and shown or hidden from their right-click menu; folders show how many items they hold, and the list can be grouped by kind or date. The grid zooms from small icons to large previews, and columns show where you are and what is inside the selected folder
- Folders with tens of thousands of files open and scroll smoothly, since only what is on screen is drawn
- A sidebar with Home, Recent, your Desktop, Documents, Downloads, Music, Pictures and Videos folders, Trash with the number of items in it, Favorites and drives. Right-click any of them to open it in a new tab, eject a drive, remove a favorite, empty the trash or see its properties
- A details pane with a large preview, the kind, size, dates, image dimensions, media length, location, version control state and the apps that can open the file
- Quick Look on `Space` for images, video, audio, text and code, Markdown and PDFs, moving between files with the arrow keys. Code is highlighted in Quick Look and the details pane
- Full keyboard navigation, including range selection and jumping to a file by typing its name
- Thumbnails for images, videos, PDFs, fonts, office documents and anything else your installed thumbnailers handle, shared with other apps through the standard thumbnail cache and made only for the files on screen. Fonts and images with transparency sit on a light backdrop so they stay readable
- Search inside the current folder and everything below it, by name or by what text files contain, narrowed by kind, date and size, with results showing up as they are found
- Folders refresh on their own when files change, including changes made by other apps
- Copy and move run in the background with progress, pause and cancel. When a name is already taken, Rover shows both items side by side and lets you replace, skip, keep both or merge folders, for one item or all of them
- Undo and redo for renaming, moving, copying, creating, trashing and restoring, with a small prompt to undo right after something is moved or trashed
- Rename many files at once by replacing text, numbering them or changing their case, with a live preview
- Compress to zip or tar.zst, and extract zip, tar (plain, gz, bz2, xz and zst), 7z and single compressed files
- A properties window with the kind, size (counted in the background for folders), location, dates, owner, editable permissions and the default app for the file type
- Duplicate, copy path and open a terminal in a folder from the context menu
- Drag and drop within Rover and to or from other apps. Holding a dragged file over a folder, in the views or the sidebar, opens it
- Trash across the home folder and mounted drives, with restore
- Favorites you can add from the context menu or by dropping files on the sidebar, and reorder by dragging
- Drives with their usage in the sidebar, and eject for removable drives. "Manage drive…" in a drive's menu opens it in Disks
- Network locations over SFTP, Windows shares (SMB), FTP, WebDAV and NFS. Type an address such as `sftp://example.com` or `smb://server/share` into the path bar, or use Connect to server in the menu, which also lists recent servers and the ones it finds on your network. Rover asks for a password when the server wants one and can remember it in your keyring, and opens `sftp://`, `smb://`, `dav://`, `davs://` and `nfs://` links from other apps. Connected locations appear in the sidebar with a button to disconnect, and the ones you keep stay there for next time
- Git and Pig status badges, diffs, commits and sync for the folder you are in
- Inline create and rename, marquee selection and an editable path bar that completes folder names with `Tab` and selects the whole location when you click into it, so typing or pasting replaces it
- A file chooser for apps that use the xdg-desktop-portal picker
- `org.freedesktop.FileManager1`, so "Show in folder" in other apps opens Rover

Network locations need GVfs with its FUSE helper, `gvfs-fuse`, and the backends for the protocols you use, such as `gvfs-smb`. Thumbnails and folder item counts are left out on network locations so browsing them stays quick.

The sidebar uses the compositor's background blur on Wayland compositors that support `ext-background-effect-v1`, and falls back to a solid surface elsewhere. The rest of the window stays opaque.

## Development

Rover uses Sabine's shared Chromium runtime. The first launch prepares it when needed. Its controls, styles and window setup come from `packages/ui` and `packages/app`, so install dependencies once from the repository root:

```bash
bun install              # from the repository root
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
```

Thumbnails are loaded through Sabine's local file access, which only works from the packaged app origin, so they appear in production builds and bundles but not while running against the Vite dev server.

Opening the Vite server in a regular browser shows the interface with sample data, which is handy for styling work.

## Install

Rover has a `Sabine.toml`, so Sabine picks up the app id, icon, web build and launch command from the project:

```bash
sabine install .
```

The installed desktop entry accepts paths. Opening a folder shows it; opening a file shows its folder with the file selected. If Rover is already running, the path opens in a new tab of the existing window.

## File chooser portal

Rover ships an xdg-desktop-portal FileChooser backend. To use it as the picker for your session:

```bash
desktop/target/debug/rover --install-file-chooser-portal
systemctl --user restart xdg-desktop-portal.service
```

This writes the portal descriptor and the D-Bus activation file for the current user, pointing at the executable that ran the command, so it works the same from a bundle or a local build. Kestrel already prefers Rover for file dialogs; on other desktops, add `org.freedesktop.impl.portal.FileChooser=rover;*` under `[preferred]` in `~/.config/xdg-desktop-portal/portals.conf`.

## Show in folder

Apps call `org.freedesktop.FileManager1` over D-Bus for "Show in folder" and "Open containing folder". To let Rover answer those calls:

```bash
desktop/target/debug/rover --install-file-manager-bus
```

This writes `~/.local/share/dbus-1/services/org.freedesktop.FileManager1.service`. D-Bus starts the service on the first call. `ShowItems` opens the containing folder with the item selected, and `ShowFolders` opens the folders themselves, in the running window when there is one. To hand the name back to another file manager, remove that service file.

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` / `Ctrl+X` / `Ctrl+V` | Copy, cut and paste |
| `Ctrl+A` | Select all |
| Arrow keys, `Home`, `End`, `Page Up`, `Page Down` | Move through files; hold `Shift` to select a range |
| Typing a name | Jump to the first file that starts with it |
| `Enter` | Open |
| `Space` | Quick Look |
| `Ctrl+Space` | Add or remove the focused file from the selection |
| `Ctrl+1` / `Ctrl+2` / `Ctrl+3` | List, grid and column view |
| `Ctrl++` / `Ctrl+-` / `Ctrl+0`, or `Ctrl` and the wheel | Grid icon size |
| `Alt+P` | Show or hide the details pane |
| `Ctrl+L` | Type a location |
| `Tab` / `Shift+Tab` while typing a location | Complete a folder name, or step through the matching folders |
| `Ctrl+H` | Show hidden files |
| `Ctrl+Shift+N` | New folder |
| `Alt+Left` / `Alt+Right` / `Alt+Up` | Back, forward and parent folder |
| `Alt+Down` | Open the focused folder |
| `Ctrl+F` | Filter the current folder |
| `Ctrl+Shift+F` | Search this folder and everything inside it |
| `Ctrl+Z` / `Ctrl+Shift+Z` or `Ctrl+Y` | Undo and redo |
| `Ctrl+T` / `Ctrl+W` | New tab, close tab |
| `F2` | Rename, or rename all selected files at once |
| `Alt+Enter` | Properties |
| `F5` | Refresh |
| `Delete` | Move to trash, or delete for good inside the trash |
| `Backspace` | Go to the parent folder |
| `Escape` | Clear the selection |
| Mouse back and forward | Folder history |

## Project layout

```
rover/
├── src/
│   ├── lib/
│   │   ├── api.ts             bridge commands and events
│   │   ├── components/        toolbar, sidebar, views, details, previews, dialogs, shell and version control
│   │   ├── features/          search, on-screen thumbnails and folder counts, undo, batch rename and archive state
│   │   ├── file-manager/      navigation, network places, location completion, view state and keys, list columns and groups, previews, actions, drag and drop, chooser
│   │   ├── state/             settings and tabs
│   │   ├── utils/             formatting, paths and file kinds
│   │   └── vcs/               version control state
│   ├── routes/+page.svelte    window layout
│   └── styles/                views, sidebar, toolbar and preview styles
└── desktop/src/
    ├── archives/              compressing and extracting
    ├── bridge/                bridge command registration
    ├── drives/                mounts, drive info and mount watching
    ├── files/                 listing, folder item counts, transfers and conflicts, trash, renaming, operations and folder watching
    ├── history/               undo and redo
    ├── inspect/               file details and open with
    ├── integration/           file chooser portal, FileManager1, terminals and launch paths
    ├── network/               network locations: connecting, signing in, disconnecting and finding servers nearby
    ├── places/                recent files and trash count
    ├── properties/            permissions, default apps and folder sizes
    ├── search/                recursive search
    ├── thumbnails/            thumbnail cache, thumbnailers and image scaling
    ├── vcs/                   Git and Pig
    ├── settings.rs
    └── state.rs
```

## License

MIT. Open Runde and Maple Mono are licensed under the SIL Open Font License, included in `packages/ui/fonts/OFL.txt` and `packages/ui/fonts/MapleMono-OFL.txt`.
