---
title: When Luft can't start
description: The screen that replaces systemd's emergency prompt, who may open a shell, Rescue, and the watchdog for hung graphics.
sidebar:
  order: 8.5
---

Luft never leaves anyone at systemd's emergency prompt. What people see and choose is in [Recovery and troubleshooting](/system/recovery/#luft-couldnt-start).

## The screen

Whenever the startup image or the installed system would go to `emergency.target` or `rescue.target`, Sushi shows a screen saying Luft couldn't start, with the reason when it can tell: the disk couldn't be unlocked, found or opened, a system file is damaged, an update didn't finish starting, or a drive couldn't be mounted. The targets stay as they are, so everything that isolates to them still does. Only `emergency.service`, `rescue.service` and dracut's `dracut-emergency.service` run `sushictl failure` in place of `sulogin`. Without a display the same choices are listed on the console, picked by number. Nothing on the screen times out.

Start the previous version works through SushiBoot. SushiBoot names the version before the one it started in the `LuftBootPrevious` variable, and the screen asks for it by writing the started entry to `LuftBootGoBack`, which SushiBoot clears when it reads it. The next start then goes back the same way as after [an update that doesn't start](/developers/system/boot/#when-an-update-doesnt-start).

A system file that doesn't match the version that started is never read. The startup image refuses a system whose digest isn't the one on the signed command line, and the kernel refuses any file whose fs-verity digest isn't the one the image records. If it refused one before the login screen, `sushi-integrity.service` stops there with the same screen.

systemd holds back an unlocked disk for as long as it finds no file system on it, which would leave a Luft whose file system is gone waiting forever behind the splash. The startup image marks Luft's unlocked disk as ready whatever is on it, so mounting fails and the screen says the system disk couldn't be opened.

## Opening a shell

A shell can do anything, so it opens only for someone who could unlock the computer anyway, and the TPM stops unlocking for whatever a shell could have changed.

- When root has a password on the installed system, `sulogin` asks for it.
- Otherwise, with an encrypted disk, it asks for the recovery key or passphrase of the disk Luft started from, checked against that disk. No other encrypted drive counts, so a prepared USB stick opens nothing. The key also has to open every partition an unlocked disk sits on, so a disk that was unlocked is never vouched for by another that took its place.
- On an unencrypted disk, from a stick, or in Rescue, the shell opens without asking. Anyone at an unencrypted computer can read it from a USB stick anyway, and Rescue has already asked for the recovery key.
- When Luft can't tell which disk it started from, no shell opens.

A disk the TPM unlocked can be pulled out afterwards while the kernel goes on holding its key, which a copy of the disk shares. So before any shell, Sushi looks through the unlocked disks and replaces the mapping of each one whose partition is gone with one that fails (`dmsetup wipe_table`), which makes the kernel drop the key. A shell in the startup image also starts with root's kernel keyring emptied, so a passphrase typed at startup isn't there to read. If any of this fails, no shell opens.

Before a shell in the startup image, and before any shell that opened without a password or key, Sushi extends PCR 11 and PCR 15. The disk's TPM token is bound to PCR 11 and Luft Keyring to PCR 15, so until the next restart neither unlocks by itself, and the shell says so when it opens. Proving who you are with the key doesn't spare the startup image this, because the disk Luft started from isn't always the one the TPM unlocks: a copy of Luft on a stick has its own. When the TPM doesn't take the change, no shell opens.

## Rescue

Every startup image has a Rescue profile, listed under the newest version in the menu. It starts `rescue.target` with messages on screen and the splash off. The TPM never unlocks the disk in Rescue, so it asks for the recovery key or passphrase, then shows the same screen titled Luft is in Rescue, where Open a shell needs nothing more.

`luft-rescue-seal.service` extends PCR 15 as Rescue starts, before anything can open a shell, so nothing Luft Keyring or another program sealed to this installation opens there, on an unencrypted disk too. If the TPM doesn't take the change, Rescue restarts the computer. A TPM the firmware announces but that never shows up as a device can't unseal anything either, so Rescue starts without this step.

## Hung graphics

Kestrel's settings service asks Kestrel every 30 seconds whether its frames still reach the screen. It asks every 3 seconds while Kestrel waits on the CPU or memory, after the power or sleep button is pressed, after waking from sleep, or once frames start to wait. To notice those buttons while Kestrel is stuck, the session may read the power and sleep button devices, and nothing else of the keyboard.

When Kestrel stops answering for 6 seconds, the power button turns the computer off directly until it answers again. After 15 seconds, `kestrel-watchdog` is told. It restarts the computer cleanly only once the kernel confirms a GPU failure, never while Kestrel is merely short of memory, and saves a report to `/var/lib/kestrel-watchdog/incidents`, readable only by administrators. At the next start Sushi explains what happened, and Settings lists the last ten incidents under System, About, Recent problems.
