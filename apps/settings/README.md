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
- Privacy: location, file history, screen lock and cleanup of old trash and temporary files
- Security: how well the device is protected at a glance, with Secure Boot, the TPM, how much the hardware guards itself and what the next level would need, and any firmware updates waiting in Updates. Device encryption turns on after you save or print a recovery key and choose whether to add a PIN at startup, or a passphrase on computers without a usable TPM; after one restart it encrypts in the background while you keep working. The recovery key can be shown again or replaced, the PIN added, changed or removed, and the TPM linked again when the computer had to ask for the recovery key. Luft's signing key can be added to Secure Boot so the computer starts through Luft's signed boot menu, and new USB devices plugged in while the screen is locked wait until you unlock. Passwords and keys shows how your keyring is protected, whether a fingerprint unlocks it too and whether a PIN follows the fingerprint, locks it now or along with the screen, and brings in older keyrings that use a different password. It lists which apps may use which saved passwords, the sign-ins apps keep for themselves, recent access, and your SSH keys, which can be made inside the security chip, asked about before each use, copied as public keys and removed
- Users: your account picture, name, password and fingerprints
- Login Screen: whether everyone sees their own wallpaper or one shared picture, whether people are listed to pick from and who is left out of the list, the session that starts by default, and which account signs in automatically when the computer starts
- Appearance: light and dark style with a sunset or custom schedule, Pure black for OLED displays, an accent color picked from the wallpaper or plain white, whether other apps and terminals take on the colors, app icons in their own colors, tinted with the accent or a chosen color, or clear, with a preview of your pinned apps in each, the cursor theme and size, wallpaper and window translucency. Wallpapers are the pictures and videos in the Wallpapers folder in Pictures, and the one you pick belongs to the style that is on, so light and dark each keep their own; videos play as live wallpapers on Kestrel, and on laptops a switch decides whether they keep playing on battery
- Date and time: time zone, automatic time and clock format
- Updates: updates for the system itself, such as the kernel, drivers, libraries and services, summed up in a sentence with their size, and listed in full by area when you want the details. They download in the background and install the next time you restart, with the boot splash showing the progress; restarting from the power menu offers to install them too. Firmware updates for your hardware appear here when the device maker publishes them. App updates are handled in Schelf, and Updates shows how many are waiting there. It also shows when updates were last checked for and how the last install went, and lets you choose whether to look for updates every day, every week or only when you check, and whether to download them automatically
- About: device name, hardware and system versions

Cursor themes are the ones in `~/.local/share/icons`, `~/.icons` and `/usr/share/icons` that have a `cursors` folder, each shown with its arrow, hand, text, busy and resize cursors. Themes put in the icons folder by hand show up the next time the window is focused. Get more cursors browses the Cursors category on [GNOME-Look](https://www.gnome-look.org/browse?cat=107): pick a download and Settings unpacks it, keeps only the folders that hold a cursor theme, and installs them in `~/.local/share/icons`, where they can also be removed again. Downloads are limited to 128 MB and 512 MB once unpacked, and archives can't write outside their own folder.

Settings reads and writes the same settings as the desktop, so changes made elsewhere show up right away.

Automatic update checks run as a systemd user timer, `com.lantharos.settings.updates.timer`, which starts Settings without a window to refresh the software sources, download what's new and send a notification once the updates are ready. Settings writes the timer the first time Updates is opened and rewrites it when the schedule changes. A package counts as an app, and is left to Schelf, when it puts a visible entry in the app menu; everything else is a system update.

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
