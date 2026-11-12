---
title: Moving Luft to another drive
description: Move Luft to a faster or bigger drive with your files, apps and settings, without installing it again.
sidebar:
  order: 6
asks:
  - new ssd
  - move to nvme
  - clone drive
  - migrate to new drive
  - { ask: move luft failed, to: nothing-is-lost-along-the-way }
  - { ask: recovery key after moving, to: encryption }
  - { ask: delete old copy, to: removing-the-old-copy }
---

Luft can move itself to another drive in your computer, such as a fast NVMe drive next to the SATA drive it was installed on. Your files, apps, Flatpaks, settings, Wi-Fi networks and the version of Luft you run all come along, so there's nothing to install or set up again.

In [Disks](/apps/disks/), open the menu of the drive Luft runs from, or of Luft's own partition, and choose **Move Luft to another drive**.

## Choosing where it goes

Disks first says how much space Luft needs on the other drive, about what its files take up plus room to grow, and at least 32 GB. Then it lists the other drives inside the computer, each with what it can offer. USB drives and memory cards aren't offered, since computers don't start from them reliably.

On the drive you pick, Luft can go into:

- **The free space** on it. You choose how much of it Luft gets.
- **Room made on a data partition**: an NTFS or ext4 partition shrinks to make room, keeping its files. It never shrinks below what its files need plus some room.
- **The whole drive**, after erasing it. Disks lists everything that's deleted and asks you to confirm. A drive that Windows or another system starts from can't be erased for Luft, and Disks says so.

When the drive has no EFI system partition, as a data drive usually doesn't, Luft makes one of 1 GB in front of its own partition, so the new drive starts by itself even if the old one is taken out later. Next to a small EFI system partition, such as Windows', Luft adds its 2 GB startup partition instead, the same way [installing](/start/alongside-windows/) does.

## At the next start

Luft moves the next time the computer starts, before anything uses its files, so the copy is exact. The screen says **Moving Luft to** and the drive's name, with how far it is. Copying takes from a few minutes to an hour on a full drive. Keep the computer on and plugged in.

When it's done, the computer restarts from the new drive. The first time Luft reaches the login screen there, it becomes the drive the computer starts from, and the firmware's start entries point to it, next to Windows' and any other system's.

Until you restart, the move can be called off in the same place in Disks. Room made on a data partition then stays free space.

## Nothing is lost along the way

The copy on the old drive isn't touched until Luft has started from the new one.

- If the power goes out while Luft copies, the next start carries on where it stopped, from the copy on the old drive.
- If copying fails, for example because the new drive fails, Luft starts from the old drive as usual, takes back the partitions it made on the new one, and Disks says why the next time you open it.
- If Luft doesn't get to the login screen from the new drive, the computer starts the old copy again, and Luft takes back what it made on the new drive.

## Encryption

An encrypted Luft stays encrypted the same way on the new drive. It gets an exact copy of the encryption header, so the same recovery key and passphrase open it, and the TPM unlocks it at startup like before. There's no new recovery key to keep.

When the TPM doesn't unlock the disk, the passphrase or recovery key you type at startup opens the new drive too, so moving needs nothing more.

## Removing the old copy

Once Luft runs from the new drive, Disks shows **Luft's earlier copy** below the old drive's partitions. **Remove** takes it out of the firmware's start entries, removes its startup files, erases its encryption and deletes its partitions. If Luft's shim had replaced Windows' boot manager as the drive's fallback, Windows' is put back.

Afterwards the space is free on the old drive. Right after Windows, **Give to Windows** grows Windows into it. Windows has to be shut down fully for that, not hibernated or in Fast Startup. After its size changed, as when Luft was installed next to it, Windows checks its drive the next time it starts, and only grows once it has. A Windows locked with BitLocker can't grow from Luft. You can also make the space a partition for your files.

## When Luft can't move

Disks says why and what to do instead, for example:

- The other drive is too small, even after making room on it.
- Luft is still being encrypted, or waits to grow or move into free space on its own drive.
- An earlier copy of Luft is still on another drive. Remove it first.
- The computer doesn't start through Luft's own boot menu, such as a computer without UEFI.
