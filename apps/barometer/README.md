# Barometer

Barometer is the system monitor and task manager for Luft, built with Sabine and SvelteKit. It lives at `apps/barometer`; run the commands below from that directory unless noted otherwise.

## Features

- Apps, grouped the way the desktop launched them, with their processor, memory, disk and graphics use. Browsers and other apps that split themselves into several groups are shown as one app. Expanding an app lists its processes
- Ending an app asks it to quit and, if it hasn't closed a few seconds later, offers to force quit it. Apps can also be paused and resumed as a whole
- Every process in a table that sorts by any column, searches by name, command, user, app or process ID, and shows or hides columns from the header's right-click menu. Tens of thousands of rows scroll smoothly
- End, force quit, pause, resume and change the priority of any process. Processes that belong to other users or to the system ask for your password first, and anything that can't be done says why
- Process details with the full command line, program, working folder, user, start time, parent, threads, open files, control group and a breakdown of its memory
- A sidebar with a live graph and the current value of the processor, memory, every graphics card, drive and network connection, and the battery when there is one
- Processor usage overall and for each core, with clock speeds, temperature, load average, context switches and the cache layout
- Memory in use, cache and free space, swap, compressed memory and what programs have been promised
- Graphics usage, video memory, video encoding and decoding, temperature, power draw and clocks for NVIDIA cards through the NVIDIA driver, and usage, memory, temperature, power and clocks for AMD and Intel graphics where the kernel reports them. Per app and per process graphics use comes from the same sources
- Drive activity, read and write speeds, totals since startup, temperature, space used across its mounted file systems, model and kind
- Network download and upload speeds, totals, addresses, link speed, signal strength for Wi-Fi, adapter and driver
- Battery charge, power draw, time left, health and charge cycles
- Adjustable update speed, from every two seconds to four times a second, and graph history from 30 seconds to 10 minutes
- Temperatures in Celsius or Fahrenheit, network speeds in bytes or bits, and process usage out of one core or the whole processor
- Graphs can glide along smoothly as values come in, which is off by default because it costs noticeably more processor time than redrawing once per update

Barometer reads everything itself, once per update, keeping files open between updates and only collecting what the current page shows. While the window is hidden it keeps a light record of the graphs and nothing else, so it costs almost nothing in the background.

The sidebar uses the compositor's background blur on Wayland compositors that support `ext-background-effect-v1`, and falls back to a solid surface elsewhere.

## Development

```bash
bun install              # from the repository root
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
```

Opening the Vite server in a regular browser shows the interface with made up data, which is handy for styling work.

## Install

```bash
sabine install .
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

## Project layout

```
barometer/
├── src/
│   ├── lib/
│   │   ├── backend/           native bridge, the process row format and the browser sample data
│   │   ├── graph/             graph drawing and motion
│   │   ├── resources/         processor, memory, graphics, drive, network and battery pages
│   │   ├── shell/             sidebar, header, preferences and notices
│   │   ├── state/             settings, live samples, apps, processes and window visibility
│   │   ├── tasks/             apps and processes tables, columns, menus and dialogs
│   │   └── format.ts          units and times
│   └── routes/+page.svelte    window layout
└── desktop/src/
    ├── gpu/                   NVIDIA, AMD and Intel graphics and per process graphics use
    ├── monitor/               the sampling loop, history and page state
    ├── system/                processor, memory, drives, network, battery and temperature sensors
    ├── tasks/                 processes, apps from control groups, details and signals
    ├── bridge.rs
    └── settings.rs
```

## License

MIT. Open Runde and Maple Mono are licensed under the SIL Open Font License, included in `packages/ui/fonts`.
