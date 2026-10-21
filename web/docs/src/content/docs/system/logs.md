---
title: Logs and reporting problems
description: Where Luft keeps its logs, what to collect, and how to report a problem.
sidebar:
  order: 7
---

## Reporting a problem

Report problems on [GitHub](https://github.com/Lantharos/Luft/issues). Say what you did, what you expected and what happened, which computer it is (its model and graphics), and whether Windows is on it. A photo helps when the problem is on screen before the desktop.

## What to collect

Right after something goes wrong, these show the most. Run them in [Tern](/apps/tern/):

| Command | Shows |
| --- | --- |
| `journalctl -b > boot.log` | Everything since the computer started |
| `journalctl -b -1 > previous-boot.log` | The start before, for crashes, freezes and failed wake-ups. Restart first |
| `journalctl -b --user` | Messages from your own session and apps |
| `coredumpctl list` | Programs that crashed |
| `bootc status` | The installed versions and which one is running |
| `sudo trustctl status` | Secure Boot, keys, the TPM and encryption |
| `sudo dmesg > kernel.log` | Kernel messages, for graphics, sleep and devices |
| `lspci -nnk` and `lsusb` | The hardware and its drivers |
| `vainfo` | Video decoding |
| `wpctl status` | Sound devices |

## Recent problems

Settings, under System, **About**, lists the last ten times the graphics driver stopped responding, with what happened and what can help. On NVIDIA graphics, NVIDIA's own `nvidia-bug-report.sh` collects a full report.

## Logs from Try Luft

When Luft runs from [Meet Luft](/start/meet-luft/), it saves its logs where Meet Luft keeps it, so a problem on your hardware can be looked at from Windows or your other Linux afterwards. It saves a minute after starting, every five minutes after that, right after an app crashes, and when it shuts down, so pulling the plug loses a few minutes at most. Luft started from a USB stick saves nothing.

Each start gets one zip, named after the time it started. The last five are kept.

- In Meet Luft, <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>L</kbd> copies the newest zip to your desktop.
- On Linux, they're in Meet Luft's folder, under `Luft logs`.
- On Windows, they're on the partition labelled *Luft*, which has no drive letter. This copies them to a folder you can open, in PowerShell:

```powershell
$luft = (Get-Volume -FileSystemLabel Luft).Path
Copy-Item -LiteralPath "${luft}Luft logs" -Destination "$env:TEMP\Luft logs" -Recurse
```

A zip holds the whole journal, the desktop's own messages, crashes with backtraces, kernel messages, the hardware and its drivers, the graphics and video decoding drivers, and the boot splash's state. [Meet Luft's reference](/reference/meet/#logs-from-try-luft) lists every file.
