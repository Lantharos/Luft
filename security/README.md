# Security

Luft's device security services: device trust (Secure Boot, the TPM and disk encryption) and USB protection while the screen is locked.

## Device trust

`trustd` looks after how the computer starts and how the disk is protected: Luft's own Secure Boot key, a signed way to start the computer, unlocking the disk with the TPM, and encrypting or decrypting the disk in place. Settings shows all of it on its Security page; `trustctl` does the same from the command line.

### How the computer starts

1. The firmware starts Fedora's shim, which Microsoft signs, from a boot entry called Luft.
2. Shim starts SushiBoot, Luft's boot menu, signed with this computer's Luft key.
3. SushiBoot starts a unified kernel image: the kernel, its initramfs and its command line in one file, signed with the same key. The newest one starts by default; holding a key while SushiBoot starts shows the menu.
4. The kernel image's stub records what it started in the TPM, and the TPM releases the disk key only if the computer started this way.

Every piece is checked against a signature before it runs, and nothing can be changed at startup, including the kernel command line.

Signed images are kept for the three newest installed kernels. SushiBoot shows the newest at the top and the others under Previous versions. A kernel-install plugin builds and signs the image for each kernel as it is installed and deletes it when the kernel is removed. When the EFI system partition runs short of room, an image being rebuilt makes room by going first, a new kernel's image makes room by removing the oldest previous versions, and the newest image is never removed to make room for an older one.

The images get an initramfs of their own, made for this one job: finding and unlocking the system disk. Graphics drivers and their firmware stay out of it, since the firmware's framebuffer carries the splash until the real driver loads after the switch to the installed system, and so does Plymouth while Sushi is the splash. With an NVIDIA card that matters most: dracut would otherwise add nouveau and around 100 MB of GPU firmware, making each image close to 190 MB instead of about 80 MB. Changing only the command line reuses the initramfs already inside each image.

To have a graphics driver in the initramfs anyway, ask dracut for it in `/etc/dracut.conf.d`, for example `force_drivers+=" nvidia nvidia_modeset nvidia_uvm nvidia_drm "` (with underscores), and run `sudo trustctl startup rebuild`. dracut keeps drivers it's explicitly asked for, so the signed images include it, and fewer previous versions fit.

Until GRUB is removed, Fedora's own entry still starts shim and GRUB. That works as before, but the TPM won't unlock the disk that way, so it asks for the recovery key.

### When a new kernel doesn't start

Every newly signed image gets three tries. A new kernel's image starts with them, and so does an image signed again, for example after the command line or the initramfs changed, because what it starts isn't the same as before. Taking a `--once` profile in and out (see below) changes nothing about the main profile and keeps the count where it was.

The count is part of the file name, the way systemd-boot does it: `luft-VERSION+3.efi` hasn't started yet, and SushiBoot renames it to `luft-VERSION+2-1.efi` (two tries left, one used) just before starting it. Once Kestrel's login screen is showing, or the desktop when signing in happens automatically, Kestrel tells `trustd`, which renames the image to `luft-VERSION.efi`: it works, and isn't counted any more. Only starts of the main profile count; Rescue and `--once` profiles never use up a try or mark an image as working.

So the tries run out without anyone at the keyboard, the signed command line restarts the computer when starting fails: `panic=10` restarts ten seconds after a kernel panic, and `rd.shell=0 rd.emergency=reboot` restarts when the initramfs can't continue, such as when the system disk never appears, instead of waiting at an emergency shell that a locked root account can't use anyway. They're added to the main and `--once` lines unless `/etc/kernel/cmdline` sets them itself, and left out of Rescue so its messages stay on screen.

When an image has no tries left, SushiBoot starts the newest one that has, and lists the one that didn't start under Previous versions, where it can still be chosen by hand. At that start `trustd` notes which version didn't start, and after signing in Kestrel says so in a notification, once. The image is renamed to `luft-VERSION+0.efi`, so it isn't reported again, and stays out of the way until it is signed again, for example by the next `trustctl startup rebuild`, which gives it three new tries. A newer kernel gets its own tries as usual. `trustctl status` shows the version that didn't start for the rest of that boot.

The TPM unlocks the disk the same way whichever image starts: each image carries the signed PCR 11 policy for itself, and the file name isn't measured.

### Rescue

Every image also holds a Rescue profile, shown under the newest version. It starts the system into `rescue.target` with messages on screen and the splash off.

The rescue command line is signed like the normal one, but no PCR 11 policy is signed for it, so the TPM never unlocks the disk in rescue: it asks for the recovery key or the passphrase. Rescue is for when something is wrong, possibly the TPM link itself (a firmware update that changed what Secure Boot measures, say), so it must not depend on the TPM. Anyone who can type the recovery key can read the disk anyway, so once the disk is unlocked this way, rescue opens a root shell even though Fedora locks the root account. If root has a password, it asks for that as usual. On a disk that isn't encrypted, rescue asks for root's password and is no way around it.

### The kernel command line

The command line is inside the signed images, built from `/etc/kernel/cmdline`, and changed with `trustctl`:

```bash
trustctl startup arguments                                   # show it
trustctl startup arguments --add "quiet loglevel=3"         # add arguments and rebuild every image
trustctl startup arguments --remove "quiet loglevel"        # take arguments out by name
trustctl startup arguments --once --add "systemd.log_level=debug"   # for the next start only
```

`--once` adds a signed profile with the changed command line to the newest image and asks SushiBoot to start it once, through the `LoaderEntryOneShot` variable of the Boot Loader Interface. The TPM unlocks it as usual. At that start `trustd` takes the profile out again, so the start after it is the usual one whether it worked or not.

SushiBoot has no command line editor, and with Secure Boot on it never hands a command line of its own to anything it starts. It ignores boot entries that start a kernel directly, whose command line and initramfs no signature covers, and drops the options of entries that start EFI programs. The only thing it tells a kernel image is which of its signed profiles to start. A command line typed at the boot menu could start the system with `init=/bin/sh`, skipping the login screen and everything after it, so changing it takes root on the running system, which signs the images again.

### Starting without GRUB and GNOME's services

Once the signed startup has started the computer and Kestrel is your desktop, GRUB can go, together with the GNOME services Kestrel replaces (Mutter, gnome-settings-daemon, the GNOME and GTK portals, GNOME Keyring and oo7):

```bash
security/scripts/remove-grub-and-gnome.sh
```

It asks for your password through `sudo`. Before changing anything it checks that:

- this start went through SushiBoot and a signed image, with Secure Boot on and the Luft key enrolled,
- the signed images of the running kernel and the ones before it are on the EFI system partition and signed with the Luft key, so there is a previous version to go back to,
- `\EFI\BOOT\BOOTX64.EFI` is Fedora's shim with its fallback program, and the Luft boot entry exists,
- Kestrel runs on its own Mutter, answers apps' portal requests, and Luft Keyring is your keyring.

It offers to make a recovery stick, then works out exactly what dnf would remove and stops if that includes anything besides GRUB's packages, grubby, os-prober, the rescue initramfs configuration, the 32-bit shim, the installer (which needs GRUB), the GNOME services above and what only exists for them, or anything Kestrel uses. Packages that only GNOME's services asked for but Kestrel needs, such as libeis, libinput and the location and sensor services, are marked as wanted on their own, so a later `dnf autoremove` leaves them alone. Nothing else is removed along the way. Then it:

1. Builds and installs `luft-startup`, a small package that takes GRUB's place. Fedora's shim package requires `grub2-efi-x64`, akmods requires `grubby` and the NVIDIA driver requires `/usr/bin/grubby`, so it provides all three and replaces the GRUB packages, the 32-bit shim and the rescue initramfs configuration, keeping them from returning with updates; dnf's settings exclude them as well. Its `grubby` changes the command line of the signed images through `trustctl startup arguments` (`grubby --update-kernel=ALL --args=... --remove-args=...`) and names the newest kernel for `--default-kernel`. It also sets kernel-install's layout to `other` with `trustd` as the initramfs generator, so kernel-install leaves `/boot` alone and only the plugin builds the initramfs and the signed image.
2. Removes the GNOME services in the same transaction.
3. Saves GRUB's settings and boot entries to `/var/lib/trustd/grub-DATE.tar.gz` and removes them, along with the rescue images and GRUB's initramfs files in `/boot`.
4. Runs `trustctl startup install`, which now also signs SushiBoot as `\EFI\fedora\grubx64.efi`, the program shim starts when nothing else is asked for, then checks the result.

After that every way of starting shim ends in SushiBoot: the Luft entry, Fedora's entry, and `\EFI\BOOT\BOOTX64.EFI`, which firmware starts when it has no boot entries. Shim updates replace shim, MokManager and the fallback program, which belong to the shim package, and leave `grubx64.efi` alone. Kernel updates go through the plugin as before and leave nothing in `/boot` but what the kernel package itself puts there.

If a new kernel doesn't start, the computer goes back to the version before it after three tries (see [When a new kernel doesn't start](#when-a-new-kernel-doesnt-start)). To get there sooner, hold any key while the computer starts and choose the version before it under Previous versions, or Rescue. From a running system, `sudo bootctl set-oneshot luft-VERSION.efi@main` starts that version once.

Other desktops that relied on GNOME's portals, such as niri, lose them; Kestrel provides its own.

### When the firmware forgets its settings

Firmware that loses its boot entries, after a reset or some firmware updates, starts `\EFI\BOOT\BOOTX64.EFI`. Shim's fallback program there recreates Fedora's entry from `\EFI\fedora\BOOTX64.CSV` and restarts, shim starts SushiBoot, and the TPM still unlocks the disk. At that start `trustd` puts the Luft entry back at the front of the boot order.

Some firmware also clears shim's list of keys when its settings are reset to defaults. Shim then refuses SushiBoot with "Verification failed: (0x1A) Security Violation". Choose OK, press a key for MOK management, and choose Enroll key from disk, the EFI system partition, `EFI`, `sushi`, `luft-secure-boot.cer`, Continue, Yes and Reboot. `trustd` keeps that copy of the key's certificate on the partition for this. With the same keys back, the TPM unlocks the disk again.

### Recovery stick and putting GRUB back

`security/scripts/recovery-stick.sh` writes a Fedora Workstation live image to a USB stick. It downloads the image for this Fedora release, or the one before while a release isn't out yet, checks it against Fedora's signed checksums, and reads the stick back after writing. It can also write an image that's already downloaded. The stick starts with Secure Boot on and needs no Luft key.

To put GRUB back on a computer that still starts:

```bash
sudo dnf swap luft-startup grub2-efi-x64
sudo dnf install grub2-tools grubby
sudo tar -C / -xzf /var/lib/trustd/grub-DATE.tar.gz boot/grub2 boot/efi/EFI/fedora/grub.cfg
for kernel in /usr/lib/modules/*/vmlinuz; do sudo kernel-install add "$(basename "$(dirname "$kernel")")" "$kernel"; done
```

Removing `luft-startup` brings back kernel-install's usual layout and lifts dnf's exclusions, GRUB takes `\EFI\fedora\grubx64.efi` back, and kernel-install writes GRUB's boot entries again. The Luft entry keeps working next to it; `trustctl startup uninstall` removes it.

When the computer doesn't start, start it from the recovery stick, open a terminal, mount the installed system and run the same commands inside it. With the partitions of a default Fedora install on an NVMe disk:

```bash
sudo cryptsetup open /dev/nvme0n1p3 root      # only if the disk is encrypted; asks for the recovery key
sudo mount -o subvol=root /dev/mapper/root /mnt   # or /dev/nvme0n1p3 when it isn't encrypted
sudo mount /dev/nvme0n1p2 /mnt/boot
sudo mount /dev/nvme0n1p1 /mnt/boot/efi
for fs in dev proc sys run; do sudo mount --rbind /$fs /mnt/$fs; done
sudo chroot /mnt
```

If the firmware lost Fedora's entry as well, add it back from inside: `efibootmgr --create --disk /dev/nvme0n1 --part 1 --label Fedora --loader '\EFI\fedora\shimx64.efi'`.

### The Luft Secure Boot key

The key is made on the computer the first time it's needed. Its private half never leaves the computer and is never stored in the clear: it is sealed with `systemd-creds` against the TPM and a secret only root can read, in `/var/lib/trustd`. A copy of the disk, or the disk in another computer, can't open it. It is unsealed into a private folder under `/run/trustd` only while something is being signed, and removed right after. On a computer without a usable TPM, a key is only made once the disk is encrypted, so that it is at least protected by the disk's passphrase; without either, Settings explains why no key can be made.

Shim only trusts keys you confirm in person. Adding the key asks shim to enroll it at the next restart, using a one-time code of eight digits. Before restarting, Sushi shows what will happen and what to type, and waits for Enter. After the restart, shim's blue key management screen waits ten seconds for a key press; then choose Enroll MOK, Continue, Yes, type the code, and choose Reboot.

Shim forgets the request once its screen has been shown, whether the key was added or not. So at every startup `trustd` compares what it asked for, kept in `/var/lib/trustd`, with the keys shim actually trusts. If the screen timed out, Continue boot was chosen, or the code was typed wrong three times, it asks shim again with a new code. Sushi then shows the steps again at the next restart, saying that the key wasn't added last time, and a notification after signing in says the same. After three restarts without the key, it stops asking by itself; Settings says so and offers to try again. Cancelling withdraws the request and stops the retries.

The key signs SushiBoot, the kernel images (a kernel-install plugin signs each new kernel as it is installed), and kernel modules built by DKMS. Drivers built with akmods, such as NVIDIA's, keep their own key, which akmods made and which Settings shows next to Luft's: akmods builds modules as an unprivileged user that can read that key, so it must never be able to sign what starts the computer.

### Unlocking the disk with the TPM

The TPM releases the disk key only when two things match:

- PCR 7, the Secure Boot state: whether Secure Boot is on, which keys the firmware trusts, and which certificates vouched for what started (here, the Luft key). Booting anything else, turning Secure Boot off or adding a key to the firmware changes it.
- PCR 11, the unified kernel image itself, through a policy signed with a second key of Luft's (kept the same way as the Secure Boot key). Each new kernel image comes with a signature for what it will measure, so kernel and initramfs updates keep unlocking without touching the disk. The signature only covers the initramfs, so even root can't make the TPM release the key once the system is running.

In the initramfs, unlocking waits until the step that marks entering the initramfs has been added to PCR 11, so the signed policy is never checked against an unfinished measurement.

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

Turning encryption off decrypts in place in the background the same way. The encryption header is moved to `/boot/trustd` meanwhile, so the start of the disk can be put back, and the startup files know where to find it. When decryption finishes, the header, the recovery key copy and the TPM link are removed.

Without a usable TPM, encryption works with a passphrase instead, asked for by Sushi at every startup. The recovery key is then protected with that passphrase for the one restart that starts encrypting, and isn't kept afterwards.

### Command line

```bash
trustctl status                    # Secure Boot, the TPM, the key, the startup and the disk
trustctl secure-boot enroll        # make the key and ask shim to trust it at the next restart
trustctl secure-boot cancel        # withdraw that, including any retries
trustctl startup install           # SushiBoot, signed kernel images and the Luft boot entry
trustctl startup uninstall         # remove them again while GRUB is still installed
trustctl startup rebuild           # rebuild the initramfs and the signed images
trustctl startup arguments         # show or change the kernel command line (see above)
trustctl tpm enroll [--pin]        # let the TPM unlock an encrypted disk
trustctl tpm remove
trustctl recovery-key show|replace
trustctl encryption check|on|off
trustctl sign efi IN OUT           # sign an EFI program with the Luft key
```

They need root. `trustd.service` starts at boot to continue encrypting or decrypting, to put the Luft boot entry back if the firmware lost it, to take out a profile started with `--once`, and to note an image that ran out of tries; otherwise it stops after a minute without requests.

### D-Bus

`com.lantharos.Trust1` on the system bus, described in `data/trust/com.lantharos.Trust1.xml`. Reading the state is open to everyone. Checking whether the disk can be encrypted needs `com.lantharos.trust.check`, changing encryption or unlocking needs `com.lantharos.trust.manage-encryption`, showing the recovery key needs `com.lantharos.trust.show-recovery-key` (every time), and the Secure Boot key and startup need `com.lantharos.trust.manage-secure-boot`. `StartupFinished`, which the login screen and the desktop call once they're up, is open to everyone: all it does is mark the image this boot started from as working.

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

Installing changes nothing about how the computer starts or how the disk is protected; each of those is a separate step in Settings or on the command line. Removing the services keeps `/var/lib/trustd`, which holds the sealed keys and, on an encrypted disk, the recovery key copy. While GRUB is installed, run `trustctl startup uninstall` first if you want the Luft boot entry gone as well; an encrypted disk keeps working with Fedora's own startup, asking for its recovery key or passphrase. Once GRUB is removed, the signed startup is how the computer starts, and `trustd` has to stay.
