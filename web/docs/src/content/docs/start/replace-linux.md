---
title: Replacing another Linux
description: Put Luft in place of a Linux system and keep your files, accounts, network and command-line tools.
sidebar:
  order: 6
---

Install Luft finds Linux systems on the computer's drives and offers **Replace** for those whose home folders live apart from the system:

- Fedora's layout, btrfs with `root` and `home` subvolumes
- a separate `/home` partition, with any file system

A system with everything on one partition, as Ubuntu installs by default, is listed but can't be replaced yet.

You can start from a [USB stick](/start/usb-stick/), or from the running system with [Meet Luft](/start/meet-luft/#on-linux), which restarts straight into **Replace**. Either way, the installer explains what stays and what changes before anything happens.

## What comes along

| What | What happens |
| --- | --- |
| Your files | Your home folders stay where they are, with their owners unchanged |
| Accounts | Every account comes over with the same user name, IDs and password. The first one, and anyone who was an administrator, is an administrator in Luft |
| Network | Saved connections, Wi-Fi passwords included |
| The computer | Its name and SSH host keys, so other machines still recognise it |
| Other drives | Drives the old system mounted at startup are mounted again, under `/var/mnt` unless they were already under `/var` or `/home` |
| Command-line tools | Packages you installed with dnf from Fedora's own repositories, or with pacman, are rebuilt in a [Toolbox](/system/software/#command-line-tools) container when you first sign in. Enter it with `toolbox enter fedora` (or `arch`) |

Because your home folder stays, so does everything in it: documents, app settings, Flatpak apps you installed for your own account, and your shell configuration.

## What happens to the old system

- **On btrfs**, Luft goes into a new subvolume, and the old system is renamed `old-system` and kept until you remove it.
- **With a separate `/home`**, the old system's partition becomes Luft's.

The old system doesn't start anymore after replacing. Its start entries and boot files go the first time you sign in to Luft. On btrfs, `old-system` stays until you remove it in Disks or Settings, which gives its space to Luft. See [Removing Windows or the old system](/system/remove-other-systems/).

When the EFI system partition is smaller than 1 GB, the old `/boot` partition becomes Luft's startup partition, so it needs to be at least 1 GB.
