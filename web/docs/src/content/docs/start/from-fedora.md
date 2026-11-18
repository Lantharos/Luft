---
title: Moving to Luft from Fedora
description: Replace a Fedora installation with Luft and keep your home folder, accounts, network and the packages you installed.
sidebar:
  order: 8
asks:
  - switch from fedora
  - upgrade fedora to luft
  - { ask: keep my files from fedora, to: what-stays }
  - { ask: where did my dnf packages go, to: what-stays }
  - { ask: dnf install, to: whats-different, shared: true }
  - { ask: sudo dnf upgrade, to: whats-different }
  - { ask: rpm fusion, to: whats-different }
  - { ask: man pages, to: whats-different }
  - { ask: no grub, to: whats-different }
---

Luft is built on Fedora, so moving over keeps most of what you're used to: the same kernel, drivers and command-line tools. What changes is how the system is put together. Fedora installs and updates packages one by one; Luft is one sealed image that updates as a whole, with your apps and tools kept apart from it.

## Moving over with Meet Luft

1. Download [Meet Luft for Linux](https://dl.schelf.store/lantharos/meet/latest/linux-x86_64/app-image), make it executable and start it.
2. It checks your computer and copies Luft into a folder, without touching your partitions.
3. Choose **Replace** on *Luft is ready*. The computer restarts into the installer, which explains what stays and what changes. Nothing happens until you confirm.

A [USB stick](/start/usb-stick/) works just as well: choose **Replace** under *Where Luft goes*.

Replacing works with Fedora Workstation's default layout, btrfs with separate `root` and `home` subvolumes, and with any system whose `/home` is its own partition. An encrypted `/home` can't be replaced.

## What stays

- **Your home folder**, untouched: documents, dotfiles, app settings, and Flatpak apps you installed for your own account.
- **Every account**, with the same user name, IDs and password.
- **Network connections**, Wi-Fi passwords included, plus the computer's name and SSH host keys.
- **Other drives** that Fedora mounted at startup.
- **Packages** you installed with dnf from Fedora's repositories, such as command-line tools and services. Luft adds them again as [system packages](/system/system-packages/) once it's online after its first start, and Schelf lists any it couldn't, with why.

The old system is kept as a btrfs subvolume called `old-system` until you remove it, so its files are still there if you need something. [Removing the old system](/system/remove-other-systems/) frees its space.

## What's different

| On Fedora | On Luft |
| --- | --- |
| `sudo dnf install` a desktop app | `schelf install`, or [Schelf](/apps/schelf/), installs it from Flathub or as an AppImage |
| `sudo dnf install` a command-line tool or a `-devel` package | `schelf install` adds it to the system, without a password unless it changes how the system works |
| `sudo dnf install` a service, such as Tailscale | `schelf install` adds it to the system after an administrator's password, and it starts with the computer |
| `sudo dnf remove`, `dnf search` | `schelf remove`, `schelf search` |
| `sudo dnf upgrade` | Settings, under System. The new version installs at the next restart, and the one before stays to go back to. Packages you added update by themselves, and `schelf update` updates them and your apps now |
| `dnf info`, `dnf list`, `dnf provides` | Work the same |
| Programs in `/usr/local`, from install scripts or built by hand | Work the same, and stay through updates |
| `man` and GRUB's tools | Luft starts without GRUB and leaves manual pages out of the system |
| Packages from RPM Fusion and COPR | Luft's image already plays every common video and audio format. Other repositories, such as a COPR project, can be added as [software sources](/system/system-packages/#software-sources) |
| GNOME | [Kestrel](/desktop/overview/), Luft's own desktop. GNOME apps keep working |

Typing `dnf install` out of habit still works: Luft asks whether to install it with Schelf instead.

Packages from RPM Fusion, COPR and other third-party repositories don't come over, and neither do system-wide Flatpak apps. Reinstall those from Schelf.
