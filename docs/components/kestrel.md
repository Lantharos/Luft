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

peek is a developer tool and stays off until Developer tools is turned on. The switch is `DeveloperTools` on `com.lantharos.Greeter1`, kept in `/var/lib/kestrel-greeter/config.json`, which only root can write; `SetDeveloperTools(b)` changes it and always asks for an administrator's password, so a program can't turn it on by itself. The same switch opens the text consoles ([Security](../security.md#text-consoles)).

## Open windows

`com.lantharos.Kestrel.OpenWindows` at `/com/lantharos/Kestrel/OpenWindows` on `com.lantharos.Kestrel` tells apps which apps have a window open. `List` returns each app's desktop file ID with the process IDs of its windows, and `Changed` is sent whenever that changes. Barometer uses it to show apps running in the background. Sandboxed apps are refused.

`com.lantharos.Kestrel.Share` at `/com/lantharos/Kestrel/Share` opens the Send sheet for files an app hands over as open files, where people choose a device nearby through [Post](#post) or an app for them. It's the one call of Kestrel's that sandboxed apps may make besides reading the palette; [App sandbox](../app-sandbox.md#sending-files) has what it checks.

## Post

Post sends files, folders and text to phones and computers nearby and takes what they send, over LocalSend's protocol (version 2.x, HTTPS on port 53317, with announcements to `224.0.0.167:53317`), so LocalSend's apps on Android, iOS, Windows, macOS and Linux work with it. What people see of it is in [the docs](https://docs.luft.computer/desktop/post/).

`kestrel-post` (`kestrel/post`) speaks the protocol. It's a session service in `session.slice`, `kestrel-post.service`, which D-Bus starts as `com.lantharos.Kestrel.Post` the first time Kestrel calls it, sandboxed to the network families it needs. It keeps its certificate in `kestrel/post` in the user's data folder; the certificate's SHA-256 is how other devices know this computer. LocalSend's parts live in `src/localsend`, and the rest (the D-Bus interface, settings, firewall, progress) knows nothing of LocalSend, so another protocol can sit beside it.

`com.lantharos.Kestrel.Post` at `/com/lantharos/Kestrel/Post` has the devices nearby, whether it's looking, the name it goes by and where files go as properties, and methods to send files or text, answer offers and PINs, cancel, and pair. Kestrel calls `Configure` with what people chose, from `com.lantharos.kestrel.post`, whenever that changes and whenever `kestrel-post` starts again. Settings calls `StartPairing` and `StopPairing`. The prefix keeps sandboxed apps from asking for it.

Post only looks for devices and announces itself on home networks: it follows `HomeInterfaces` on `com.lantharos.Firewall1`, joins the announcement group on those interfaces alone and leaves it when a network stops being home. Without the firewall it finds no one.

Who can find this computer (`visibility`) decides what it says to whom:

- **No one**: it serves nothing and announces nothing, and the firewall keeps the port closed. Sending still works: looking for devices asks each address on the local `/24` for `/info`, which shows nothing of this computer.
- **Your devices** (the default): it never announces itself to everyone. It answers `/info`, `/register` and `prepare-upload` only for a device whose TLS client certificate is one of yours, registers back only with those when they announce themselves, and looks for devices by asking each address nearby as above, registering with yours as it finds them.
- **Everyone**: it announces itself, answers everyone, and asks before taking files from a device that isn't one of yours.

Your devices are the `devices` key, fingerprints with names. A device becomes one either by **Always accept** in the window that asks about its files, which needs a client certificate, or through Settings, which calls `StartPairing`: for as long as the dialog is open the computer can be found by everyone, `prepare-upload` from a device that isn't yours asks for the six-digit PIN Settings shows, three wrong tries per address, and the first device with a certificate that gives it becomes yours (`Paired`), Kestrel keeping it.

Received files go to `Post` in the Downloads folder unless `folder` names another. A folder someone sends keeps its layout inside it, but nothing the sender names can leave that folder, start with a dot or replace a file already there.

Kestrel draws Post in `kestrel/ui/src/system/connectivity/post`: the window that asks about what comes in and shows it arriving, text windows, the PIN prompt, notifications, Post's button and panel in the taskbar beside the status icons, which shows while someone may find the computer, and Send to device in Rover's menu, which is a file action Kestrel adds itself. Files dropped on Post's button or on a bare part of the taskbar open the Send sheet. `kestrel-post` tells the firewall with `SetPostOpen` whether its port should be open; see [Security](../security.md#post).

Headless sessions run `kestrel-post` in a network of its own (`kestrel/tools/session/postNetwork.sh`): two network namespaces in a user namespace, joined by a veth pair with multicast, this computer at `10.53.17.1` and a computer nearby at `10.53.17.2`. `desktop:post` and `desktop:send` start a second `kestrel-post` at the far end, on a bus of its own, so checks never reach the real network or a real Post on the same computer.

## Sounds

Kestrel plays the `luft` sound theme from `kestrel/engine/data/sounds/luft`, which `kestrel/tools/sounds` renders. Each sound is decoded once, the first time it plays, and kept in memory; all of them play through one PipeWire stream with the Notification role, which keeps its own volume (the System sounds volume in Settings). A sound that plays again before it ends starts over instead of doubling up, so the volume tick keeps up with a held key. `com.lantharos.Kestrel.Sounds` at `/com/lantharos/Kestrel/Sounds` plays theme sounds for apps: `Play`, which sandboxed apps may call too, takes a sound's name, follows the switches in `com.lantharos.kestrel.sounds` and `org.gnome.desktop.sound event-sounds` and plays at most four sounds a second for each caller; `Preview`, which Settings uses, plays regardless of the switches, and `Check` tells Settings whether a file can be a custom sound. Neither answers sandboxed apps. The `custom` key in `com.lantharos.kestrel.sounds` maps sound names to files Settings copied into `kestrel/sounds` in the user's data folder. The player reads it instead of the theme, drops its decoded sounds when it changes so a new choice plays at once, stops decoding a custom sound past 10 seconds, and falls back to the theme when a file is missing or won't decode. A sound file an app's notification names plays for at most 10 seconds, fading out at the cut. Only theme sounds that ship with the system, under a system data folder owned by root, are decoded inside Kestrel. Theme sounds from anywhere else, such as the user's data folder, custom sounds and the files apps name are decoded by `kestrel-sound-decoder`, a helper Kestrel starts for each one in a Bubblewrap sandbox with no network, no home folder and nothing to write to, only `/usr` and the sound itself as its input; once it has loaded GStreamer it also gives up starting programs, opening sockets and the system calls a decoder never needs, and may use at most 1 GiB of memory. Kestrel reads the decoded sound from it and stops it after 5 seconds or once it has the 10 seconds it plays, so a broken or hostile file can only make that one sound fail. The login screen runs as its own user, so it never sees these files. The headless `system:sounds` check follows what plays, and from which file, through the player's `played` signal.

## Pens

`com.lantharos.Kestrel.Pens` at `/com/lantharos/Kestrel/Pens` lists the seat's pens and drawing tablets in its `Devices` property, each with the `VVVV:PPPP` ID that GNOME's tablet settings paths use, its name, and whether it's a pen on a screen (it shares its HID device with a touchscreen, or it's virtual) or a separate tablet; `PropertiesChanged` follows devices coming and going. Settings shows its Pen page only while it lists something. Pen settings live in `com.lantharos.kestrel.pen` for every pen at once: the writing hand, the pressure curves, and what the side buttons and the eraser do. Taking a screenshot, opening Heft and opening Start come from the compositor's `pen-action` signal on the display, which `kestrel/ui/src/system/hardware/pens/actions.ts` carries out while the desktop is usable. The headless `tablet:pen` check drives a virtual pen through them.

## Taskbar

The taskbar is a set of islands, each a group of elements: Start, the dock, the tray, the status icons, the clock, and elements extensions add through `taskbarElements` in `kestrel/ui/src/desktop/panel/elements/extensionElements.ts`. `com.lantharos.kestrel taskbar-arrangement` keeps them as one `a(sas)` value, each island a spot such as `bottom-end` with its elements in order. The model, its geometry and the presets live in `packages/web/ui/src/taskbar/arrangement` and are shared with Settings; Kestrel reads them in `preferences/arrangement.ts`.

Separate islands each sit at their own spot; a joined taskbar runs along the dock's edge and keeps every island's place along it. Islands on the top and bottom keep the corners, and one on a side that would run into them moves along its edge. Every edge with an island gets a strut and its own auto-hide, Mutter is told the display leaves a gap so maximized windows keep their rounded corners there, and Start, quick settings and notifications open beside the island of the element that opens them. `IslandShapes` in `islands/shapes.ts` is the one place that says where the taskbar is: the bar or every separate island, with its edge and rounding, in stage coordinates.

The taskbar's menu, the desktop's menu and Settings open Edit taskbar (`TaskbarEditor`), which previews every change live and saves only on Done. Settings starts it through `Arrange` on `com.lantharos.Kestrel.Taskbar` at `/com/lantharos/Kestrel/Taskbar`; sandboxed apps are refused.

## Emoji and characters

The emoji picker reads its emoji and symbols from `emoji.json` and `characters.json` in `kestrel/engine/data`. Both are generated from Unicode's data and checked in; regenerate them when Unicode publishes a new version:

| Command | Writes |
| --- | --- |
| `bun kestrel/tools/unicode/emojiData.ts [emoji-test.txt]` | `emoji.json`: every emoji in Unicode's groups and order, marking those that take a skin tone, from the latest `emoji-test.txt` or the copy given |
| `bun kestrel/tools/unicode/characterData.ts [ucd]` | `characters.json`: the symbol tabs and sections laid out in `characterGroups.ts`, from the latest Unicode Character Database or the folder given |

The build runs `annotationData.ts` to turn CLDR's emoji annotations (`cldr-emoji-annotation` on Fedora) into the names and keywords search uses, for the emoji, symbols and kaomoji the picker shows.

After sign-in Kestrel reads these files in the background and builds the picker and its search a few milliseconds at a time, along with Start, quick settings and the notification center, so each opens at once the first time without holding up animations or input.

## On-screen keyboard layouts

The on-screen keyboard reads its layouts from `kestrel/engine/data/osk-layouts`, one JSON file per XKB layout, named `layout.json` or `layout+variant.json`. A layout the folder lacks falls back to its base layout and then to `us`; terminals use the `-extended` files, and fields that ask for digits, numbers, phone numbers, email addresses or URLs use `digits`, `number`, `phone`, `email` and `url`.

The files come from the Android keyboards in Unicode CLDR 43, the last release that published them, and are then edited by hand. `kestrel/engine/data/update-osk-layouts.sh` downloads that release, checks it, converts it with [`cldr2json`](../../kestrel/engine/data/cldr2json/README.md) and rewrites the resource list, which overwrites hand edits, so go through the diff before committing.

Each file is an object with `levels`, plus the `locale` and `name` CLDR gave it. A level is one panel of keys:

| Property | Value |
| --- | --- |
| `level` | Its name: `default`, `shift`, `opt` or `opt+shift` |
| `mode` | `default`, `latched` or `locked`, as CLDR marked it |
| `rows` | An array of rows, each an array of keys |

A key has these properties, all optional:

| Property | Value |
| --- | --- |
| `strings` | The strings it types. The first is its label unless `label` is set; the rest show in the popup that opens when the key is held |
| `label` | The text on the key |
| `iconName` | An icon to show in place of a label |
| `keyval` | A keysym in hexadecimal, pressed as a key instead of typing a string |
| `width` | Its width in keys, in steps of 0.5; 1 when left out |
| `height` | Its height in rows, in steps of 0.5, growing downwards; 1 when left out |
| `leftOffset` | Empty space before it, in keys, in steps of 0.5 |
| `action` | What it does in place of typing, from the list below |
| `level` | The level a `levelSwitch` key shows |

| Action | What the key does |
| --- | --- |
| `hide` | Hides the keyboard |
| `languageMenu` | Opens the list of keyboard layouts |
| `emoji` | Switches to the emoji panel |
| `modifier` | Holds `keyval` as a modifier for the next key, so Ctrl then A sends Ctrl+A |
| `delete` | Deletes backwards |
| `levelSwitch` | Shows the level named in `level` |

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

The login screen follows the schedule too. The session gives `com.lantharos.Greeter1` your light and dark wallpapers with the part of each kept on screen, your style, the schedule with its own hours and, from sunset to sunrise, the place `kestrel-settings` last used (or none, which falls back to the time zone the way `kestrel-settings` does). It also gets whether you have rounded or square corners, and the login screen shows them that way, rounded for anyone who hasn't chosen. `kestrel-greeter-service` keeps them in `/var/lib/kestrel-greeter/users/UID`, storing one picture when both wallpapers are the same file, and its `CurrentStyle` method works out the style for the current time with the same code `kestrel-settings` uses, in `packages/daylight`, along with how long until it next changes. The service runs as root but never opens a picture itself: it hands the file to a copy of itself started with `--encode-wallpaper`, which reads it, then gives up every system call except those for memory, threads and writing its answer, and only then decodes it and writes back the JPEG the login screen shows. The login screen asks before it first shows anyone, so it fades in from Sushi's last frame already in the right style with the wallpaper for it, and asks again when that time comes while it's on screen, and after the computer wakes. The lock screen needs none of this: it shows the desktop's own style and wallpaper, which `kestrel-settings` keeps current.

Once the desktop is up, `kestrel-settings` mounts the data drives inside the computer through UDisks, and does the same for any that appear later, while `mount-internal` in `com.lantharos.kestrel.drives` is on. It mounts ext4, Btrfs, XFS, F2FS, exFAT, FAT32 and NTFS file systems on drives that aren't removable, and leaves out partitions with `UDISKS_IGNORE`, `UDISKS_AUTO=0` or an fstab entry, the GPT attributes for required (bit 0), hidden (62) and no automount (63), EFI, XBOOTLDR, Microsoft reserved and recovery, BIOS boot, LDM, Storage Spaces, swap and the discoverable root, `/usr`, `/var` and `/tmp` types, recovery and OEM labels, and Luft's and Meet Luft's own partitions by label. Locked LUKS and BitLocker volumes stay locked. The first time it meets an ext4, Btrfs, XFS or F2FS file system, it mounts it read-only (ext4 without replaying its journal) and closes it again if it holds another system: `etc/os-release`, `usr/lib/os-release`, `etc/fstab`, an OSTree or boot loader files, at the top or in a Btrfs subvolume. What it found is kept by file system UUID in `~/.local/state/luft/internal-drives`, so later sign-ins mount straight away. NTFS mounts read-only while `com.lantharos.Windows1` reports a hibernated Windows, with a notification the first time. A drive you unmount stays unmounted until it appears again. e2fsprogs marks every ext4 file system `UDISKS_AUTO=0`; `65-kestrel-internal-ext4.rules` takes that back for drives that aren't on USB or a memory card and aren't held by trustd, so an explicit `UDISKS_AUTO=0` from a later rule still counts. `50-kestrel-drives.rules` lets administrators at the computer mount internal file systems without a password; for anyone else, mounting at sign-in never asks and leaves the drives closed.

`kestrel-settings` also keeps old files from piling up, with the age in `old-files-age` of `org.gnome.desktop.privacy`, 30 days unless changed. Every hour it removes items deleted longer ago than that from each trash, while `remove-old-trash-files` is on. A couple of minutes after sign-in, once a day and after any of these settings change, it removes your temporary files that nothing has used for that long, while `remove-old-temp-files` is on, and moves screenshots taken longer ago than that to the trash, while `remove-old-screenshots` in `com.lantharos.kestrel.housekeeping` is on. All three are on in a new account. Screenshots go to the trash rather than away for good, so one can still be brought back until the trash forgets it in turn. Kestrel marks the folder it saves screenshots in, `Pictures/Screenshots` in English, with the extended attribute `user.luft.screenshots`, and the cleanup only looks in folders inside Pictures that carry it, so it finds the folder in any language and leaves every other folder alone. Once a minute it also looks at how much room is left on the system disk and on every other writable drive inside the computer, and warns when one is down to its last 5% and under 1 GB.

Chromium-based browsers and Electron apps lock their profile with the host name, and refuse a profile locked under another name. At sign-in and whenever the host name changes, `kestrel-settings` looks for these locks in `~/.config` and `~/.cache`, in each Flatpak's own config and cache folders under `~/.var/app`, and in Sabine's profiles: a lock still held by its running app is moved to the new name, so launching it again opens a window in that app, and one left behind by an app that's no longer running is removed. NetworkManager never names the computer after the network (`hostname-mode=none`), so the name only changes when you rename it in Settings.

## Session services

| Service | Role |
| --- | --- |
| `kestrel-session` | Started by the login screen; runs `kestrel-session.target` and Kestrel's session manager in place of gnome-session |
| `kestrel-setup.target` | Kestrel in setup mode with the session manager, before the desktop when setup is pending |
| `kestrel-session-manager` | `org.gnome.SessionManager` for apps and the shell: inhibitors, registered apps, logging out, restarting and shutting down after Kestrel asks you (registered apps get a second to answer, then 5 seconds to close), the question the power button opens, idle presence, and `org.freedesktop.ScreenSaver` for players and browsers. Sandboxed apps can't change the session's environment, put the computer to sleep or end the session without asking, and only the app that took an inhibitor or registered can give it up |
| `kestrel-settings` | Settings service started before the shell |
| `kestrel-search` | Indexes the names and text of files in your home folder for Start, at idle priority. It reads text only from regular files, never through links, and can write only to its own cache folder. The text it found is kept in the index, so the words shown around a match come from there and searching never opens your files |
| `kestrel-portal` | `com.lantharos.Kestrel.Portal`, the portal backend for email, printing, accounts, app choosers, launchers, USB devices, wallpapers and lockdown. Its dialogs still open in Kestrel |
| `kestrel-greeter-service` | `com.lantharos.Greeter1` on the system bus, the login screen's settings |
| `kestrel-authenticate` | Checks lock screen passwords and fingerprints through the `kestrel-unlock` PAM rules, and waits for a fingerprint at the login screen |
| `kestrel-watchdog` | Restarts the computer when the GPU is stuck ([details](../boot.md#graphics-driver-stopped-responding)) |
| `kestrel-wallpaper` | Plays live wallpapers |

`com.lantharos.Password1` at `/com/lantharos/Password1` on the system bus changes the caller's own password, for people in an active session at the computer: `ChangePassword(h current, h new)`. Both passwords come through file descriptors, never in the message. It checks the new one against the system's password rules, then runs the `kestrel-password` PAM rules: the current password has to be right, and Luft Keyring is locked with the new one in the same step. It answers `WrongPassword`, `TooWeak` (whose message is `too-short`, `too-similar`, `dictionary-word`, `contains-name`, `too-simple` or `rejected`) or `Failed`. It is `kestrel-greeter-service --passwords` in a unit of its own, `kestrel-password.service`, which D-Bus starts for the call and which quits half a minute later, so the login screen's settings service keeps no way to write `/etc`.

greetd reads `/run/greetd/config.toml`, which `kestrel-greeter-service --write-greetd-config` writes before each start from the image's defaults in `/usr/lib/kestrel-greeter/greetd.toml` and the account that signs in by itself, kept in `/var/lib/kestrel-greeter/initial-session.toml`. Settings turns it on with `SetAutomaticLogin`, and first asks to confirm in a dialog when nothing asks for a password while the computer starts: the disk isn't encrypted, or the TPM unlocks it without a PIN. Nothing in `/etc` holds it, so updates to the defaults always arrive; to change greetd's configuration on one computer, point `greetd.service` at your own file with a drop-in. The `greetd` and `kestrel-unlock` PAM rules are in `/usr/lib/pam.d` for the same reason, and a file of the same name in `/etc/pam.d` takes their place.

`kestrel-session --setup` runs Install Luft alone over the blurred wallpaper first ([Install](../install.md)). The session identifies as `Kestrel;GNOME`, so apps that only recognize GNOME keep their keyring, theme and autostart behavior.

## Extensions

Kestrel runs extensions people install from Schelf, such as Seasons. How they load, what they may use, their D-Bus interface, the crash guard and shaders on windows and the screen are in [Extensions](../extensions.md).

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
| GTK 3 and GTK 4 apps, Firefox, Chromium and Electron apps | Close, since they can't reconnect to a display, and open again |
| X11 apps | Close with Xwayland, which starts again, and open again |

Kestrel notes where every window is in `$XDG_RUNTIME_DIR/kestrel/DISPLAY/windows.json`. Windows of apps that reconnect within a minute of the restart come back on their workspace with their position, size, maximized, fullscreen, minimized and always-on-top state, in their stacking order, and the one that had focus gets it back. With window tiling on, tiled windows are laid out again with the others in their space. Apps whose every process ended with Kestrel are opened again once and their windows put back the same way, as after an update below; apps that are still running are never opened a second time.

## Reopening apps

Every Luft update needs a restart, so Kestrel brings back what was open. It keeps a record in `~/.local/state/kestrel/session.json`, readable only by the account: which apps were open and, for each window, its workspace, display, position and size, whether it was maximized, tiled, fullscreen, minimized or always on top, the stacking order and which window had focus. It holds no titles or contents. Kestrel rewrites it half a second after windows open, close, move or change, so a power cut still leaves a recent one, and when the session ends it notes how:

| The session ended | At the next sign-in |
| --- | --- |
| With a restart to install an update, from Settings or the Restart dialog | The apps open again |
| Without warning, such as a power cut, or with Kestrel crashing for good | The apps open again |
| With an ordinary sign-out, restart or power off | The apps open again only with **Reopen apps when I sign in** on, in Settings → Apps (`reopen-apps` in `com.lantharos.kestrel`, off by default) |

Nothing opens before the session is unlocked. Kestrel then starts each app once through its launcher, a little apart so the desktop can be used at once, and puts its windows back in the order the app opens them: on their workspace, where they were, as they were. Windows of Wayland apps are placed before they first show; those of X11 apps right after. A window whose display is gone opens centered on the main one, and one that no longer fits its display is moved and shrunk until it does. Apps that were removed are left out, apps that open by themselves at sign-in aren't started again, and an app that opens fewer windows, more, or none is left as it is. Half a minute after the last app starts at the latest, the windows are stacked as they were and the one that had focus gets it back, unless you have started using another window by then.

Luft's own apps come back with what their windows showed too. Every window of a Sabine app carries a key of its own as its Wayland toplevel tag, which the record keeps. Kestrel starts such an app with the keys of its windows in `SABINE_RESTORE_WINDOWS` and puts each window back where the window with the same tag was; windows without a tag go back in the order they open. While a window is open, the app keeps what it shows in `~/.local/state/<app id>/windows`, readable only by the account, written a moment after it changes. It holds paths, page names and ids, never passwords, tokens or anything unlocked, and closing the window or quitting the app removes it, so a window you closed never comes back. Something the app was asked to open, such as a file it was started with, goes before what it showed.

| App | Comes back with |
| --- | --- |
| Rover | Its tabs and their folders, Recent or Trash, and the tab you were in |
| Settings | The page and the part of it that was open |
| Schelf | The pages you went through, back to the first; a question about full access isn't asked again |
| Tern | A tab for each one you had, in the folder its shell was in; no command runs again |
| Magpie | The picture, PDF or font you were looking at, or the folder you were browsing; a song or video comes back as its folder, so nothing starts playing |
| Mailman | The mailbox and the conversation you were reading; nothing you were writing comes back |
| Convertible | The files you added, the one you had selected and the formats you chose; edits and conversions that were running don't |
| Keys | The layout, input method or view you had open |
| Barometer | The page you were on |
| Draft, Heft, Flatbed | Already open what you were working on every time they start, unsaved Draft changes included |
