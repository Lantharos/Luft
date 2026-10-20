---
title: Recovery and troubleshooting
description: The boot menu, going back to an earlier version, Rescue, and what to do when something doesn't start.
sidebar:
  order: 6
---

## The boot menu

Luft's boot menu stays hidden. Hold any key while the computer starts to show it. It lists:

- the newest version of Luft, and below it **Rescue**
- **Previous versions**, to start the one before the last update
- Windows and other systems on the computer
- **Firmware settings**, when the firmware supports it

From a running Luft, holding <kbd>Alt</kbd> in the Restart dialog shows **Boot Options**, which restarts into the menu.

## Something broke after an update

- If the new version doesn't reach the login screen in three tries, Luft goes back to the version that last worked by itself, and says so before the login screen.
- If it starts but something's wrong, go back in Settings, under Updates, **Go back to the previous version**, or pick the previous version in the boot menu.

Your files and settings stay as they are either way. See [How updates work](/system/updates/#going-back).

## Rescue

**Rescue**, under the newest version in the boot menu, starts a minimal system with messages on screen. It asks for the disk's recovery key or passphrase, since the TPM never unlocks the disk in Rescue, then opens a root shell.

## The disk asks for its recovery key

An encrypted disk normally unlocks by itself with the TPM. It asks for the recovery key when the way the computer starts has changed, such as Secure Boot being turned off, keys being added to or removed from the firmware, or another boot loader starting Luft. The prompt says why it's asking.

Type the 64-character recovery key you saved; it's in groups of eight, made of letters that type the same on almost every keyboard. Once the desktop is up, Settings, under Security, says the computer starts differently now when its Secure Boot keys changed. If you made the change, confirm it there with your password so the disk unlocks by itself next time. If you didn't, leave it: the disk keeps asking for the recovery key, and someone may have changed how your computer starts. With Secure Boot off, Settings offers to link the TPM again instead.

## The screen stays dark from a USB stick

Hold <kbd>Esc</kbd> while the stick starts and choose **Luft with basic graphics**. It uses the firmware's screen, which is slower but enough to install. Installing picks the right graphics driver for the computer.

## The firmware forgot its settings

| What you see | What to do |
| --- | --- |
| The computer starts but the boot entry for Luft is gone | Nothing. The firmware's fallback starts Luft, and Luft puts its entry back |
| *Verification failed: (0x1A) Security Violation* | The firmware's keys were reset. On the blue screen, choose **Enroll key from disk**, then the EFI partition, `EFI`, `luft`, `luft.cer`, **Continue**, **Yes** and **Reboot**. The disk unlocks by itself again afterwards |

## The graphics stopped responding

When the graphics card hangs entirely, Luft restarts cleanly and explains what happened at the next start, with suggestions for the computer. Settings lists these under About, **Recent problems**. See [NVIDIA graphics](/system/nvidia/#when-the-graphics-driver-stops-responding) for a common cause on NVIDIA cards.

## An app misbehaves

[Barometer](/apps/barometer/) (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Esc</kbd>) ends or force quits it.
