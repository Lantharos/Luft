# Boot and recovery

How a Luft computer starts, and what to do when it doesn't. The services involved are [trustd](../security/README.md), [SushiBoot and Sushi](../boot/sushi/README.md).

## How the computer starts

1. The firmware starts Fedora's shim (signed by Microsoft) from the boot entry called Luft.
2. Shim starts SushiBoot, signed with this computer's Luft key.
3. SushiBoot starts a unified kernel image (kernel, initramfs and command line in one file), signed with the same key. The newest starts by default.
4. The image's stub measures what it started into the TPM, which releases the disk key only if the computer started this way.

Nothing can be changed at startup, including the kernel command line.

- Signed images are kept for the three newest kernels, in `EFI/Linux` on the EFI system partition. A kernel-install plugin builds and signs one per installed kernel.
- The images carry their own initramfs with the graphics driver of each card in the computer (never nouveau; NVIDIA's driver with only the firmware its cards need).
- Drivers built by akmods arrive after the kernel. `trustctl startup refresh` rebuilds the affected images when akmods finishes (`trustd-refresh.path`), at shutdown and at startup.
- Until GRUB is removed, Fedora's own entry still starts GRUB, but the TPM won't unlock the disk that way and it asks for the recovery key.

## Adding the Luft Secure Boot key

The key is made on the computer the first time it is needed (`trustctl secure-boot enroll`, or Settings). Shim only trusts it after you confirm in person:

1. Before restarting, Sushi shows the steps and an eight-digit code, and waits for Enter.
2. After the restart, shim's blue screen waits ten seconds for a key press.
3. Choose Enroll MOK, Continue, Yes, type the code, and choose Reboot.

If the screen timed out or the code was wrong, `trustd` asks shim again with a new code at the next start, up to three times; after that Settings offers to try again.

## When a new kernel doesn't start

Every newly signed image gets three tries, counted in its file name the way systemd-boot does:

| File name | Meaning |
| --- | --- |
| `luft-VERSION+3.efi` | Not started yet, three tries |
| `luft-VERSION+2-1.efi` | Two tries left, one used |
| `luft-VERSION.efi` | Known to work (marked once the login screen or desktop appears) |
| `luft-VERSION+0.efi` | Didn't start; listed under Previous versions until it is signed again |

The main command line includes `panic=10 rd.shell=0 rd.emergency=reboot`, unless `/etc/kernel/cmdline` sets them, so failed starts restart on their own. When an image runs out of tries, SushiBoot starts the newest one that still has tries, and Kestrel says so in a notification.

To go back sooner:

- Hold any key while the computer starts and choose a version under Previous versions, or Rescue.
- From a running system: `sudo bootctl set-oneshot luft-VERSION.efi@main`.

## Rescue

Every image has a Rescue profile, shown under the newest version. It starts `rescue.target` with messages on screen and the splash off. The TPM never unlocks the disk in Rescue, so it asks for the recovery key or passphrase, then opens a root shell (or asks for root's password if root has one).

## Kernel command line

The command line is built from `/etc/kernel/cmdline` and lives inside the signed images.

```sh
trustctl startup arguments                                        # show it
trustctl startup arguments --add "quiet loglevel=3"               # add, and rebuild every image
trustctl startup arguments --remove "quiet loglevel"              # remove by name
trustctl startup arguments --once --add "systemd.log_level=debug" # next start only
```

`--once` adds a signed profile to the newest image and starts it once through `LoaderEntryOneShot`; `trustd` removes it again at that start.

## Removing GRUB and GNOME services

The last step of setting up Luft on a fresh Fedora install. Run it once the signed startup works and Kestrel is your desktop:

```sh
security/scripts/remove-grub-and-gnome.sh
```

Before changing anything it checks that this start went through SushiBoot with Secure Boot on and the Luft key enrolled, that signed images for the running and previous kernels exist, that shim's fallback and the Luft entry are in place, and that Kestrel and Luft Keyring are running. It offers to make a recovery stick, and stops if dnf would remove anything unexpected. Then it:

1. Installs `luft-startup`, which takes the place of GRUB, grubby and the 32-bit shim (its `grubby` forwards to `trustctl startup arguments`) and sets kernel-install's layout to `other` with `trustd` as the initramfs generator.
2. Removes Mutter, gnome-settings-daemon, the GNOME and GTK portals, GNOME Keyring and oo7.
3. Saves GRUB's settings and entries to `/var/lib/trustd/grub-DATE.tar.gz` and removes them from `/boot`.
4. Runs `trustctl startup install`, which also signs SushiBoot as `\EFI\fedora\grubx64.efi`, so every way of starting shim ends in SushiBoot.

Other desktops that relied on GNOME's portals, such as niri, lose them.

## When the firmware forgets its settings

- **Boot entries lost:** the firmware starts `\EFI\BOOT\BOOTX64.EFI`, shim's fallback recreates Fedora's entry, and `trustd` puts the Luft entry back first at the next start. Nothing to do.
- **Shim's keys cleared** ("Verification failed: (0x1A) Security Violation"): choose OK, press a key for MOK management, then Enroll key from disk, the EFI system partition, `EFI`, `sushi`, `luft-secure-boot.cer`, Continue, Yes and Reboot. The TPM unlocks the disk again afterwards.

## Putting GRUB back

On a computer that still starts:

```sh
sudo dnf swap luft-startup grub2-efi-x64
sudo dnf install grub2-tools grubby
sudo tar -C / -xzf /var/lib/trustd/grub-DATE.tar.gz boot/grub2 boot/efi/EFI/fedora/grub.cfg
for kernel in /usr/lib/modules/*/vmlinuz; do sudo kernel-install add "$(basename "$(dirname "$kernel")")" "$kernel"; done
```

The Luft entry keeps working alongside GRUB; `trustctl startup uninstall` removes it.

When the computer doesn't start, boot the recovery stick (`security/scripts/recovery-stick.sh` writes one; it starts with Secure Boot on), mount the installed system and run the same commands inside it. For a default Fedora install on NVMe:

```sh
sudo cryptsetup open /dev/nvme0n1p3 root          # only if encrypted; asks for the recovery key
sudo mount -o subvol=root /dev/mapper/root /mnt   # or /dev/nvme0n1p3 when not encrypted
sudo mount /dev/nvme0n1p2 /mnt/boot
sudo mount /dev/nvme0n1p1 /mnt/boot/efi
for fs in dev proc sys run; do sudo mount --rbind /$fs /mnt/$fs; done
sudo chroot /mnt
```

If Fedora's boot entry is gone too: `efibootmgr --create --disk /dev/nvme0n1 --part 1 --label Fedora --loader '\EFI\fedora\shimx64.efi'`.

## Graphics driver stopped responding

When the whole GPU hangs, `kestrel-watchdog` restarts the computer cleanly once the kernel confirms a GPU failure, and saves a report to `/var/lib/kestrel-watchdog/incidents`. At the next start Sushi explains what happened with suggestions for the computer, and Settings lists the last ten incidents under About, Recent problems.

On NVIDIA cards with Resizable BAR off, the 256 MB BAR1 window can fill up and hang the driver. Turn on Above 4G Decoding and Resizable BAR in the firmware, or add `options nvidia NVreg_EnableResizableBar=1` to a file in `/etc/modprobe.d` and rebuild the images with `sudo trustctl startup rebuild`; a full shutdown may be needed before the new size applies. `nvidia-smi -q -d MEMORY` shows the window size under BAR1 Memory Usage.
