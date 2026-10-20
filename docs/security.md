# Security model

What protects a Luft computer, and against what. The services are [trustd and USB protection](../security/README.md) and [Luft Keyring](../kestrel/keyring/README.md); boot and recovery steps are in [boot.md](boot.md).

## Luft Secure Boot key

- Luft's key is held by the Luft project and signs, in CI, everything that starts the computer: SushiBoot, the startup images and NVIDIA's driver. Its certificate ships in every image, at `/usr/share/luft/secure-boot/luft.der`.
- Shim trusts it once someone confirms it in person on shim's key enrollment screen ([boot.md](boot.md#adding-lufts-secure-boot-key)).
- A second key signs the TPM policy for each startup image. Its public half ships at `/usr/share/luft/secure-boot/pcr-policy.pem`. Keeping it apart means a leaked Secure Boot key alone still can't make a startup image the TPM would unlock the disk for.
- Each startup image names the exact system it belongs to by its composefs digest, and the system's files are checked against it with fs-verity, so a signed image never starts a changed system. Nothing is signed or rebuilt on the computer.
- Shipping a Luft shim with the key built in would remove the one-time enrollment screen, but needs Microsoft's shim review and an HSM-backed CA.

## Games with anti-cheat

Epic's Easy Anti-Cheat for Linux, and others like it, only let a game run when the computer can show it started the way its maker intended. Luft meets each of Epic's requirements by default:

| Requirement | How Luft meets it |
| --- | --- |
| Signed kernel and drivers | The kernel is in the signed startup image, Fedora signs its drivers and Luft's key signs NVIDIA's |
| TPM 2.0 | Used when the computer has one |
| Secure Boot with well-known keys only | Only Fedora's shim, Luft's key and shim's own key; any other key added to shim counts against it, since shim trusts those for drivers too |
| Measured startup | The firmware measures shim, SushiBoot and the startup image into PCR 4, shim measures the Secure Boot state and its keys into PCR 7, SushiBoot measures `loader.conf` into PCR 5 and any command line it passes into PCR 12 like systemd-boot, and the startup image's stub measures itself into PCR 11 |
| IOMMU on, without passthrough | `intel_iommu=on iommu.passthrough=0`; AMD's is on by itself |
| Kernel lockdown in integrity mode, set at startup | `lockdown=integrity` |
| kexec turned off at startup | `sysctl.kernel.kexec_load_disabled=1` |
| The BPF security module | Part of Fedora's kernel |

Settings shows "Ready for games with anti-cheat" under Security, or the first thing missing, such as Secure Boot being off in the firmware. Other keys added to shim can be removed from there; shim's blue screen asks to confirm with a one-time code at the next restart. `trustctl anti-cheat` lists every requirement.

Epic's list of well-known keys doesn't include Luft's key, and nothing on the computer changes that; games that check for it start working once Epic adds it.

Secure Boot and the TPM stay optional. With Secure Boot off, SushiBoot starts the kernel without `lockdown=integrity`, so unsigned drivers load and nothing is locked down against the computer's owner; games with anti-cheat just aren't available then. The IOMMU and kexec settings apply either way. Hibernation isn't available while the kernel is locked down; sleep works as usual.

## Disk unlock with the TPM

The TPM releases the disk key only when both match:

| PCR | Measures | Changes when |
| --- | --- | --- |
| 7 | Secure Boot state and the certificates that vouched for what started | Secure Boot is turned off, keys or the forbidden list change, or something else starts |
| 11 | The startup image, through a policy signed by Luft's policy key | Never for a Luft-signed image; the policy only covers the initramfs, so the running system can't release the key |

- Updates to Luft and ordinary firmware updates keep unlocking without a prompt.
- Once the disk is open, its volume key is measured into PCR 15, so anything sealed to the running system later only opens on this disk.
- A new forbidden list or new keys installed while Luft runs, as Settings and fwupd do, are in the firmware before the restart. As the computer shuts down, trustd works out from the TPM's event log what PCR 7 the next start will measure and seals the disk key to that, so the restart unlocks without a prompt. It never does this when the forbidden list lost entries the key was sealed with, since removing revocations is what an attacker would do.
- When PCR 7 changes any other way, Sushi asks for the recovery key once and says why. trustd doesn't follow the change by itself: Settings says the computer starts differently now, and the TPM unlocks by itself again only after an administrator confirms the change there. A TPM with a PIN can't be sealed again without the PIN, so Settings offers to link it again instead.
- An optional PIN of 6 to 20 digits makes the TPM also require something you know, with its own guessing lockout.
- Every encrypted disk has a 64-character recovery key, in groups of eight, from letters that type the same on almost every keyboard. With a TPM, a sealed copy lets Settings show it again after an administrator password.
- Sushi waits for the recovery key, passphrase or PIN for as long as it takes, and a wrong one just asks again. Only a system disk that never shows up ends in the emergency shell.

### Older signed startup images

The policy key's signature over a startup image never expires, so an older Luft image that was signed once still unlocks the disk if someone starts it from the EFI system partition. Rolling back to the version before an update depends on exactly that, so the old image has to keep working for one step back, and only then stop.

What was weighed:

- **systemd-pcrlock** could limit PCR 11 to the images that are installed, keeping the current and the previous one in a policy stored in the TPM. Every update would rewrite that policy before the restart, from a lock file per image, and a policy that doesn't match what starts asks everyone for their recovery key. It also takes over how the TPM token is sealed, so it would replace the signed policy rather than add to it. Too much can go wrong on every update for what it buys.
- **A version counter in the TPM** that images have to be newer than isn't something systemd's TPM token can check, so the startup would need its own unlocking code in place of systemd-cryptsetup's.

The plan instead is to rotate the policy key when an older image has to stop unlocking:

1. A release that fixes something serious is signed with a new policy key, and ships both public halves.
2. Before restarting into it, trustd adds a second TPM token sealed to the new key and keeps the old one, so going back to the version before still unlocks.
3. Once the new version has started and confirmed itself, trustd removes the token for the old key. From then on, images signed with the old key only open the disk with the recovery key.
4. The old private key is destroyed, and its public half leaves the images after the next release.

Until a rotation is needed, every Luft-signed image keeps unlocking the disk.

## Device encryption

`trustctl encryption on`, or Settings, encrypts the running system in place with LUKS2.

Requirements, checked first by `trustctl encryption check`:

- UEFI, with the system on a single btrfs partition
- the EFI system partition on its own partition
- nothing else on the disk that would stay unencrypted, and no other system on the same partition
- 1 GB free, and the computer plugged in

Steps:

1. Save the recovery key.
2. The file system shrinks by 32 MB for the header, and the plan waits on the EFI system partition, with the recovery key sealed to the TPM (or to the passphrase without one). The plan's fingerprint is sealed with it, so a plan changed on the EFI system partition doesn't open.
3. At the next restart Sushi shows "Encrypting your device" for a few seconds while the header is written. If the file system no longer leaves the 32 MB free, the disk isn't touched: Luft starts unencrypted and Settings says encryption didn't start. Disks won't resize the system's partition while encryption waits for the restart.
4. The rest is encrypted in the background at idle priority, pausing on battery. A crash or power cut loses nothing.
5. When it finishes, the TPM is linked and the disk unlocks without a prompt.

Without a TPM, a passphrase is asked at every start instead. Decrypting works the same way in reverse, with the disk's header kept on the EFI system partition until it finishes, since the startup has to read it before the disk opens.

The EFI system partition can be written by anyone who starts another system on the computer, so the startup trusts nothing on it by itself:

- The plan has to name its disks by plain IDs and the partition Luft starts from; anything else leaves the disk as it is.
- With the TPM, the plan only counts when its fingerprint comes out of the TPM sealed to Luft's startup, and the recovery key next to it has to be one Luft makes. Without one, the passphrase opens the plan and the recovery key together.
- While decrypting, the header on the EFI system partition is only used once the TPM vouches for the plan, or once the passphrase or recovery key typed at startup opens it.

Someone who can start another system can still make a TPM-sealed plan of their own, since sealing doesn't take Luft's startup, only opening does. What such a plan can do stays within the partition Luft starts from and Luft's own way of encrypting it, which they could already change from the other system while it's unencrypted.

Only root can read the EFI system partition and the startup partition, so other accounts can't copy the header or the sealed recovery key and try passphrases against them elsewhere.

## Other drives

Disks can encrypt other drives in place through `trustd`. Partitions the system needs, swap, LVM and RAID are refused.

- Room for the 32 MB header comes from free space right after the partition (any file system), shrinking ext2/3/4 while unmounted, or shrinking btrfs while mounted. Otherwise the drive can only be encrypted by formatting it.
- Encryption runs in the background, can be paused, and continues when the drive is unlocked again.
- Every drive gets a recovery key; a passphrase is optional.
- **Unlock automatically on this computer** keeps a random key in `/etc/luks-keys` with an `/etc/crypttab` entry, like BitLocker's automatic unlock. It requires device encryption, so the drive's key is protected by the TPM-protected disk.
- Removable drives aren't decrypted in place.

## Luft Keyring

- One file, `~/.local/share/luft-keyring/vault`, encrypted with XChaCha20-Poly1305 under a random master key, including item names.
- The master key is wrapped by your password (Argon2id, 64 MiB, three passes), which always works, and, with a TPM 2.0, by a key sealed to PCR 7 and PCR 15. An optional PIN can be added to the TPM wrap.
- Only after the system's sign-in rules succeed does `pam_luft_keyring.so` tell the unlock service, which hands the TPM key only to your own `luft-keyring` (checked by pidfd, installed binary, your user manager's unit, not traced).
- `luft-keyring` is installed setgid to its own `luft-keyring` group. Starting with that group makes the kernel shield it from the first instruction: your other programs can't trace it, read its memory or slip libraries into it, even through a changed unit. The unlock service only answers a keyring that is running with the group, so one started under a debugger or with no new privileges gets no key.
- PCR 7 ties the seal to the Secure Boot state, and PCR 15 to this installation: with device encryption the disk's volume key is measured into it at every start, so another system the firmware would start, even a signed one, can't unseal it. Kernel and Luft updates change neither, so they never cost a password prompt. A changed Secure Boot state means typing your password once.
- Without device encryption, PCR 15 only holds values another system could read off the disk and measure itself, so the seal then rests on Secure Boot alone. Turn on device encryption to have it bound to this computer's own installation.
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

## Flatpak apps with full access

Kestrel and Luft's services hold Flatpak apps to their sandbox: no background clipboard, no windows kept above others or out of the taskbar, no screen recording or display changes without the portal, and none of the shell's private services. Apps listed in `/etc/kestrel/trusted-apps` are treated like apps installed on the system instead, and Schelf also opens their sandbox for the account with a Flatpak override. The list belongs to root and changes only through the updater, after an administrator's password, so an app can't give itself full access, even one allowed to write to your home folder or settings. An app is recognised by the app ID Flatpak gives it, which an app inside a sandbox can't change. 1Password, KeePassXC and Bitwarden may use the clipboard in the background without full access.

## Passkeys

[Luft Passkeys](../kestrel/passkeys/README.md) makes each private key inside the TPM when there is one, so it never leaves the chip; otherwise the keyring holds it and makes the signature itself. Passkeys never leave the computer and are never marked as backed up. Only `luft-passkeys` may use the Passkeys collection.

## USB protection while locked

While the screen is locked, and at the login screen, new USB devices wait until you unlock. Devices already connected keep working.

- Keyboards, mice and security keys (HID) and hubs connect right away. For a device with several parts, only those parts connect; storage, network, serial, audio and vendor-specific parts wait. This stops a gadget that poses as a keyboard and a network adapter at once.
- At unlock everything that waited connects, and Kestrel names it in a notification.
- It uses the kernel's `authorized_default` and `interface_authorized_default` switches per bus, follows logind's lock state, and costs nothing while unlocked. It is not meant to run alongside USBGuard.
- On by default; turning it off in Settings needs an administrator. The choice is kept in `/var/lib/luft-usb-protection`.
