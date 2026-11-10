# Boot and recovery

How a Luft computer starts, and what to do when it doesn't. The pieces are [SushiBoot and Sushi](../sushi/README.md), [trustd](../security/README.md) and the [Luft image](../os/README.md).

## How the computer starts

1. The firmware starts Fedora's shim, signed by Microsoft, from the boot entry called Luft.
2. Shim starts SushiBoot, signed with Luft's key.
3. SushiBoot starts the newest version's startup image: kernel, initramfs and command line in one file, signed with Luft's key.
4. The startup image's stub measures what it started into the TPM, which releases the disk key only if the computer started this way.
5. The command line names the exact system the image was built with (`composefs.digest=` and a SHA-512 digest, and `composefs=` with the digest of the same system in bootc's older image format). The initramfs mounts the system only if every file matches it, so nothing from the firmware to `/usr` can change without Secure Boot noticing.

Nothing can be changed at startup, including the kernel command line. Kernel arguments are part of the image, in `/usr/lib/bootc/kargs.d`. With Secure Boot off, SushiBoot starts the same command line without `lockdown=integrity` ([why](security.md#games-with-anti-cheat)).

## Updates and going back

Every version of Luft is a sealed bootc image, built and signed in CI. An update downloads the new version, and bootc puts its startup image in `EFI/Linux/bootc` on the EFI system partition with an entry in `loader/entries`. The version before it stays, so there are always two.

Next to Windows, whose EFI system partition is usually too small for them, the startup images and entries go on a separate 2 GB startup partition (XBOOTLDR, as the Boot Loader Specification calls it) on the same drive instead. Shim and SushiBoot stay on the EFI system partition, and SushiBoot reads the entries from both.

- SushiBoot starts the newest. Next to Windows or another system, its menu shows itself for 10 seconds and starts whichever system was started last, so Windows can finish an update that restarts it several times. Windows starts through a quick restart into its own firmware entry, so BitLocker doesn't ask for its recovery key. Otherwise holding any key while the computer starts shows the menu, with the version before under Previous versions.
- `bootc rollback` makes the previous version the default from a running system. That's the only way back: the updater refuses an image older than the running one, even a signed one ([image updates](components/software.md#schedule)).
- After an update, trustd brings shim and SushiBoot on the EFI system partition up to the new version's at the next start. It replaces SushiBoot before shim, one whole file at a time, so a power cut partway leaves an older shim with the newer SushiBoot, which still starts. bootupd, which does this on other bootc systems, is turned off.

While Luft runs, the partition with the startup images and entries is at `/boot`: the EFI system partition, or the startup partition next to Windows, with the EFI system partition at `/efi` then. Each mounts when something opens it and unmounts after two idle minutes. trustd and bootc don't rely on those folders: they find the EFI system partition the computer started from, and the startup partition by its type on the same drive.

### Switching between the standard and NVIDIA images

When a computer running the standard image has an NVIDIA graphics card, hybrid laptops included, Luft offers NVIDIA's driver in Settings, System, and once with a notification after signing in. That happens again only when a different NVIDIA card turns up. The other way round, on the NVIDIA image without an NVIDIA card, Settings offers the smaller standard image without a notification.

Switching stays on the same channel and version: `:1` becomes `:1-nvidia`, `:1-nightly` becomes `:1-nightly-nvidia`, and a pinned version such as `:1.1` becomes `:1.1-nvidia`. Settings shows the download size, which counts only the parts of the image the computer doesn't have yet, and the switch waits for the next restart like an update. The image it came from stays as the previous version to go back to, so switching back while that's still the newest version of the other image just starts it again. NVIDIA's driver is signed with the same Luft key as the startup images, so Secure Boot needs nothing new.

### When an update doesn't start

A new version gets three tries to reach the login screen, with the boot counting of the [Boot Loader Specification](https://uapi-group.org/specifications/specs/boot_loader_specification/#boot-counting) that systemd-boot uses. When there's a version to go back to, bootc names the new version's boot entry with the tries from `/usr/lib/kernel/tries`, such as `…+3.conf`. SushiBoot counts one down in the name each time it starts that version, and names the entry it started in `LoaderBootCountPath`. Once the login screen or the desktop has been on screen for five seconds, Kestrel tells trustd, which lets `boot-complete.target` finish, and `systemd-bless-boot` marks the version as good by taking the count out of the name. A login screen that crashes as soon as it appears doesn't count. An entry with no tries left goes after the others, so after the third failed try SushiBoot starts the version before it. A version whose startup image can't be loaded or gives up before Linux starts doesn't wait for its three tries: SushiBoot starts the version before it right away, unless someone picked that version in the menu, where it says the version didn't start. Before the login screen, Sushi then explains that the update didn't start and Luft went back, and trustd makes that version the default again with `bootc rollback`. Settings doesn't offer the same update again; the next release replaces it.

Starting another version from the menu, or Rescue, never counts against an update. If the update stops at [the screen that says Luft couldn't start](#when-luft-cant-start), Start the previous version goes back right away. `os/vm/check.py rollback` tries all of this in a VM ([Testing](testing.md#vms)).

## Adding Luft's Secure Boot key

Shim only trusts Luft's key after someone confirms it in person, once per computer. People see this as finishing setting up Secure Boot. Install Luft queues the key before the first restart and shows an eight-digit code. The request is kept in the new system's `/var/lib/trustd` (`trustctl secure-boot enroll --state`), so the installed system knows the code, and every later reminder shows the same one until the key is in.

Shim's blue screen is in English, so Luft quotes its words exactly:

1. "Press any key to perform MOK management": press any key. Luft asks shim to wait 60 seconds here instead of 10 (`mokutil --timeout`).
2. Choose "Enroll MOK", then "Continue".
3. At "Enroll the key(s)?", choose "Yes" (shim selects "No" first).
4. At "Password:", type the eight digits and press Enter. Nothing shows while typing; a wrong code shows "Password doesn't match".
5. Choose "Reboot".

Until the key is added, there's a second firmware entry, "Luft without its key". It starts the same version through Fedora's signed shim, GRUB and kernel, from `EFI/luft-start` (the kernel itself is on the startup partition when there is one), which trustd keeps in step with the newest version. Each version's kernel and initramfs go in a folder of their own, and GRUB's configuration switches to it only once it's complete. Its command line carries `luft.started=without-key`, so trustd, Settings and Sushi know how the computer started, and `systemd.mount-extra` for the partitions at `/boot` and `/efi`, since GRUB doesn't tell systemd which partition it started from.

- While a request is waiting, the next start goes through "Luft without its key" (`BootNext`), even with the USB stick still in. Its shim shows the blue screen. After "Reboot" the firmware starts the Luft entry, which shim now trusts. When the blue screen goes by, shim carries on into GRUB, so nothing stops at shim's errors.
- When nothing is waiting, "Luft without its key" comes before the Luft entry, so the computer starts without errors until the key is added.
- That way has no signed command line, so the TPM can't check it and an encrypted disk asks for its recovery key, with Sushi saying Secure Boot isn't set up yet. Once the disk is open, trustd seals the disk key to exactly that start too: PCR 4 (shim and GRUB), 7 (the Secure Boot state), 8 (every GRUB command and the kernel's command line) and 9 (every file GRUB read, the kernel and initramfs included), and only when GRUB measured into 8 and 9. Starts the same way then unlock by themselves until the version or that path changes. A TPM with a PIN isn't sealed this way.
- After a start that went by the blue screen, trustd asks shim again with the same code, up to three times, and Sushi shows the steps and the code for 30 seconds before each restart, or until Enter is pressed. Settings shows the code and steps under Security, Secure Boot, where a notification after signing in leads, once per start; `trustctl secure-boot enroll` prints them.
- Kestrel keeps the screen on while its power off and restart dialog counts down, and Sushi switches the display back on when it takes over, so the steps are always on screen before the restart.
- Updates, rolling back and the version in Settings work on that start too: with the boot entries at `/boot`, Luft's bootc reads them when Fedora's GRUB started the system ([`grub-started.patch`](../os/image/patches/bootc/README.md)).
- Once the key is in, trustd removes `EFI/luft-start`, its entry and the disk key sealed to it.

The live system, from a stick or Meet Luft, leaves the key and the EFI system partition alone.

The key can also be added from the blue screen without a code: press a key for key management, then "Enroll key from disk", the EFI system partition, `EFI`, `luft`, `luft.cer`, "Continue", "Yes" and "Reboot".

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

A shell can do anything, so it opens only for someone who could unlock the computer anyway, and the TPM stops unlocking for whatever a shell could have changed:

- When root has a password on the installed system, `sulogin` asks for it.
- Otherwise, with an encrypted disk, the recovery key or passphrase of the disk Luft started from, checked against that disk with `cryptsetup`. No other encrypted drive counts, so a prepared USB stick opens nothing. Esc goes back to the screen.
- On an unencrypted disk, in Rescue, from a stick, or in the startup image when Luft's disk never showed up, the shell opens without asking. Anyone at an unencrypted computer can read it from a USB stick anyway, and Rescue only starts after the recovery key or passphrase, since the TPM never unlocks the disk for it.
- On the installed system, when Luft can't tell which disk it started from, no shell opens, and the screen says so.

Before a shell opens in the startup image, and before any shell that opened without a password or key, Sushi extends PCR 11 and PCR 15 in the TPM. The disk's TPM token is bound to PCR 11 and Luft Keyring to PCR 15, so until the next restart neither unlocks by itself: the disk asks for its recovery key or passphrase and Luft Keyring for the account password. The shell says so when it opens. Proving who you are with the key doesn't spare the startup image this, because the disk Luft started from isn't always the one the TPM unlocks: a copy of Luft on a stick has its own. When the TPM is there but doesn't take the change, no shell opens.

Leaving the shell brings the screen back.

### Rescue

Every startup image has a Rescue profile, under the newest version in the menu. It starts `rescue.target` with messages on screen and the splash off. The TPM never unlocks the disk in Rescue, so it asks for the recovery key or passphrase, then shows the same screen titled Luft is in Rescue, where Open a shell needs nothing more. Luft Keyring asks for the account password after a shell was open. Rescue also extends PCR 15 as it starts (`luft-rescue-seal.service`), before anything can open a shell, so nothing Luft Keyring or another program sealed to this installation opens there, on an unencrypted disk too. If the TPM doesn't take the change, Rescue restarts the computer.

## Moving to another drive

Disks moves Luft to another drive in the computer through trustd, without installing it again ([Moving Luft to another drive](https://docs.luft.computer/system/move-to-another-drive/)). Luft is copied whole, not installed fresh, so every deployment, a staged update, each version's `/etc` and all of `/var` arrive as they were.

1. **Asking.** `MoveSystem` (into free space) or `EraseAndMoveSystem` (onto a whole drive, after erasing it) lays out the partitions the way Install Luft does: a 1 GB EFI system partition when the drive has none, Luft's 2 GB startup partition next to a smaller one, and the root partition with the root type. An encrypted Luft's root gets a copy of the system disk's LUKS2 header. Then the request is kept inside Luft's own file system, with [the others for the next start](security.md#requests-for-the-next-start): the partition Luft runs from, the new partitions, and a fresh UUID for the new file system. The EFI variable `MovingSystemDisk` only holds the request's ID and how far it got, so nothing outside the running system can choose where Luft is copied. Nothing is written to the new EFI system partition yet, so the firmware can't start the half-made copy.
2. **Copying.** At the next start, `trustd-move-drive.service` runs in the startup image once the root device is open and before `/sysroot` mounts. It opens the new partition with `systemd-cryptsetup`, so the TPM token or the passphrase already typed at startup opens it, makes the btrfs when it isn't there yet, mounts the old file system read-only and copies every subvolume, file, hard link, extended attribute (SELinux labels included), file attribute and sparse region, and turns fs-verity back on for the files that had it, with the same parameters, so the composefs objects keep their digests. Sushi shows "Moving Luft to" and the drive's name with the progress. A file is copied again only when its size, time or mode differs, so after a power cut the next start carries on from the old copy. Then the boot entries and startup images go onto the new startup partition, and shim and SushiBoot into `EFI/luft` on the new EFI system partition.
3. **Trying it.** The request is marked as copied, the firmware gets a start entry named "Luft on" and the drive's name, which the next start uses once (`BootNext`), and the computer restarts. SushiBoot on the new drive starts the same signed startup image, and the systemd root discovery finds the new root on the drive SushiBoot started from.
4. **Settling.** When the login screen confirms the start (`ConfirmStartup`) and the system runs from the new drive, trustd removes the start entries for the old drive's `EFI/luft` and `EFI/luft-start` and the trial entry, puts Luft's own entries in place for the new drive, first, and remembers the old copy in `/var/lib/trustd/earlier-copy.json`. Disks shows it as Luft's earlier copy, and `RemoveEarlierCopy` takes its start entries and startup files away, puts Windows' boot manager back as the fallback when Luft's shim had taken its place, and erases its LUKS header before Disks deletes its partitions.

The copy is encrypted exactly when the system it copies is, whatever the request says. When copying fails, the request is marked failed and the start carries on from the old drive. When the old drive starts with the request still copied or failed, the new start never reached the login screen: trustd removes the trial entry and the partitions it made, and keeps why in `/var/lib/trustd/move-failed.json` for Disks. `trustctl system-disk move` is the startup step; `apps/system/disks/vm/move/run.sh` tries all of it in a VM ([Disks](../apps/system/disks/README.md#testing)).

## When the firmware forgets its settings

- **Boot entries lost:** the firmware starts `\EFI\BOOT\BOOTX64.EFI`, which is shim with SushiBoot next to it, and trustd puts the Luft entry back at the next start. Nothing to do.
- **Shim's keys cleared** ("Verification failed: (0x1A) Security Violation"): enroll `EFI\luft\luft.cer` from disk as above. The TPM unlocks the disk again afterwards.

## Graphics driver stopped responding

When the whole GPU hangs, `kestrel-watchdog` restarts the computer cleanly once the kernel confirms a GPU failure (never while Kestrel is only waiting on memory, see [Running out of memory](memory.md)), and saves a report to `/var/lib/kestrel-watchdog/incidents`, readable only by administrators. At the next start Sushi explains what happened with suggestions for the computer, and Settings lists the last ten incidents under System, About, Recent problems.

Kestrel's settings service asks Kestrel every 30 seconds whether its frames still reach the screen, and every 3 seconds once Kestrel waits on the CPU or memory, the power or sleep button is pressed, the computer wakes from sleep, or frames start to wait. To notice the buttons while Kestrel is stuck, the session at the screen may read the power and sleep button devices, and nothing else of the keyboard. When Kestrel stops answering for 6 seconds, the power button turns the computer off directly until it answers again, and after 15 seconds `kestrel-watchdog` is told.

On NVIDIA cards with Resizable BAR off, the 256 MB BAR1 window can fill up and hang the driver. Turn on Above 4G Decoding and Resizable BAR in the firmware, or add `options nvidia NVreg_EnableResizableBar=1` to a file in `/etc/modprobe.d`; a full shutdown may be needed before the new size applies. `nvidia-smi -q -d MEMORY` shows the window size under BAR1 Memory Usage.
