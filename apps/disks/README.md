# Disks

Disks shows the drives in your computer and the ones you plug in, and lets you look after them: partitions, formatting, encryption, health and disk images. It is built with Sabine and SvelteKit and lives at `apps/disks`; run the commands below from that directory unless noted otherwise.

## Features

- Every drive in the sidebar, with its partitions drawn to scale and the free space between them. Selecting a partition shows its format, size and how much of it is used, where it is mounted, its device and UUID
- Mount, unmount and open partitions in Rover, rename them, and choose whether one mounts every time the computer starts
- Format a partition or a whole drive by what you will use it with: "All computers" gives exFAT, which Windows, Mac and Linux, cameras and TVs read, "Linux only" gives ext4, and Btrfs, NTFS and FAT32 are a choice away. Formatting can overwrite the old data so it can't be recovered
- New partitions in free space, resizing into the free space after a partition or shrinking a mounted one down to what it holds, and deleting partitions
- Encrypted partitions: unlock and lock them, change the passphrase, and encrypt a partition while formatting it. Passphrases you choose to remember are kept in Luft Keyring, so unlocking later needs no typing
- Health in plain words for SATA and NVMe drives, such as "Healthy" or "This drive reports that it is failing", with the temperature, how long the drive has been running, and quick and full self-tests
- Save a drive or partition as a disk image, and write an image back, with progress. Opening an `.iso` or `.img` file with Disks offers to write it to a drive, which is how you make a bootable USB stick
- Safely remove USB drives: everything on them is unmounted and locked, then the drive is powered off

Anything that erases data asks first, naming the drive and what will be lost. The drive the running system lives on can be looked at but not changed, and so can any partition the system is using, such as the one mounted at `/` or `/boot`; the other partitions on that drive and its free space work as usual.

Changes go through UDisks, so the desktop asks for your password when an action needs it. Rover opens a drive here from "Manage drive…" in a drive's menu, and Settings opens it from Storage in About. Disks also takes a path when it starts and selects the drive and partition holding it, for example `disks /run/media/you/USB` or `disks /dev/sdb`.

## Development

Disks shares its controls, styles and window setup with the other Luft apps through `packages/ui` and `packages/app`, so install dependencies once from the repository root:

```bash
bun install              # from the repository root
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
```

`kestrel/tools/session.sh capture` opens Disks on a stand-in UDisks with an NVMe system drive, an encrypted hard drive, a failing one and a USB stick, and goes through mounting, formatting, unlocking, new partitions, self-tests, safe removal and disk images without touching a real drive.

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
│   │   ├── components/       sidebar, partition map, partition details, actions and health
│   │   ├── dialogs/          format, new partition, resize, unlock, passphrase, startup and disk image dialogs
│   │   └── state/            drives, selection and running actions
│   └── routes/+page.svelte   window layout
└── desktop/src/
    ├── udisks/               drives, partitions, free space, health and watching for changes
    ├── actions/              mounting, formatting, partitions, encryption and drives
    ├── images/               saving and writing disk images
    └── launch.rs             finding the drive for a path given at startup
```

## License

MIT. Open Runde and Maple Mono are licensed under the SIL Open Font License, included in `packages/ui/fonts/OFL.txt` and `packages/ui/fonts/MapleMono-OFL.txt`.
