# Settings

Settings is the system settings app for Luft, built with Sabine and SvelteKit. It lives at `apps/settings`; run the commands below from that directory unless noted otherwise.

## Pages

- Network: Wi-Fi, wired connections, VPN and proxy, with per-connection settings for IP addresses, DNS, routes, metered data, hardware addresses and work or school Wi-Fi sign-in. Known networks lists every saved Wi-Fi network, including ones out of range, to change or forget. VPNs can be imported from WireGuard, OpenVPN and other configuration files your installed VPN plugins understand, or set up by hand for WireGuard with a freshly generated key, and VPN and wired connections can be removed
- Bluetooth: pairing, connecting and forgetting devices, visibility to nearby devices, and device details such as battery and automatic connection
- Displays: arrangement, resolution, refresh rate, scale, brightness and night light
- Sound: output and input devices, connections and device profiles, volumes, which output each app plays on and alert sounds
- Power: power mode, battery health and charge limit, keyboard backlight, screen blanking and suspend
- Keyboard: input sources, repeat and shortcuts
- Mouse and touchpad: speed, scrolling and tap to click
- Notifications: do not disturb and per-app notifications, including which apps may still notify you during do not disturb
- Apps: default apps and what each app is allowed to do
- Privacy: location, file history, screen lock and trash cleanup
- Users: your account picture, name, password and fingerprints
- Appearance: light and dark style with a sunset or custom schedule, Pure black for OLED displays, the colors picked from the wallpaper and whether other apps and terminals take them on, wallpaper and window translucency. Wallpapers are the pictures and videos in the Wallpapers folder in Pictures, and the one you pick belongs to the style that is on, so light and dark each keep their own; videos play as live wallpapers on Kestrel, and on laptops a switch decides whether they keep playing on battery
- Date and time: time zone, automatic time and clock format
- About: device name, hardware and system versions

Settings reads and writes the same settings as the desktop, so changes made elsewhere show up right away.

Brightness for external displays needs [ddcutil](https://www.ddcutil.com). Its package lets your account reach the displays after you log in again; without it, Displays explains what's missing. Built-in screens are adjusted through the desktop and need nothing extra.

The sidebar uses the compositor's background blur on Wayland compositors that support `ext-background-effect-v1`, and falls back to a solid surface elsewhere.

## Development

Settings shares its controls, styles and window setup with the other Luft apps through `packages/ui` and `packages/app`, so install dependencies once from the repository root:

```bash
bun install              # from the repository root
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
```

## Install

```bash
sabine install .
```

This registers the `kestrel-settings:` link scheme, which Kestrel uses to open a specific page, for example `kestrel-settings:bluetooth`. If Settings is already open, the link switches the existing window to that page.
