---
title: Computers waiting for their owner
description: How Luft is installed without an account, what the temporary disk key is, how the owner takes the computer over, and how erasing works.
sidebar:
  order: 11.5
---

Installing [for someone else](/start/for-someone-else/) and [erasing](/system/erase/) both leave a computer *unclaimed*: Luft is installed and encrypted, nobody has an account, and the first start belongs to whoever owns it. The installer service (`apps/system/setup/installer`) keeps that state, and trustd (`security/crates/trust`) the disk's keys.

## The state

`/var/lib/installer/unclaimed` holds `installer` or `owner`, which the installer reports as its `Phase`:

| Phase | Marker | Setup shows |
| --- | --- | --- |
| `handover` | `unclaimed` says `installer` | Secure Boot's code again if the blue screen was missed, then **Ready for its owner** |
| `unclaimed` | `unclaimed` says `owner` | The welcome, language, network, account and recovery key |
| `first-boot` | `first-boot` names the account | Fingerprints and the last screen, as after [any install](/developers/system/installing/#the-first-start) |

With no account to sign in, greetd's `initial_session` runs `kestrel-session --setup-only` as `luft-setup`: setup mode and nothing after it, so the session ends instead of opening a desktop if setup ever stops. `luft-setup` is a system account without a password that the installer adds to `/etc/passwd` when it leaves a computer unclaimed and deletes when the owner's account exists. A polkit rule lets it do what setup needs, which is why it only exists in between. The installer answers its setup calls only in these two phases.

**Ready for its owner** calls `LeaveToOwner` as soon as it shows. That moves the marker to `owner` and makes the next start a first one: `/etc/machine-id` goes back to what the image ships, and the SSH host keys, the random seed, systemd's credential secret and the journals are removed. A drive copied from here, or from before its first start, gives every computer its own identity.

## The temporary key

Luft's partition is always encrypted when it's installed for someone else. `trustctl encryption format-unclaimed` makes a LUKS2 volume with one random key in keyslot 0, and a `luft-temporary` token that carries the key itself. The key derivation is PBKDF2 with few rounds, since the key is random and stretching it would only slow every start. The volume's label is `luft-unclaimed`, which is how the startup image finds it without looking into every disk: a udev rule starts `trustd-unclaimed.service` for a root partition with that label, and it opens the partition with the key from the token before `systemd-cryptsetup@root.service` would ask for one.

A key next to the lock protects nothing, and there is nothing to protect yet. What it gives is one way to install, with or without a TPM, and a drive that can be copied before its first start.

At each start, `trustctl follow-up` looks for a carried key. Once the TPM can unlock the disk (a TPM, Secure Boot on, Luft's key trusted, started through the signed startup image), it seals the key to the TPM as it would an owner's, keeps a TPM-sealed copy in `/var/lib/trustd`, and replaces the token with one that carries nothing. From then on the disk only opens on that computer, started with Luft, so nobody can change what the owner will start. Without those, the key stays in the token.

## Taking over

When the owner continues from **Protect your files**, setup calls the installer's `Claim` with the recovery key and, where the TPM can't unlock the disk, a passphrase. The installer:

1. has trustd's `ClaimSystemDisk` change the disk's keys (below),
2. writes the language, keyboard, time zone and computer name, and creates the account, on the running system, with the code that does the same to a new system while installing,
3. writes `first-boot` and an `initial_session` for the account, removes `unclaimed`, deletes `luft-setup` and restarts greetd, so the owner's own session carries on with setup.

A power cut before step 3 leaves the computer unclaimed, and `Claim` can be called again: trustd accepts the recovery key in place of the temporary one once the keys are changed.

`ClaimSystemDisk`, which only root may call, adds the recovery key and the passphrase with the temporary key, then removes the temporary key's keyslot and token, the label, and every TPM keyslot made for it. That alone would leave the volume key as it was, and whoever installed the computer could have copied it. So it then starts `cryptsetup reencrypt` on the open disk, which gives the volume a new key and rewrites every block with it:

- The keyslots that exist then, the recovery key's and the passphrase's, are carried over to the new volume key, so either opens the disk before, during and after.
- LUKS2 allows no new keyslots while it runs, and the TPM's can't be carried over. With a TPM, the recovery key is sealed into the EFI variable `EncryptingSystemDiskKey`, to PCR 7 and the signed policy, and `trustd-encrypt.service` opens the disk with it at each start until the work is done, exactly as for [encrypting in place](/security/encrypting/#encrypting-in-place). Then trustd links the TPM to the new volume key and deletes the variable.
- trustd runs it at the lowest CPU and I/O priority. It doesn't wait for mains power: the sooner the old key is gone, the better.
- LUKS2 keeps a checksummed journal of the area it's rewriting, so a power cut loses nothing. The next start opens the disk in both keys, finishes the interrupted area and trustd carries on. Without a TPM it uses the passphrase or recovery key typed at that start, from the kernel keyring.

`Disk` on `com.lantharos.Trust1` says `NewKey` is `underway` with `NewKeyProgress`, or `waiting` when it carries on after a restart, and Settings shows it under Security. The unlock settings there wait until it's done.

## Erasing

Deleting files leaves them on the drive, and encrypting the same blocks again with a new key would carry deleted files' blocks along. Erasing instead moves Luft into new encryption and destroys the old one, so everything that isn't Luft is left in a key that no longer exists.

`Erase` on the installer, behind `com.lantharos.installer.erase` and an administrator's password, prepares the start afterwards in `luft-next-start/erase` at the top of Luft's file system: for each installed version, the `/etc` its image ships plus the `luft-setup` account, and one `/var` with the image's own, the `unclaimed` marker and setup's `initial_session`. It asks readers to forget the fingerprints they store themselves, has `trustctl system-disk erase` keep a [request for the next start](/security/encrypting/#requests-for-the-next-start) (`ErasingSystemDisk`) and restarts. trustd refuses when Luft's files wouldn't fit twice on the partition.

`trustd-erase.service` then runs in the startup image, after the disk is unlocked as at any start and before anything mounts it, and says how far it is on the splash:

1. It puts the prepared `/etc` folders and `/var` in place of the old ones, deleting subvolumes inside `/var` first, and shrinks btrfs to what's left.
2. In the unused second half of the partition it makes a LUKS2 volume with a throwaway key, adds it to the file system and removes the old volume from it, which makes btrfs move every block that's still in use.
3. It formats the first half as a new unclaimed volume, over the old header and keyslots, and moves the file system back the same way. The second half's header is overwritten.
4. After a restart it grows the file system to the whole partition again and deletes the request.

The old volume key is gone with step 3, and with it everything outside Luft's own files: old blocks stay on the drive as noise. A partition that wasn't encrypted has nothing to throw away, so both halves are overwritten with zeros instead, which takes as long as the drive is big. The firmware variable records the step, and each step can be run again, so a power cut continues where it stopped.

The disk ends as it does after installing for someone else, with a carried temporary key that the next start seals to the TPM where it can, and the computer in the `unclaimed` phase. Luft's key in shim, the startup files on the EFI system partition and other systems aren't touched.
