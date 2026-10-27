# Boot and recovery

How a Luft computer starts, and what to do when it doesn't. The pieces are [SushiBoot and Sushi](../sushi/README.md), [trustd](../security/README.md) and the [Luft image](../os/README.md).

## How the computer starts

1. The firmware starts Fedora's shim, signed by Microsoft, from the boot entry called Luft.
2. Shim starts SushiBoot, signed with Luft's key.
3. SushiBoot starts the newest version's startup image: kernel, initramfs and command line in one file, signed with Luft's key.
4. The startup image's stub measures what it started into the TPM, which releases the disk key only if the computer started this way.
5. The command line names the exact system the image was built with (`composefs=` and a SHA-512 digest). The initramfs mounts the system only if every file matches it, so nothing from the firmware to `/usr` can change without Secure Boot noticing.

Nothing can be changed at startup, including the kernel command line. Kernel arguments are part of the image, in `/usr/lib/bootc/kargs.d`. With Secure Boot off, SushiBoot starts the same command line without `lockdown=integrity` ([why](security.md#games-with-anti-cheat)).

## Updates and going back

Every version of Luft is a sealed bootc image, built and signed in CI. An update downloads the new version, and bootc puts its startup image in `EFI/Linux/bootc` on the EFI system partition with an entry in `loader/entries`. The version before it stays, so there are always two.

Next to Windows, whose EFI system partition is usually too small for them, the startup images and entries go on a separate 2 GB startup partition (XBOOTLDR, as the Boot Loader Specification calls it) on the same drive instead. Shim and SushiBoot stay on the EFI system partition, and SushiBoot reads the entries from both.

- SushiBoot starts the newest. Next to Windows or another system, its menu shows itself for 10 seconds and starts whichever system was started last, so Windows can finish an update that restarts it several times. Windows starts through a quick restart into its own firmware entry, so BitLocker doesn't ask for its recovery key. Otherwise holding any key while the computer starts shows the menu, with the version before under Previous versions.
- `bootc rollback` makes the previous version the default from a running system.
- After an update, trustd brings shim and SushiBoot on the EFI system partition up to the new version's at the next start. It replaces SushiBoot before shim, one whole file at a time, so a power cut partway leaves an older shim with the newer SushiBoot, which still starts. bootupd, which does this on other bootc systems, is turned off.

While Luft runs, the partition with the startup images and entries is at `/boot`: the EFI system partition, or the startup partition next to Windows, with the EFI system partition at `/efi` then. Each mounts when something opens it and unmounts after two idle minutes. trustd and bootc don't rely on those folders: they find the EFI system partition the computer started from, and the startup partition by its type on the same drive.

### Switching between the standard and NVIDIA images

When a computer running the standard image has an NVIDIA graphics card, hybrid laptops included, Luft offers NVIDIA's driver in Settings, System, and once with a notification after signing in. That happens again only when a different NVIDIA card turns up. The other way round, on the NVIDIA image without an NVIDIA card, Settings offers the smaller standard image without a notification.

Switching stays on the same channel and version: `:1` becomes `:1-nvidia`, `:1-nightly` becomes `:1-nightly-nvidia`, and a pinned version such as `:1.20261020.57` becomes `:1.20261020.57-nvidia`. Settings shows the download size, which counts only the parts of the image the computer doesn't have yet, and the switch waits for the next restart like an update. The image it came from stays as the previous version to go back to. NVIDIA's driver is signed with the same Luft key as the startup images, so Secure Boot needs nothing new.

### When an update doesn't start

A new version gets three tries to reach the login screen. SushiBoot counts each start of a version it hasn't seen work yet. Once the login screen or the desktop has been on screen for five seconds, Kestrel tells trustd, which remembers that version as the one that works. A login screen that crashes as soon as it appears doesn't count. If the third try doesn't get there either, SushiBoot starts the version that last worked instead. Before the login screen, Sushi then explains that the update didn't start and Luft went back, and trustd makes that version the default again with `bootc rollback`. Settings doesn't offer the same update again; the next release replaces it.

A new version only gets tries when there's a version that worked to go back to. The counts are kept in EFI variables (`LuftBootGood` and `LuftBootTried`, vendor `b6a4c1e2-3f5d-4c8a-9e71-2d0f6a8b5c3e`), keyed by the startup image's path, so they survive bootc rewriting its entries. Starting another version from the menu, or Rescue, never counts against an update. If the update stops at [the screen that says Luft couldn't start](#when-luft-cant-start), Start the previous version goes back right away.

## Adding Luft's Secure Boot key

Shim only trusts Luft's key after someone confirms it in person, once per computer. Install Luft queues the key before the first restart and shows an eight-digit code:

1. After the restart, shim's blue screen waits ten seconds for a key press.
2. Choose Enroll MOK, Continue, Yes, type the code, and choose Reboot.

If the blue screen was skipped, the computer still starts: shim shows "Verification failed" for SushiBoot, and after OK the firmware moves on to the entry called "Luft without its key". It starts the same version through Fedora's signed GRUB and kernel, from `EFI/luft-start` (the kernel itself is on the startup partition when there is one), which trustd keeps in step with the newest version until the key is added. Each version's kernel and initramfs go in a folder of their own, and GRUB's configuration switches to it only once it's complete. That way has no signed command line or TPM unlock, so an encrypted disk asks for its recovery key or passphrase. trustd asks shim again with a new code at the next starts, up to three times, and Sushi shows the code for 20 seconds before each restart, or until Enter is pressed; after that, Settings (or `trustctl secure-boot enroll`) asks again. Once the key is in, trustd removes `EFI/luft-start` and its entry. The live system, from a stick or Meet Luft, leaves the key and the EFI system partition alone.

The key can also be added from the blue screen without a code: press a key for key management, then Enroll key from disk, the EFI system partition, `EFI`, `luft`, `luft.cer`, Continue, Yes and Reboot.

## When Luft can't start

Luft never leaves anyone at systemd's emergency prompt. Whenever the startup image or the installed system would go to `emergency.target` or `rescue.target`, Sushi shows a screen that says Luft couldn't start, why when it can tell (the disk couldn't be unlocked, found or opened, a system file is damaged, an update didn't finish starting, a drive couldn't be mounted), and what can be done:

- **Enter recovery key**, when the disk didn't unlock in the startup image. The startup carries on and asks again.
- **Restart**.
- **Start the previous version**, when SushiBoot found one older than the version that started, first when an update didn't finish starting. SushiBoot starts it at the next start, the same way it goes back after an update that doesn't start, so trustd makes it the default with `bootc rollback` and Sushi explains what happened.
- **Show details**: the parts of the system that didn't start and the errors logged since the computer started, to scroll through.
- **Open a shell**.

A system file that doesn't match the version that started never gets read: the startup image refuses a system image whose fs-verity digest isn't the one on the signed command line, and the kernel refuses any file whose digest isn't the one the image records. If it refused one before the login screen, `sushi-integrity.service` stops there with the same screen, saying a system file is damaged.

The targets themselves stay as they are, so everything that isolates to them still does. Only `emergency.service` and `rescue.service`, and dracut's `dracut-emergency.service` in the startup image, run `sushictl failure` in place of `sulogin`. If Sushi isn't running it starts it; without a display the same choices are listed on the console, picked by number. Nothing on the screen times out.

SushiBoot names the version before the one it started in `LuftBootPrevious`, and the screen asks for it by writing the started entry to `LuftBootGoBack` (vendor `b6a4c1e2-3f5d-4c8a-9e71-2d0f6a8b5c3e`), which SushiBoot clears when it reads it.

### Opening a shell

A shell can do anything, and in the startup image the TPM would still unlock the disk for it, so it needs proof that whoever is at the computer may have that:

- When root has a password on the installed system, `sulogin` asks for it.
- Otherwise, with an encrypted disk, the disk's recovery key or passphrase, checked against the disk with `cryptsetup`. Esc goes back to the screen.
- On an unencrypted disk, or in Rescue, the shell opens right away. Anyone at an unencrypted computer can read it from a USB stick anyway, and Rescue only starts after the recovery key or passphrase, since the TPM never unlocks the disk for it.

Leaving the shell brings the screen back.

### Rescue

Every startup image has a Rescue profile, under the newest version in the menu. It starts `rescue.target` with messages on screen and the splash off. The TPM never unlocks the disk in Rescue, so it asks for the recovery key or passphrase, then shows the same screen titled Luft is in Rescue, where Open a shell needs nothing more.

## When the firmware forgets its settings

- **Boot entries lost:** the firmware starts `\EFI\BOOT\BOOTX64.EFI`, which is shim with SushiBoot next to it, and trustd puts the Luft entry back at the next start. Nothing to do.
- **Shim's keys cleared** ("Verification failed: (0x1A) Security Violation"): enroll `EFI\luft\luft.cer` from disk as above. The TPM unlocks the disk again afterwards.

## Graphics driver stopped responding

When the whole GPU hangs, `kestrel-watchdog` restarts the computer cleanly once the kernel confirms a GPU failure (never while Kestrel is only waiting on memory, see [Running out of memory](memory.md)), and saves a report to `/var/lib/kestrel-watchdog/incidents`, readable only by administrators. At the next start Sushi explains what happened with suggestions for the computer, and Settings lists the last ten incidents under System, About, Recent problems.

Kestrel's settings service asks Kestrel every 30 seconds whether its frames still reach the screen, and every 3 seconds once Kestrel waits on the CPU or memory, the computer wakes from sleep, or frames start to wait. When Kestrel stops answering for 6 seconds, the power button turns the computer off directly until it answers again, and after 15 seconds `kestrel-watchdog` is told.

On NVIDIA cards with Resizable BAR off, the 256 MB BAR1 window can fill up and hang the driver. Turn on Above 4G Decoding and Resizable BAR in the firmware, or add `options nvidia NVreg_EnableResizableBar=1` to a file in `/etc/modprobe.d`; a full shutdown may be needed before the new size applies. `nvidia-smi -q -d MEMORY` shows the window size under BAR1 Memory Usage.
