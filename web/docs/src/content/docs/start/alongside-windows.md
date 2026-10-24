---
title: Installing alongside Windows
description: Share a drive with Windows, and what Luft changes in Windows to make that smooth.
sidebar:
  order: 5
---

Luft can share a drive with Windows. Install Luft makes Windows' partition smaller and puts Luft in the space it frees, and Luft's boot menu lets you choose which system to start each time the computer starts. When you don't choose, it starts the one you started last. Choosing Windows restarts the computer straight into Windows, so BitLocker unlocks Windows by itself rather than asking for its recovery key.

There are two ways to get there:

- From a [USB stick](/start/usb-stick/), choosing **Alongside Windows**. Drag the bar to decide how much each system gets; Windows keeps its files and at least 20 GB to grow.
- From Windows with [Meet Luft](/start/meet-luft/), which makes the room with Windows' own tools before restarting. This also works when Windows is locked with BitLocker.

## When Windows can't be made smaller

Install Luft won't touch Windows when changing it could lose data. It says why, and what to do:

| What you see | What to do |
| --- | --- |
| Windows is locked with BitLocker | Turn off device encryption in Windows, use [Meet Luft](/start/meet-luft/), or shrink Windows' drive in Disk Management and choose the free space under **Custom** |
| Windows is asleep or shut down with Fast Startup | Start Windows, hold <kbd>Shift</kbd> while choosing **Shut down**, then start from the stick again |
| Windows' drive needs a check | Restart Windows once |
| Windows needs almost all of its drive | Free up space in Windows |

## Three things Luft offers

Each has its own switch in the installer:

- **Turn off Fast Startup in Windows.** With Fast Startup, *Shut down* in Windows is really a kind of hibernation. Windows' drive stays in use, and sound, Wi-Fi and Bluetooth can start in Luft in the state Windows left them. Luft changes the setting while Windows is fully off, and keeps a copy of Windows' registry as it was, at `Windows\System32\config\SYSTEM.luft-backup`.
- **Keep the clock right in both.** Windows keeps the computer's clock in local time and Luft in UTC, so the time jumps when you switch. Luft asks Windows to use UTC too.
- **Bring your Bluetooth devices.** Devices paired in Windows work in Luft right away. Ones you pair in Windows later come over from Settings, under Bluetooth.

Windows' settings are only changed when Windows was shut down fully and isn't locked with BitLocker. To do it yourself in Windows instead: in Control Panel, open Power Options, *Choose what the power buttons do*, and clear *Turn on fast startup*. For the clock, run this in a terminal opened as administrator:

```powershell
reg add "HKLM\System\CurrentControlSet\Control\TimeZoneInformation" /v RealTimeIsUniversal /t REG_DWORD /d 1 /f
```

## Living with both

Windows updates sometimes turn Fast Startup back on. When Luft starts after Windows was hibernated or fast-started, it resets the sound chips before anything uses them and, once, explains Fast Startup in a notification that can turn it off when Windows is next fully shut down.

Windows' drive shows up in [Rover](/apps/rover/). While Windows is asleep it opens read-only, so nothing Windows still has open gets changed.

When you no longer need Windows, [Removing Windows or the old system](/system/remove-other-systems/) gives its space to Luft.
