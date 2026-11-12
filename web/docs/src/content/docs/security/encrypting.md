---
title: Encrypting and moving the disk
description: How Luft encrypts its partition while installing or in place, moves it encrypted, and encrypts other drives.
sidebar:
  order: 2.5
---

Install Luft encrypts Luft's partition before anything is on it. Encrypting an installed Luft, and moving it to another partition or drive, happen at the next restart in the startup image, where the partition is already open, so no key is ever written in the clear. [Disk encryption and the TPM](/security/encryption/) covers how the disk unlocks once it's encrypted.

## Encrypting while installing

Install Luft formats Luft's partition with `trustctl encryption format`, keyed by the recovery key and, without a TPM, a passphrase of at least eight characters. Before the first start, `trustctl encryption seal` links the TPM. PCR 7 isn't sealed to what the live system measured, since it started through Fedora's shim and GRUB, but to what the computer will measure once Luft's key is in shim: trustd replays the event log without the live system's loader and adds Luft's key. If the prediction misses, the first start asks once for the recovery key that was just saved, and trustd seals to what that start measured.

Replacing a Linux system while keeping its files next to Luft can't be encrypted while installing, since those files stay on the same unencrypted partition.

## Encrypting in place

Settings encrypts an installed Luft without moving its files. It needs Luft's own btrfs partition, the computer plugged in, and a recovery key, plus a passphrase without a TPM. Neither key is ever written to the disk or the firmware in the clear.

- **Before the restart**, trustd shrinks the mounted btrfs by the 32 MB a LUKS2 header needs and writes a [request for the next start](#requests-for-the-next-start). With a TPM, the recovery key is sealed into the EFI variable `EncryptingSystemDiskKey` to PCR 7 and the signed policy, so only Luft's own startup image can open it, and only before the system starts. Without one, the request holds the recovery key encrypted with the passphrase (Argon2id and XChaCha20-Poly1305), which gives away no more than the passphrase keyslot will. Until the restart, **Don't encrypt** takes it all back.
- **At the restart**, `trustd-encrypt.service` in the startup image gets the first key, from the TPM or by asking for the passphrase, starts the encryption with `cryptsetup reencrypt --init-only`, and opens the partition so the volume key is measured into PCR 15 as at every later start. The key stays in root's kernel keyring, in memory only, readable by trustd's units and no other service. A [shell opened in the startup image](/developers/system/recovery/#opening-a-shell) gets that keyring emptied first.
- **While it encrypts**, trustd carries on in the background at the lowest priority, pausing on battery. LUKS2 allows no new keyslots until it's done, so there is one key: the recovery key with a TPM, the passphrase without.
- **Once it's done**, trustd deletes `EncryptingSystemDiskKey`, adds the second key, links the TPM as after installing, and deletes the request. The first restart measures the volume key into PCR 15 for the first time, so the keyring asks for your password once.

Old blocks are encrypted where they are. An SSD that keeps copies of blocks after they're rewritten may still hold earlier unencrypted data, as with any encryption that starts after the data was written.

## Requests for the next start

Moving Luft to another drive and encrypting it in place happen in the startup image, where Luft's partition is already open. What they should do is kept in `luft-next-start` at the top of Luft's own file system, never in the firmware. On an encrypted Luft that puts the request inside the encryption, so only the running system can write one: another system started on the computer, or a firmware shell, can't make the next start copy Luft somewhere.

Each request has a random ID, and an EFI variable (`MovingSystemDisk` or `EncryptingSystemDisk`) holds the ID of the one that waits. A request only counts while its ID is the one in the variable, so one left on an earlier copy of Luft is never picked up. Whoever can write firmware variables can call a waiting request off or make it run again, and nothing more: the variable names no partition and holds no key.

A request on an unencrypted disk is as trustworthy as the disk, and encrypting in place starts from exactly that: it protects what is written from then on, not against someone who changed the disk before.

Meet Luft's requests to change Luft's size are the exception, because they come from Windows, which can't write into Luft. They stay in the EFI variable `LuftResize` and can only ask to grow, shrink or trim Luft's own partition, which trustd checks against the space Luft needs ([Resizing and removing Luft](/developers/system/resizing/)).

## Moving the encrypted system

When Luft moves to a new partition, for Meet Luft or to another drive, the new partition gets a copy of the LUKS2 header, so both use the same volume key and keyslots while btrfs moves the files across. The copy is opened with the recovery key the TPM keeps for Luft, which never leaves memory. A move to another drive keeps the LUKS UUID too, so the recovery key, passphrase, TPM token and PIN keep working and no new recovery key is made.

Encrypting different data at different places with one XTS key reveals nothing more than one disk written over time does. The old copy's header is wiped and its blocks trimmed once btrfs no longer uses it; on a drive that doesn't erase trimmed blocks, they stay readable to whoever has the volume key until something writes over them, like blocks freed inside one encrypted disk.

During a move, both halves carry a `luft-move` token in their header with the btrfs file system's UUID. The startup only opens partitions on the system disk's drive that have the token, and closes one again unless the file system inside has that UUID, so a header copied onto another partition only opens to noise. Nothing about a move is kept in firmware variables, so resetting them halfway can't keep Luft from starting.

## Other drives

[Disks](/apps/disks/) encrypts other drives in place through trustd. Luft's own partition, partitions the system needs, swap, LVM and RAID are refused, and removable drives aren't decrypted in place. Room for the header comes from free space right after the partition, shrinking ext2/3/4 while unmounted, or shrinking btrfs while mounted; otherwise the drive can only be encrypted by formatting it.

**Unlock automatically on this computer** keeps a random key next to the drive's record in `/var/lib/trustd/drives`. It requires Luft to be encrypted, so that key is as safe as the TPM-protected disk. `trustd-drives-generator` turns each record into a `systemd-cryptsetup@` unit wanted by the drive's device, so the drive unlocks at startup or whenever it's plugged in.
