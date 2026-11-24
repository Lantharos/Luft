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
| `kestrel-search` | Indexes the names and text of files in your home folder for Gust, at idle priority |
| `kestrel-portal` | The portal backend for email, printing, accounts, app choosers, launchers, USB devices, wallpapers and lockdown; its dialogs open in Kestrel |
| `kestrel-greeter-service` | `com.lantharos.Greeter1` on the system bus, the login screen's settings |
| `kestrel-authenticate` | Checks lock screen passwords and fingerprints through the `kestrel-unlock` PAM rules |
| `kestrel-watchdog` | Restarts the computer when the GPU is stuck ([When Luft can't start](/developers/system/recovery/#hung-graphics)) |
| `kestrel-wallpaper` | Plays live wallpapers |

At shutdown, registered apps get a second to answer and then 5 seconds to close. Sandboxed apps can't change the session's environment, put the computer to sleep or end the session without asking, and only the app that took an inhibitor can give it up.

Apps end with the session that started them, even when the user manager outlives it because of an SSH login, lingering or another session. Every `app-*.scope` and `app-*.service` is part of `graphical-session.target` and ordered after it, and stopping `kestrel-session.target` or `kestrel-setup.target` also stops `graphical-session.target` in the same step. So when you sign out, or Kestrel gives up after crashing, apps are asked to close first while the display is still there, get 10 seconds before they're killed, and Kestrel stops after them. Services that aren't apps, such as Sabine's runtime, Luft's services and anything started with `systemd-run`, keep running.

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

peek stays off until Developer tools is on. The switch is `DeveloperTools` on `com.lantharos.Greeter1`, kept in `/var/lib/kestrel-greeter/config.json`, which only root can write. `SetDeveloperTools` always asks for an administrator's password, so no program can turn it on by itself. The same switch opens the text consoles ([Hardening](/security/hardening/#text-consoles)). An organization's [policy](/organizations/policy/) can decide it, and `SetDeveloperTools` then refuses to change it.

## Recording windows

A game clipper records the game's window, not the whole screen, and shows a short note over the game while it is full screen. Kestrel offers that through standard Wayland protocols, so the same app works on other desktops that have them:

| Protocol | Version | Gives |
| --- | --- | --- |
| `ext_foreign_toplevel_list_v1` | 1 | The windows on the taskbar, each with its title, app ID and an identifier that is never reused. The app ID of an X11 window is its `WM_CLASS`, so Steam games show as `steam_app_<id>` |
| `ext_foreign_toplevel_image_capture_source_manager_v1` | 1 | A capture source for one of those windows |
| `ext_image_copy_capture_manager_v1` | 1 | Frames of the window copied into the app's own buffers: DMA-BUFs on the main graphics device or shared memory, in `ARGB8888` or `XRGB8888`, with the pointer drawn in when the app asks for `paint_cursors`. Frames hold only the window's own picture, without the desktop's rounded corners, outline or shadow. `ready` comes once the graphics card has finished drawing the frame, so the app can read it straight away. A frame fails with `buffer_constraints` only when the buffer doesn't match the latest constraints, and with `unknown` when drawing it failed, in which case the app can try again. After the first frame, a frame waits until the window changes. The session stops when the window closes. Cursor sessions aren't offered |
| `zwlr_layer_shell_v1` | 5 | The overlay layer only. An overlay sits above every window, full-screen ones included, on the output it names or the primary one, placed by its anchors and margins, with its subsurfaces. It never takes keyboard focus and the pointer goes through it to the window below, whatever its keyboard interactivity or input region say. Asking for another layer, or for a popup, is a protocol error |

Sandboxed apps see none of these globals unless they may record windows: either they declared `windows = "capture"` in `[sandbox]` and the person agreed when installing, or the person allowed it when the app called `RequestAccess()` on `com.lantharos.Kestrel.WindowCapture`. That shows "Allow *app* to see your windows?" once. Allowing writes `yes` to the `window-capture` table of the permission store, under the app ID the sandbox gives the app, never one the app names. Declining refuses the app until it restarts. Programs outside a sandbox see the globals without asking, as they can already read the screen.

Kestrel hands the compositor the apps allowed, and the compositor checks them when a client binds a global, when it starts a recording and when it asks for an overlay. A client sees new globals only in a registry it creates after the permission arrives, so an app that just got it creates a new `wl_registry`. Taking the permission away in Settings, under Privacy → Screen and input sharing, stops the app's recordings and keeps it from starting new ones.

While an app records a window, the taskbar shows that the screen is shared, its menu stops every recording, and Settings lists the app as recording right now. The compositor announces each recording with `MetaDisplay::window-capture-started` and `::window-capture-ended`, and `meta_display_stop_window_capture()` ends one.

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
