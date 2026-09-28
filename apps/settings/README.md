# Settings

Settings is the system settings app for Luft, built with Sabine and SvelteKit. It lives at `apps/settings`; run the commands below from that directory.

## Pages

- Network: Wi-Fi, wired connections, VPN and proxy
- Bluetooth: pairing, connecting and forgetting devices
- Displays: arrangement, resolution, refresh rate, scale and night light
- Sound: output and input devices, volumes and alert sounds
- Power: power mode, battery, screen blanking and suspend
- Keyboard: input sources, repeat and shortcuts
- Mouse and touchpad: speed, scrolling and tap to click
- Notifications: do not disturb and per-app notifications
- Apps: default apps and what each app is allowed to do
- Privacy: location, file history, screen lock and trash cleanup
- Users: your account picture, name and password
- Appearance: light and dark style, accent color, wallpaper and window translucency
- Date and time: time zone, automatic time and clock format
- About: device name, hardware and system versions

Settings reads and writes the same settings as the desktop, so changes made elsewhere show up right away.

The sidebar uses the compositor's background blur on Wayland compositors that support `ext-background-effect-v1`, and falls back to a solid surface elsewhere.

## Development

```bash
bun install
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
```

## Install

```bash
sabine install .
```

This registers the `kestrel-settings:` link scheme, which Kestrel uses to open a specific page, for example `kestrel-settings:bluetooth`. If Settings is already open, the link switches the existing window to that page.
