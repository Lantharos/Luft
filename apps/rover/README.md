# Rover

A modern, fast, and user-friendly file manager for Linux built with Fenestra + SvelteKit.

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
- **Custom Window**: Fenestra OSR window with native controls, rounded input regions, and a translucent sidebar on supported compositors
- **File Chooser Portal**: Rover can register as the xdg-desktop-portal file picker for apps that use the Linux portal picker

## Prerequisites

Rover uses the shared Fenestra CEF runtime. Development builds resolve an installed runtime first and can install the shared user runtime when needed.

## Development

```bash
# Install dependencies
bun install

# Run in development mode
bun run desktop:dev

# Build for production
bun run desktop:build
```

Sidebar translucency is configured through Fenestra window regions. Rover keeps the main content opaque and uses compositor-backed blur only for the sidebar surface where available.

## File Picker Portal

Rover includes an xdg-desktop-portal FileChooser backend. The local installer writes the portal descriptor and D-Bus activation file for the current user.

To prefer Rover for portal file pickers in your user session:

```bash
desktop/target/debug/rover --install-file-chooser-portal
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
│   │   ├── api.ts          # Fenestra bridge wrappers
│   │   ├── components/     # Svelte components
│   │   │   └── file-manager/ # File manager UI shell
│   │   ├── file-manager/   # File manager state and list helpers
│   │   ├── stores/         # Svelte stores for state
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── routes/
│       └── +page.svelte    # Main application UI
├── desktop/                # Fenestra backend (Rust)
│   └── src/
│       ├── lib.rs          # Fenestra window and bridge setup
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
