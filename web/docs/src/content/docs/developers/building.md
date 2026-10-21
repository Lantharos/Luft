---
title: Building Luft
description: Build Kestrel and the apps on Fedora, run test sessions, and build the image and the USB stick.
sidebar:
  order: 2
---

Day-to-day work happens on a Fedora 45 machine, in test sessions that change nothing on it.

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
