---
title: Try Luft with Meet Luft
description: Get a Windows or Linux computer ready for Luft without a USB stick, then try it, install it, or replace the old system.
sidebar:
  order: 3
---

Meet Luft is a small app for Windows and Linux. It checks your computer, puts Luft next to the system you already have, and restarts into Luft once. From there you can try the desktop, install Luft, or on Linux let it take the old system's place. Until you decide in the installer, your computer keeps starting the way it always has.

| | Download |
| --- | --- |
| Windows 10 or 11 | [meet-luft.exe](https://get.luft.computer/meet/meet-luft.exe) ([checksum](https://get.luft.computer/meet/meet-luft.exe.sha256)) |
| Linux | [meet-luft.AppImage](https://get.luft.computer/meet/meet-luft.AppImage) ([checksum](https://get.luft.computer/meet/meet-luft.AppImage.sha256)) |

Meet Luft isn't code-signed, so Windows SmartScreen asks before it first starts: choose **More info**, then **Run anyway**.

Meet Luft downloads the newest Luft, which works with any graphics card and installs NVIDIA's driver when your computer needs it. If you already have a Luft ISO, **Use an ISO I already have** skips the download.

## On Windows

1. **It checks the PC.** Luft needs a 64-bit Intel or AMD processor, UEFI and a GPT drive. Meet Luft also looks at Secure Boot, the TPM, BitLocker, Fast Startup, free space, the graphics card and the Wi-Fi chip, and says what each means for you. When Secure Boot is off, it explains where to turn it on for your PC's maker and can restart straight into the firmware settings. Start entries left behind by systems you removed long ago, such as an old Ubuntu, can be tidied away here too.
2. **It makes room.** Windows makes its own partition smaller, the same way Disk Management does, so this works with BitLocker on. Free space right after Windows counts first, so Windows only gives up what's missing. Then Meet Luft downloads Luft, checks it against its checksum, and unpacks it as it arrives.

   When there's another place for Luft, Meet Luft lets you pick it instead:
   - **Free space** that nothing uses, on Windows' drive or another one. Luft gets all of it and nothing else changes.
   - **Another drive**, erased for Luft. Meet Luft names the drive and lists what's on it, with labels, drive letters, sizes and BitLocker, and asks before erasing anything. The drive Windows starts from and USB drives are never offered.

   On a drive of its own, Luft gets its own start files, so your PC starts it from that drive.
3. **It restarts into Luft.** Luft starts through Fedora's signed boot loader, so Secure Boot can stay on. The restart after that goes back to Windows.
   - **Try Luft** opens the desktop. Nothing is installed.
   - **Install Luft** opens the installer with **Alongside Windows** already chosen, in the room Meet Luft made, and your language, time zone and keyboard already filled in from Windows. **More options** shows the other ways to install. Nothing on the drive changes until you confirm there.
4. **It packs a moving box**, if you like: folders from your Windows account, your wallpaper, your name and account picture, Bluetooth devices, and Wi-Fi networks with their passwords (only when you tick that). The installer fills in your name from it and unpacks the rest into your new account.

Before restarting, Meet Luft offers to keep the clock right in both systems and, whenever Fast Startup is on, to turn it off. It changes both in Windows itself, so they work with BitLocker on. [Installing alongside Windows](/start/alongside-windows/) explains why they matter.

Meet Luft asks Windows for administrator rights once, when it first looks at the drive. It needs an internet connection unless you pick an ISO.

## On Linux

Meet Luft for Linux repartitions nothing. It keeps Luft as files in a folder, `/home/.luft-meet` on the drive with your home folder, and adds a small start entry called *Meet Luft* next to your system's own boot files. The folder has to be on ext4, btrfs or XFS on a plain partition: Luft can't start from an encrypted drive, LVM or RAID yet, and Meet Luft tells you when that's the case.

It asks for your password once, when it first looks at the computer. When Luft is ready, there are three ways in:

- **Try Luft** opens the desktop.
- **Replace** opens the installer with your current system chosen, explains what stays and what changes, and does nothing until you confirm. See [Replacing another Linux](/start/replace-linux/).
- **Install Luft** opens the installer to put Luft on another drive or in free space.

## Once Luft is installed

When you open Meet Luft on a PC that has Luft, it shows **Your Luft**:

- **Change how much space Luft has** gives Luft more of Windows' space, or gives some back. Windows makes itself smaller right away; Luft moves into the space the next time it starts and takes a few minutes, while you can keep using it. To give space back, Luft moves its files first, then Meet Luft hands the space to Windows when you open it again. Luft needs some free room to move. An encrypted Luft moves with its own keys, so you won't need the recovery key; one that opens only with a passphrase can't move by itself. When Luft has a drive of its own, it can take the free space right after it, or leave some of it free.
- **Give Windows the free space** extends Windows into unused space right after it.
- **Remove Luft from this PC** deletes Luft, its start files and its start entry, and gives Windows the space back. It asks first, and doesn't need a recovery key even when Luft is encrypted.

## Getting a newer Luft

When a newer build is out than the one Meet Luft copied, it offers **Get the newest Luft** next to **Try Luft**. It replaces the old build and keeps your room, your moving box and the logs from earlier tries.

Meet Luft follows releases. To try the nightly builds instead, start it with `--nightly` or press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>N</kbd>; press it again to go back.

## Making a USB stick

**Make a USB stick** puts Luft on a stick, on Windows and on Linux. It lists only removable USB drives, with each one's name, size and what's on it, and finds a stick you plug in later by itself.

The stick gets the newest Luft, which starts and installs on any computer. **Use an ISO I already have** writes that ISO instead, checked against a `.sha256` file next to it when there is one.

Meet Luft names the stick and asks before erasing it. After writing, it reads everything back and compares it with the ISO before ejecting the stick. Downloads are kept, so the next stick doesn't download again.

### Ventoy sticks

If your stick was made with [Ventoy](https://www.ventoy.net), Meet Luft recognises it and asks whether to add Luft next to your other ISOs or to erase the stick and make it a Luft stick. Adding checks the free space first, asks before replacing an older Luft ISO, and verifies the copy before ejecting.

Luft starts from Ventoy's normal mode with nothing to configure. With Secure Boot on, Ventoy asks once, on its own blue screen, to enroll its key.

## Logs from Try Luft

When Luft runs from Meet Luft, it saves its logs where Meet Luft keeps it, so a problem on your hardware can be looked at afterwards. **Ctrl+Shift+L** in Meet Luft copies the newest logs to your desktop as a zip. [Logs and reporting problems](/system/logs/) has the details.

## Taking it back out

**Remove Luft from this PC** deletes everything Meet Luft added and gives Windows its space back. On Linux, **Remove Luft from this computer** deletes the folder and the start entry. Once Luft is installed, its first start removes Meet Luft's leftovers in the background and grows into their space. To take out an installed Luft, see [Once Luft is installed](#once-luft-is-installed).
