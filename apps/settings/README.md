# Settings

Settings is the system settings app for Luft. It reads and writes the same settings as the desktop, so changes made elsewhere show up right away. Built with Sabine and Svelte.

## Pages

| Page | Covers |
|------|--------|
| Network | Wi-Fi, wired, VPN (WireGuard, OpenVPN and other plugin imports) and proxy, with per-connection IP, DNS, routes and metered data |
| Bluetooth | Pairing, connecting, visibility and device details; shown only with an adapter |
| Displays | Arrangement, resolution, refresh rate, variable refresh, scale, brightness and night light |
| Sound | Devices, volumes, per-app volume and output, profiles and alert sounds |
| Power (& Battery) | Power mode, battery health and charge limit, keyboard backlight, blanking and suspend |
| Appearance | Style and schedule, accent, app icon style, cursors, fonts, text size, wallpaper, translucency and the taskbar |
| Notifications | Do not disturb, lock screen and per-app notifications |
| Keyboard | Input sources, repeat and shortcuts; layouts and input methods made in Keys open there |
| Mouse & Touchpad | Speed, scrolling and tap to click; named after what is connected |
| Accessibility | Screen reader (with Orca), zoom, contrast, motion, on-screen keyboard, typing assist, mouse keys and visual alerts |
| Apps | Default apps and app permissions |
| Privacy | Location, file history, screen lock and cleanup of trash and temporary files |
| Security | Device encryption and recovery key, Secure Boot and signed startup, the security chip, USB protection, Luft Keyring, app access to passwords, SSH keys and passkeys |
| Date & Time | Time zone, automatic time and clock format |
| Users | Account picture, name, password and fingerprints |
| Login Screen | Wallpaper, listed users, default session and automatic login |
| Updates | System updates (kernel, drivers, libraries, services) and firmware, installed at the next restart; app updates are left to Schelf |
| About | Device name, hardware, system versions, storage and recent graphics driver problems |

Notes:

- Wallpapers are the pictures and videos in `~/Pictures/Wallpapers`; light and dark styles each keep their own.
- All fonts lists every installed family; fonts in `~/.local/share/fonts` can be removed, and clicking a family opens it in Magpie.
- Cursor themes come from `~/.local/share/icons`, `~/.icons` and `/usr/share/icons`. Get more cursors installs themes from [GNOME-Look](https://www.gnome-look.org/browse?cat=107) into `~/.local/share/icons`, limited to 128 MB downloaded and 512 MB unpacked.
- Brightness for external displays needs [ddcutil](https://www.ddcutil.com).
- A package counts as an app, and is left to Schelf, when it puts a visible entry in the app menu.

## Build and run

Install dependencies once from the repository root with `bun install`, then from this directory:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # Sabine bundle
```

## Install

```sh
sabine install --bundle .
```

This registers the `kestrel-settings:` link scheme. If Settings is already open, a link switches the window to that page.

## Links

| Link | Opens |
|------|-------|
| `kestrel-settings:<page>` | A page: `network`, `bluetooth`, `display`, `sound`, `power`, `appearance`, `notifications`, `keyboard`, `mouse`, `accessibility`, `apps`, `privacy`, `security`, `datetime`, `users`, `login`, `updates`, `about` |
| `kestrel-settings:appearance/fonts` | All fonts |
| `kestrel-settings:appearance/cursors` | Cursor themes |
| `kestrel-settings:appearance/taskbar` | Taskbar |

A link to a page for missing hardware, such as Bluetooth without an adapter, explains that instead.

## Automatic updates

Settings writes the systemd user timer `com.lantharos.settings.updates.timer` the first time Updates opens, and rewrites it when the schedule changes. The timer runs Settings with `--check-updates`, which refreshes the software sources, downloads updates without a window and sends a notification when they are ready.
