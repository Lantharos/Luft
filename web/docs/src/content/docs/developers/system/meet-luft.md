---
title: Meet Luft
description: How Meet Luft makes room on Windows and Linux, seals the moving box and writes USB sticks.
sidebar:
  order: 11.5
---

Meet Luft prepares a Windows or Linux computer for Luft without a USB stick, then hands over to the installer. [Try Luft with Meet Luft](/start/meet-luft/) covers what people see. The app is in `apps/store/meet`, and the formats it shares with the installer and trustd are in the `luft_meet` crate in `packages/system/meet`.

## The download

Every computer gets the same ISO, which starts the standard image and carries the NVIDIA one too. Releases are on get.luft.computer in a folder per major version (`1/`), nightly builds in `nightly/`. Each folder's `latest.json` names its newest ISO:

```json
{"name": "luft-1.1.iso", "version": "1.1", "size": 2147483648, "sha256": "…"}
```

Meet Luft takes the name and size from it, and the checksum from the ISO's signed `.sha256`; when the two checksums disagree, it refuses the download. Both files are signed, and [Keys, signatures and the build](/security/keys/) says with what and how old builds are kept out. Meet Luft remembers the copied build by its checksum in `LiveOS\iso.sha256`, which is how it knows a newer one is out.

On Windows, the live system is unpacked from the ISO under temporary names as it downloads, and only takes their place once the whole ISO matched its checksum. If an update of the copied build stops halfway, Meet Luft won't restart into Luft until it finishes.

## On Windows

Windows shrinks its own partition through its storage service, as Disk Management does, which works with BitLocker on. The clock (`RealTimeIsUniversal`) and Fast Startup are changed inside Windows for the same reason: Luft can't read a drive BitLocker protects.

Meet Luft adds a firmware start entry called *Meet Luft* at the end of the boot order and asks for it once with `BootNext`. Some firmware drops entries it doesn't recognise, so the entry is put back before every restart. Luft starts through Fedora's signed shim and GRUB, as the stick does, so Secure Boot can stay on.

The window runs as the signed-in person, so it sees their folders and settings. A helper does the disk and firmware work with the administrator rights Windows grants once. The helper loads Windows' libraries only from `System32`, never from the folder Meet Luft runs from, and keeps what it handles, such as exported Wi-Fi networks and Bluetooth keys, in `C:\ProgramData\Lantharos\Meet Luft`, which only administrators can open. Failed steps are logged to `%LOCALAPPDATA%\Sabine\logs\meet.jsonl`.

### Where Luft goes

Luft's room goes next to Windows, into free space, or onto another drive that Meet Luft erases (`MSFT_Disk.Clear`, then `Initialize` as GPT). Free space right after Windows counts first, so Windows only gives what's missing.

These drives are never offered: the one Windows starts from or that holds its EFI system partition, USB, SD, MMC, virtual and Storage Spaces drives, read-only and offline drives, and the drive holding an ISO picked with *Use an ISO I already have*. Free space on an MBR drive isn't offered either, since the installer makes GPT partitions.

Meet Luft's own partitions go right after the room on the same drive, so the installer finds the room next to them and Luft grows into their space later:

| Partition | Size | Holds |
| --- | --- | --- |
| Luft's room | At least 32 GB, or 34 GB next to a small EFI system partition | Nothing until Luft is installed |
| Moving box | What was packed, plus a little | exFAT, the [sealed](#the-moving-box) files |
| Start | About 512 MB | An EFI system partition of its own, with shim, GRUB, the kernel and initramfs |
| Luft | The live system plus 1 GB | exFAT, with `LiveOS`, `meet.json` and the [logs from Try Luft](#logs-from-try-luft) |

None of them gets a drive letter. Where Windows encrypts new partitions with BitLocker as soon as they're formatted, Meet Luft decrypts its own right away so the firmware and Luft can read them. Every partition it makes is noted in `made.json` in the administrators-only folder, and it only ever removes partitions noted there, whatever the files on its partitions claim.

On a drive without an EFI system partition, the installer makes one and the firmware starts Luft from that drive. While the installer copies Luft, Meet Luft's start partition briefly loses its EFI system partition type, because bootc writes to the first one on the drive; after a crash, the next start of the installer or of Meet Luft gives the type back.

### The handover

`meet.json` names Meet Luft's partitions by GUID, the room (with `otherDrive` when it isn't next to Windows), the start entry, and whether the restart is to try or to install. Before each restart it also notes the display language, formats, time zone and keyboard layouts, already turned into their Linux names. Time zones go through CLDR's mapping for the formats' country, so *Central Europe Standard Time* in Slovakia becomes `Europe/Bratislava`. The installer starts from these.

The live system finds its partition through `root=luft-live:PARTUUID=…` on the kernel command line. At the first start after installing, `trustd-system-disk.service` removes the start entry and Meet Luft's partitions and grows Luft into their space, as one [plan](/developers/system/resizing/).

## The moving box

The moving box sits on a partition anything can read, between Windows and the moment Luft is installed. It holds Wi-Fi passwords, Bluetooth keys and documents, so it's encrypted, and nobody who starts the computer from something else can read it, or add or swap a file without the installer noticing.

- After packing, Meet Luft shows a twelve-character code such as `7K2M-0QRX-4TB9`: 60 random bits from an alphabet without letters that look like digits. It's shown until Meet Luft closes and stored nowhere. Packing again makes a new box with a new code.
- The key is Argon2id over the code with 64 MiB of memory, three passes and a random salt. `box.seal` holds the salt in the clear and is the only unencrypted file.
- Every file is a numbered blob under `blobs`, encrypted with XChaCha20-Poly1305 a megabyte at a time. Each piece's nonce is the blob's number, the piece's place in it and whether it's the last, so pieces can't be moved, dropped or cut off. Blob `0` is the list of what the box holds, with every file's path, size and date.
- The installer's `OpenMovingBox` opens the list with the code, forgiving case, dashes, and `O`, `I` or `L` typed for `0` and `1`. Unpacking writes only the files the list names, checking each piece and the listed size. A file that was changed, swapped, cut short or is missing stops the unpacking; an added file is never read. A box without a seal isn't offered.

## On Linux

Nothing is repartitioned. The live system is a folder of files, `/home/.luft-meet`, or `/var/lib/luft-meet/live` when the home folder's drive can't be used. Next to the system's own boot files, Meet Luft adds `EFI/luft-meet` with Fedora's shim and GRUB, and a start entry. GRUB reads the kernel and initramfs straight from the folder, and the live system finds it with `root=luft-live:UUID=<file system>/<folder>`, the folder being its path from the top of the file system (for btrfs, the top-level subvolume).

A helper started through `pkexec` does the drive and firmware work. `/var/lib/luft-meet/made.json` notes what Meet Luft made, and Luft's first start after installing removes it all. On Luft itself, recognised by `ID=luft` in `os-release`, Meet Luft sets up nothing.

## USB sticks

Only removable USB drives are listed. Meet Luft writes the ISO to the whole stick, reads everything back, compares its SHA-256 with the ISO's and ejects the stick. On Windows, the helper locks and dismounts each volume, clears the partition table and writes `\\.\PhysicalDriveN` unbuffered. On Linux, it unmounts the partitions through UDisks, writes the drive opened exclusively with `O_DIRECT`, reads it back past the page cache, and powers it off through UDisks.

A [Ventoy](https://www.ventoy.net) stick is recognised as Ventoy recognises it: a first partition starting at 1 MiB, followed directly by a 32 MiB FAT partition labelled `VTOYEFI`. Adding Luft copies the ISO into Ventoy's data partition under a temporary name, reads the copy back, and only then renames it. Luft starts from Ventoy's normal mode without any `ventoy.json`, because the live system looks for its label on every block device, including the device-mapper device Ventoy maps the ISO onto.

## Logs from Try Luft

Luft started from Meet Luft's partition or folder keeps one zip per start in `Luft logs`, replaced whole at every save. A zip stays under 48 MB: past that, the JSON journal goes first, then the text journal is cut to its last lines. Older starts go sooner when the partition runs short. [Logs and reporting problems](/system/logs/#logs-from-try-luft) says when they're saved and how to read them.

| File | Holds |
| --- | --- |
| `journal.txt` | The journal of that start (`journalctl -b -o short-precise`) |
| `journal.json.zst` | The same journal as JSON, compressed with zstd |
| `kestrel.txt` | Kestrel, setup mode, the login screen and the graphics watchdog |
| `kestrel-watchdog` | The graphics watchdog's records, when it has any |
| `coredumps.txt` | `coredumpctl list` and `coredumpctl info` for every crash, with backtraces |
| `dmesg.txt` | Kernel messages |
| `system.txt` | Kernel, version, command line, `meet.json`, memory, free space and drives |
| `lspci.txt`, `lsusb.txt` | Devices and their drivers |
| `drm.txt` | The firmware's framebuffer and logo, graphics cards and their drivers, and each connector's state and modes |
| `vainfo.txt` | Video decoding, for each render node |
| `graphics.txt` | Vulkan and EGL drivers and devices |
| `sushi.txt` | `sushictl status` |
| `sabine` | Sabine's logs from the live account, with Chromium's in `chromium.log` |
