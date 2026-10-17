---
title: System requirements
description: What a computer needs to run Luft.
sidebar:
  order: 2
---

| | Needs |
| --- | --- |
| Processor | 64-bit Intel or AMD. Arm computers aren't supported yet |
| Firmware | UEFI. Computers that only start in legacy BIOS mode can't run Luft |
| Drive | A GPT partition table and at least 32 GB for Luft, or 34 GB next to a small EFI system partition such as Windows' |
| USB stick | 4 GB or more, if you install from a stick. [Meet Luft](/start/meet-luft/) can do without one |
| Next to Windows | Windows keeps everything it uses plus room to grow: at least 20 GB, or a tenth of what it uses if that's more |

## Optional

| | What it adds |
| --- | --- |
| Secure Boot | A signed startup from the firmware to the system, and games with anti-cheat. Luft starts with Secure Boot on or off |
| TPM 2.0 | An encrypted disk that unlocks by itself, a keyring that unlocks when you sign in, and passkeys whose keys never leave the chip. Without one, an encrypted disk asks for a passphrase at every start |
| Fingerprint reader | Signing in, unlocking and confirming passkeys with a finger |
| An internet connection | Not needed to install from the universal stick, which carries everything. Meet Luft needs one unless you give it an ISO |

## Graphics

Intel, AMD and NVIDIA graphics all work, and video in H.264, HEVC and AV1 is decoded in hardware on each. Computers with NVIDIA graphics, hybrid laptops included, get an image with NVIDIA's own driver, chosen for you when installing. [NVIDIA graphics](/system/nvidia/) has the details.

## Wi-Fi

Most Wi-Fi chips work out of the box. Some Broadcom chips need a driver Luft doesn't include, and [Meet Luft](/start/meet-luft/) points this out when it checks the computer.
