# Disks

Disks shows the drives in your computer and the ones you plug in, and lets you look after them: partitions, formatting, encryption, health and disk images. It is built with Sabine and SvelteKit and lives at `apps/disks`; run the commands below from that directory unless noted otherwise.

## Features

- Every drive in the sidebar, drawn as one bar with its partitions to scale, how full each one is, and the free space between them. Below it, each partition takes one line with its name, format, size and free space, and the one action it most likely needs, such as Open, Mount or Unlock. Everything else is in its menu, and clicking a partition shows the rest: where it is mounted, its device, UUID and partition type
- Mount, unmount and open partitions in Rover, rename them, and choose whether one mounts every time the computer starts
- See what's using space on a partition, or in any folder from Rover: Disks measures it in the background, filling in as it goes, and shows the folders and largest files as a map of rectangles sized by what they take up, with a sorted list underneath. Click a folder to go into it, show anything in Rover, or move it to the trash. Measuring stays on the partition it starts on, counts hard-linked files once, and gets through a folder of two million files in about a quarter of a second on a fast SSD once they have been read before
- Format a partition or a whole drive by what you will use it with: "All computers" gives exFAT, which Windows, Mac and Linux, cameras and TVs read, "Linux only" gives ext4, and Btrfs, NTFS and FAT32 are a choice away. Formatting can overwrite the old data so it can't be recovered
- New partitions in free space, resizing into the free space after a partition or shrinking a mounted one down to what it holds, and deleting partitions
- Encrypted partitions: unlock and lock them, change the passphrase, and encrypt a partition while formatting it. Passphrases you choose to remember are kept in Luft Keyring, so unlocking later needs no typing
- Turn on encryption for any drive or partition the system doesn't need to start, keeping what's on it, the way BitLocker does: a check says whether there's room for it, the recovery key is shown with ways to save, print or copy it, and you choose whether it unlocks automatically on this computer (at startup for drives inside it, as soon as it's plugged in for removable ones) and whether it also takes a passphrase for other computers. It stays usable while it's encrypted in the background, shows its progress in its row, and can be paused and resumed; a restart, unplugging it or a power cut only pauses it. File systems that can't make room, such as a full exFAT stick, can be encrypted by formatting instead, with a clear warning. A partition's Encryption sheet turns unlocking automatically on or off, shows the recovery key this computer keeps or makes a new one, changes the passphrase, and turns encryption off again for drives inside the computer. The work itself happens in the system's device trust service, so it needs the security services installed; unlocking automatically also needs device encryption to be on in Settings
- Health in plain words for SATA and NVMe drives, such as "Healthy" or "Failing", in one line under the partitions. Clicking it shows the temperature, how long the drive has been running, unreadable sectors, and quick and full self-tests
- Save a drive or partition as a disk image, and write an image back, with progress. Opening an `.iso` or `.img` file with Disks offers to write it to a drive, which is how you make a bootable USB stick
- Safely remove USB drives: everything on them is unmounted and locked, then the drive is powered off

Anything that erases data asks first, naming the drive and what will be lost. The drive the running system lives on can be looked at but not changed, and so can any partition the system is using, such as the one mounted at `/` or `/boot`; the other partitions on that drive and its free space work as usual.

Changes go through UDisks, so the desktop asks for your password when an action needs it. Rover opens a drive here from "Manage drive…" in a drive's menu, and Settings opens it from Storage in About. Disks also takes a path when it starts and selects the drive and partition holding it, for example `disks /run/media/you/USB` or `disks /dev/sdb`, and `disks disks-space:///home/you/Videos` opens what's using space in that folder.

## Development

Disks shares its controls, styles and window setup with the other Luft apps through `packages/ui` and `packages/app`, so install dependencies once from the repository root:

```bash
bun install              # from the repository root
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
```

`kestrel/tools/session.sh capture` opens Disks on a stand-in UDisks with an NVMe system drive, an encrypted hard drive, a failing one and a USB stick, and goes through mounting, formatting, unlocking, new partitions, self-tests, safe removal and disk images without touching a real drive. A stand-in device trust service lets it turn on encryption for a partition and unlocking automatically for the encrypted drive, and it measures a folder it makes in the test home and moves its largest folder to the trash.

## Install

```bash
sabine install .
```

## Project layout

```
disks/
├── src/
│   ├── lib/
│   │   ├── api.ts            bridge commands and events
│   │   ├── components/       sidebar, the drive's bar and partition list, actions, and the space map and list
│   │   ├── dialogs/          details, health, encryption, format, new partition, resize, unlock, passphrase, startup and disk image dialogs
│   │   └── state/            drives, running actions and what's being measured
│   └── routes/+page.svelte   window layout
└── desktop/src/
    ├── udisks/               drives, partitions, free space, health and watching for changes
    ├── actions/              mounting, formatting, partitions, encryption and drives
    ├── images/               saving and writing disk images
    ├── space/                measuring what's using space, in parallel
    ├── trust/                encrypting drives through the device trust service
    └── launch.rs             finding the drive for a path given at startup
```

## License

MIT. Open Runde and Maple Mono are licensed under the SIL Open Font License, included in `packages/ui/fonts/OFL.txt` and `packages/ui/fonts/MapleMono-OFL.txt`.
