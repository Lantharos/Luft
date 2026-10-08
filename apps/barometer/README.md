# Barometer

Barometer is the system monitor and task manager for Luft, built with Sabine and Svelte.

## Features

- Apps grouped the way the desktop launched them, with processor, memory, disk and graphics use; expand an app to see its processes
- End, force quit, pause, resume and reprioritise apps and processes; other users' and system processes ask for your password
- A sortable, searchable process table with columns chosen from the header's right-click menu
- Process details: command line, working folder, user, parent, threads, open files, control group and a memory breakdown
- Live graphs for the processor, memory, every graphics card, drive and network connection, and the battery
- NVIDIA graphics through the NVIDIA driver; AMD and Intel graphics where the kernel reports them
- Adjustable update speed and graph history, Celsius or Fahrenheit, bytes or bits, and per-core or whole-processor usage

## Build and run

Install dependencies once from the repository root with `bun install`, then from this directory:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # release bundle
```

`bun run dev` serves the interface in a regular browser with sample data, which is useful for styling work.

## Install

```sh
sabine install --bundle .
```

Kestrel opens Barometer with `Ctrl+Shift+Esc` and from the panel's right-click menu.

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+F` | Search apps or processes |
| Arrow keys, `Page Up`, `Page Down`, `Home`, `End` | Move through the list |
| `Right` / `Left` | Show or hide an app's processes |
| `Enter` | Show an app's processes, or a process's details |
| `Delete` | End the selected app or process |
| `Shift+Delete` | Force quit the selected app or process |

## Preferences

Saved to `~/.config/barometer/settings.json`.

| Setting | Options | Default |
|---------|---------|---------|
| Update speed | 2 s, 1 s, 0.5 s, 0.25 s | 1 s |
| History | 30 s, 1 m, 2 m, 5 m, 10 m | 1 m |
| Temperature | °C, °F | °C |
| Glide graphs | on, off | off |
| Network speed in bits | on, off | off |
| Share of the whole processor | on, off | off |
| Virtual devices | on, off | off |

## License

MIT. Open Runde and Maple Mono are licensed under the SIL Open Font License, included in `packages/ui/fonts`.
