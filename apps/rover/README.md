# Rover

A modern, fast, and user-friendly file manager for Linux built with Tauri + SvelteKit.

## Features

- **Modern UI**: Compact dark interface with a native translucent sidebar on supported Wayland compositors
- **Tab Support**: Open multiple folders in tabs
- **Drives View**: Windows-style drives/volumes overview with usage info
- **Trash Management**: Full trash support with restore and permanent delete
- **Favorites**: Pin files and folders from the context menu for quick access
- **Sidebar Bookmarks**: Drop files or folders into the sidebar and remove pinned entries inline
- **File Previews**: Inline image thumbnails with dedicated package and AppImage icons
- **Per-Folder Views**: Table, list, and gallery choices are remembered per folder
- **Marquee Selection**: Drag through empty space to select multiple files
- **Inline Editing**: Create and rename files directly in the file list
- **Editable Path Bar**: Click the current path to type a destination directly
- **Hidden Files Toggle**: Show or hide dotfiles without leaving the current folder
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Search**: Quick file search within current directory
- **Custom Window**: Frameless window with custom title bar
- **NVIDIA WebKitGTK Workaround**: Applies the required X11/Wayland startup fixes automatically on proprietary NVIDIA drivers
- **File Chooser Portal**: Rover can register as the xdg-desktop-portal file picker for apps that use the Linux portal picker

## Prerequisites

### Fedora
```bash
sudo dnf install gtk3-devel webkit2gtk4.1-devel libsoup3-devel
```

### Ubuntu/Debian
```bash
sudo apt install libwebkit2gtk-4.1-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

### Arch Linux
```bash
sudo pacman -S webkit2gtk-4.1 gtk3 libsoup3
```

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run tauri:dev

# Build for production
bun run tauri:build
```

The production build script sets `NO_STRIP=1` for AppImage packaging. This avoids linuxdeploy strip failures on newer Linux distributions while still producing `.deb`, `.rpm`, and `.AppImage` bundles.

Rover applies the WebKitGTK/NVIDIA startup workaround before the webview is created, so packaged builds work on both X11 and Wayland NVIDIA sessions without wrapper scripts.

Sidebar translucency uses the compositor-provided `ext-background-effect-v1` path when available. Rover falls back to an opaque sidebar on sessions where that native blur path is unavailable or unreliable.

## File Picker Portal

Rover includes an xdg-desktop-portal FileChooser backend. The `.deb` and `.rpm` packages install the portal descriptor and D-Bus activation file.

To prefer Rover for portal file pickers in your user session:

```bash
rover --install-file-chooser-portal
systemctl --user restart xdg-desktop-portal.service
```

The same command also works from an AppImage or local build, using the executable path that ran the command.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Copy selected |
| `Ctrl+X` | Cut selected |
| `Ctrl+V` | Paste |
| `Ctrl+A` | Select all |
| `Ctrl+T` | New tab |
| `Ctrl+W` | Close tab |
| `Delete` | Move to trash |
| `F2` | Rename |
| `Backspace` | Go up one directory |
| Mouse Back/Forward | Navigate folder history |
| `Escape` | Clear selection |

## Project Structure

```
rover/
├── src/                    # Frontend (SvelteKit)
│   ├── lib/
│   │   ├── api.ts          # Tauri command wrappers
│   │   ├── components/     # Svelte components
│   │   │   └── file-manager/ # File manager UI shell
│   │   ├── file-manager/   # File manager state and list helpers
│   │   ├── stores/         # Svelte stores for state
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── routes/
│       └── +page.svelte    # Main application UI
├── src-tauri/              # Backend (Rust)
│   └── src/
│       ├── lib.rs          # Tauri setup
│       ├── fs_ops.rs       # File system operations
│       ├── drives.rs       # Drive/mount detection
│       ├── trash_manager.rs # Trash operations
│       ├── portal_backend.rs # xdg-desktop-portal FileChooser backend
│       ├── chooser.rs      # Portal-launched picker session state
│       ├── operations_queue.rs # File op queue
│       └── settings.rs     # User settings
└── package.json
```

## License

MIT
