---
title: Crash reports
description: What counts as a crash of Luft's own programs, what a report holds, and how reports are grouped.
sidebar:
  order: 6.5
---

When one of Luft's own programs crashes, Luft can send a short report, only with the person's agreement. [Logs and reporting problems](/system/logs/#crash-reports) covers what people see and choose.

## Core dumps

Crashes go to `systemd-coredump` as on Fedora. It writes the crashed thread's stack into the journal and keeps the compressed core in `/var/lib/systemd/coredump`, readable by root and the crashed program's own account, until systemd's retention removes it. Luft Keyring and its unlock service run with `LimitCORE=0`, so a crash of either leaves only the journal entry; the keyring also isn't dumpable while it runs.

## How reports are made

Crash reports never read a core dump. `luft-crash-collector`, a system service started after each core dump and whenever one of Luft's programs panics, reads from the journal only the fields a report is made from. It runs as its own account in the `systemd-journal` group, without network or capabilities. A user service in each session, `luft-crash-reports`, takes the person's own reports and the system's, asks through Kestrel or follows the person's choice, and sends. The inbox's address and client key ship in `/usr/share/luft/crash-reports.toml`; both are public by design, and a build whose file leaves either empty sends nothing and asks nothing.

Only Luft's own programs are reported: a file of the read-only image under `/usr`, owned by root, where the image installs Luft's programs, told apart as [Who an app is](/security/identity/) describes. Apps you installed, Flatpaks, AppImages, games, anything in a home folder and anything in a container never are.

## What a report holds

A report holds the program and its build, the version and channel of Luft, the signal, panic message or uncaught script error, the stack as file name, build ID, offset and function name where the file has one, the graphics card's maker and whether NVIDIA's driver runs it, and a random number for the computer, made with the first report and reset from Settings. It never holds memory, the environment, the command line, files, the screen, or names and serial numbers. Paths in home folders, email addresses and the names of the computer's accounts are taken out of messages before anything is kept.

## Grouping

Reports with the same `signature` are grouped. It's the start of a SHA-256 over the program and how it failed, plus, for a signal, the top five frames once the ones that only report the crash are left out; for a panic, the file and line without the message, which often holds values that change; and for a script error, its type and top three frames. Five frames tell different paths into the same function apart, while the same bug reached from different callers further up still groups. Offsets change with every build, so without function names the same bug in two versions is two items.
