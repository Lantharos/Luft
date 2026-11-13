---
title: Boot and recovery
description: How a Luft computer starts, keeps two versions, counts tries for an update, and starts before its Secure Boot key is trusted.
sidebar:
  order: 8
---

Luft starts through SushiBoot, its own UEFI boot menu, and Sushi, its boot splash. trustd keeps the boot files on the EFI system partition current, and bootc writes one boot entry per version of the system. What people see is in [Recovery and troubleshooting](/system/recovery/); what happens when the start fails is in [When Luft can't start](/developers/system/recovery/).

## How the computer starts

1. The firmware starts Fedora's shim, signed by Microsoft, from the boot entry called Luft.
2. Shim starts SushiBoot, signed with Luft's key.
3. SushiBoot starts the newest version's startup image: kernel, initramfs and command line in one file, signed with Luft's key.
4. The startup image's stub measures what it started into the TPM, which releases the disk key only if the computer started this way.
5. The command line names the exact system the image was built with, as a composefs digest. The initramfs mounts the system only if every file matches it.

So nothing from the firmware to `/usr` can change without Secure Boot noticing, the kernel command line included. Kernel arguments are part of the image, in `/usr/lib/bootc/kargs.d`. With Secure Boot off, SushiBoot starts the same command line without `lockdown=integrity`, so drivers people build themselves can load. [Keys, signatures and the build](/security/keys/) covers which key signs what.

## Two versions on the computer

An update puts the new version's startup image in `EFI/Linux/bootc` on the EFI system partition, with an entry in `loader/entries`. The version before it stays, so there are always two. `bootc rollback` makes the previous version the default. That is the only way back: the updater refuses an image older than the running one, even a signed one ([Updates and releases](/developers/system/updates/#never-older)).

Next to Windows, whose EFI system partition is usually too small for them, the startup images and entries go on a separate 2 GB startup partition (XBOOTLDR, in the Boot Loader Specification's terms) on the same drive. Shim and SushiBoot stay on the EFI system partition, and SushiBoot reads entries from both.

While Luft runs, the partition holding the entries is mounted at `/boot`, with the EFI system partition at `/efi` when they differ. Each mounts when something opens it and unmounts after two idle minutes. trustd and bootc don't rely on those mounts: they find the EFI system partition the computer started from, and the startup partition by its type on the same drive.

After an update, trustd brings shim and SushiBoot up to the new version's at the next start. It replaces SushiBoot first, then shim, one whole file at a time, so a power cut partway leaves an older shim with a newer SushiBoot, which still starts. bootupd, which does this on other bootc systems, is removed from the image.

## When an update doesn't start

A new version gets three tries to reach the login screen, with the [boot counting](https://uapi-group.org/specifications/specs/boot_loader_specification/#boot-counting) systemd-boot uses:

1. bootc names the new version's entry with the tries from `/usr/lib/kernel/tries`, such as `…+3.conf`.
2. Each time SushiBoot starts that version, it counts one down in the name and names the entry in `LoaderBootCountPath`.
3. Once the login screen or the desktop has been on screen for five seconds, Kestrel calls trustd's `ConfirmStartup`, which lets `boot-complete.target` finish, and `systemd-bless-boot` takes the count out of the name. A login screen that crashes as soon as it appears doesn't count.
4. An entry with no tries left sorts after the others, so after the third failed try SushiBoot starts the version before it.

A startup image that can't be loaded, or gives up before Linux starts, doesn't wait for its three tries: SushiBoot goes to the version before it right away. Before the login screen, Sushi then explains that the update didn't start, and trustd makes the working version the default with `bootc rollback`. Settings doesn't offer that update again; the next release replaces it. Starting another version from the menu, or Rescue, never counts against an update.

## SushiBoot

SushiBoot reads unified kernel images and Boot Loader Specification entries, finds Windows and other systems, and draws its menu under the firmware logo. Its entry IDs and Boot Loader Interface variables match systemd-boot's, so `bootctl status`, `bootctl list` and `bootctl set-oneshot ID` work.

- Versions show newest first, the rest under Previous versions, each named by its operating system and version, such as Luft Alizé 1.2 Nightly 21. The version comes from the startup image's `IMAGE_VERSION`, or else the entry's `version`, which bootc fills in from the image's labels.
- With another system on the computer, the menu shows itself for 10 seconds and starts whichever system was started last, so Windows can finish an update that restarts it several times. That choice is kept in the `LuftBootLast` variable, and starting Luft clears it, so Luft always means its newest version. Otherwise the menu stays hidden until a key is held.
- `loader/loader.conf` takes `timeout` and `default`, which accepts patterns such as `luft-*`. `timeout 0` hides the menu even next to another system.
- Windows is never started from SushiBoot. BitLocker checks with the TPM that the firmware started Windows' boot manager itself and asks for its recovery key otherwise, so SushiBoot sets `BootNext` to the firmware's entry for it and restarts, as systemd-boot's `reboot-for-bitlocker` does.
- With Secure Boot on, it has no command line editor and skips entries that start a kernel directly. It measures what it starts into the TPM like systemd-boot.
- It draws only when something on the menu changes, and when it fails it hands back to the firmware, which tries its next boot entry.

## Before Luft's key is trusted

Shim only trusts Luft's key once someone confirms it at the computer, on shim's blue screen, with an eight-digit code. Install Luft queues the key before the first restart and keeps the request in the new system's `/var/lib/trustd`, so every later reminder shows the same code until the key is in. trustd asks shim to wait 60 seconds on the blue screen instead of 10. [The first start](/start/first-start/#the-blue-screen) has the steps people follow.

Until then there's a second firmware entry, "Luft without its key". It starts the same version through Fedora's signed shim, GRUB and kernel from `EFI/luft-start`, which trustd keeps in step with the newest version, one complete folder per version. Its command line carries `luft.started=without-key`, so trustd, Settings and Sushi know how the computer started.

- While a request is waiting, the next start goes through that entry (`BootNext`), whose shim shows the blue screen. After Reboot, the firmware starts the Luft entry, which shim now trusts.
- When nothing is waiting, "Luft without its key" comes before the Luft entry, so the computer starts without errors.
- That path has no signed command line, so the TPM can't vouch for it and an encrypted disk asks for its recovery key. Once the disk is open, trustd seals the disk key to exactly that start: PCR 4 (shim and GRUB), 7 (the Secure Boot state), 8 (GRUB's commands and the kernel command line) and 9 (every file GRUB read). Starts the same way then unlock by themselves until the version changes. A TPM with a PIN isn't sealed this way.
- After a start that went past the blue screen, trustd asks shim again with the same code, up to three times, and Sushi shows the steps and the code before each restart.
- Once the key is in, trustd removes `EFI/luft-start`, its entry, and the disk key sealed to it.

The live system, from a stick or Meet Luft, leaves the key and the EFI system partition alone.

## Moving to another drive

Disks moves Luft to another drive through trustd ([Moving Luft to another drive](/system/move-to-another-drive/)). Luft is copied whole, so every deployment, a staged update, each version's `/etc` and all of `/var` arrive as they were.

1. `MoveSystem` or `EraseAndMoveSystem` lays out the partitions as Install Luft does, gives an encrypted Luft's new root a copy of its LUKS2 header, and keeps the request inside Luft's own file system. The EFI variable `MovingSystemDisk` holds only the request's ID and progress, so nothing outside the running system can choose where Luft is copied.
2. At the next start, `trustd-move-drive.service` runs in the startup image before `/sysroot` mounts. It opens the new partition with the key already used at startup, mounts the old file system read-only and copies every subvolume, file, extended attribute and sparse region, turning fs-verity back on with the same parameters so the composefs objects keep their digests. A file is copied again only when it differs, so a power cut just resumes.
3. The firmware gets a one-time entry for the new drive (`BootNext`) and the computer restarts into the same signed startup image there.
4. When the login screen confirms the start, trustd makes the new drive's entries the default and remembers the old copy, which Disks can then remove.

When copying fails, or the new drive never reaches the login screen, the start carries on from the old drive, and trustd removes the trial entry and the partitions it made.

## Sushi's display

Sushi starts each screen in the arrangement of whoever signed in last, from `monitors` in `/etc/sushi/sushi.conf`, or else in its preferred mode. On HDMI, a mode faster than 340 MHz needs the monitor to turn on scrambling, which some monitors miss straight out of standby and stay black. So Sushi wakes such a monitor at the same size closest to 60 Hz and switches to the faster mode two seconds later. The drivers Sushi loads itself are listed in `/usr/lib/modprobe.d/sushi.conf`; a file of the same name in `/etc/modprobe.d` replaces it.

A computer started without a display starts the same way: SushiBoot starts the default entry, a TPM unlocks the disk, and the login screen starts on the graphics card with nothing connected and lights a display as soon as one is plugged in. Before the login screen starts, Sushi draws whatever it's showing, the disk prompt included, on a display plugged in later. Sushi never stays the DRM master of a card it doesn't show, since the kernel makes the first program to open a card its master and the login screen couldn't take the card then. NVIDIA's driver only loads once the system has started, so with NVIDIA graphics and no display at power-on, the disk prompt has no screen to appear on until the computer restarts with a display connected. `sushi/vm/run.sh` checks the start without a display in a VM.
