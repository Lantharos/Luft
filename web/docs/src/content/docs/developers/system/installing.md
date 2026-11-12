---
title: Installing Luft
description: How the USB stick's live session, the installer service and Kestrel's setup mode put Luft on a drive and hand it over to its first account.
sidebar:
  order: 11
---

Installing involves three parts: [Install Luft](/start/usb-stick/#install-luft), the app in `apps/system/setup`; `luft-installer`, the service behind it on `com.lantharos.Installer1`; and Kestrel's setup mode, which runs both before anyone has an account. The same app runs from the USB stick and from [Meet Luft](/developers/system/meet-luft/)'s partitions.

## What gets installed

`/usr/lib/luft-installer/install.toml` says which images the installer may put on a drive:

```toml
version = "1.2-nightly.21"

[images.default]
source = "containers-storage:ghcr.io/lantharos/luft:1"
target = "ghcr.io/lantharos/luft:1"
size = 5286520084
```

The image itself ships only the settings above the tables, such as `smallest-system`, the size in bytes below which drives and free spaces aren't offered (32 GiB unless set). The stick's build in `os/iso` adds the rest: the version it carries, from the image's label, and an `[images.NAME]` table for each image with the size Podman reports for it. `[images.nvidia]` is picked on computers with an NVIDIA graphics card, and a stick with a single table installs that image everywhere.

`source` is where the stick holds the image, `target` where the installed system gets its updates: `ghcr.io/lantharos/luft:1` on a release's stick, `:1-nightly` on a nightly's, with `-nvidia` for the NVIDIA image. The image doesn't know its own channel, so a release can be exactly the image that was tested as a nightly.

The stick keeps both images in a read-only image store that the live session adds to Podman's storage, so installing needs no network. While bootc unpacks, the installer puts `/var/tmp` on the new drive, because bootc keeps each layer there until it's unpacked and the live session's own changes live in memory. Kernel arguments come from the image's `/usr/lib/bootc/kargs.d` and are sealed into its startup image.

When the drive's EFI system partition is smaller than 1 GB, as Windows' usually is, the installer adds a 2 GB XBOOTLDR partition in front of Luft's for the startup images and boot entries. Luft's image carries a bootc patched to use it, in `os/image/patches/bootc`.

## The live session

The stick's kernel command line has `rd.live.image`, which is how the installer knows where it runs. greetd signs in the passwordless `live` account with `kestrel-session --setup` as its `initial_session`, polkit allows that account everything, and Install Luft appears in Start only there.

- Setup's first screen starts from the language, formats, time zone and keyboard layouts Meet Luft wrote into `meet.json`, or else from a Windows it can read on the computer, and from the time zone Fedora's GeoIP service gives once it's online. It only says it guessed when one of these told it something.
- Changing the language on that screen changes the live account's language through AccountsService, so Kestrel follows, and `UseLanguage` makes the service answer in it too. The service keeps the choice in `/run/luft-installer/language` across its idle restarts.
- After copying, `trustctl startup install` puts shim and SushiBoot on the EFI system partition and makes the new system the firmware's next start (`BootNext`), so a stick left in doesn't start setup again. With Secure Boot on and Luft's key not yet trusted, `trustctl secure-boot enroll --state` queues the key in the new system's `/var/lib/trustd`, and the service publishes its code as `SecureBootCode` so the restart screen can show it. [Boot and recovery](/developers/system/boot/) covers what happens to the request at the next start.
- The recovery key is saved onto a USB drive through UDisks, printed, or written down and checked by typing back three of its 12 words. Encryption stays off until one of them worked, and the key is never saved into the live session's home, which is gone after the restart.
- Wi-Fi networks joined in the live session come along from `/etc/NetworkManager/system-connections` and `/run/NetworkManager/system-connections`. Before the account exists, passwords the session's keyring held move into NetworkManager's own files, readable by root alone, so the network belongs to everyone on the computer and connects at the first start.

## The first start

After copying, the installer writes the locale, keyboard, time zone, computer name and account into the new system, and `/var/lib/luft-installer/first-boot` with the account's name. greetd gets an `initial_session` for that account, so every start goes straight back into setup until it's finished.

The account's Luft Keyring is created with its password, plus a one-time key in `/var/lib/luft-keyring` that unlocks it in those setup sessions, since an automatic sign-in has no password to unlock it with. While setup is pending, the service also enrolls Luft's Secure Boot key, adds fingerprints and tells the firewall the first network's type (`SetNetworkType`), so the person isn't asked for the password they just chose. It does these only for the account setup is pending for, signed in at the computer, and only for programs outside a sandbox.

`FinishFirstBoot`, which only that account may call, removes the `initial_session`, the marker and the keyring's one-time key, and the next start shows the login screen. Setup doesn't stay open forever: `luft-installer-expire-setup.service` counts the starts, and after five, or a day after installing, it finishes setup the same way before the login screen appears. The service stops doing setup's work at the same limits.

## Setup mode

`kestrel-session --setup` runs Kestrel in setup mode until Install Luft finishes, then starts the normal session. `kestrel-session` does the same by itself when `first-boot` names the person signing in. Setup mode runs as `kestrel-setup.target`, which starts the graphical session as the desktop does, so file dialogs, printing, the portal's appearance settings and Luft's palette all work. It keeps the firmware logo on screen while Sushi hands over and ends on the blurred wallpaper the desktop starts with, so there's no flash between them.

Services that belong only on the desktop wait for `kestrel-session.target`. The portal service stops with setup mode and starts again once the desktop's Kestrel is ready, since it learns which portals Kestrel serves when it starts, and setup mode serves fewer.
