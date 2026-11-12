---
title: Kestrel
description: The session Kestrel runs, how it comes back from a crash and brings apps back after a restart, peek, and the on-screen keyboard's layout files.
sidebar:
  order: 7
---

Kestrel is Luft's desktop and login screen. [Building Luft](/developers/building/#kestrel) builds it and runs it in a window, and [The compositor](/developers/desktop/compositor/) covers the Mutter it runs on.

## The session

The login screen starts `kestrel-session`, which runs `kestrel-session.target` and Kestrel's own session manager in place of gnome-session. When setup is still pending, `kestrel-setup.target` runs Install Luft alone over the blurred wallpaper first.

| Service | Role |
| --- | --- |
| `kestrel-session-manager` | `org.gnome.SessionManager` for apps and the shell: inhibitors, registered apps, logging out, restarting and shutting down once Kestrel has asked, idle presence, and `org.freedesktop.ScreenSaver` for players and browsers |
| `kestrel-settings` | The settings service, started before the shell |
| `kestrel-search` | Indexes the names and text of files in your home folder for Start, at idle priority |
| `kestrel-portal` | The portal backend for email, printing, accounts, app choosers, launchers, USB devices, wallpapers and lockdown; its dialogs open in Kestrel |
| `kestrel-greeter-service` | `com.lantharos.Greeter1` on the system bus, the login screen's settings |
| `kestrel-authenticate` | Checks lock screen passwords and fingerprints through the `kestrel-unlock` PAM rules |
| `kestrel-watchdog` | Restarts the computer when the GPU is stuck ([When Luft can't start](/developers/system/recovery/#hung-graphics)) |
| `kestrel-wallpaper` | Plays live wallpapers |

At shutdown, registered apps get a second to answer and then 5 seconds to close. Sandboxed apps can't change the session's environment, put the computer to sleep or end the session without asking, and only the app that took an inhibitor can give it up.

`kestrel-search` reads text only from regular files, never through links, and can write only to its own cache. The words shown around a match come from the index, so searching never opens your files.

greetd reads `/run/greetd/config.toml`, which `kestrel-greeter-service --write-greetd-config` writes before each start from the image's defaults in `/usr/lib/kestrel-greeter/greetd.toml` and the account that signs in by itself, kept in `/var/lib/kestrel-greeter`. Nothing in `/etc` holds it, so updates to the defaults always arrive. To change greetd's configuration on one computer, point `greetd.service` at your own file with a drop-in. The `greetd` and `kestrel-unlock` PAM rules live in `/usr/lib/pam.d` for the same reason, and a file of the same name in `/etc/pam.d` takes their place.

## Crash recovery

`kestrel-wrapper` starts Kestrel and starts it again within a moment when it crashes. It creates the session's Wayland socket, keeps it open, and hands it to each Kestrel it starts in `WAYLAND_SOCKET_NAME` and `WAYLAND_SOCKET_FD`, so the display stays where apps connect while Kestrel is away. After three crashes within a minute it gives up, the session ends and the login screen returns. Kestrel comes back on the lock screen when the screen was locked, and the session's services keep running throughout.

| Apps | After Kestrel crashes |
| --- | --- |
| Sabine apps, which every Luft app is | Reconnect, with their pages as they were |
| Qt 6 apps | Reconnect, since the session sets `QT_WAYLAND_RECONNECT=1` |
| GTK 3 and GTK 4 apps, Firefox, Chromium and Electron apps | Close, since they can't reconnect to a display, and open again |
| X11 apps | Close with Xwayland, which starts again, and open again |

Kestrel notes where every window is in `$XDG_RUNTIME_DIR/kestrel/DISPLAY/windows.json`. Windows of apps that reconnect within a minute come back on their workspace with their position, size and state, in their stacking order, and the one that had focus gets it back. Apps whose every process ended with Kestrel are opened again once, the way they are after an update.

## Bringing apps back

Every update needs a restart, so Kestrel keeps a record of what was open in `~/.local/state/kestrel/session.json`, readable only by the account: which apps were open and, for each window, its workspace, display, geometry, state, stacking order and focus. It holds no titles or contents. Kestrel rewrites it half a second after windows change, so a power cut still leaves a recent one.

At the next sign-in, the apps come back after a restart to install an update and after the session ended without warning. After an ordinary sign-out, restart or power off they only come back with `reopen-apps` in `com.lantharos.kestrel` on, which Settings shows under Apps. Nothing opens before the session is unlocked. Kestrel starts each app once through its launcher, a little apart, and places its windows in the order the app opens them, Wayland windows before they first show. A window whose display is gone opens on the main one. Apps that open by themselves at sign-in aren't started again, and the windows are stacked as they were within half a minute unless you've started using another one.

Apps bring back what their windows showed through Sabine. [Writing a Luft app](/developers/desktop/writing-apps/#bringing-windows-back) has the contract.

## peek

`peek` lets a program, such as a development tool, take pictures of windows and click and type in them. `peek --help` explains every command.

```sh
h=$(peek run --wait-window -- cargo run)   # starts it on a hidden display and prints a handle
peek window $h                             # saves a PNG and prints its path
peek click $h 120 40
peek type $h 'Hello'
peek stop $h
```

`peek run` gives the program its own hidden display, so nothing reaches your screen. An app you already have open starts a separate copy there, with its own runtime folder, cache and profile; `--shared` lets it use yours. `--here` opens it on your screen instead, and `--size 1920x1200:302x189mm` sets the hidden display's resolution and physical size. Windows you opened yourself need your permission first, which the privacy menu in the taskbar shows and takes back.

peek stays off until Developer tools is on. The switch is `DeveloperTools` on `com.lantharos.Greeter1`, kept in `/var/lib/kestrel-greeter/config.json`, which only root can write. `SetDeveloperTools` always asks for an administrator's password, so no program can turn it on by itself. The same switch opens the text consoles ([Hardening](/security/hardening/#text-consoles)).

## On-screen keyboard layouts

The on-screen keyboard reads its layouts from `kestrel/engine/data/osk-layouts`, one JSON file per XKB layout, named `layout.json` or `layout+variant.json`. A layout the folder lacks falls back to its base layout and then to `us`. Terminals use the `-extended` files, and fields that ask for digits, numbers, phone numbers, email addresses or URLs use `digits`, `number`, `phone`, `email` and `url`. The files started from the Android keyboards in Unicode CLDR 43, the last release that published them, and are edited by hand.

Each file is an object with `levels`, plus the `locale` and `name` CLDR gave it. A level is one panel of keys: its `level` name (`default`, `shift`, `opt` or `opt+shift`), its `mode` (`default`, `latched` or `locked`), and `rows`, an array of rows, each an array of keys. A key's properties are all optional:

| Property | Value |
| --- | --- |
| `strings` | The strings it types. The first is its label unless `label` is set; the rest show in the popup that opens when the key is held |
| `label` | The text on the key |
| `iconName` | An icon to show in place of a label |
| `keyval` | A keysym in hexadecimal, pressed as a key instead of typing a string |
| `width`, `height` | Its size in keys and rows, in steps of 0.5; 1 when left out. Height grows downwards |
| `leftOffset` | Empty space before it, in keys, in steps of 0.5 |
| `action` | `hide`, `languageMenu`, `emoji`, `delete`, `levelSwitch` to show the level named in `level`, or `modifier` to hold `keyval` for the next key, so Ctrl then A sends Ctrl+A |
