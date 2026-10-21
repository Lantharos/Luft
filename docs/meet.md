# Meet Luft

How Meet Luft prepares a Windows or Linux computer for Luft, makes USB sticks and keeps logs from Try Luft. The app is in [apps/meet](../apps/meet/README.md).

## Which Luft it downloads

There is one Luft ISO for every computer. It starts the regular image and carries the one with NVIDIA's driver too, so Install Luft puts the right one on without a network. Releases are published on get.luft.computer in a folder per major version (`1/`), nightly builds in `nightly/`, each as `luft-<version>.iso` with its `.sha256` and [signature](#signatures). Each folder's `latest.json` names its newest ISO:

```json
{"name": "luft-1.20261020.57-nightly.iso", "version": "1.20261020.57-nightly", "size": 2147483648, "sha256": "…"}
```

Meet Luft reads it to find the ISO and its size, then takes the checksum from the signed `.sha256`, and refuses the download when the two checksums disagree. *Get the newest Luft* and *Make a USB stick* use the same ISO.

## On Windows

The steps people see are in [Try Luft with Meet Luft](https://docs.luft.computer/start/meet-luft/). Underneath:

- Windows shrinks its own partition through its storage service, as Disk Management does, so it works with BitLocker on. Luft's room and Meet Luft's partitions go right after Windows, in front of a recovery partition at the end of the drive, unless Luft goes somewhere else (see [Where Luft goes](#where-luft-goes)).
- The download is checked against its `.sha256` as it arrives, and the `.sha256` against its [signature](#signatures). The live system is copied out of the ISO under temporary names, and only takes their place once the whole ISO matched.
- The start entry *Meet Luft* goes at the end of the firmware's list, and the firmware is asked to use it once (`BootNext`). Some firmware drops entries it doesn't know, so Meet Luft puts it back before each restart. Luft starts through Fedora's signed shim and GRUB, like the stick.
- The clock (`RealTimeIsUniversal`) and Fast Startup are changed in Windows itself, so they work with BitLocker on, where Luft can't read Windows' drive.
- The moving box holds folders from the Windows account, the wallpaper, name and account picture, Bluetooth pairings, and Wi-Fi networks with their passwords when ticked.

### Where Luft goes

Meet Luft looks at every drive and offers each place Luft fits, the one next to Windows first:

- **Next to Windows.** Windows gives up part of its partition. Free space right after Windows, left by an earlier install or by shrinking Windows in Disk Management, counts first, so Windows only gives what's missing. The space step shows that part lighter, and the room can't be smaller than it.
- **Free space.** A gap no partition uses, on Windows' drive or on another drive, that holds Luft and Meet Luft's partitions. Luft gets all of it and nothing else changes.
- **Another drive, erased.** Meet Luft clears the drive through the storage service (`MSFT_Disk.Clear`, then `Initialize` as GPT, which may add a small *Microsoft reserved* partition) and uses it like free space. Before that, it names the drive and lists every partition on it with its label, drive letter, file system, size and whether BitLocker protects it. When anything on it is BitLocker-protected, erasing also takes a tick confirming it's gone for good.

Drives that are never offered: the one Windows starts from or that holds its EFI system partition (`IsBoot` or `IsSystem`), USB, SD, MMC, virtual and Storage Spaces drives, and drives that are read-only or offline. The drive holding an ISO picked with *Use an ISO I already have* is never offered for erasing. Free space on an MBR drive isn't offered, since Install Luft makes GPT partitions; erasing one makes it GPT.

Wherever the room is, Meet Luft's partitions go right after it on the same drive, so Install Luft finds the room next to them and Luft grows into their space at its first start. The moving box goes in between: next to Windows, Windows gives up its space; anywhere else, it comes off the end of the room. On a drive without an EFI system partition, Install Luft makes one, and the firmware starts Luft from that drive; on a drive that has one, it shares it like it shares Windows' own. While Install Luft copies Luft next to Meet Luft's start partition, that partition briefly stops being an EFI system partition, so Luft's start files go on the one Install Luft made. `meet.json` notes `otherDrive` in the room, and Install Luft then names the drive instead of saying the room is next to Windows.

### Partitions

| Partition | Size | What's on it |
| --- | --- | --- |
| Luft's room | your choice, at least 32 GB (34 GB next to a small EFI system partition) | Empty until Luft is installed into it |
| Moving box | what you packed, plus a little | exFAT, labelled *Moving box*, with `box.json` listing what's inside |
| Start | about 512 MB | FAT, an EFI system partition of its own with shim, GRUB, the kernel and its initramfs |
| Luft | the live system plus 1 GB | exFAT, labelled *Luft*, with `LiveOS` from the ISO, `meet.json` and the logs from Try Luft |

When Windows encrypts new partitions with BitLocker as soon as they're formatted, as it does on PCs with device encryption, Meet Luft decrypts its own right away, so the firmware and Luft can read them. Windows' drive stays encrypted. Meet Luft also notes the partitions it made in `C:\ProgramData\Lantharos\Meet Luft\made.json`, so it can always take them back out. Only administrators can open that folder, and Meet Luft only touches partitions noted there, whatever the files on Luft's own partitions say.

`meet.json` names Meet Luft's partitions by their GUIDs, the room, the start entry and whether the last restart was to try or to install. Before each restart it also notes the language Meet Luft shows, the formats, time zone and keyboard layouts in use, already turned into their Linux names (CLDR's mapping for the time zone, which picks the zone for the formats' country, so *Central Europe Standard Time* in Slovakia is Europe/Bratislava), so Install Luft can start with them. On Linux they come from the session's locale, `/etc/localtime` and the GNOME, Plasma or system keyboard settings. The live system finds its partition with `root=luft-live:PARTUUID=…` on the kernel command line; the stick uses `root=luft-live:LABEL=…`. None of the partitions get a drive letter.

At Luft's first start after installing, before the login screen, it removes the start entry, the moving box, the start and live partitions, and grows into the space they used.

### Getting a newer Luft

When a newer Luft is out than the one on its partition, Meet Luft offers *Get the newest Luft* next to *Try Luft*. Newer means a different checksum than the build it copied, from the releases or nightly builds Meet Luft is using, or from an ISO picked with *Use an ISO I already have*; an ISO without a `.sha256` next to it always counts as newer. It downloads the new build in place of the old one and keeps the room, the moving box and the logs from Try Luft. When the new build fits the partitions Meet Luft already made, only their files change. Otherwise it makes them again at the size the new build needs, taking what's missing from Windows, and adds the start entry back. Meet Luft remembers which build it copied by its checksum in `LiveOS\iso.sha256`. If an update stops halfway, Meet Luft won't restart into Luft until the update is done.

### Once Luft is installed

When Meet Luft opens on a PC with Luft installed, which it tells by a partition of the root type `4f68bce3-e8cd-4db1-96e7-fbcaf984b709` named *Luft*, it shows *Your Luft* instead of the first screen. It reads the partition's first bytes to tell whether Luft is encrypted (a LUKS header) and, when it isn't, how much of its btrfs is taken (the superblock's allocated bytes). From there:

- **Change how much space Luft has** splits the drive between Windows and Luft. It's offered when Luft sits right after Windows on the same drive, possibly with its startup partition in front, and isn't encrypted.
- **Give Windows the free space** extends Windows into free space right after it.
- **Clean up after trying Luft** removes Meet Luft's own partitions when Luft's first start didn't.
- **Remove Luft from this PC** deletes Luft's partitions, its start files and its start entries, and gives Windows the space back.
- **Restart into Luft** sets `BootNext` to Luft's start entry, adding one when the firmware lost it.

#### Changing Luft's size

btrfs can only change size from the system that has it mounted, and Windows can only grow into space right after it, so Luft moves itself:

1. For more space, Windows shrinks right away. For less, nothing changes in Windows yet.
2. Meet Luft writes the request into the UEFI variable `LuftResize` with Luft's vendor GUID `b6a4c1e2-3f5d-4c8a-9e71-2d0f6a8b5c3e`: `{"change":"grow","partition":"…"}` or `{"change":"shrink","bytes":…,"partition":"…"}`, the partition being Luft's own. *Your Luft* shows a change that's waiting and can call it off; calling off a grow gives Windows its space back.
3. At Luft's next start, `luft-installer-resize.service` plans the move and runs it in the background, step by step: it makes a new partition, adds it to Luft's btrfs, hands it the root type, lets btrfs move everything off the old partition (`btrfs device remove`), deletes the old one and grows the new one to the end. The startup partition moves first when Luft grows and last when it shrinks, copied to a new FAT partition with the same serial. At the end Luft's partition gets its old partition UUID back, so nothing measured into the TPM changes.
4. When Luft gave space back, the next time Meet Luft opens it offers to extend Windows into it.

Every step is noted in `/var/lib/luft-installer/resize.json` before the next one starts, and at every point Luft still starts: while both partitions belong to the file system, the startup finds it through either. After a power cut the service carries on at the next start, and it gives up on a step that fails three times in a row.

Luft's files have to fit wherever they move, with 10% and 1 GB to spare. When the new space is smaller than that, Luft moves twice, first to the far end of its own partition and then into the new space, which needs it to be less than half full. Meet Luft works out the same limits from the superblock before offering a size, and Luft checks them again before it starts.

An encrypted Luft can't move this way: its startup only opens one encrypted partition, so a second one would need the recovery key. *Your Luft* says so and suggests turning off device encryption in Luft first. Removing an encrypted Luft needs no key, and nothing is left in the TPM, since Luft keeps its sealed keys in the LUKS header and on the EFI system partition.

#### Removing Luft

Meet Luft removes the firmware start entries for `\EFI\luft\` and `\EFI\luft-start\`, and Windows' copies of them. On every EFI system partition with Luft's files it deletes `EFI\luft` and `EFI\luft-start`, the boot loader entries naming Luft with their images, and puts Windows' boot manager back as `EFI\Boot\BOOTX64.EFI` when Luft's shim had taken its place. An EFI system partition Install Luft made on another drive, with only Luft's files on it, is deleted whole. Then it deletes Luft's startup and root partitions and anything left from trying Luft, and extends Windows when the space is right after it.

## Making a USB stick

*Make a USB stick*, on the first screen and next to *Try Luft* and *Install Luft*, puts Luft on a stick, on Windows and on Linux. It lists only USB drives that can be taken out, with each one's name, size and what's on it. Internal drives, read-only sticks, the drive the computer runs from and the drive holding a chosen ISO never show up. Sticks are looked for again every few seconds, so one plugged in later appears by itself.

The stick gets the newest Luft ISO, which starts on any computer. *Use an ISO I already have* writes that ISO instead, checked against a `.sha256` next to it when there is one.

Downloads are checked against their `.sha256` and kept, so the next stick doesn't download again: in `~/.cache/luft-meet` on Linux, and `%LOCALAPPDATA%\Lantharos\Meet Luft\Downloads` on Windows. A newer build replaces the one kept there. They can be deleted any time.

### Erasing the stick

Meet Luft names the stick and asks before erasing it. It writes the ISO to the whole stick, reads everything back and compares its SHA-256 with the ISO's, then ejects the stick.

- **Windows:** the helper locks and dismounts each of the stick's volumes, clears its partition table and writes `\\.\PhysicalDriveN` unbuffered, as Rufus does. Windows then reads the new partitions, and the stick is ejected like *Safely Remove Hardware* does.
- **Linux:** the helper unmounts the stick's partitions through UDisks, opens the drive exclusively with `O_DIRECT`, writes and flushes it, reads it back past the page cache, and powers it off through UDisks.

### Ventoy

A stick made with [Ventoy](https://www.ventoy.net) is recognised the way Ventoy recognises it: its first partition starts at 1 MiB, its second is exactly 32 MiB right after it and is the FAT partition labelled `VTOYEFI` (named `VTOYEFI` too on GPT). Meet Luft then asks whether to add Luft to it, or to erase the whole stick and make it a Luft stick.

Adding copies the ISO into Ventoy's data partition, the large exFAT or NTFS one, next to the other ISOs. On Windows it's opened by its drive letter or volume path; on Linux through UDisks when it isn't mounted yet. Meet Luft checks the free space first, asks before replacing a Luft ISO already on the stick, copies to a temporary name, reads the copy back and compares its SHA-256, and only then gives it its name and ejects the stick.

Luft starts from Ventoy's normal mode, with nothing to set in `ventoy.json`: Ventoy maps the ISO onto a device-mapper device, and Luft's live system looks for its label on every block device, not only on whole sticks. With Secure Boot on, Ventoy asks once, on its own blue screen, to enroll its key.

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

*Remove Luft from this PC* deletes the start entry and every partition Meet Luft made, moving box included, and gives Windows all of its space back. A drive Meet Luft erased stays empty. Once Luft is installed, [*Your Luft*](#once-luft-is-installed) removes it.

### Running it

Meet Luft asks Windows for administrator rights once, when it first looks at the drive. A small helper does the disk and firmware work with those rights; the window itself runs as you, so it sees your own folders and settings. It needs Windows 10 or 11, and an internet connection unless you pick an ISO. The helper loads Windows' libraries and tools only from `System32`, never from the folder Meet Luft is installed in, and keeps what it handles along the way, like exported Wi-Fi networks and Bluetooth keys, in the administrators-only folder above.

When a step doesn't finish, Meet Luft says which one and offers to try it again. What went wrong is written to `%LOCALAPPDATA%\Sabine\logs\meet.jsonl`.

## On Linux

Meet Luft for Linux is an AppImage. It needs UEFI and a GPT drive, and checks Secure Boot, the TPM, the graphics card, the Wi-Fi chip, free space, the EFI system partition and how the system is laid out.

Nothing is repartitioned. Meet Luft keeps the live system as files in a folder, `/home/.luft-meet` on the drive that holds your home folder, or `/var/lib/luft-meet/live` when that one can't be used. The folder has to be on ext4, btrfs or XFS on a plain partition: Luft can't start from an encrypted drive, LVM or RAID yet, and Meet Luft says so. Next to the system's own boot files on the EFI system partition it adds `EFI/luft-meet` with Fedora's signed shim and GRUB, about 5 MB, and a start entry called *Meet Luft*. GRUB reads the kernel and initramfs straight from the folder, and the live system finds it with `root=luft-live:UUID=<file system>/<folder>` on the kernel command line, the folder being its path from the top of the file system (for btrfs, from the top-level subvolume). Restarting sets `BootNext` once, so the restart after that is back in the old system.

Secure Boot can stay on: Luft starts through Fedora's shim and GRUB, like the stick. Luft's own key is only added when it's installed, with the usual blue screen at its first start.

*Luft is ready* offers *Try Luft*, *Replace* and *Install Luft*; [Try Luft with Meet Luft](https://docs.luft.computer/start/meet-luft/#on-linux) describes them.

*Get the newest Luft* and the nightly builds (**Ctrl+Shift+N**) work as on Windows. *Remove Luft from this computer* deletes the folder, `EFI/luft-meet` and the start entry. `/var/lib/luft-meet/made.json` notes what Meet Luft made, so it can always take it back out. At Luft's first start after installing, it removes them itself.

Meet Luft asks for your password through polkit once, when it first looks at the computer; a helper started with `pkexec` does the work on the drive and the firmware, and the window runs as you.

## Language

Meet Luft shows the first of your display languages it's translated into: on Windows the order under *Language & region* in Settings, on Linux the session's `LANGUAGE`, `LC_MESSAGES` and `LANG`. Dates and sizes follow your regional format. It falls back to English, and `LUFT_LOCALE` overrides the choice as everywhere else in Luft. The helper gets the window's language when it starts, so its messages match even when an administrator on another account approves it. Install Luft then starts in the same language: Meet Luft hands over the display language it picked, like `de_AT`, or `en_US` when it fell back to English.

## Signatures

Every published `.sha256` has a [minisign](https://jedisct1.github.io/minisign/) signature next to it, `.sha256.minisig`, whose trusted comment is the name of the ISO it's for. The ISO workflow signs with the `LUFT_ISO_MINISIGN_KEY` Actions secret, and Meet Luft has the public key built in as `PUBLIC_KEY` in `apps/meet/desktop/src/live/signature.rs`. It only accepts checksums signed for the exact ISO it downloads, so an older or other ISO can't be passed off as the one it asked for, and refuses a download without a signature. An ISO picked with *Use an ISO I already have* is the person's own choice and isn't checked against a signature.

To change the key, make a new pair without a password on a computer you trust (`minisign -G -W -p luft-iso.pub -s luft-iso.key`), replace the secret with the whole of `luft-iso.key`, publish ISOs signed with it, and only then put the second line of `luft-iso.pub` into `PUBLIC_KEY`. Copies of Meet Luft with the old key refuse ISOs signed with the new one.

Meet Luft itself isn't signed with an Authenticode certificate yet, so Windows shows it from an unknown publisher. Signing waits on a certificate; with one, the Meet Luft workflow signs `meet.exe` and the setup program through Sabine:

1. Make the certificate available on the Windows runner before the *Find signtool* step, for Certum SimplySign by installing SimplySign Desktop and signing in to it, which puts the certificate in the certificate store.
2. Set the repository variable `WINDOWS_CERTIFICATE_SHA1` to the certificate's thumbprint.
3. Use a Sabine release newer than 0.48, which signs with a certificate from the store.
