# Settings

Settings is the system settings app for Luft, built with Sabine and Svelte. It lives at `apps/settings`; run the commands below from that directory unless noted otherwise.

## Pages

- Network: Wi-Fi, wired connections, VPN and proxy, with per-connection settings for IP addresses, DNS, routes, metered data, hardware addresses and work or school Wi-Fi sign-in. Known networks lists every saved Wi-Fi network, including ones out of range, to change or forget. VPNs can be imported from WireGuard, OpenVPN and other configuration files your installed VPN plugins understand, or set up by hand for WireGuard with a freshly generated key, and VPN and wired connections can be removed
- Bluetooth: pairing, connecting and forgetting devices, visibility to nearby devices, and device details such as battery and automatic connection. The page is only there when the computer has a Bluetooth adapter, or one turned off with a hardware switch, and shows up as soon as a USB adapter is plugged in
- Displays: arrangement, resolution, refresh rate, scale, brightness and night light. Variable refresh can be off, follow fullscreen games, or follow every fullscreen app
- Sound: output and input devices, connections, volumes and alert sounds, with app volumes, including which output each app plays on, and device profiles on pages of their own
- Power: power mode, battery health and charge limit, keyboard backlight, screen blanking and suspend. On computers without a battery the page is called Power and leaves out everything about the battery
- Keyboard: input sources and repeat, with every keyboard shortcut, app shortcuts and your own on a page of their own. Input sources are keyboard layouts, including your own, and input methods, including the ones made in Keys. When Keys is installed, layouts and input methods made in it have an edit button that opens them there, and the page has rows to make a new layout from the first one in the list, make an input method, or open Keys
- Mouse and touchpad: speed, scrolling and tap to click, each shown when that kind of device is connected. The page is named after what is connected, and only appears once a mouse or touchpad is, including one plugged in while Settings is open
- Accessibility: the screen reader when Orca is installed, zoom and how far it magnifies, large text, high contrast, reduced animations and cursor size; the on-screen keyboard, with sticky, slow and bounce keys and their delays tucked under Typing assist; mouse keys, clicking by resting the pointer, holding to right-click and pressing Ctrl to find the pointer; and flashing the window or screen for alert sounds
- Notifications: do not disturb, the lock screen, and a page for per-app notifications, including which apps may still notify you during do not disturb
- Apps: default apps and what each app is allowed to do
- Privacy: location, file history, screen lock and cleanup of old trash and temporary files
- Security: a calm list of what protects the computer, showing only what is actually on: device encryption, Secure Boot, signed startup, the security chip, how much the hardware guards itself, and holding back new USB devices while the screen is locked. What can still be turned on shows up as an action instead, such as encrypting the device or setting up signed startup, along with firmware updates waiting in Updates. Device encryption turns on after you save or print a recovery key and choose whether to add a PIN at startup, or a passphrase on computers whose security chip can't unlock the disk; after one restart it encrypts in the background while you keep working. Other drives shows how far a drive being encrypted in Disks has come, or how many unlock with this computer, and opens Disks. The recovery key can be shown again or replaced, the PIN added, changed or removed, and the security chip linked again when the computer had to ask for the recovery key. Signed startup adds Luft's signing key to Secure Boot so the computer starts through Luft's signed boot menu; if the key isn't added at the restart, the steps come back at the next one with a new code, and after a few tries Settings offers to try again instead. Passwords and keys shows how your keyring is protected, locks it now or along with the screen, seals it with the security chip, and brings in older keyrings that use a different password; on computers with a fingerprint reader it also shows whether a fingerprint unlocks it and whether a PIN follows the fingerprint. Apps with access opens a page of its own listing which apps may use which saved passwords, the sign-ins apps keep for themselves, and recent access. SSH keys can be made inside the security chip, asked about before each use, copied as public keys and removed, and passkeys can be renamed and removed
- Users: your account picture, name, password and fingerprints
- Login Screen: whether everyone sees their own wallpaper or one shared picture, whether people are listed to pick from and who is left out of the list, the session that starts by default, and which account signs in automatically when the computer starts
- Appearance: light and dark style with a sunset or custom schedule, Pure black for OLED displays, an accent color picked from the wallpaper or plain white, whether other apps and terminals take on the colors, app icons in their own colors, tinted with the accent or a chosen color, or clear, with a preview of your pinned apps in each, the cursor theme and size, the system and monospace fonts, text size, wallpaper and window translucency. Wallpapers are the pictures and videos in the Wallpapers folder in Pictures, and the one you pick belongs to the style that is on, so light and dark each keep their own; videos play as live wallpapers on Kestrel, and on laptops a switch decides whether they keep playing on battery
- Date and time: time zone, automatic time and clock format
- Updates: updates for the system itself, such as the kernel, drivers, libraries and services, summed up in a sentence with their size, and listed in full by area when you want the details. They download in the background and install the next time you restart, with the boot splash showing the progress; restarting from the power menu offers to install them too. Firmware updates for your hardware appear here when the device maker publishes them. App updates are handled in Schelf, and Updates shows how many are waiting there. It also shows when updates were last checked for and how the last install went, and lets you choose whether to look for updates every day, every week or only when you check, and whether to download them automatically
- About: device name, hardware and system versions, storage with a button to manage drives in Disks, and recent problems: when the computer had to restart because the graphics driver stopped responding, what happened and what can keep it from happening again, with a restart straight into the firmware settings when that's what it takes

Appearance also chooses the system font, used for menus, buttons and text across the desktop and apps, and the monospace font for terminals and code. Each picker lists the installed families in their own font with a search, the monospace one only families whose letters are all the same width, and starts with Luft's own Open Runde and Maple Mono, which bring the default back. The size already chosen is kept.

All fonts opens a page listing every font family on the computer, each written in its own font, with a search. Clicking a family opens it in Magpie. Its ⋯ menu makes it the system or monospace font, and families you installed yourself, which live in `~/.local/share/fonts`, can be removed from there; they go to the trash.

Cursor themes are the ones in `~/.local/share/icons`, `~/.icons` and `/usr/share/icons` that have a `cursors` folder, each shown with its arrow, hand, text, busy and resize cursors. Themes put in the icons folder by hand show up the next time the window is focused. Get more cursors browses the Cursors category on [GNOME-Look](https://www.gnome-look.org/browse?cat=107): pick a download and Settings unpacks it, keeps only the folders that hold nothing but a cursor theme, and installs them in `~/.local/share/icons`. A theme never takes the place of an icon theme: if its folder name belongs to one, such as `hicolor` or `Adwaita`, it gets a free name like `hicolor-2` instead. Themes in that folder that hold nothing but cursors can be removed again. Downloads are limited to 128 MB and 512 MB once unpacked, and archives can't write outside their own folder.

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

This registers the `kestrel-settings:` link scheme, which Kestrel uses to open a specific page, for example `kestrel-settings:bluetooth`. A few pages within pages have links of their own: `kestrel-settings:appearance/fonts` and `kestrel-settings:appearance/cursors`. If Settings is already open, the link switches the existing window to that page. A link to a page for hardware the computer doesn't have, such as Bluetooth without an adapter, explains that in a line instead.
