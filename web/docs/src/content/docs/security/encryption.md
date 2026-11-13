---
title: Disk encryption and the TPM
description: When the TPM unlocks Luft's encrypted disk, what the recovery key is, and how older startup images are cut off.
sidebar:
  order: 2
---

Luft's partition is LUKS2. It opens with a recovery key, a passphrase when there is no TPM, and, with a TPM, a token that unlocks it only when the computer started a Luft-signed startup image with Secure Boot on. [Security](/system/security/#device-encryption) covers turning it on and what people see, and [Encrypting and moving the disk](/security/encrypting/) how an installed Luft gets encrypted. trustd does all of it, and `trustctl` is its command line.

## When the TPM unlocks

The TPM releases the disk key only when two measurements match:

| PCR | Measures | Changes when |
| --- | --- | --- |
| 7 | Secure Boot's state and the certificates that vouched for what started | Secure Boot is turned off, its keys or the forbidden list change, or something else starts |
| 11 | The startup image, through a policy signed by Luft's [policy key](/security/keys/#the-tpm-policy-key) | Never for a Luft-signed image. The policy only covers the initramfs, so the running system can't release the key |

Updates to Luft and ordinary firmware updates keep unlocking without a prompt. Once the disk is open, its volume key is measured into PCR 15, so anything sealed to the running system afterwards, such as [Luft Keyring](/security/keyring/), only opens on this installation.

The TPM only unlocks while Secure Boot is on, and shim's own switch counts: after `mokutil --disable-validation` the firmware still reports Secure Boot as on while shim checks nothing, so trustd reads `MokSBStateRT` and treats that as off. With Secure Boot off, anything can start the computer and measure itself as Luft, so PCR 7 and 11 prove nothing. Settings doesn't offer the TPM then, Install Luft asks for a passphrase, and a disk linked to the TPM asks for its passphrase or recovery key.

When a new forbidden list or new keys reach the firmware while Luft runs, as Settings and fwupd install them, trustd works out from the TPM's event log what PCR 7 the next start will measure and seals the disk key to that as the computer shuts down. It never does this when the forbidden list lost entries, since removing revocations is what an attacker would do. When PCR 7 changes any other way, Sushi asks for the recovery key once and says why, and the TPM unlocks by itself again only after an administrator confirms the change in Settings. A TPM with a PIN can't be sealed again without the PIN, so Settings offers to link it again instead.

Until shim trusts Luft's key, the computer starts through Fedora's GRUB, which has no signed startup image for PCR 11. The first such start asks for the recovery key, and trustd adds a second token sealed to PCR 4, 7, 8 and 9 as that start measured them: shim, GRUB, the Secure Boot state, every GRUB command with the kernel's command line, and every file GRUB read. A changed configuration, command line, kernel or initramfs then never unlocks. The token is only added when GRUB measured into PCR 8 and 9, never with a PIN, and it's removed once Luft's key is in.

An optional PIN of 6 to 20 digits makes the TPM also require something you know, with the TPM's own lockout against guessing.

## The recovery key

Every encrypted disk has a recovery key of 12 words from the BIP39 English list: 128 random bits from the kernel plus a 4-bit checksum. The list is English in every language and plain a to z, since the key may be typed before the right keyboard layout is loaded. Every word is unique in its first four letters, so four letters are enough and Sushi completes the rest, and the checksum catches a wrong word before anything tries the disk. The keyslot's passphrase is the 12 words in lower case with single spaces.

Wherever a new recovery key is shown, in Install Luft, Settings and Disks, the next step waits until the key was kept: saved to a USB drive or a file, printed, or written down and checked by typing three words picked at random. With a TPM, a copy sealed to it in `/var/lib/trustd`, inside the encryption, lets Settings show the key again after an administrator's password, and lets trustd open the disk itself to move it. `CheckRecoveryKey` on `com.lantharos.Trust1` tries a key against its own keyslot without unlocking anything.

Sushi waits for a key, passphrase or PIN as long as it takes, and a wrong one asks again. Only a system disk that never shows up ends in the emergency shell.

## Files beside the startup image

systemd's stub hands the startup image whatever lies next to it on the startup partition: credentials, and system and configuration extensions. That partition isn't encrypted, and the stub measures those files into PCR 12 and 13, which the disk's token isn't bound to. Luft puts nothing there, so when anything arrives, `luft-added-files.service` in the startup image extends PCR 11 and 15 before the disk is unlocked. The TPM then releases neither the disk key nor the keyring's, and the disk asks for its recovery key or passphrase.

Hibernation is off: the kernel is locked down, swap is compressed memory only, and the startup image has no resume support, so nothing unencrypted is written out when the computer sleeps.

## Older signed startup images

The policy key's signature never expires, so an older Luft image that was signed once still unlocks the disk if someone starts it from the EFI system partition. Going back to the version before an update depends on exactly that, so an old image has to keep working for one step back, and only then stop.

systemd-pcrlock could limit PCR 11 to the installed images, but every update would rewrite a policy stored in the TPM, and one that doesn't match what starts asks everyone for their recovery key. A version counter in the TPM isn't something systemd's TPM token can check. So the policy key has generations, and the disk has one TPM token per generation an installed version is signed with:

1. A release that has to cut older images off is signed with the old and a new policy key, and starts through the old key's token.
2. At its first start, trustd adds a token for the new key and keeps the old one, so going back still unlocks.
3. Later releases are signed with the new key only. Once neither the running version nor the one it replaced is signed with the old key, trustd removes that token and remembers the key as retired, so an older image started by hand can't link the TPM for it again.

trustd keeps which keyslot belongs to which generation, and which generations the last two versions were signed with, in `/var/lib/trustd/tpm-generations.json`, telling versions apart by the `composefs=` digest on their command line. A disk that skipped the release signed with both keys only has a token for the old one, so it asks for its recovery key or passphrase once, and trustd then links the TPM for the new key. Sushi tells this apart from a change in how the computer starts: when none of the public keys in the disk's TPM tokens is one the startup image's PCR signature was made with, its prompt says that this version of Luft uses a newer key and won't ask again, instead of pointing at the firmware.

Luft's images up to Nightly 26 are signed with the first policy key, Nightly 27 with the first and second, and later images with the second only, so the first stops unlocking a disk two updates after Nightly 27. A new generation needs its public half in `os/image/keys/pcr`, its private half as the `LUFT_PCR_KEY_<generation>` secret passed to the signing keys action, and its number in `PCR_GENERATIONS` in `os/versions.env`.
