# Search in Start

Typing in Start searches as you type. The best match sits on top and Enter opens it; the rest follow in groups: apps, actions, Settings pages, files and matches inside files.

| Key | Does |
| --- | --- |
| Enter | Opens the best match |
| Ctrl+Enter | Shows the best file match in Rover |
| Down, Tab | Moves into the results |
| Menu or right-click | More choices for a result, such as Show in Rover or Copy path |
| Escape | Clears the search |

## What it finds

- **Apps** by name, generic name and keywords. Apps you open often rank higher.
- **Calculations**: `2*(3+18)`, `15% of 80`, `80 + 15%`, `2^10`, `sqrt(16)`, `7 mod 3`. Enter copies the result.
- **Unit conversions** for length, mass, temperature, data sizes, time, volume and speed: `10 km to mi`, `100 f`, `1.5 GB in MiB`, `90 min`. Without a target unit, Start picks the usual counterpart. There are no currencies, since that would need a network lookup.
- **Actions**: dark or light style, night light, Do Not Disturb, Wi-Fi, Bluetooth, airplane mode, keep awake, lock, sleep, log out, restart and power off. Everyday words work, such as "dark mode", "dnd", "wifi off", "sign out" or "shut down". Log out, restart and power off still ask first.
- **Settings pages and sections**, by title and keywords, such as "night light", "fonts" or "taskbar". They come straight from Settings, so a new page shows up without changes to Start.
- **Recent files** from the list apps share, which Rover's Recent also shows.
- **Files and folders** in your home folder by name. Several words narrow it down by folder, so `garden readme` finds `garden-planner/README.md`.
- **Text inside files**: plain text, Markdown, code and other text files up to 1 MB, and the first 40 pages of PDFs up to 64 MB. The line that matches shows under the file.

## The file index

`kestrel-search` keeps the index. It starts with the session, runs at the lowest CPU and disk priority, and looks for changes every five minutes (fifteen on battery), when Start opens and when you plug in. It doesn't watch every folder, so a file saved a moment ago can take until the next look to appear. File contents are only read on mains power; on battery the names stay current and the contents wait.

It leaves out:

- hidden files and folders
- folders on other drives and mounts
- whatever a Git repository's `.gitignore` or an `.ignore` file excludes
- folders marked as caches with a `CACHEDIR.TAG` file, and `node_modules`
- read-only folders, such as Go's module cache

The contents index lives in `~/.cache/kestrel/search`. Removing that folder makes it read everything again.
