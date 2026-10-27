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

`peek run` gives the program its own hidden display, so nothing reaches your screen. An app you already have open starts a separate copy there with its own runtime folder, cache and profile, instead of handing over to yours; `--shared` lets it use yours. `--here` opens it on your screen instead, and `--size 1920x1200:302x189mm` sets the hidden display's resolution and physical size. Windows you opened yourself need your permission first, which the privacy menu in the taskbar shows and takes back.

## Open windows

`com.lantharos.Kestrel.OpenWindows` at `/com/lantharos/Kestrel/OpenWindows` on `com.lantharos.Kestrel` tells apps which apps have a window open. `List` returns each app's desktop file ID with the process IDs of its windows, and `Changed` is sent whenever that changes. Barometer uses it to show apps running in the background. Sandboxed apps are refused.

## Sounds

Kestrel plays the `luft` sound theme from `kestrel/engine/data/sounds/luft`, which `kestrel/tools/sounds` renders. Each sound is decoded once, the first time it plays, and kept in memory; all of them play through one PipeWire stream with the Notification role, which keeps its own volume (the System sounds volume in Settings). A sound that plays again before it ends starts over instead of doubling up, so the volume tick keeps up with a held key. `com.lantharos.Kestrel.Sounds` at `/com/lantharos/Kestrel/Sounds` plays theme sounds for apps outside a sandbox: `Play` follows the switches in `com.lantharos.kestrel.sounds` and `org.gnome.desktop.sound event-sounds`, and `Preview`, which Settings uses, plays regardless of them. The headless `system:sounds` check follows what plays through the player's `played` signal.

## Emoji and characters

The emoji picker reads its emoji and symbols from `emoji.json` and `characters.json` in `kestrel/engine/data`. Both are generated from Unicode's data and checked in; regenerate them when Unicode publishes a new version:

| Command | Writes |
| --- | --- |
| `bun kestrel/tools/unicode/emojiData.ts [emoji-test.txt]` | `emoji.json`: every emoji in Unicode's groups and order, marking those that take a skin tone, from the latest `emoji-test.txt` or the copy given |
| `bun kestrel/tools/unicode/characterData.ts [ucd]` | `characters.json`: the symbol tabs and sections laid out in `characterGroups.ts`, from the latest Unicode Character Database or the folder given |

The build runs `annotationData.ts` to turn CLDR's emoji annotations (`cldr-emoji-annotation` on Fedora) into the names and keywords search uses, for the emoji, symbols and kaomoji the picker shows.

After sign-in Kestrel reads these files in the background and builds the picker and its search a few milliseconds at a time, along with Start, quick settings and the notification center, so each opens at once the first time without holding up animations or input.

## Settings

Kestrel's settings live in the `com.lantharos.kestrel` schemas, and Settings changes most of them. Keyboard shortcuts are in `com.lantharos.kestrel.keybindings` and `.media-keys`, with window management in GNOME's `org.gnome.desktop.wm.keybindings`; every one is listed in [Keyboard shortcuts](https://docs.luft.computer/desktop/shortcuts/). The wallpaper palette Kestrel shares with apps is described in [Appearance](../appearance.md), and its own dialogs for the keyring and GnuPG in [Prompts](../prompts.md).

`kestrel-settings` follows the dark style schedule in `dark-schedule` together with the night light, from the same sunrise and sunset, so both change at the same moment.

Chromium-based browsers and Electron apps lock their profile with the host name, and refuse a profile locked under another name. At sign-in and whenever the host name changes, `kestrel-settings` looks for these locks in `~/.config`, Flatpak's `~/.var/app/*/config` and Sabine's profiles: a lock still held by its running app is moved to the new name, so launching it again opens a window in that app, and one left behind by an app that's no longer running is removed. NetworkManager never names the computer after the network (`hostname-mode=none`), so the name only changes when you rename it in Settings.

## Session services

| Service | Role |
| --- | --- |
| `kestrel-session` | Started by the login screen; runs `kestrel-session.target` and Kestrel's session manager in place of gnome-session |
| `kestrel-setup.target` | Kestrel in setup mode with the session manager, before the desktop when setup is pending |
| `kestrel-settings` | Settings service started before the shell |
| `kestrel-search` | Indexes the names and text of files in your home folder for Start, at idle priority |
| `kestrel-portal` | `com.lantharos.Kestrel.Portal`, the portal backend for email, printing, accounts, app choosers, launchers, USB devices, wallpapers and lockdown. Its dialogs still open in Kestrel |
| `kestrel-greeter-service` | `com.lantharos.Greeter1` on the system bus, the login screen's settings |
| `kestrel-authenticate` | Checks lock screen passwords and fingerprints through the `kestrel-unlock` PAM rules |
| `kestrel-watchdog` | Restarts the computer when the GPU is stuck ([details](../boot.md#graphics-driver-stopped-responding)) |
| `kestrel-wallpaper` | Plays live wallpapers |
| `kestrel-rain` | Makes the sound of rain as it plays, as a `Rain` stream in PipeWire. Kestrel writes `INTENSITY VOLUME` lines to it and closes its input to fade it out. `--render PATH SECONDS:INTENSITY:VOLUME...` writes the same sound to a WAV file instead |

greetd reads `/run/greetd/config.toml`, which `kestrel-greeter-service --write-greetd-config` writes before each start from the image's defaults in `/usr/lib/kestrel-greeter/greetd.toml` and the account that signs in by itself, kept in `/var/lib/kestrel-greeter/initial-session.toml`. Nothing in `/etc` holds it, so updates to the defaults always arrive; to change greetd's configuration on one computer, point `greetd.service` at your own file with a drop-in. The `greetd` and `kestrel-unlock` PAM rules are in `/usr/lib/pam.d` for the same reason, and a file of the same name in `/etc/pam.d` takes their place.

If Kestrel crashes, systemd starts it again within a moment, and it comes back on the lock screen when the screen was locked. Apps lose their connection to the display and close, while the session's services keep running. After three crashes within a minute the session ends and the login screen returns.

`kestrel-session --setup` runs Install Luft alone over the blurred wallpaper first ([Install](../install.md)). The session identifies as `Kestrel;GNOME`, so apps that only recognize GNOME keep their keyring, theme and autostart behavior.
