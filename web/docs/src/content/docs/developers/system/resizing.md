---
title: Resizing and removing Luft
description: How trustd grows, shrinks and moves Luft's partition on request from Meet Luft or Disks, and how Meet Luft removes it.
sidebar:
  order: 11.75
---

An installed Luft changes the size and place of its own partition, because only the running system can resize its btrfs. Requests come from [Meet Luft](/developers/system/meet-luft/) on Windows and from [Disks](/apps/disks/) on Luft, and trustd carries them out at the next start.

Meet Luft recognises an installed Luft by a partition of the root type `4f68bce3-e8cd-4db1-96e7-fbcaf984b709` named *Luft*, and shows *Your Luft*. To tell how full it is, it reads the btrfs superblock. An encrypted Luft can't be read from Windows, so Luft reports its own use: at every start, `trustd-system-disk.service` writes `{"partition":"…","allocated":…}` to the UEFI variable `LuftSpace` whenever the value moved by a gigabyte or more.

## Moving Luft

btrfs only changes size from the system that has it mounted, and Windows only grows into space right after it, so Luft moves itself:

1. For more space, Windows shrinks right away by whatever the free space next to Luft doesn't cover, and `made.json` notes it as `givenToLuft`. For less, Windows doesn't change yet.
2. Meet Luft writes the request to the UEFI variable `LuftResize`, under Luft's vendor GUID `b6a4c1e2-3f5d-4c8a-9e71-2d0f6a8b5c3e`: `{"change":"grow","partition":"…"}`, `{"change":"shrink","bytes":…,"partition":"…"}` to free space in front of Luft, or `{"change":"trim","bytes":…,"partition":"…"}` to free it at the end. Calling off a waiting grow gives Windows back what it gave.
3. At the next start, `trustd-system-disk.service` plans the move and runs it in the background: make a new partition, add it to Luft's btrfs, hand it the root type, let `btrfs device remove` move everything off the old one, delete the old one, and grow the new one to the end. The startup partition moves first when Luft grows and last when it shrinks, copied to a new FAT partition with the same serial. Luft's partition gets its old partition UUID back at the end, so nothing measured into the TPM changes.
4. When Luft gave space back, Meet Luft offers to extend Windows into it the next time it opens.

When the free space is right after Luft, no move is needed: Luft grows its partition, encryption and btrfs in place, and trimming shrinks them in the opposite order. Luft's files must fit wherever they go with 10% and 1 GB to spare. When the new space is smaller than that, Luft moves twice, first to the far end of its own partition, which needs it to be less than half full.

trustd is the only thing that changes Luft's partition, its encryption or its btrfs on an installed system. Taking back Meet Luft's space, a request from Windows, and growing or shrinking from Disks are all plans of the same steps; Disks asks through trustd's `GrowSystemAtStart` and `CancelSystemResize`. Plans live in one journal, `/var/lib/trustd/system-disk.json`, and only one runs at a time. Each step is written down before the next starts, and Luft starts at every point in between, since the startup finds the file system through either partition. After a power cut, the next start carries on. A plan whose first step fails three times is dropped, since nothing has changed yet; once a step is done, the plan is never dropped, so Luft is never left spread over two partitions. Every tool a step runs is stopped after five minutes, except the ones that move data or wait for a person.

## An encrypted Luft

An encrypted Luft moves the same way, with three more steps: **Seal** gives the new partition a copy of the LUKS2 header with a `luft-move` token, **Retire** wipes and trims a partition btrfs has left, and **Settle** gives the final partition the original LUKS UUID and removes the token. [Encrypting and moving the disk](/security/encrypting/#moving-the-encrypted-system) explains why that is safe. A Luft that only opens with a passphrase can't move, since there's no key it could use alone.

## Removing Luft

Meet Luft removes the firmware entries for `\EFI\luft\` and `\EFI\luft-start\` and Windows' copies of them. On every EFI system partition holding Luft's files, it deletes those folders and Luft's boot entries with their images, and restores Windows' boot manager as `EFI\Boot\BOOTX64.EFI` where Luft's shim took its place. An EFI system partition the installer made with only Luft on it goes whole. Then Luft's partitions go, and Windows grows into the space when it's right after it. No key is needed, even for an encrypted Luft, and nothing is left in the TPM, since Luft keeps its sealed keys in the LUKS header.

