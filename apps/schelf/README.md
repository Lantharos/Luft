# Schelf

Schelf is where you get apps on Luft. It finds, installs, updates and removes apps from Flathub, your system's software sources and AppImages. System updates such as the kernel and drivers live in Settings, so Schelf only shows apps. Built with Sabine and Svelte.

## Features

- Discover with trending, popular and recently updated apps from Flathub and Fedora, plus categories
- Search across installed apps, Flathub and Fedora at once
- App pages with screenshots, release notes, size, license and source, switchable when an app is on both Flathub and Fedora
- Flatpak permissions in plain words, broadest access first
- Installed lists every app with its size and source; removing a system app shows what else goes with it
- Updates for every app in one go, with Flatpak runtimes listed separately as app platforms
- Queued, cancellable downloads with progress
- Catalog pages cached on disk, so browsing works offline
- AppImages kept in `~/Applications` with a menu entry, icon and automatic updates, including ones set up earlier with other tools such as Gear Lever

## How apps are installed

| Source | Installed for | Permission |
|--------|---------------|------------|
| Flathub | Your account (Flathub is added on first use) | None |
| System software sources | Everyone, through PackageKit | As the system is set up |
| AppImage | Your account, in `~/Applications` | None |

A package from the system's sources counts as an app when it puts a visible entry in the app menu. Everything else is part of the system and is updated from Settings, which uses the same rule.

## Build and run

Install dependencies once from the repository root with `bun install`, then from this directory:

```sh
bun run dev              # the interface in a browser, with sample apps and Flathub's real catalog
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # Sabine bundle
```

In the browser, `?scheme=light` shows the light style, `?file=/path` shows the page for an opened file and `?page=schelf:updates` opens Updates.

## Install

```sh
sabine install --bundle .
```

This makes Schelf the app for `.flatpakref`, `.flatpakrepo`, `.rpm` and `.AppImage` files and for `schelf:` links. Each file opens on a page explaining it before anything is installed; packages from a file need an administrator's permission.

## Links

| Link | Opens |
|------|-------|
| `schelf:updates` | Updates (used by Settings) |
| `schelf:installed` | Installed |
| `schelf:search?<query>` | A search (used by Luft to find an app for a file) |

## Files

| Path | Contents |
|------|----------|
| `~/Applications/` | Installed AppImages |
| `~/.local/share/applications/` | Menu entries for AppImages |
| `~/.local/share/icons/hicolor/` | AppImage icons |

Electron AppImages are started with `--no-sandbox`, since Chromium's sandbox refuses to start from an AppImage.
