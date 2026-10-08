# Security model

What protects a Luft computer, and against what. The services are [trustd and USB protection](../security/README.md) and [Luft Keyring](../kestrel/keyring/README.md); boot and recovery steps are in [boot.md](boot.md).

## Luft Secure Boot key

- Made on the computer the first time it is needed. The private key is sealed with `systemd-creds` to the TPM and a root-only secret in `/var/lib/trustd`, and only unsealed into `/run/trustd` while signing.
- Without a usable TPM, a key is only made once the disk is encrypted.
- It signs SushiBoot, the kernel images and DKMS modules. akmods modules (such as NVIDIA's) keep akmods' own key, because akmods builds as an unprivileged user that must never be able to sign what starts the computer.
- A second key signs the PCR 11 policies, kept the same way.
- Shipping a Luft shim with the key built in would remove the one-time enrollment screen, but needs Microsoft's shim review and an HSM-backed CA. Until then, Fedora's shim and a per-computer key give the same protection.

## Disk unlock with the TPM

The TPM releases the disk key only when both match:

| PCR | Measures | Changes when |
| --- | --- | --- |
| 7 | Secure Boot state and the certificates that vouched for what started | Secure Boot is turned off, keys or the forbidden list change, or something else starts |
| 11 | The unified kernel image, through a policy signed by Luft's key | Never for a correctly signed image; the policy only covers the initramfs, so the running system can't release the key |

- Kernel, initramfs and ordinary firmware updates keep unlocking without a prompt.
- When PCR 7 changes, Sushi asks for the recovery key and says why, and Settings offers to link the TPM again.
- An optional PIN of 6 to 20 digits makes the TPM also require something you know, with its own guessing lockout.
- Every encrypted disk has a 64-character recovery key, in groups of eight, from letters that type the same on almost every keyboard. With a TPM, a sealed copy lets Settings show it again after an administrator password.

## Device encryption

`trustctl encryption on`, or Settings, encrypts the running system in place with LUKS2.

Requirements, checked first by `trustctl encryption check`:

- UEFI, with the system on a single btrfs partition
- `/boot` and the EFI system partition on their own partitions
- nothing else on the disk that would stay unencrypted, and no other system on the same partition
- 1 GB free, and the computer plugged in

Steps:

1. Save the recovery key.
2. The file system shrinks by 32 MB for the header.
3. At the next restart Sushi shows "Encrypting your device" for a few seconds while the header is written.
4. The rest is encrypted in the background at idle priority, pausing on battery. A crash or power cut loses nothing.
5. When it finishes, the TPM is linked and the disk unlocks without a prompt.

Without a TPM, a passphrase is asked at every start instead. Decrypting works the same way in reverse.

## Other drives

Disks can encrypt other drives in place through `trustd`. Partitions the system needs, swap, LVM and RAID are refused.

- Room for the 32 MB header comes from free space right after the partition (any file system), shrinking ext2/3/4 while unmounted, or shrinking btrfs while mounted. Otherwise the drive can only be encrypted by formatting it.
- Encryption runs in the background, can be paused, and continues when the drive is unlocked again.
- Every drive gets a recovery key; a passphrase is optional.
- **Unlock automatically on this computer** keeps a random key in `/etc/luks-keys` with an `/etc/crypttab` entry, like BitLocker's automatic unlock. It requires device encryption, so the drive's key is protected by the TPM-protected disk.
- Removable drives aren't decrypted in place.

## Luft Keyring

- One file, `~/.local/share/luft-keyring/vault`, encrypted with XChaCha20-Poly1305 under a random master key, including item names.
- The master key is wrapped by your password (Argon2id, 64 MiB, three passes), which always works, and, with a TPM 2.0, by a key sealed to PCR 7. An optional PIN can be added to the TPM wrap.
- Only after the system's sign-in rules succeed does `pam_luft_keyring.so` tell the unlock service, which hands the TPM key only to your own `luft-keyring` (checked by pidfd, installed binary, your user manager's unit, not traced).
- PCR 7 alone is used so kernel updates never cost a password prompt. A changed Secure Boot state means typing your password once.
- While unlocked, the master key sits in locked, non-dumpable memory; locking wipes it and every secret.
- Automatic login never unlocks the keyring.

It protects you when:

- someone has your disk, a copy of it, or the powered-off computer
- the boot chain is changed in a way Secure Boot sees
- another account on the computer, or an app you didn't allow, wants your secrets

It doesn't protect you when:

- someone can sign in as you, or uses the computer while it's unlocked
- malware already runs as you (unsandboxed apps can impersonate each other; per-app access guards against mistakes, not malware)
- root is compromised on a correctly started computer
- a trusted but vulnerable signed component is abused
- memory is read physically while unlocked

## Passkeys

[Luft Passkeys](../kestrel/passkeys/README.md) makes each private key inside the TPM when there is one, so it never leaves the chip; otherwise the keyring holds it and makes the signature itself. Passkeys never leave the computer and are never marked as backed up. Only `luft-passkeys` may use the Passkeys collection.

## USB protection while locked

While the screen is locked, and at the login screen, new USB devices wait until you unlock. Devices already connected keep working.

- Keyboards, mice and security keys (HID) and hubs connect right away. For a device with several parts, only those parts connect; storage, network, serial, audio and vendor-specific parts wait. This stops a gadget that poses as a keyboard and a network adapter at once.
- At unlock everything that waited connects, and Kestrel names it in a notification.
- It uses the kernel's `authorized_default` and `interface_authorized_default` switches per bus, follows logind's lock state, and costs nothing while unlocked. It is not meant to run alongside USBGuard.
- On by default; turning it off in Settings needs an administrator. The choice is kept in `/var/lib/luft-usb-protection`.
