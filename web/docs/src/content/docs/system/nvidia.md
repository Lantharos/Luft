---
title: NVIDIA graphics
description: The standard and NVIDIA images, and switching between them.
sidebar:
  order: 2
---

Luft comes as two images that are otherwise the same:

| Image | For |
| --- | --- |
| Standard | Intel and AMD graphics, and NVIDIA cards on the open-source driver |
| NVIDIA | Computers with NVIDIA graphics, hybrid laptops included, with NVIDIA's own driver |

NVIDIA's driver is built for each image's kernel and signed with Luft's key, so it works with Secure Boot on and needs nothing extra. Both images play every common video format and decode H.264, HEVC and AV1 in hardware.

## Which one you get

Install Luft picks the NVIDIA image when the computer has an NVIDIA card, and [Meet Luft](/start/meet-luft/) downloads only the one your computer needs.

## Switching

If you add an NVIDIA card later, or installed the standard image on a computer with one, Luft notices. It offers NVIDIA's driver in Settings, under System, and once in a notification after you sign in. It offers again only if a different NVIDIA card turns up.

The other way round, on the NVIDIA image without an NVIDIA card, Settings offers the smaller standard image, without a notification.

Switching works like an update. Settings shows how much it downloads, which counts only what your computer doesn't have yet, and the switch happens at the next restart. You stay on the same version and the same [releases or nightly builds](/system/updates/#releases-and-nightly-builds), and the image you came from stays as the previous version to go back to.

## When the graphics driver stops responding

If the graphics card stops responding entirely, Luft restarts the computer cleanly once the kernel confirms the failure, and explains what happened at the next start, with suggestions for that computer. Settings lists the last ten under System, About, **Recent problems**.

On NVIDIA cards with Resizable BAR off, the driver can run out of room and stop responding. Turn on **Above 4G Decoding** and **Resizable BAR** in the firmware settings. A full shutdown may be needed before the change applies.
