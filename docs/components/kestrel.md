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

## Types

The TypeScript in `kestrel/ui` and `kestrel/tools` is typed against `kestrel/types/gir`, which ts-for-gir generates from the GIR files of Kestrel's own Mutter, its engine (`Shell` and `St`) and every other library they import, so the types match what Kestrel runs, patches included. Regenerate them after changing API the shell uses, in a patch or in the engine:

```sh
cd kestrel/types
bun run generate                                      # builds the compositor and kestrel/build, then writes gir/
bun generate.ts --build BUILD_DIR --compositor PREFIX # uses an existing build instead
```

The libraries' GIR files come from the folders in `XDG_DATA_DIRS`, so install the packages in `os/image/packages/build.txt` first. The image build runs `generate.ts --check` after building Kestrel and fails when the checked-in types differ from what its build produces.

## Settings

Kestrel's settings live in the `com.lantharos.kestrel` schemas, and Settings changes most of them. Keyboard shortcuts are in `com.lantharos.kestrel.keybindings` and `.media-keys`, with window management in GNOME's `org.gnome.desktop.wm.keybindings`; every one is listed in [Keyboard shortcuts](https://docs.luft.computer/desktop/shortcuts/). The wallpaper palette Kestrel shares with apps is described in [Appearance](../appearance.md), and its own dialogs for the keyring and GnuPG in [Prompts](../prompts.md).

`kestrel-settings` follows the dark style schedule in `dark-schedule` together with the night light, from the same sunrise and sunset, so both change at the same moment.

Once the desktop is up, `kestrel-settings` mounts the data drives inside the computer through UDisks, and does the same for any that appear later, while `mount-internal` in `com.lantharos.kestrel.drives` is on. It mounts ext4, Btrfs, XFS, F2FS, exFAT, FAT32 and NTFS file systems on drives that aren't removable, and leaves out partitions with `UDISKS_IGNORE`, `UDISKS_AUTO=0` or an fstab entry, the GPT attributes for required (bit 0), hidden (62) and no automount (63), EFI, XBOOTLDR, Microsoft reserved and recovery, BIOS boot, LDM, Storage Spaces, swap and the discoverable root, `/usr`, `/var` and `/tmp` types, recovery and OEM labels, and Luft's and Meet Luft's own partitions by label. Locked LUKS and BitLocker volumes stay locked. The first time it meets an ext4, Btrfs, XFS or F2FS file system, it mounts it read-only (ext4 without replaying its journal) and closes it again if it holds another system: `etc/os-release`, `usr/lib/os-release`, `etc/fstab`, an OSTree or boot loader files, at the top or in a Btrfs subvolume. What it found is kept by file system UUID in `~/.local/state/luft/internal-drives`, so later sign-ins mount straight away. NTFS mounts read-only while `com.lantharos.Windows1` reports a hibernated Windows, with a notification the first time. A drive you unmount stays unmounted until it appears again. e2fsprogs marks every ext4 file system `UDISKS_AUTO=0`; `65-kestrel-internal-ext4.rules` takes that back for drives that aren't on USB or a memory card and aren't held by trustd, so an explicit `UDISKS_AUTO=0` from a later rule still counts. `50-kestrel-drives.rules` lets administrators at the computer mount internal file systems without a password; for anyone else, mounting at sign-in never asks and leaves the drives closed.

Chromium-based browsers and Electron apps lock their profile with the host name, and refuse a profile locked under another name. At sign-in and whenever the host name changes, `kestrel-settings` looks for these locks in `~/.config` and `~/.cache`, in each Flatpak's own config and cache folders under `~/.var/app`, and in Sabine's profiles: a lock still held by its running app is moved to the new name, so launching it again opens a window in that app, and one left behind by an app that's no longer running is removed. NetworkManager never names the computer after the network (`hostname-mode=none`), so the name only changes when you rename it in Settings.

## Session services

| Service | Role |
| --- | --- |
| `kestrel-session` | Started by the login screen; runs `kestrel-session.target` and Kestrel's session manager in place of gnome-session |
| `kestrel-setup.target` | Kestrel in setup mode with the session manager, before the desktop when setup is pending |
| `kestrel-session-manager` | `org.gnome.SessionManager` for apps and the shell: inhibitors, registered apps, logging out, restarting and shutting down after Kestrel asks you (each app then gets 10 seconds to close), idle presence, and `org.freedesktop.ScreenSaver` for players and browsers. Sandboxed apps can't change the session's environment or end it without asking |
| `kestrel-settings` | Settings service started before the shell |
| `kestrel-search` | Indexes the names and text of files in your home folder for Start, at idle priority |
| `kestrel-portal` | `com.lantharos.Kestrel.Portal`, the portal backend for email, printing, accounts, app choosers, launchers, USB devices, wallpapers and lockdown. Its dialogs still open in Kestrel |
| `kestrel-greeter-service` | `com.lantharos.Greeter1` on the system bus, the login screen's settings |
| `kestrel-authenticate` | Checks lock screen passwords and fingerprints through the `kestrel-unlock` PAM rules, and waits for a fingerprint at the login screen |
| `kestrel-watchdog` | Restarts the computer when the GPU is stuck ([details](../boot.md#graphics-driver-stopped-responding)) |
| `kestrel-wallpaper` | Plays live wallpapers |
| `kestrel-rain` | Makes the sound of rain as it plays, as a `Rain` stream in PipeWire. Kestrel writes `INTENSITY VOLUME` lines to it and closes its input to fade it out. `--render PATH SECONDS:INTENSITY:VOLUME...` writes the same sound to a WAV file instead |

greetd reads `/run/greetd/config.toml`, which `kestrel-greeter-service --write-greetd-config` writes before each start from the image's defaults in `/usr/lib/kestrel-greeter/greetd.toml` and the account that signs in by itself, kept in `/var/lib/kestrel-greeter/initial-session.toml`. Nothing in `/etc` holds it, so updates to the defaults always arrive; to change greetd's configuration on one computer, point `greetd.service` at your own file with a drop-in. The `greetd` and `kestrel-unlock` PAM rules are in `/usr/lib/pam.d` for the same reason, and a file of the same name in `/etc/pam.d` takes their place.

`kestrel-session --setup` runs Install Luft alone over the blurred wallpaper first ([Install](../install.md)). The session identifies as `Kestrel;GNOME`, so apps that only recognize GNOME keep their keyring, theme and autostart behavior.

## Signing in and unlocking

With a finger enrolled and the lid open, the lock screen and the login screen ask for the fingerprint first, with the password a click or a keystroke away; the key you type stays in the password field. With the lid closed the reader isn't used at all. Each screen remembers how you last got in and starts there next time: the lock screen in `~/.local/state/kestrel/sign-in-method`, the login screen in `/var/lib/kestrel-greeter/users/UID/sign-in-method`, which the session updates through `com.lantharos.Greeter1` along with your style, wallpaper, displays and Num Lock.

The lock screen listens for the finger as soon as it shows, so a recognized finger unlocks from the clock without opening the prompt. When the reader gives up after three unknown fingers, or stops responding, the prompt turns to the password and offers to try the fingerprint again. Results from the reader (`VerifyStatus` from fprintd) only decide what the prompt shows; only the PAM rules decide whether you get in.

At the login screen, the `greetd` PAM rules start with `pam_kestrel_sign_in.so`, which asks the login screen how you sign in. For a fingerprint it runs the system's `fingerprint-auth` rules in `kestrel-authenticate --fingerprint` and keeps asking whether to go on waiting, so typing a password stops the reader at once. Otherwise, or once the reader gives up, the system's `password-auth` rules ask for the password. Either way exactly one of the two sets of rules decides, followed by the same account, keyring and session rules as before.

## Crash recovery

`kestrel-wrapper` starts Kestrel and starts it again within a moment when it crashes. It creates the session's Wayland socket and keeps it open, and hands it to each Kestrel it starts in `WAYLAND_SOCKET_NAME` and `WAYLAND_SOCKET_FD`, so the display stays where apps connect while Kestrel is away. After three crashes within a minute it stops, the session ends and the login screen returns. Kestrel comes back on the lock screen when the screen was locked, and the session's services keep running throughout.

| Apps | After Kestrel crashes |
| --- | --- |
| Sabine apps, which every Luft app is | Reconnect, with their pages as they were |
| Qt 6 apps | Reconnect, since the session sets `QT_WAYLAND_RECONNECT=1` |
| GTK 3 and GTK 4 apps, Firefox, Chromium and Electron apps | Close; they can't reconnect to a display |
| X11 apps | Close with Xwayland, which starts again for the next one |

Kestrel notes where every window is in `$XDG_RUNTIME_DIR/kestrel/DISPLAY/windows.json`. Windows of apps that reconnect within a minute of the restart come back on their workspace with their position, size, maximized, fullscreen, minimized and always-on-top state, in their stacking order, and the one that had focus gets it back. With window tiling on, tiled windows are laid out again with the others in their space.
