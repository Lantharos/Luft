---
title: Building Luft
description: Build Kestrel and the apps, run test sessions, try your build on an installed Luft, and build the image and the USB stick.
sidebar:
  order: 2
---

Day-to-day work happens in test sessions that change nothing on the computer, on Fedora 45 or in a Fedora 45 [toolbox](https://containertoolbx.org) on Luft.

## What you need

Install [Bun](https://bun.sh), Rust and the [Sabine](https://github.com/Lantharos/Sabine) CLI, then the build dependencies:

```sh
sudo dnf builddep mutter
sudo dnf install $(cat os/image/packages/build.txt) greetd gstreamer1-plugin-gtk4
```

## Kestrel

Build Kestrel into `kestrel/build` and try it in a window:

```sh
bun install
kestrel/compositor/build.sh
meson setup kestrel/build kestrel/engine -Dpkg_config_path="$PWD/kestrel/run/mutter-install/lib/pkgconfig" --prefix="$PWD/kestrel/install"
meson compile -C kestrel/build
kestrel/tools/session.sh nested
```

After pulling, `meson compile -C kestrel/build` is enough. The nested session copies your wallpaper, settings, keyboard layout and favourite apps, and closing its window ends it.

## Apps

Each app runs from its own folder:

```sh
cd apps/rover
bun run desktop:dev      # the interface with hot reload, in its native window
bun run check            # type checks
bun run desktop:build    # a release build
```

## Test sessions

`kestrel/tools/session.sh capture` runs every check headless, in isolated sessions with their own D-Bus buses and stand-ins for system services, and saves a screenshot of every surface. Other modes measure frame times, record animations frame by frame, and check the login screen and first-run setup. [Testing](/reference/testing/) covers every mode and option.

Test sessions still reach the real system bus for a few services. Point `KESTREL_SESSION_DIR` and `KESTREL_CAPTURE_DIR` at scratch folders, and never type a real password into a prompt that appears during a test.

## On an installed Luft

Luft's system is a signed, read-only image, so a build of your own goes over it as a [system extension](https://www.freedesktop.org/software/systemd/man/latest/systemd-sysext.html) instead of into it. `os/dev/layer.sh` builds Luft's parts from your working tree exactly as the image build does, in the same Podman builder, on the same Fedora base as the installed image, and lays them over `/usr`:

```sh
os/dev/layer.sh apply                    # Kestrel
os/dev/layer.sh apply kestrel app-rover  # Kestrel and Rover
os/dev/layer.sh status                   # what's laid over, from which commit
os/dev/layer.sh reset                    # back to the signed image
```

| Part | Holds |
| --- | --- |
| `kestrel` | Kestrel, its settings service, search, the login screen's service, Luft Keyring, Luft Passkeys and the watchdog |
| `boot` | trustd, USB protection and Sushi's shutdown screen |
| `services` | The installer, updater, sleep, accounts, speech and Windows services |
| `app-NAME` | The app in `apps/NAME` |

Run it on Luft itself rather than in a toolbox, from a clone of this repository; Luft already has the Git and Podman it needs. The first `apply` downloads the base and sets up the builder, which takes a while and around 8 GB of space; later ones only rebuild what changed. It asks for your password to lay the build over `/usr`. `apply` refreshes the settings schemas, icon, font, MIME and app caches over the combined system, labels everything for SELinux with the installed policy, restarts the system services the build replaces, and reloads D-Bus. Log out and back in to run a new Kestrel or a new session service.

The build stays across restarts. When Luft updates, the next start takes it off and says so, since a build made for the previous version would hide the update's own files; run `apply` again to put your build back on the new version. It goes over [system packages](/system/software/#system-packages) the same way, and both stay merged.

Some things only change with a new image: SELinux policy, Fedora packages and libraries the build needs that the image doesn't have, files in `/etc` such as gpg-agent's configuration, and whatever runs before the disk is unlocked, such as Sushi in the startup image and SushiBoot. `apply` refuses builds that need libraries or typelibs the installed image lacks, and names the files in `/etc` that differ.

## The image

The image is built with Podman, without root:

```sh
os/image/build.sh                    # localhost/luft:45
os/image/build.sh luft-nvidia        # localhost/luft:45-nvidia
os/iso/build.sh                      # the USB stick, in os/iso/state
```

The first build downloads Fedora packages, Mutter's source and the web runtime, and takes about an hour. Later builds only remake the parts whose sources changed. Without signing keys, builds make throwaway ones.

## Virtual machines

Disk, boot and install changes are tested in VMs, never on the host's drives:

```sh
os/vm/disk.sh                        # install the image onto a virtual disk
SECURE_BOOT=1 os/vm/run.sh           # start it with Secure Boot and a TPM
ISO=os/iso/state/luft-VERSION.iso os/vm/run.sh    # start the stick instead
apps/setup/installer/vm/run.sh       # real installs next to a Windows-like drive
```

[Testing on real hardware](/reference/hardware-testing/) lists what to try when Luft goes on a new computer.
