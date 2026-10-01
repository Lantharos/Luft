# Security

Luft's device security services: device trust (Secure Boot, the TPM and disk encryption) and USB protection while the screen is locked.

## Device trust

`luft-trust` looks after how the computer starts and how the disk is protected: Luft's own Secure Boot key, a signed way to start the computer, unlocking the disk with the TPM, and encrypting or decrypting the disk in place. Settings shows all of it on its Security page; the same things are available from the command line.

### How the computer starts

Fedora starts through shim, which Microsoft signs, then GRUB and the kernel, all signed by Fedora. Luft keeps that path and adds its own next to it:

1. The firmware starts Fedora's shim from a boot entry called Luft.
2. Shim starts SushiBoot, Luft's boot menu, signed with this computer's Luft key.
3. SushiBoot starts a unified kernel image: the kernel, its initramfs and its command line in one file, signed with the same key. The newest one starts by default; holding a key while SushiBoot starts shows the menu.
4. The kernel image's stub records what it started in the TPM, and the TPM releases the disk key only if the computer started this way.

Every piece is checked against a signature before it runs, and nothing can be changed at startup, including the kernel command line. Fedora's own entry stays in the firmware's boot list as a fallback. Starting through it works as before, but the TPM won't unlock the disk, so it asks for the recovery key.

### The Luft Secure Boot key

The key is made on the computer the first time it's needed. Its private half never leaves the computer and is never stored in the clear: it is sealed with `systemd-creds` against the TPM and a secret only root can read, in `/var/lib/luft-trust`. A copy of the disk, or the disk in another computer, can't open it. It is unsealed into a private folder under `/run/luft-trust` only while something is being signed, and removed right after. On a computer without a usable TPM, a key is only made once the disk is encrypted, so that it is at least protected by the disk's passphrase; without either, Settings explains why no key can be made.

Shim only trusts keys you confirm in person. Adding the key asks shim to enroll it at the next restart, using a one-time code of eight digits. Before restarting, Sushi shows what will happen and what to type, and waits for Enter. After the restart, shim's blue key management screen waits ten seconds for a key press; then choose Enroll MOK, Continue, Yes, type the code, and choose Reboot. If the screen times out, nothing is added and the key can be requested again.

The key signs SushiBoot, the kernel images (a kernel-install plugin signs each new kernel as it is installed), and kernel modules built by DKMS. Drivers built with akmods, such as NVIDIA's, keep their own key, which akmods made and which Settings shows next to Luft's: akmods builds modules as an unprivileged user that can read that key, so it must never be able to sign what starts the computer.

### Unlocking the disk with the TPM

The TPM releases the disk key only when two things match:

- PCR 7, the Secure Boot state: whether Secure Boot is on, which keys the firmware trusts, and which certificates vouched for what started (here, the Luft key). Booting anything else, turning Secure Boot off or adding a key to the firmware changes it.
- PCR 11, the unified kernel image itself, through a policy signed with a second key of Luft's (kept the same way as the Secure Boot key). Each new kernel image comes with a signature for what it will measure, so kernel and initramfs updates keep unlocking without touching the disk. The signature only covers the initramfs, so even root can't make the TPM release the key once the system is running.

This combination survives kernel updates and ordinary firmware updates, which change the firmware's own measurements (PCR 0 to 2) that aren't used. What changes PCR 7 is rare and worth a second look: a revocation update to the firmware's forbidden list, a new Secure Boot key, or starting some other way. Then the startup screen asks for the recovery key and explains why, and Settings offers to link the TPM again. `systemd-pcrlock` could follow those changes on its own, but it is still marked experimental, and the disk key shouldn't depend on it.

A PIN of 6 to 20 digits can be added, so the TPM also needs something you know before it unlocks; it is checked by the TPM, which slows down guessing on its own. Digits keep it independent of the keyboard layout at startup.

Every encrypted disk has a recovery key: 64 letters from an alphabet that types the same on almost every keyboard, in groups of eight. Sushi accepts it with or without the dashes. Where there is a TPM, a copy is kept sealed by the TPM on the encrypted disk, so Settings can show it again (after asking for an administrator's password) and change unlocking without asking for it.

### Device encryption

Turning on encryption encrypts the existing system in place with LUKS2.

Before it starts, a check runs without changing anything. Encryption needs UEFI, the system on a single btrfs partition (btrfs can make room for the encryption header while in use), `/boot` and the EFI system partition on their own partitions, nothing else on the disk that would stay unencrypted (another partition in use, a swap partition), no other operating system on the same partition, 1 GB of free space, and the computer plugged in. Anything else is refused with the reason rather than guessed at. Disks other than the system disk are left as they are.

Then:

1. The recovery key is shown and has to be saved first.
2. The file system shrinks by 32 MB to make room for the encryption header, and the recovery key is sealed by the TPM for the next start, bound to the same PCR policy as the disk itself. A PIN chosen now starts being asked once encryption finishes.
3. At the next restart, Sushi shows "Encrypting your device" for the few seconds it takes to write the header and move the start of the disk, before the system is mounted.
4. The rest happens in the background while the computer is in use, at idle priority, pausing on battery. Settings shows the progress.
5. When it finishes, the TPM is linked to the disk, and from the next start the disk unlocks with no prompt at all.

LUKS2 keeps a journal of the area it is working on, so a crash or power cut at any point loses nothing: the next start finishes the interrupted step and the background work continues where it stopped. Until encryption finishes, the startup files themselves carry what is needed to open the disk, so a restart in the middle unlocks the same way.

Turning encryption off decrypts in place in the background the same way. The encryption header is moved to `/boot/luft-trust` meanwhile, so the start of the disk can be put back, and the startup files know where to find it. When decryption finishes, the header, the recovery key copy and the TPM link are removed.

Without a usable TPM, encryption works with a passphrase instead, asked for by Sushi at every startup. The recovery key is then protected with that passphrase for the one restart that starts encrypting, and isn't kept afterwards.

### Command line

```bash
luft-trust status                    # Secure Boot, the TPM, the key, the startup and the disk
luft-trust secure-boot enroll        # make the key and ask shim to trust it at the next restart
luft-trust secure-boot cancel        # withdraw that before restarting
luft-trust startup install           # SushiBoot, signed kernel images and the Luft boot entry
luft-trust startup uninstall         # remove them again; Fedora's entry is untouched
luft-trust tpm enroll [--pin]        # let the TPM unlock an encrypted disk
luft-trust tpm remove
luft-trust recovery-key show|replace
luft-trust encryption check|on|off
luft-trust sign efi IN OUT           # sign an EFI program with the Luft key
```

They need root. `luft-trust.service` starts at boot to continue encrypting or decrypting, and otherwise stops after a minute without requests.

### D-Bus

`com.lantharos.Trust1` on the system bus, described in `data/trust/com.lantharos.Trust1.xml`. Reading the state is open to everyone. Checking whether the disk can be encrypted needs `com.lantharos.trust.check`, changing encryption or unlocking needs `com.lantharos.trust.manage-encryption`, showing the recovery key needs `com.lantharos.trust.show-recovery-key` (every time), and the Secure Boot key and startup need `com.lantharos.trust.manage-secure-boot`.

### A shim of Luft's own

Enrolling a key through MokManager is the one step that needs someone at the keyboard. To drop it, Luft would ship its own shim with Luft's certificate built in, signed by Microsoft through the shim review process. That needs:

- A Luft Secure Boot CA kept in a hardware security module, with a documented process for who can sign and how, and separate keys for signing releases.
- A reproducible shim build from an upstream release, submitted as an issue to the shim-review repository with the build, its hashes, SBAT entries for Luft, and answers about how the keys are protected, how revocation works, and how kernels are signed and kept up to date.
- A boot chain that meets the review's rules: a signed GRUB or systemd-boot with current SBAT generations (SushiBoot would need the same scrutiny), kernels with lockdown enforced under Secure Boot, and prompt security updates.
- An organisation with a verified Microsoft Hardware Dev Center account to submit the reviewed shim for signing, and the means to publish revocations (SBAT and dbx) when something goes wrong.

Until then, Fedora's shim and the per-computer Luft key give the same protection, at the cost of the enrollment screen once per computer.

## USB protection while locked

While the screen is locked, and at the login screen before anyone signs in, newly plugged USB devices wait. Devices that were already connected keep working. When you unlock, everything that waited is connected and Kestrel shows a notification naming what has just become available.

Keyboards, mice, and security keys are the exception, because you may need a new keyboard to type your password. A device that has a keyboard, mouse, or security key part gets only that part connected while locked; its other parts, such as storage, a network adapter, a serial port, audio, or anything vendor specific, wait for the unlock. Hubs are connected so a keyboard behind a dock still works, and the devices behind them are judged the same way. A device with no keyboard, mouse, or security key part waits entirely.

At the lock screen a keyboard can only type into the password field, much like a person sitting at the computer. The attacks this protection is for come through the other parts: a network adapter that quietly becomes the computer's route to the internet and intercepts its traffic, a disk crafted to exploit the code that reads file systems, or a gadget that pretends to be a keyboard and a network adapter at once. Connecting each part of a device separately lets the keyboard half of such a gadget work while its network half waits.

The service is `luft-usb-protection`, running as root from early boot, before the login screen starts, so devices present at boot are connected as usual. It is on by default and can be turned off in Settings; turning it off connects everything that waited straight away and returns USB to its usual behaviour. Changing it asks for an administrator's password. The choice is kept in `/var/lib/luft-usb-protection`. Stopping the service also returns USB to its usual behaviour.

### How it works

The kernel decides for each USB bus whether new devices, and new parts of devices (interfaces), are allowed in. While nobody is signed in and unlocked, the service sets `authorized_default` and `interface_authorized_default` to 0 on every bus, including buses that appear later, such as a dock's. The kernel still reads a waiting device's descriptors, so the service looks at the interface classes in `descriptors` when the device appears. If one of them is a keyboard, mouse, or security key (HID, class 3) or a hub (class 9), it authorizes the device and then just those interfaces, asking the kernel to bind their drivers. Everything else stays unauthorized and no driver ever touches it.

Locked or not comes from logind: the service follows seat0's active session and treats it as unlocked when it is a user session whose `LockedHint` is off. The greeter and lock screen sessions, or no session at all, count as locked. Changes are picked up from logind's signals the moment they happen, and new devices from the kernel's uevents, so nothing is polled.

On unlock the bus defaults go back to the kernel's own policy (the `usbcore.authorized_default` parameter), every waiting device and interface is authorized, and the `Released` signal lists them by name.

The kernel's own switches are used rather than USBGuard. USBGuard is built around allow lists of known devices, which is not what this needs: the decision here depends only on whether the computer is locked right now. Using the kernel directly means no extra daemon or policy file, no rules to keep in sync with the lock state, and no cost at all for devices plugged in while you are using the computer, because the kernel handles them exactly as it would without the service. The two are not meant to run side by side.

### D-Bus

`com.lantharos.UsbProtection1` on the system bus, described in `data/usb/com.lantharos.UsbProtection1.xml`:

- `Enabled`: whether new devices wait while locked.
- `Guarding`: whether new devices are waiting right now.
- `Held`: the devices waiting so far, as (id, name), the id being the kernel's name such as `3-2`.
- `SetEnabled(b)`: turns the protection on or off; requires `com.lantharos.usb-protection.configure`.
- `Released(a(ss))`: emitted on unlock with the devices that are now connected.
- `TakeReleased() -> a(ss)`: returns the devices connected by the last unlock and forgets them, so a session that starts after signing in can still announce them once. Only the person whose session is active on seat0 may take them, and the list is cleared as soon as devices start waiting again.

## Installing

```bash
security/scripts/install.sh install   # build, install, and start both services
security/scripts/install.sh remove    # stop and remove them
```

`security/scripts/build.sh DESTDIR` builds and stages the files without installing them. In the Sushi VM, `boot/sushi/scripts/vm/security.sh` puts them in the VM's root tree before `disk.sh`.

Installing changes nothing about how the computer starts or how the disk is protected; each of those is a separate step in Settings or on the command line. Removing the services keeps `/var/lib/luft-trust`, which holds the sealed keys and, on an encrypted disk, the recovery key copy. Run `luft-trust startup uninstall` first if you want the Luft boot entry gone as well; an encrypted disk keeps working with Fedora's own startup, asking for its recovery key or passphrase.
