---
title: Testing
description: Kestrel's test sessions, what they isolate, and the variables and tools that widen them.
sidebar:
  order: 3
---

Kestrel and the apps are tested in sessions that change nothing on the computer. Build Kestrel first, as [Building Luft](/developers/building/) describes, then run `kestrel/tools/session.sh` from the repository's root. Apps, services and everything that needs a real computer are covered in [Testing apps, services and VMs](/developers/testing-vms/).

## Session modes

| Command | Runs |
| --- | --- |
| `session.sh nested` | A nested session in a window, for trying things by hand |
| `session.sh capture` | Every headless check, saving a screenshot of every surface |
| `session.sh greeter` | The login screen checks, against a stand-in greetd |
| `session.sh setup` | The first-run setup checks, in Kestrel's setup mode with Install Luft |
| `session.sh scaling` | The default display scale for panels and monitors of different sizes |
| `session.sh performance` | Startup memory, stalls, idle paints, wakeups and CPU of Kestrel and its services |
| `session.sh frames` | Frame times of animations and gestures |
| `session.sh motion` | Every painted frame of animations, as clips |

The checks, stand-in services and test clients are TypeScript in `kestrel/tools`. Each run bundles them, and the extensions, into a folder of its own under `kestrel/run/builds`, so a session that's still running keeps the build it started with.

`capture` splits the checks into groups and runs several sessions side by side:

| Option | Effect |
| --- | --- |
| `--only GROUPS` | Only these comma-separated groups. An area such as `apps` runs every group in it, `apps:mailman` one |
| `--jobs N` | Up to N sessions at once, by default one per four processors; `--jobs 1` runs every group in one session |
| `--list` | Lists the groups |

Some groups also run on two laptop panels at their automatic scale, or with the taskbar on another edge, as the groups ending in `+laptop`, `+laptop15`, `+left`, `+top` and `+right`, with their screenshots in folders of their own.

## What a headless session is

A headless session takes nothing from the computer's settings or home folder. Each starts from the settings of a fresh Luft install, in US English with the US keyboard layout and in UTC, signed in as Mara Lindqvist on Mara's Laptop, and a check that needs another setting sets it itself. Kestrel, the apps and every service in it share a private system bus, where stand-ins from `kestrel/tools/fixtures` serve accounts, networks, Bluetooth, logind, the updater and the other system services, so nothing reaches the computer's own login screen, startup check or hardware. File pickers go through the real portal frontend to a stand-in, and the document portal is the real one, mounted in the session's runtime folder, so sandboxed apps get files the way they do on Luft. With `LUFT_SAMPLE_SYSTEM` set, screenshots show sample hardware and drives instead of the host's.

The nested session is different: it copies the host's wallpaper, settings, keyboard layout and favourite apps, and talks to the computer's real system bus.

Headless sessions run the Luft apps built in this tree, which have to be built first with `bun run desktop:build` in each app's folder; a check stops with the command to run when an app's build is older than its sources. They run Kestrel through `kestrel-wrapper`, as the real session does, so a crash restarts it and the checks see it reconnect.

Point `KESTREL_SESSION_DIR` and `KESTREL_CAPTURE_DIR` at empty scratch folders, start each run with a fresh session folder, since state left from an earlier run can fail checks, and never type a real password into a prompt that appears during a test.

## Variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `KESTREL_SESSION_DIR` | `kestrel/run/session` | Settings, caches and app data of the session |
| `KESTREL_CAPTURE_DIR` | `kestrel/run/screenshots` | Where captures go |
| `KESTREL_CAPTURE_SIZE` | `1440x900` | The virtual monitor, optionally with a physical size that sets its scale, such as `3840x2400:443x277mm` for 200% |
| `KESTREL_CAPTURE_SECONDARY_SIZE` | none | A second virtual monitor, such as `1280x720` |
| `KESTREL_CAPTURE_SCHEME` | `dark` | `light` or `dark` |
| `KESTREL_CAPTURE_WALLPAPER` | Luft's wallpapers | One picture for both styles, to check the glass on light and dark pictures |
| `KESTREL_CAPTURE_TASKBAR` | bottom | `left`, `top` or `right` |
| `KESTREL_EXTENSIONS` | none | Extensions from the session's build folder to install on top of Seasons, such as `com.lantharos.Phosphor` |
| `KESTREL_SANDBOXED_EXTENSIONS` | off | `1` installs Luft's own extensions in the account's own folder, so they run [sandboxed](/extensions/how-extensions-run/#the-sandbox) |
| `LUFT_LOCALE` | US English | A language for Kestrel and the apps, such as `de` or the pseudo-locale `en-XA`. Most checks look for English text, so pair it with `--only system:translations` |
| `KESTREL_BUILD` | `kestrel/build` | Another Kestrel build to run |
| `KESTREL_COMPOSITOR` | `kestrel/run/mutter-install` | Another Mutter install to run on |

A development build of Kestrel also reads `KESTREL_STORE_EXTENSIONS`, `KESTREL_SANDBOXED_STORE_EXTENSIONS`, `KESTREL_UNREVIEWED_EXTENSIONS` and `KESTREL_DEVELOPMENT_EXTENSIONS`, folders that stand in for the folders [extensions run from](/extensions/how-extensions-run/#where-an-extension-runs) without belonging to root. Headless sessions set all four. The installed Kestrel ignores them.

## Optional tools

The capture covers more when these are there:

| With | Adds |
| --- | --- |
| `rclone` | Rover and Settings sign in to local WebDAV and FTP servers |
| `stalwart` 0.15 | Mailman signs in to a local mail server and sends over SMTP and JMAP. Later versions lack the in-memory directory the checks configure |
| `squashfuse_ll` and `mksquashfs` | Sabine AppImages installed in their sandbox, with files handed to them through the portals |
| `KESTREL_APPIMAGES` | Each AppImage in that folder installed through Schelf and started in its sandbox |
| `KESTREL_ELECTRON` | An `electron` binary, for scrolling, the on-screen keyboard, frameless windows and Electron's own sandbox inside the AppImage sandbox |
| `KESTREL_HELIUM` | A Helium AppImage or binary, for scrolling, the on-screen keyboard, links handed over from other apps and files dropped into a page |
| `KESTREL_FLATPAK_HOME` | A home folder with Flathub's Chromium or Obsidian installed for the user, for scrolling |
| `KESTREL_DICTATION` | A folder with downloaded speech `models`, a 16 kHz mono `speech.wav` and its words in `speech.txt`, to dictate into real text fields |
| `KESTREL_QT_APP` | A Qt 6 program whose window has to come back after Kestrel crashes |
| `xrdb` | The cursor Xwayland apps get |
| `unshare`, `nsenter`, `ip` and user namespaces | Post, in a network of the session's own |

Some checks need more of the tree built, such as Heft and Settings for the tablet and Phosphor groups, or `services/speech` for dictation, and say so when it's missing.

## Store pictures

The pictures in each app's and extension's `store` folder are captures from these groups, taken over Fog, Luft's default wallpaper, so they show its gold accent:

```sh
KESTREL_CAPTURE_WALLPAPER=os/image/files/usr/share/backgrounds/luft/Fog.jpg kestrel/tools/session.sh capture --only apps:convertible,apps:flatbed,apps:settings
KESTREL_CAPTURE_WALLPAPER=os/image/files/usr/share/backgrounds/luft/Fog.jpg KESTREL_CAPTURE_SIZE=2880x1800:332x208mm kestrel/tools/session.sh capture --only apps:heft
```

| Pictures | Captures |
| --- | --- |
| Convertible | `convertible-format-light` and `-dark` |
| Flatbed | `flatbed-scans-light` and `-dark`, scanning a contract from a stand-in scanner |
| Heft | `heft-split-light` and `-dark`, a textbook beside handwritten notes, at 200% |
| Keystrokes, Soundscapes, Strays and Tailor settings | `settings-extension-<name>`, with Tailor dressing stand-ins for Spotify, Steam and Vesktop |
| Phosphor settings | `store-settings` from `desktop:phosphorStore` |

Each is turned into the store's WebP with `cwebp -q 80`, keeping the file's name.

## Frame timing

`frames` opens Start, Gust, quick settings, the notification center, the overview, the emoji picker and the lock screen's prompt once, as they first open after signing in, and then again. It types into Start and Gust, moves, opens and closes windows under glass, enters and zooms a board, tiles windows, steps through a scrolling strip, locks and unlocks, and turns on Phosphor's main effects. Each interaction runs three times for timing and twice more to time the GPU. For each it prints the time to the first frame, missed refreshes, slow frames, CPU, update, layout and GPU time a frame, and saves them as `frames-WIDTHxHEIGHT@SCALE.json` in the capture folder.

| Variable | Purpose |
| --- | --- |
| `KESTREL_FRAMES_BASELINE` | A saved report to compare against; each value prints as before → after |
| `KESTREL_FRAMES_ONLY` | Comma-separated words; only interactions whose name contains one run |

`KESTREL_CAPTURE_SIZE=1920x1200:302x189mm` measures a 14-inch laptop panel at its own scale. To compare two builds, point `KESTREL_BUILD` and `KESTREL_COMPOSITOR` at each in turn while nothing else loads the computer.

## Motion clips

`motion` records every frame Kestrel paints while surfaces open, close and change their mind half-way, windows minimise and restore, and workspaces switch, also with reduced motion. Each clip goes to its own folder in `clips` in the capture folder, with the frames as pictures and `frames.json` saying when each was painted and how far along it looks. `KESTREL_MOTION_ONLY` picks groups: `surfaces`, `windows`, `board`, `gestures`, `reduced` and `snap`. `kestrel/tools/motion/sheets.py CLIPS` turns each clip into a contact sheet and a video at real speed, with ImageMagick and FFmpeg.

## What needs a real session

Polkit's password prompts, real network credentials, unlocking with the computer's own sign-in rules, physical displays and their scanout, the hardware cursor, a physical power button, the real clock and suspend aren't in a headless session. Kestrel's own units, which keep variables such as `LD_PRELOAD` out of it, only run in a real one, and headless sessions can't record the screen, since they run PipeWire without a session manager. Check these on an installed Luft, with a build [laid over it](/developers/building/#on-an-installed-luft), or in a [VM](/developers/testing-vms/#virtual-machines).
