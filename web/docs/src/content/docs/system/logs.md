---
title: Logs and reporting problems
description: Where Luft keeps its logs, what to collect, and how to report a problem.
sidebar:
  order: 8
asks:
  - report a bug
  - bug report
  - file an issue
  - { ask: send crash report, to: crash-reports }
  - { ask: turn off crash reports, to: crash-reports }
  - { ask: journalctl, to: collecting-logs }
  - { ask: luft report, to: collecting-logs, shared: true }
  - { ask: system logs, to: collecting-logs }
  - { ask: event viewer, to: collecting-logs }
  - { ask: headphones work in windows not luft, to: no-sound-from-the-jacks }
  - { ask: realtek sound, to: no-sound-from-the-jacks }
  - { ask: try luft logs, to: logs-from-try-luft }
---

## Reporting a problem

Report problems on [GitHub](https://github.com/Lantharos/Luft/issues). Say what you did, what you expected and what happened, which computer it is (its model and graphics), and whether Windows is on it. A photo helps when the problem is on screen before the desktop.

## Crash reports

When one of Luft's own programs closes unexpectedly, such as an app that comes with Luft, a background service or the desktop itself, Luft asks whether to send a report. If the desktop or the computer went down, it asks after you sign in again. Apps you installed yourself are never reported.

A report says which program closed and how, where in its code it was, which version of Luft you have and who made your graphics card. It never holds your files, what was on the screen, your name, your computer's name or anything else that says who you are. **What's in it** shows the exact report before you decide, and **Do the same next time without asking** remembers your answer.

You're asked about the same problem once per version of Luft. To change your answer, open Settings, then **Privacy**, and choose under **Crash reports** whether to be asked each time, to send without asking or never to send. **Reset** there gives your computer a new random number, so later reports can't be linked to earlier ones. Reports wait while you're offline or on a metered connection.

## Collecting logs

Right after something goes wrong, `luft report` saves most of this in one file, with your name, your computer's name and paths in your home folder taken out ([the luft command](/system/terminal/#logs-and-bug-reports)). These show more. Run them in [Tern](/apps/tern/):

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

## No sound from the jacks

When headphones or speakers stay silent in Luft but work in Windows, download [`try-hda-fixups.sh`](https://raw.githubusercontent.com/Lantharos/Luft/main/os/tools/audio/try-hda-fixups.sh) and run `bash try-hda-fixups.sh` in Tern. It asks for your password, tries a few known fixes for Realtek sound chips one after another, plays a tone after each and asks whether you heard it, and puts everything back at the end. Attach the `hda-fixups.txt` it leaves in your home folder to your report.

If Windows is on the same computer, a dump of how its driver sets up the chip helps too. In Windows, plug the headphones in, open PowerShell as administrator and run:

```powershell
cd $env:USERPROFILE\Desktop; iwr https://github.com/ChimeraOS/reverse-engineering-tools/raw/main/RtHDDump_V236.zip -OutFile RtHDDump.zip; Expand-Archive RtHDDump.zip RtHDDump -Force; cd RtHDDump; & (Get-ChildItem -Recurse RtHDDump.exe)[0].FullName; Get-ChildItem -Recurse RtHDDump.txt
```

Attach the `RtHDDump.txt` it lists. A fix that works becomes part of Luft for that model of computer only.

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

A zip holds the whole journal, the desktop's own messages, crashes with backtraces, kernel messages, the hardware and its drivers, and the boot splash's state. [Meet Luft](/developers/system/meet-luft/#logs-from-try-luft) lists every file.
