---
title: Testing apps, services and VMs
description: Type checks, the Rust workspace, D-Bus interface checks, virtual machines and what CI runs.
sidebar:
  order: 3.5
---

Kestrel's own [test sessions](/developers/testing/) cover the desktop. Everything else is checked with the tools of its language, and anything that needs a real computer runs in a virtual machine.

## Apps and packages

From an app's folder, `bun run check` type-checks its interface. In `kestrel/ui` it also runs the unit tests, and in `kestrel/tools` it checks the checks and stand-ins against the shell's own types, so renaming something a check uses fails there.

An app's interface calls its Rust side through `src/lib/bindings.ts`, which Sabine writes from the commands and events the app registers. `sabine bindings` rewrites it after a change on the Rust side, and `sabine dev` does so by itself. Shared crates with page code of their own, such as `luft-network`, `luft-app` and `luft-fingerprint`, name their bindings file under `[package.metadata.bindings]` in their `Cargo.toml` and rewrite it with their `bindings` example:

```sh
SABINE_BINDINGS=$PWD/packages/web/network/bridge/bindings.ts cargo run -p luft-network --example bindings
```

Their types also land in the bindings of every app that uses them, so run `sabine bindings` in those apps too.

Every Rust crate belongs to one Cargo workspace at the repository's root, with one `Cargo.lock` and the versions of shared dependencies in its `Cargo.toml`. `cargo clippy --all-targets` and `cargo test --no-fail-fast` there check them all, and `-p NAME` picks one. Some tests only pass as root, as CI runs them, so a few failures on your own account can be expected.

Services test their own logic with `cargo test`, often against a stand-in server, such as `services/accounts` with token exchange and conflict names. Their path through the desktop is a headless group, such as `apps:cloud` for cloud drives against a local `rclone serve webdav` or `system:crashReports` against a stand-in for the crash inbox, and a headless session runs a private CUPS with two printers for the printing pages.

## D-Bus interfaces

Every D-Bus interface has one source of truth: the XML its Fedora package ships, the introspection of a Luft service written in Rust, or the XML a Kestrel service exports. `bun .github/scripts/dbus/index.ts` compares everything else against it. Interface files in `data` folders must match it member for member; Kestrel's copies, client XML, Rust proxies and the stand-ins in `kestrel/tools/fixtures` may only use members that exist, with the same signatures and property access; bus policies may only name interfaces and methods that exist. It downloads the reference XML with `dnf` into `target/dbus-references` and refreshes it weekly.

The introspection of Luft's own services comes from `#[introspect]`, as [Contributing](/developers/contributing/#d-bus-interfaces) describes.

## NVIDIA graphics

Install Luft and Settings find NVIDIA graphics by reading `/sys/bus/pci/devices`. `LUFT_PCI_DEVICES` points them at another folder laid out the same way, to try NVIDIA's offers on a computer or VM without the card:

```sh
mkdir -p ~/pci/0000:01:00.0 ~/.config/environment.d
printf '0x030200\n' >~/pci/0000:01:00.0/class
printf '0x10de\n' >~/pci/0000:01:00.0/vendor
printf '0x28e0\n' >~/pci/0000:01:00.0/device
printf 'LUFT_PCI_DEVICES=%s\n' ~/pci >~/.config/environment.d/90-pci.conf
```

After signing in again, the session sees an NVIDIA card. Removing the file brings back the real devices.

## Virtual machines

Disks, startup, installing and system services are tested in QEMU VMs from `os/vm`, without `sudo` and without touching the host's drives. Never test them with loop devices or mounts on your own computer. The VMs start the same on Fedora and on CI's Ubuntu runners, since the firmware comes from QEMU's firmware descriptors.

| Command | Does |
| --- | --- |
| `os/vm/disk.sh [IMAGE]` | Installs a sealed image, by default `localhost/luft:45`, onto `os/vm/state/disk.qcow2` with the image's own installer. The account `luft` gets the password in `VM_PASSWORD`, `luft-vm` without it, which is also root's on the serial console and the code for adding Luft's key on shim's blue screen |
| `os/vm/qemu.sh` | Starts a VM; `--help` lists options such as `SECURE_BOOT=1`, `TPM=0`, `ISO=`, extra drives and `HEADLESS=1` |
| `os/vm/control.py` | Screenshots, keys, clicks and root commands over the serial console of a running VM, and `enroll` on shim's blue screen |
| `os/vm/check.py session` | Starts the installed VM with Secure Boot, adds Luft's key, signs in, checks that Kestrel and its services stay up, and opens Settings |
| `os/vm/check.py rollback` | Updates the VM to a new version and checks it's marked good, then to one whose login screen never starts, and checks that after three tries it goes back |

`LUFT_VM` picks another folder than `os/vm/state`, so VMs can live side by side. `check.py` keeps its screenshots, the serial console, the journal and `bootc status` in `check` inside it when a step fails or times out.

Checks of single parts, such as the installer, Luft Keyring, the system packages service, crash reports, printing, sleep, Windows and Disks, live in a `vm` folder next to their code and share `os/vm/check.sh`: a check image with the check's files on top of the system, started directly with the image's kernel or installed with `disk.sh`. A drive started that way has SELinux off, since its files carry no labels; `relabel_root_drive` labels it once, after which `SELINUX="selinux=1 enforcing=1"` starts it enforcing, so a check fails on anything SELinux denies.

Luft opens no text console unless Developer tools is on, so no check waits for a `login:` prompt. A service in the check image writes each result to the serial console instead, and `disk.sh` opens root's console on the drives it makes. The installer check installs its own check image, so each drive it installs says on the serial console that it started through SushiBoot and that setup stayed on screen.

For startup, `qemu.sh` also takes:

| Variable | Effect |
| --- | --- |
| `TPM=0` / `TPM=1.2` | No TPM, or an old one, instead of a TPM 2.0 kept next to the disk |
| `XRES=3440 YRES=1440` | The monitor's resolution, 1920×1080 without it |
| `GPU=vga` | QEMU's standard VGA instead of virtio |
| `FRAMEBUFFER=1024x768` | Hands SushiBoot a smaller framebuffer, as some firmware does |
| `EDID=1` | Describes the monitor to SushiBoot |

`FRAMEBUFFER` and `EDID` start a small unsigned loader before shim, so they need Secure Boot off. To see a start frame by frame:

```sh
os/vm/record.py frames --seconds 40 --type "16:luft-vm"   # types the password at 16 s
os/vm/frames.py frames                                     # when the screen went black, froze or changed mode
os/vm/control.py shell 'journalctl -b -1 -u sushi'         # the previous start's journal
```

On an installed Luft, the boot splash's update screen can be previewed with Plymouth's commands, which Sushi answers:

```sh
sudo plymouth change-mode --updates
sudo plymouth system-update --progress=40
sudo plymouth display-message --text="Upgrading firefox"
```

## CI

On every push and pull request, `.github/workflows/checks.yml` runs only what a change can reach: Clippy and the tests of the crates it touches, through their own files, their dependencies or the locked packages they build with, and `bun run check` for the interface packages. It fails when an app's bindings no longer match its Rust side, and runs the D-Bus and units consistency scripts when what they read changes. The `/etc` and image component scripts run on every push, and the extension permissions are compared with the store's when the extension API's types change.

When a change can reach Kestrel, a job in a Fedora container started with systemd checks that the Mutter patch series applies, builds Mutter and the engine, and runs a set of headless groups: the session starts, Start opens and searches, the panel's surfaces open and move, the lock screen locks and unlocks, the watchdog's checks pass, and what keeps extensions and apps in their place holds: the extension sandbox, the background clipboard, global shortcuts, network access, the taskbar and keyring prompts. A failure uploads the session's logs and screenshots. To run something in the same container on your own computer:

```sh
.github/scripts/kestrel/container.sh run kestrel/tools/session.sh capture --only lockScreen
```

Before the nightly tag moves, the Image workflow installs each new image, the standard and the NVIDIA one, in a VM with `os/vm/disk.sh` and runs `os/vm/check.py session` on it. The tag only moves when that passes.
