---
title: Erasing a computer
description: Remove every account, file and app before selling a computer or giving it away, and leave Luft ready for its next owner.
sidebar:
  order: 7.5
asks:
  - factory reset
  - { ask: erase everything, to: erasing }
  - { ask: reset luft, to: erasing }
  - { ask: wipe computer before selling, to: erasing }
  - { ask: what does erasing remove, to: what-goes-and-what-stays }
---

## Erasing

In Settings, open **System** and choose **Erase** next to **Erase everything**. Luft asks whether you're sure and for an administrator's password, then restarts, erases and restarts once more. It takes a minute or two, longer on a drive that wasn't encrypted. Keep the computer plugged in.

Afterwards the computer [welcomes its next owner](/start/for-someone-else/#when-its-owner-starts-it) as if Luft had just been installed for them.

Nothing that was on the drive can be read again, not with your password, your recovery key or the computer's TPM, and not by looking at the drive with other tools. Luft doesn't delete your files one by one: it moves itself onto a newly encrypted part of the drive and throws away the keys of everything else.

## What goes and what stays

| Gone | Kept |
| --- | --- |
| Every account, with its files, settings, keyring and fingerprints | Luft itself, at the version that's installed, and the version before it |
| Apps from Schelf, Flatpak apps and system packages you added | Windows or another system on the same computer, and other drives |
| Wi-Fi networks, VPNs, printers, Bluetooth devices and firewall choices | Luft's key in Secure Boot, so there's no blue screen again |
| Security keys, smart cards and USB devices you allowed | Firmware settings and firmware updates |
| The computer's name, language, time zone, machine ID and SSH host keys | |
| The recovery key, passphrase, PIN and what the TPM held for the drive | |

Luft needs room to move itself, about twice its own size. A drive too full of earlier versions says so before anything is removed; installing Luft again from [a USB stick](/start/usb-stick/) onto the whole drive erases it as well.

Other drives aren't touched. Erase or format them in [Disks](/apps/disks/).
