# Meet Luft

Meet Luft gets a Windows or Linux computer ready for Luft without a USB stick. It restarts into Luft once, to try it, install it or, on Linux, let it take the old system's place. The system already there keeps starting as usual until you decide otherwise in Install Luft. The app is in [apps/meet](../apps/meet/README.md).

## Which Luft it downloads

Meet Luft only downloads the image the computer needs: `luft-latest-nvidia.iso` when it has an NVIDIA graphics card, hybrid laptops included, and `luft-latest-standard.iso` otherwise (`luft-nightly-…` for nightly builds), each with its `.sha256`. Until a build has its own image for that, it falls back to the universal `luft-latest.iso`. The size it shows is the real size of that download, and *Get the newest Luft* keeps to the same one.

## On Windows

1. **Checks the PC.** A 64-bit Intel or AMD processor, UEFI and a GPT drive are needed. It also looks at Secure Boot, the TPM, BitLocker, Fast Startup, free space, the graphics card (an NVIDIA card gets the image with NVIDIA's driver later) and the Wi-Fi chip, and says what each means. When Secure Boot is off it explains where to turn it on for that PC's maker, and can restart straight into the firmware settings. Start entries left by systems that are gone, such as an old Ubuntu, can be tidied away, from the firmware and from Windows' own boot configuration.
2. **Makes room.** Windows makes its partition smaller, the same way Disk Management does, so it also works with BitLocker on. Luft's room and Meet Luft's own partitions go right after Windows, in front of a recovery partition at the end of the drive. Then it downloads Luft, checks it against its `.sha256`, and copies the live system out of it as it arrives. An ISO you already have works too.
3. **Restarts into Luft.** It adds a start entry called *Meet Luft* at the end of the firmware's list and asks the firmware to use it once (`BootNext`). Some firmware drops entries it doesn't know; Meet Luft puts it back before each restart. Luft starts the same way as from the stick, through Fedora's signed shim and GRUB, so Secure Boot can stay on. The restart after that goes back to Windows.
   - *Try Luft* opens the desktop. Nothing is installed.
   - *Install Luft* opens Install Luft with *Alongside Windows* already chosen, in the room Meet Luft made. Nothing on the drive changes until you confirm there.
4. **Packs a moving box**, if you like: folders from your Windows account with their sizes, your wallpaper, your name and account picture, time zone, keyboard and language, Bluetooth devices, and Wi-Fi networks with their passwords (off unless you tick it). Install Luft fills in your name and regional settings from it, and unpacks the rest into your new account.

Before restarting, Meet Luft offers to keep the clock right in both systems (`RealTimeIsUniversal`) and, when installing, to turn off Fast Startup. It changes these in Windows itself, so they work with BitLocker on, where Luft can't read Windows' drive.

### Partitions

| Partition | Size | What's on it |
| --- | --- | --- |
| Luft's room | your choice, at least 32 GB (34 GB next to a small EFI system partition) | Empty until Luft is installed into it |
| Moving box | what you packed, plus a little | exFAT, labelled *Moving box*, with `box.json` listing what's inside |
| Start | about 512 MB | FAT, an EFI system partition of its own with shim, GRUB, the kernel and its initramfs |
| Luft | the live system plus 1 GB | exFAT, labelled *Luft*, with `LiveOS` from the ISO, `meet.json` and the logs from Try Luft |

When Windows encrypts new partitions with BitLocker as soon as they're formatted, as it does on PCs with device encryption, Meet Luft decrypts its own right away, so the firmware and Luft can read them. Windows' drive stays encrypted. Meet Luft also notes the partitions it made in `C:\ProgramData\Lantharos\Meet Luft\made.json`, so it can always take them back out.

`meet.json` names Meet Luft's partitions by their GUIDs, the room, the start entry and whether the last restart was to try or to install. The live system finds its partition with `root=luft-live:PARTUUID=…` on the kernel command line; the stick uses `root=luft-live:LABEL=…`. None of the partitions get a drive letter.

After Luft is installed and you sign in for the first time, it removes the start entry, the moving box, the start and live partitions, and grows into the space they used.

### Getting a newer Luft

When a newer Luft is out than the one on its partition, Meet Luft offers *Get the newest Luft* next to *Try Luft*. Newer means a different checksum than the build it copied, from the releases or nightly builds Meet Luft is using, or from an ISO picked with *Use an ISO I already have*; an ISO without a `.sha256` next to it always counts as newer. It downloads the new build in place of the old one and keeps the room, the moving box and the logs from Try Luft. When the new build fits the partitions Meet Luft already made, only their files change. Otherwise it makes them again at the size the new build needs, taking what's missing from Windows, and adds the start entry back. Meet Luft remembers which build it copied by its checksum in `LiveOS\iso.sha256`. If an update stops halfway, Meet Luft won't restart into Luft until the update is done.

## Logs from Try Luft

When Luft starts from Meet Luft's partition or folder, it keeps its logs on that partition, so problems on real hardware can be looked at from Windows afterwards. It saves them a minute after starting, every five minutes after that, right after an app crashes, and when it shuts down or restarts, so pulling the plug loses a few minutes at most. Each start gets one zip, `Luft logs\YYYY-MM-DD HH-MM-SS.zip` on the *Luft* partition (on Linux, in Meet Luft's folder), named after the time of its first save, and each save replaces it whole. Starting from a USB stick saves nothing.

A zip stays under 48 MB. When the logs of one start get bigger than that, the JSON journal is left out first, then only the last part of the text journal is kept. The last five starts are kept, and older ones are removed sooner when the partition gets short of space.

| File | What's in it |
| --- | --- |
| `journal.txt` | The whole journal of that start (`journalctl -b -o short-precise`) |
| `journal.json.zst` | The same journal as JSON, compressed with zstd |
| `kestrel.txt` | Kestrel's own messages: the desktop, setup mode, the login screen and the graphics watchdog |
| `kestrel-watchdog` | The graphics watchdog's records, when it has any |
| `coredumps.txt` | `coredumpctl list` and `coredumpctl info` for every crash, with backtraces |
| `dmesg.txt` | Kernel messages |
| `system.txt` | Kernel, version, command line, `meet.json`, memory, free space and drives |
| `lspci.txt`, `lsusb.txt` | Devices and their drivers (`lspci -nnk`, `lsusb`, `lsusb -t`) |
| `drm.txt` | The framebuffer and logo the firmware left, graphics cards and their drivers, and each connector's state and modes |
| `vainfo.txt` | Video decoding, for each render node |
| `graphics.txt` | Vulkan and EGL drivers and devices (`vulkaninfo --summary`, `eglinfo -B`) |
| `sushi.txt` | `sushictl status` |
| `sabine` | Sabine's logs from the live account, with Chromium's own log in `chromium.log` |

In Meet Luft, **Ctrl+Shift+L** copies the newest zip to the desktop as `Luft logs YYYY-MM-DD HH-MM-SS.zip`, and *Show* opens it in Explorer or your file manager.

To read them without Meet Luft, use the partition's volume path. It works without giving the partition a drive letter, and only reads:

```powershell
$luft = (Get-Volume -FileSystemLabel Luft).Path        # \\?\Volume{…}\
Get-ChildItem -LiteralPath "${luft}Luft logs"
Copy-Item -LiteralPath "${luft}Luft logs" -Destination "$env:TEMP\Luft logs" -Recurse
```

### Taking it back out

*Remove Luft from this PC* deletes the start entry and every partition Meet Luft made, moving box included, and gives Windows all of its space back. Once Luft is installed, its partition is Luft's own: remove it from Windows' Disk Management if you go back.

### Running it

Meet Luft asks Windows for administrator rights once, when it first looks at the drive. A small helper does the disk and firmware work with those rights; the window itself runs as you, so it sees your own folders and settings. It needs Windows 10 or 11, and an internet connection unless you pick an ISO.

When a step doesn't finish, Meet Luft says which one and offers to try it again. What went wrong is written to `%LOCALAPPDATA%\Sabine\logs\meet.jsonl`.

## On Linux

Meet Luft for Linux is an AppImage. It needs UEFI and a GPT drive, and checks Secure Boot, the TPM, the graphics card (an NVIDIA card gets the image with NVIDIA's driver), the Wi-Fi chip, free space, the EFI system partition and how the system is laid out.

Nothing is repartitioned. Meet Luft keeps the live system as files in a folder, `/home/.luft-meet` on the drive that holds your home folder, or `/var/lib/luft-meet/live` when that one can't be used. The folder has to be on ext4, btrfs or XFS on a plain partition: Luft can't start from an encrypted drive, LVM or RAID yet, and Meet Luft says so. Next to the system's own boot files on the EFI system partition it adds `EFI/luft-meet` with Fedora's signed shim and GRUB, about 5 MB, and a start entry called *Meet Luft*. GRUB reads the kernel and initramfs straight from the folder, and the live system finds it with `root=luft-live:UUID=<file system>/<folder>` on the kernel command line, the folder being its path from the top of the file system (for btrfs, from the top-level subvolume). Restarting sets `BootNext` once, so the restart after that is back in the old system.

Secure Boot can stay on: Luft starts through Fedora's shim and GRUB, like the stick. Luft's own key is only added when it's installed, with the usual blue screen at its first start.

On *Luft is ready* there are three ways in:

- *Try Luft* opens the desktop.
- *Replace* opens Install Luft with the old system chosen, explains what stays and changes, and does nothing before you confirm. It's offered when your home folder is its own btrfs subvolume, as Fedora does it, or its own partition. A system with everything on one partition is found but can't be replaced yet.
- *Install Luft* opens Install Luft to put Luft on another drive or in free space.

*Get the newest Luft* and the nightly builds (**Ctrl+Shift+N**) work as on Windows. *Remove Luft from this computer* deletes the folder, `EFI/luft-meet` and the start entry. `/var/lib/luft-meet/made.json` notes what Meet Luft made, so it can always take it back out. After Luft is installed and you sign in for the first time, it removes them itself.

Meet Luft asks for your password through polkit once, when it first looks at the computer; a helper started with `pkexec` does the work on the drive and the firmware, and the window runs as you.
