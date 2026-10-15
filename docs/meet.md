# Meet Luft

Meet Luft gets a Windows PC ready for Luft without a USB stick. It runs in Windows, makes room next to it, and restarts into Luft once, to try it or install it. Windows keeps starting as usual unless you install Luft and choose it. The app is in [apps/meet](../apps/meet/README.md).

## What it does

1. **Checks the PC.** A 64-bit Intel or AMD processor, UEFI and a GPT drive are needed. It also looks at Secure Boot, the TPM, BitLocker, Fast Startup, free space, the graphics card (an NVIDIA card gets the image with NVIDIA's driver later) and the Wi-Fi chip, and says what each means. When Secure Boot is off it explains where to turn it on for that PC's maker, and can restart straight into the firmware settings. Start entries left by systems that are gone, such as an old Ubuntu, can be tidied away, from the firmware and from Windows' own boot configuration.
2. **Makes room.** Windows makes its partition smaller, the same way Disk Management does, so it also works with BitLocker on. Luft's room and Meet Luft's own partitions go right after Windows, in front of a recovery partition at the end of the drive. Then it downloads [luft-latest.iso](https://get.luft.lanth.me/luft-latest.iso), checks it against its `.sha256`, and copies the live system out of it as it arrives. An ISO you already have works too.
3. **Restarts into Luft.** It adds a start entry called *Meet Luft* at the end of the firmware's list and asks the firmware to use it once (`BootNext`). Some firmware drops entries it doesn't know; Meet Luft puts it back before each restart. Luft starts the same way as from the stick, through Fedora's signed shim and GRUB, so Secure Boot can stay on. The restart after that goes back to Windows.
   - *Try Luft* opens the desktop. Nothing is installed.
   - *Install Luft* opens Install Luft with *Alongside Windows* already chosen, in the room Meet Luft made. Nothing on the drive changes until you confirm there.
4. **Packs a moving box**, if you like: folders from your Windows account with their sizes, your wallpaper, your name and account picture, time zone, keyboard and language, Bluetooth devices, and Wi-Fi networks with their passwords (off unless you tick it). Install Luft fills in your name and regional settings from it, and unpacks the rest into your new account.

Before restarting, Meet Luft offers to keep the clock right in both systems (`RealTimeIsUniversal`) and, when installing, to turn off Fast Startup. It changes these in Windows itself, so they work with BitLocker on, where Luft can't read Windows' drive.

## Partitions

| Partition | Size | What's on it |
| --- | --- | --- |
| Luft's room | your choice, at least 32 GB (34 GB next to a small EFI system partition) | Empty until Luft is installed into it |
| Moving box | what you packed, plus a little | exFAT, labelled *Moving box*, with `box.json` listing what's inside |
| Start | about 512 MB | FAT, an EFI system partition of its own with shim, GRUB, the kernel and its initramfs |
| Luft | the live system plus 256 MB | exFAT, labelled *Luft*, with `LiveOS` from the ISO and `meet.json` |

When Windows encrypts new partitions with BitLocker as soon as they're formatted, as it does on PCs with device encryption, Meet Luft decrypts its own right away, so the firmware and Luft can read them. Windows' drive stays encrypted. Meet Luft also notes the partitions it made in `C:\ProgramData\Lantharos\Meet Luft\made.json`, so it can always take them back out.

`meet.json` names Meet Luft's partitions by their GUIDs, the room, the start entry and whether the last restart was to try or to install. The live system finds its partition with `root=luft-live:PARTUUID=…` on the kernel command line; the stick uses `root=luft-live:LABEL=…`. None of the partitions get a drive letter.

After Luft is installed and you sign in for the first time, it removes the start entry, the moving box, the start and live partitions, and grows into the space they used.

## Taking it back out

*Remove Luft from this PC* deletes the start entry and every partition Meet Luft made, moving box included, and gives Windows all of its space back. Once Luft is installed, its partition is Luft's own: remove it from Windows' Disk Management if you go back.

## Running it

Meet Luft asks Windows for administrator rights once, when it first looks at the drive. A small helper does the disk and firmware work with those rights; the window itself runs as you, so it sees your own folders and settings. It needs Windows 10 or 11, and an internet connection unless you pick an ISO.
