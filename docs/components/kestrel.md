# Kestrel

Kestrel ([kestrel](../../kestrel)) is Luft's desktop and login screen. Building it and running it in a window is in [the folder's README](../../kestrel/README.md).

## peek

`peek` lets a program, such as a development tool, take pictures of windows and click and type in them. `peek --help` explains every command.

```sh
h=$(peek run --wait-window -- cargo run)   # starts it on a hidden display and prints a handle
peek window $h                             # saves a PNG and prints its path
peek click $h 120 40
peek type $h 'Hello'
peek stop $h
```

`peek run` gives the program its own hidden display, so nothing reaches your screen; `--here` opens it on your screen instead, and `--size 1920x1200:302x189mm` sets the hidden display's resolution and physical size. Windows you opened yourself need your permission first, which the privacy menu in the taskbar shows and takes back.

## Open windows

`com.lantharos.Kestrel.OpenWindows` at `/com/lantharos/Kestrel/OpenWindows` on `com.lantharos.Kestrel` tells apps which apps have a window open. `List` returns each app's desktop file ID with the process IDs of its windows, and `Changed` is sent whenever that changes. Barometer uses it to show apps running in the background. Sandboxed apps are refused.

## Sounds

Kestrel plays the `luft` sound theme from `kestrel/engine/data/sounds/luft`, which `kestrel/tools/sounds` renders. Each sound is decoded once, the first time it plays, and kept in memory; all of them play through one PipeWire stream with the Notification role, which keeps its own volume (the System sounds volume in Settings). A sound that plays again before it ends starts over instead of doubling up, so the volume tick keeps up with a held key. `com.lantharos.Kestrel.Sounds` at `/com/lantharos/Kestrel/Sounds` plays theme sounds for apps outside a sandbox: `Play` follows the switches in `com.lantharos.kestrel.sounds` and `org.gnome.desktop.sound event-sounds`, and `Preview`, which Settings uses, plays regardless of them. The headless `system:sounds` check follows what plays through the player's `played` signal.

## Settings

Kestrel's settings live in the `com.lantharos.kestrel` schemas, and Settings changes most of them. Keyboard shortcuts are in `com.lantharos.kestrel.keybindings` and `.media-keys`, with window management in GNOME's `org.gnome.desktop.wm.keybindings`; every one is listed in [Keyboard shortcuts](https://docs.luft.computer/desktop/shortcuts/). The wallpaper palette Kestrel shares with apps is described in [Appearance](../appearance.md), and its own dialogs for the keyring and GnuPG in [Prompts](../prompts.md).

## Session services

| Service | Role |
| --- | --- |
| `kestrel-session` | Started by the login screen; runs `kestrel-session.target` and Kestrel's session manager in place of gnome-session |
| `kestrel-setup.target` | Kestrel in setup mode with the session manager, before the desktop when setup is pending |
| `kestrel-settings` | Settings service started before the shell |
| `kestrel-search` | Indexes the names and text of files in your home folder for Start, at idle priority |
| `kestrel-greeter-service` | `com.lantharos.Greeter1` on the system bus, the login screen's settings |
| `kestrel-authenticate` | Checks lock screen passwords and fingerprints through the `kestrel-unlock` PAM rules |
| `kestrel-watchdog` | Restarts the computer when the GPU is stuck ([details](../boot.md#graphics-driver-stopped-responding)) |
| `kestrel-wallpaper` | Plays live wallpapers |

`kestrel-session --setup` runs Install Luft alone over the blurred wallpaper first ([Install](../install.md)). The session identifies as `Kestrel;GNOME`, so apps that only recognize GNOME keep their keyring, theme and autostart behavior.
