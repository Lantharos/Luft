---
title: Moving to Luft from Fedora
description: Replace a Fedora installation with Luft and keep your home folder, accounts, network and command-line tools.
sidebar:
  order: 8
---

Luft is built on Fedora, so moving over keeps most of what you're used to: the same kernel, drivers and command-line tools. What changes is how the system is put together. Fedora installs and updates packages one by one; Luft is one sealed image that updates as a whole, with your apps and tools kept apart from it.

## The quickest way

1. Download [Meet Luft for Linux](https://get.luft.computer/meet/meet-luft.AppImage), make it executable and start it.
2. It checks your computer and copies Luft into a folder, without touching your partitions.
3. Choose **Replace** on *Luft is ready*. The computer restarts into the installer, which explains what stays and what changes. Nothing happens until you confirm.

A [USB stick](/start/usb-stick/) works just as well: choose **Replace** under *Where Luft goes*.

Replacing works with Fedora Workstation's default layout, btrfs with separate `root` and `home` subvolumes, and with any system whose `/home` is its own partition. An encrypted `/home` can't be replaced.

## What stays

- **Your home folder**, untouched: documents, dotfiles, app settings, and Flatpak apps you installed for your own account.
- **Every account**, with the same user name, IDs and password.
- **Network connections**, Wi-Fi passwords included, plus the computer's name and SSH host keys.
- **Other drives** that Fedora mounted at startup.
- **Command-line tools** you installed with dnf from Fedora's repositories. They're rebuilt in a Toolbox container called `fedora` when you first sign in; `toolbox enter fedora` takes you there.

The old system is kept as a btrfs subvolume called `old-system` until you remove it, so its files are still there if you need something. [Removing the old system](/system/remove-other-systems/) frees its space.

## What's different

| On Fedora | On Luft |
| --- | --- |
| `sudo dnf install` a desktop app | `schelf install`, or [Schelf](/apps/schelf/), installs it from Flathub or as an AppImage |
| `sudo dnf install` a command-line tool | `schelf install` puts it in a Toolbox container and makes its commands available everywhere, or use `toolbox enter` yourself |
| `sudo dnf install` a `-devel` package | `schelf install` puts it in the Toolbox, so build inside `toolbox enter` |
| `sudo dnf remove`, `dnf search` | `schelf remove`, `schelf search` |
| `sudo dnf upgrade` | Settings, under System. The new version installs at the next restart, and the one before stays to go back to. `schelf update` updates apps and tools |
| `dnf info`, `dnf list`, `dnf provides` | Work the same |
| Packages from RPM Fusion and COPR | Luft's image already plays every common video and audio format. Tools from other repositories can go in a Toolbox |
| GNOME | [Kestrel](/desktop/overview/), Luft's own desktop. GNOME apps keep working |

Typing `dnf install` out of habit still works: Luft asks whether to install it with Schelf instead.

Packages from RPM Fusion, COPR and other third-party repositories don't come over into the Toolbox, and neither do system-wide Flatpak apps. Reinstall those from Schelf.
