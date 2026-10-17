---
title: Removing Windows or the old system
description: Give the space of Windows, or of the Linux Luft replaced, to Luft.
sidebar:
  order: 5
---

Once Luft starts the computer, you can remove the other systems on it and give their space to Luft. Disks shows them on each drive, below its partitions, and Settings lists them under About, **Other systems**.

**Remove** names everything that goes and how big it is, and offers to open the system's files in [Rover](/apps/rover/) first, so you can copy what you still need.

| System | What goes |
| --- | --- |
| Windows | Its system, recovery and reserved partitions, and whatever Meet Luft left on that drive. Windows' boot manager and its start entry go too, unless another Windows stays. Windows locked with BitLocker can't be read from Luft, so its files are gone for good |
| The system Luft replaced | The kept `old-system`, its partitions, and its start entries |
| Another Linux | Its partitions, its boot files and its start entries |

The partitions that start the computer and anything Luft uses always stay.

## If it's interrupted

Removing first makes sure Luft's own startup is in place and first in the firmware's list, then takes the other system out of the startup list, and only then deletes its partitions. So if the power goes out halfway, the computer still starts Luft, and removing again finishes the job.

## Where the space goes

Space right after Luft's partition goes to Luft straight away, while it runs.

Space before Luft's partition can't be added that way. Disks offers to make it a partition for your files instead. To give it to Luft itself, start Luft from a USB stick, choose **Just try Luft**, and move Luft's partition into the space with Disks' partition editor.
