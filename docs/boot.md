# Boot and recovery

How a Luft computer starts, and what to do when it doesn't. The pieces are [SushiBoot and Sushi](../boot/sushi/README.md), [trustd](../security/README.md) and the [Luft image](../os/README.md).

## How the computer starts

1. The firmware starts Fedora's shim, signed by Microsoft, from the boot entry called Luft.
2. Shim starts SushiBoot, signed with Luft's key.
3. SushiBoot starts the newest version's startup image: kernel, initramfs and command line in one file, signed with Luft's key.
4. The startup image's stub measures what it started into the TPM, which releases the disk key only if the computer started this way.
5. The command line names the exact system the image was built with (`composefs=` and a SHA-512 digest). The initramfs mounts the system only if every file matches it, so nothing from the firmware to `/usr` can change without Secure Boot noticing.

Nothing can be changed at startup, including the kernel command line. Kernel arguments are part of the image, in `/usr/lib/bootc/kargs.d`.

## Updates and going back

Every version of Luft is a sealed bootc image, built and signed in CI. An update downloads the new version, and bootc puts its startup image in `EFI/Linux/bootc` on the EFI system partition with an entry in `loader/entries`. The version before it stays, so there are always two.

- SushiBoot starts the newest. Holding any key while the computer starts shows its menu, with the version before under Previous versions.
- `bootc rollback` makes the previous version the default from a running system.
- After an update, trustd brings shim and SushiBoot on the EFI system partition up to the new version's.

## Adding Luft's Secure Boot key

Shim only trusts Luft's key after someone confirms it in person, once per computer. Install Luft queues the key before the first restart and shows an eight-digit code:

1. After the restart, shim's blue screen waits ten seconds for a key press.
2. Choose Enroll MOK, Continue, Yes, type the code, and choose Reboot.

If the blue screen was skipped, the computer still starts: shim shows "Verification failed" for SushiBoot, and after OK the firmware moves on to the entry called "Luft without its key". It starts the same version through Fedora's signed GRUB and kernel, from `EFI/luft-start`, which trustd keeps in step with the newest version until the key is added. That way has no signed command line or TPM unlock, so an encrypted disk asks for its recovery key or passphrase. trustd asks shim again with a new code at the next starts, up to three times, and Sushi shows the code before each restart; after that, Settings (or `trustctl secure-boot enroll`) asks again. Once the key is in, trustd removes `EFI/luft-start` and its entry.

The key can also be added from the blue screen without a code: press a key for key management, then Enroll key from disk, the EFI system partition, `EFI`, `luft`, `luft.cer`, Continue, Yes and Reboot.

## Rescue

Every startup image has a Rescue profile, under the newest version in the menu. It starts `rescue.target` with messages on screen and the splash off. The TPM never unlocks the disk in Rescue, so it asks for the recovery key or passphrase, then opens a root shell.

## When the firmware forgets its settings

- **Boot entries lost:** the firmware starts `\EFI\BOOT\BOOTX64.EFI`, which is shim with SushiBoot next to it, and trustd puts the Luft entry back at the next start. Nothing to do.
- **Shim's keys cleared** ("Verification failed: (0x1A) Security Violation"): enroll `EFI\luft\luft.cer` from disk as above. The TPM unlocks the disk again afterwards.

## Graphics driver stopped responding

When the whole GPU hangs, `kestrel-watchdog` restarts the computer cleanly once the kernel confirms a GPU failure, and saves a report to `/var/lib/kestrel-watchdog/incidents`. At the next start Sushi explains what happened with suggestions for the computer, and Settings lists the last ten incidents under About, Recent problems.

On NVIDIA cards with Resizable BAR off, the 256 MB BAR1 window can fill up and hang the driver. Turn on Above 4G Decoding and Resizable BAR in the firmware, or add `options nvidia NVreg_EnableResizableBar=1` to a file in `/etc/modprobe.d`; a full shutdown may be needed before the new size applies. `nvidia-smi -q -d MEMORY` shows the window size under BAR1 Memory Usage.
