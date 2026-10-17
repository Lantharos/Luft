# Schelf

Schelf is where you get apps on Luft. It finds, installs, updates and removes apps from Flathub, your system's software sources and AppImages, and command-line tools on image-based installs. System updates such as the kernel and drivers live in Settings, so Schelf only shows apps. Built with Sabine and Svelte.

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
| System software sources | Everyone, through PackageKit, on regular Fedora installs | As the system is set up |
| AppImage | Your account, in `~/Applications` | None |
| Fedora packages as command-line tools | Your account, in the default Toolbox container, on image-based installs | None |

Image-based installs don't take Fedora's desktop apps; search shows command-line tools from Fedora instead. Their commands get launchers in `~/.local/bin`, so they run from Tern, their updates show up in Updates, and a `.rpm` file opened in Schelf installs into the same container.

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

In the browser, `?scheme=light` shows the light style, `?system=image` shows an image-based install, with command-line tools, `?file=/path` shows the page for an opened file and `?page=schelf:updates` opens Updates.

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
| `~/.local/share/applications/` | Menu entries for AppImages, named like the entry inside each AppImage so windows and the default app settings match it |
| `~/.local/share/icons/hicolor/` | AppImage icons, at each size the AppImage ships |
| `~/.local/state/luft/preinstalled` | Apps Luft has already preinstalled for you |

Electron AppImages are started with `--no-sandbox`, since Chromium's sandbox refuses to start from an AppImage.

## Preinstalled apps and background updates

On Luft, `schelf --preinstall` runs at sign-in before the desktop appears and adds each AppImage in `/usr/share/luft/preinstall` to the account like opening it in Schelf, linked to the image's copy until its first update, so it works offline, takes no extra space and can be removed like any other app. A browser among them becomes the default one if there's none yet. Each app is only preinstalled once, so a removed app stays removed. `schelf --update-apps` runs a few minutes after sign-in and every six hours after that, and updates every AppImage that has a newer version.

When Schelf starts, it gives AppImages installed earlier the icons they ship if theirs are missing or the wrong size.
