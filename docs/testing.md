# Testing

Every test here runs in isolation: test sessions use their own D-Bus buses, stand-ins for system services and a scratch profile, and the VMs change nothing on the host.

## Kestrel sessions

Build Kestrel first (see [Building Luft](https://docs.luft.computer/developers/building/)). Then from the repository root:

| Command | Runs |
| --- | --- |
| `kestrel/tools/session.sh nested` | A visible nested session in Mutter's development kit window, for trying things by hand |
| `kestrel/tools/session.sh capture` | The full headless check suite, including the login screen, saving screenshots of every surface |
| `kestrel/tools/session.sh greeter` | Only the login screen checks, against a stand-in greetd |
| `kestrel/tools/session.sh setup` | Only the first-run setup checks, in Kestrel's setup mode with Install Luft |
| `kestrel/tools/session.sh scaling` | The default display scale for laptop panels and monitors of different sizes, as virtual monitors |
| `kestrel/tools/session.sh performance` | Startup memory, the longest stall while Kestrel prepares its surfaces after startup, search, notification bursts, actor reuse, memory after a burst of copied pictures, CPU while a tray icon animates, the cost of a window opening under the task view, idle paints, idle wakeups and CPU of Kestrel and its settings service, paints and wakeups while the screen is dimmed, paints and memory while the screen is locked, and the session manager's memory, CPU time and idle wakeups |
| `kestrel/tools/session.sh frames` | Frame times of animations and gestures, see [Frame timing](#frame-timing) |
| `kestrel/tools/session.sh motion` | Every painted frame of animations, see [Motion clips](#motion-clips) |

The checks, the stand-in services and the test clients are TypeScript in `kestrel/tools`. Every mode first bundles them into `kestrel/run/tools`, which is what Kestrel and `gjs` run.

`capture` splits the checks into groups and runs several sessions side by side:

| Option | Effect |
| --- | --- |
| `--only GROUPS` | Only these comma-separated groups. An area such as `apps` runs every group in it |
| `--jobs N` | Up to N sessions at once (default: one per four processors, fewer when the inotify limit is close); `--jobs 1` runs one session at a time |
| `--list` | Lists the groups |

The board groups, `input:dictation`, `input:scrolling`, `panel:battery`, `panel:repaints`, `panel:screenshot`, `tablet:keyboard`, `tablet:longPress`, `windows:serverDecorations` and `windows:x11Frames` also run on two laptop panels at their automatic display scale: a 14-inch 1920×1200 panel at 150%, as the groups ending in `+laptop`, and a 15.6-inch 1080p panel at 125%, as the groups ending in `+laptop15`. Their screenshots go to a `laptop` or `laptop15` folder inside the capture folder.

The `taskbar`, `start`, `panel` and `tiling` groups also run with the taskbar on the left, top and right, as the groups ending in `+left`, `+top` and `+right`, with their screenshots in a `taskbar-left`, `taskbar-top` or `taskbar-right` folder.

Headless sessions run Kestrel through `kestrel-wrapper`, as the real session does, so a Kestrel that crashes starts again. `system:reconnect` relies on it: it opens Rover and Settings, moves Rover to the second workspace, maximizes Settings and locks the screen, then crashes Kestrel. In the Kestrel that takes over, it checks that the screen is still locked, that both apps reconnect without reloading their pages and that their windows come back where they were. Pointing `KESTREL_QT_APP` at a Qt 6 program adds its window to the check.

`tiling:monitors` and `system:dimming` always run with a second 1280×720 display to the right of the first, which the other groups only get from `KESTREL_CAPTURE_SECONDARY_SIZE`. `system:dimming` lets the screen go idle until it dims, saving `dimming-fading` and `dimming-dimmed`, and gives the first display a stand-in backlight to check how a built-in panel dims and comes back.

The `tablet` groups fold the session into a tablet with a virtual tablet mode switch and touchscreen, swipe and tap with a finger, and turn the display through Mutter's display configuration. Their clips of each transition go to `clips` in the capture folder, like those of `motion`.

The nested session copies the host's wallpaper, interface settings, keyboard layout and favorite apps, so it feels like the desktop it runs on. Closing its window ends it. Headless sessions take nothing from the host's settings or home folder: every one starts from the settings of a fresh Luft install, the ones `os/image/files/usr/share/glib-2.0/schemas/20_luft.gschema.override` sets with the wallpapers next to it, in US English with the US keyboard layout and in UTC. A check that needs another setting, such as a second input source, sets it itself. Headless sessions show the Luft apps built in this tree, which the checks also start from their build folders (run `bun run desktop:build` in each app first), plus the stand-in apps in `kestrel/tools/fixtures/apps`, and sign in as Mara Lindqvist on a computer named Mara’s Laptop. Kestrel, the apps and every service in a headless session share a private system bus, where the stand-ins in `kestrel/tools/fixtures/system` serve accounts, networks, Bluetooth devices and the other system services, so nothing reaches the computer's own login screen, startup check or hardware. The nested session talks to the computer's real system bus. Rover lists two stand-in drives from the mount table that `LUFT_MOUNTS` points it at, Schelf finds no system Flatpaks in the empty folder `FLATPAK_SYSTEM_DIR` names, and with `LUFT_SAMPLE_SYSTEM` set Barometer and Settings → System → About show sample hardware and Rover sample drive sizes, so screenshots never show who uses the host or what is installed, running or plugged in on it. The `apps:barometer` check is the exception: it starts Mailman in a scope of its own and points a real Barometer at that scope's slice with `LUFT_APP_SLICE`, so it lists only the app the check started. Theme edits reload live after `meson compile -C kestrel/build`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `KESTREL_SESSION_DIR` | `kestrel/run` | Settings, caches and app data of the test session. Point it at an empty folder for a clean profile or to run sessions side by side |
| `KESTREL_CAPTURE_DIR` | `kestrel/run/screenshots` | Where captures are saved |
| `KESTREL_CAPTURE_SIZE` | `1440x900` | Size of the virtual monitor |
| `KESTREL_CAPTURE_SECONDARY_SIZE` | none | Adds a second virtual monitor, such as `1280x720` |
| `KESTREL_CAPTURE_SCHEME` | dark | `light` or `dark`, to capture every surface in one style |
| `KESTREL_CAPTURE_WALLPAPER` | Luft's default wallpapers | An image used as the wallpaper for both styles, also behind the Luft apps in place of their test gradient, to check the glass on light and dark pictures |
| `KESTREL_CAPTURE_TASKBAR` | bottom | Starts every session with the taskbar on another edge: `left`, `top` or `right` |
| `LUFT_LOCALE` | US English | A language for Kestrel and the apps, also used for their dates, numbers and first day of the week, such as `de` or the pseudo-locale `en-XA`. Most checks look for English text, so pair it with `--only system:translations`, which captures Kestrel's surfaces and every Settings page in any language |
| `KESTREL_BUILD` | `kestrel/build` | Another Kestrel build to run, set up against `KESTREL_COMPOSITOR` |
| `KESTREL_COMPOSITOR` | `kestrel/run/mutter-install` | Another Mutter install to run on, such as one from `kestrel/compositor/build.sh BUILD_DIR PREFIX` |

Optional tools widen the capture: with `rclone` installed Rover connects to local WebDAV and FTP servers, and with `stalwart` 0.15 Mailman signs in to a local mail server and sends from aliases over SMTP and JMAP. Stalwart 0.16 and later lack the in-memory directory these checks configure. Pointing `KESTREL_HELIUM` at a Helium AppImage or binary adds a web page in Helium to `input:scrolling`, a web page's text field in Helium on Wayland and on Xwayland to `tablet:keyboard`, which the on-screen keyboard has to open for and type into, and to `windows:handoff` a link clicked in Mailman that has to bring Helium to the front. With `squashfuse_ll` on the `PATH`, `apps:appimages` installs a Sabine AppImage that declares it stays offline and may only read your home folder, and checks that its sandbox holds it to that; with `KESTREL_ELECTRON` and Zypak in `/usr/lib/zypak`, as on Luft, it checks that an Electron app's renderer runs in a sandbox of its own, with its system call filter, nested in the AppImage sandbox. Pointing `KESTREL_APPIMAGES` at a folder of AppImages makes `apps:appimages` install each through Schelf, start it twice in its sandbox and check that Kestrel knows its Wayland windows by the app ID Schelf gave it and that it keeps its files in its own folder, then show them in Settings → Apps; AppImages in a `devices` folder inside it have to look for a USB or serial device and get offered more access. It needs `squashfuse_ll` on the `PATH`. `apps:schelfTrust` captures Schelf's confirmation for full access to a Flatpak and, with `KESTREL_ELECTRON`, to an AppImage, what a Sabine AppImage declares and the confirmation for one that asks to run unsandboxed, for adding a package's software source and for installing a package file nobody signed. Pointing `KESTREL_ELECTRON` at an `electron` binary from Electron's releases adds a web page in Electron to `input:scrolling`, once as it starts and once with the touchpad feature Schelf enables, the same text field in Electron on Wayland and on Xwayland to `tablet:keyboard`, and frameless Electron windows on Wayland and on Xwayland to `windows:shadows`. Pointing `KESTREL_FLATPAK_HOME` at a home folder with Flathub's Chromium or Obsidian installed for the user (`HOME=folder flatpak --user install flathub org.chromium.Chromium md.obsidian.Obsidian`) adds a page in Chromium and a note in Obsidian to `input:scrolling`, after `schelf --integrate-apps` sets them up. `input:dictation` checks the Copilot key and the Super+Alt dictation shortcut with the dictation service from `services/speech` (build it with `cargo build --release` first), and the dictation pill, the privacy indicator and an app that keeps scrolling, clicking and typing normally while either shortcut is held with a stand-in service that pretends to hear a sentence; pointing `KESTREL_DICTATION` at a folder with a `models` folder of downloaded speech models, a 16 kHz mono `speech.wav` and what it says in `speech.txt` also dictates into a GTK and an X11 text field, as if the recording came from the microphone, holding and pressing each shortcut and letting it stop by itself after the recording.

### Frame timing

`frames` first opens Start, Gust, quick settings, the notification center, the overview, the emoji picker and the lock screen's prompt once each, as they first open after signing in. Then it opens each of them again, types a search into Start and into Gust, opens, closes and drags windows, slides windows under stacked glass and under a blurred app window, enters, pans, pinches, zooms and leaves a board, turns window tiling on, swaps tiled windows and opens one among them, steps through, swipes and zooms out of a scrolling strip, and locks and unlocks the screen. Each of these runs three times for timing and twice more to time the GPU. For every interaction it prints the time until the first frame, the frames drawn, missed refreshes, frames slower than a refresh, CPU time per frame on the compositor thread and on the slowest frame, update time, layout time and GPU time after each frame, and saves them as `frames-WIDTHxHEIGHT@SCALE.json` in the capture folder.

| Variable | Purpose |
| --- | --- |
| `KESTREL_FRAMES_BASELINE` | A saved report to compare against; each value prints as before → after |
| `KESTREL_FRAMES_ONLY` | Comma-separated words; only interactions whose name contains one run |

`KESTREL_CAPTURE_SIZE=1920x1200:302x189mm` measures a 14-inch laptop panel at its own scale. To compare two builds, point `KESTREL_BUILD` and `KESTREL_COMPOSITOR` at each in turn, ideally while nothing else loads the machine.

### Motion clips

`motion` records every frame Kestrel paints while surfaces open, close and change their mind half-way, windows minimise and restore, and workspaces switch, back to back and with reduced motion. Each clip goes to its own folder in `clips` inside the capture folder, with the frames as pictures and `frames.json` listing when each was painted and how far along the change it looks. `KESTREL_MOTION_ONLY` picks groups of clips: `surfaces`, `windows`, `board`, `gestures`, `reduced` and `snap`.

`kestrel/tools/motion/sheets.py CLIPS` turns each clip into a contact sheet and a video at real speed, with ImageMagick and FFmpeg.

Polkit, real network credentials, unlocking with the computer's own sign-in rules, physical displays and suspend still need a real login session.

## Apps and packages

From an app's folder, `bun run check` type-checks its interface. The interface calls the app's Rust side through `src/lib/bindings.ts`, which Sabine writes from the commands and events the app registers: `sabine bindings` rewrites it after a change on the Rust side, and `sabine dev` does so on its own. Shared page code gets its bindings from the crate behind it the same way: `luft-network` writes `packages/web/network/bridge/bindings.ts`, and `luft-app` and `luft-fingerprint` write theirs to `packages/web/ui/src/bindings`. Each of those crates names its file under `[package.metadata.bindings]` in its `Cargo.toml` and rewrites it from the repository's root with its `bindings` example, such as `SABINE_BINDINGS=$PWD/packages/web/network/bridge/bindings.ts cargo run -p luft-network --example bindings`. Their types also land in the bindings of every app that uses them, so run `sabine bindings` in those apps too. In `kestrel/ui` it also runs the unit tests, such as those of the quick answers and conversions in Start's search. In `kestrel/tools` it type-checks the checks and stand-ins against the shell's own types, so renaming something in `kestrel/ui` that a check uses fails there. The Rust side builds with `bun run desktop:build`. Every Rust crate in the repository belongs to one Cargo workspace at its root, with one `Cargo.lock` and the versions of shared dependencies in its `Cargo.toml`; `cargo clippy --all-targets` and `cargo test` there check them all, and `-p NAME` picks one. Programs land in the root `target` folder.

On every push and pull request, `.github/workflows/checks.yml` runs Clippy and the tests of only the crates a change can reach, through their own files, the crates they depend on, the shared dependency entries they use or the locked packages they build with, and `bun run check` for the interface packages it touches. The test job for the apps also fails when the bindings of an app or a shared package no longer match their Rust side. Clippy and the tests run side by side, each split between the crates built on Sabine and the rest, and each of those jobs keeps a build cache of its own. The Rust checks run in `ghcr.io/lantharos/luft-ci`, a Fedora image with the build dependencies and Rust toolchains made from `.github/ci`, rebuilt every week and whenever that folder changes. When a service's unit file changes, `bun .github/scripts/units/index.ts` checks that its sandbox didn't get weaker; see [Service sandboxing](security.md#service-sandboxing).

## NVIDIA graphics

Install Luft and Settings find NVIDIA graphics by reading `/sys/bus/pci/devices`. Pointing `LUFT_PCI_DEVICES` at another folder laid out the same way, each device a folder with `class`, `vendor` and `device` files, makes them read that instead, to try NVIDIA's offers on a computer or VM without an NVIDIA card:

```sh
mkdir -p ~/pci/0000:01:00.0 ~/.config/environment.d
printf '0x030200\n' >~/pci/0000:01:00.0/class
printf '0x10de\n' >~/pci/0000:01:00.0/vendor
printf '0x28e0\n' >~/pci/0000:01:00.0/device
printf 'LUFT_PCI_DEVICES=%s\n' ~/pci >~/.config/environment.d/90-pci.conf
```

After signing in again, the session sees an NVIDIA card; removing the file brings back the real devices.

## Installer

`apps/setup/installer/vm/run.sh` installs Luft for real with `bootc install to-filesystem` inside a QEMU VM with spare drives, checks the result and starts the installed drive with UEFI. See [Install Luft](../apps/setup/README.md#testing).

## Luft Keyring and Passkeys

See [Luft Keyring](../kestrel/keyring/README.md#testing) and [Luft Passkeys](../kestrel/passkeys/README.md#development).

## VMs

Everything that needs a real computer runs in QEMU VMs from `os/vm`, without `sudo` and without touching the host's drives. They start the same on Fedora and on CI's Ubuntu runners, since the firmware comes from QEMU's firmware descriptors.

| Command | Does |
| --- | --- |
| `os/vm/disk.sh [IMAGE]` | Installs a sealed image (default `localhost/luft:45`) onto `os/vm/state/disk.qcow2` with the image's own installer, in a helper VM started from the image itself. The account `luft` gets the password in `VM_PASSWORD` (default `luft-vm`), which is also root's on the serial console and the code that adds Luft's key on shim's blue screen |
| `os/vm/qemu.sh` | Starts a VM; `--help` lists the options, such as `SECURE_BOOT=1`, `TPM=0`, `ISO=`, extra drives, `HEADLESS=1` and `TIMEOUT=` |
| `os/vm/control.py` | Screenshots, keys, clicks and root commands over the serial console of a running VM, and `enroll` on shim's blue screen |
| `os/vm/check.py session` | Starts the installed VM with Secure Boot, adds Luft's key, waits for the login screen, signs in, checks that Kestrel and its settings service stay up and the graphics watchdog saw no problem, and opens Settings |
| `os/vm/check.py rollback` | Updates the installed VM to a new version and checks that it's marked good once the login screen is up, then to a version whose login screen never starts, and checks that after three tries the computer goes back to the version before |

`LUFT_VM` picks another folder than `os/vm/state`, so VMs can live side by side. `check.py` writes its screenshots, the serial console, the journal and `bootc status` to `check` in that folder, and keeps them when a step fails or times out. Every step has a time limit.

`os/vm/check.sh` holds what the checks of single services share: a check image with the check's files on top of the system, started directly from a drive with the image's kernel, or installed with `disk.sh`. The [installer](#installer), [Luft Keyring and Passkeys](#luft-keyring-and-passkeys), [sleep](../services/sleep/README.md), [Windows](../services/windows/README.md) and [Disks](../apps/disks/README.md) checks use it.

SushiBoot and Sushi are tried on the installed image too. `qemu.sh` options that matter for startup:

| Variable | Effect |
| --- | --- |
| `TPM=0` / `TPM=1.2` | No TPM, or an old one, instead of a TPM 2.0 kept next to the disk |
| `XRES=3440 YRES=1440` | Monitor resolution (default 1920×1080) |
| `GPU=vga` | QEMU's standard VGA instead of virtio |
| `FRAMEBUFFER=1024x768` | Hands SushiBoot a smaller framebuffer, as some firmware does |
| `EDID=1` | Describes the monitor to SushiBoot |

`FRAMEBUFFER` and `EDID` start a small loader from `os/vm/display` before shim, so they need Secure Boot off. Recording boots frame by frame:

```sh
os/vm/record.py /tmp/frames --seconds 40 --type "16:luft-vm"   # type at 16 s
os/vm/frames.py /tmp/frames                                     # when the screen went black, froze or changed mode
os/vm/control.py shell 'journalctl -b -1 -u sushi'              # the previous start's journal
```

## D-Bus interfaces

Every D-Bus interface has one source of truth: the XML its Fedora package ships (or its source package, or Mutter at the revision Kestrel builds), the introspection of a Luft service written in Rust, or the XML a Kestrel service exports. `bun .github/scripts/dbus/index.ts` compares everything else that describes an interface against it: the interface files in `data` folders must match it member for member, while Kestrel's copies in `kestrel/engine/data/dbus-interfaces`, the XML in clients, Rust proxies and the stand-ins in `kestrel/tools/fixtures` may only use members that exist, with the same signatures and property access. Bus policies may only name interfaces and methods that exist. It downloads the reference XML into `target/dbus-references` with `dnf`, and refreshes it weekly.

Put `#[introspect]` from `luft-dbus-macros` above every zbus `#[interface]` and `#[proxy]`. `cargo test` then checks that `packages/dbus/introspection` holds what zbus exports or what the proxy calls; after changing one, run `LUFT_DBUS_UPDATE=1 cargo test -p NAME introspection` and commit the result.

## CI

Every pull request and push to `main`, and a run of the Checks workflow started by hand on a branch, runs, besides the Rust and TypeScript checks above, the Kestrel job when a change can reach Kestrel: its own folders, a crate or interface package it uses, or the build container. In `ghcr.io/lantharos/luft-ci-kestrel`, a Fedora container started with systemd so sessions get a user instance, it checks that Mutter's patch series applies (`patches.py check`), builds Mutter and the engine, and runs the headless session groups `system:session`, `start:search`, `lockScreen:lock`, `lockScreen:unlock`, `panel:surfaces` and `system:watchdog`: the session starts, Start opens and searches, the panel's surfaces open, the lock screen locks and unlocks, and the watchdog's checks pass. Mutter is kept between runs for each patch series and container, and the compilers keep their caches. A failure uploads the session logs and screenshots. `.github/scripts/kestrel/container.sh run COMMAND` runs a command in the same container on any computer with Podman, such as `kestrel/tools/session.sh capture --only lockScreen`.

A change to anything that describes a D-Bus interface, from interface files and policies to Rust interfaces, proxies and stand-ins, runs the D-Bus interface check in a Fedora container, which keeps the downloaded reference XML for a week.

Before the nightly tag moves, the Image workflow installs the new image in a VM on the runner with `os/vm/disk.sh` and runs `os/vm/check.py session` on it, with a password made up for that run, which also opens Settings in the new session. The tag only moves when it passes; otherwise the screenshots and logs are kept with the run.
