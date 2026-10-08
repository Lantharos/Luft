# Disks

Disks shows the drives in your computer and the ones you plug in, and looks after their partitions, formatting, encryption, health and disk images. It is built with Sabine and Svelte.

## Features

- Each drive as one bar with its partitions to scale, and a list with the likeliest action per partition (Open, Mount, Unlock)
- Mount, unmount, rename, open in Rover, and choose whether a partition mounts at startup
- See what's using space on a partition or in any folder, as a map and a sorted list; open items in Rover or move them to the trash
- Format by purpose: "All computers" (exFAT), "Linux only" (ext4), or Btrfs, NTFS and FAT32, optionally overwriting old data
- A partition editor: create, delete, grow, shrink and move partitions as a plan with undo, applied in one step
- Unlock, lock and change the passphrase of encrypted partitions, with passphrases remembered in Luft Keyring
- Turn on encryption in place, keeping the data, with a recovery key and optional automatic unlocking on this computer
- Health and self-tests for SATA and NVMe drives
- Save a drive or partition as a disk image and write images back, including making a bootable USB stick from an `.iso`
- Safely remove USB drives

Anything that erases data asks first. The drive the running system lives on can be viewed, but the partitions it uses can't be changed. Changes go through UDisks, which asks for your password when needed. Encryption needs trustd; automatic unlocking also needs device encryption turned on in Settings.

## Build and run

Install dependencies once from the repository root with `bun install`, then from this directory:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # release bundle
```

## Install

```sh
sabine install --bundle .
```

Installing registers Disks for `.iso` and raw disk image files. Rover opens it from "Manage drive…" in a drive's menu, and Settings from "Manage drives" in About.

## Testing

`kestrel/tools/session.sh capture` runs Disks against a stand-in UDisks, keyring and trustd without touching a real drive.

## Command line

| Argument | Opens |
|----------|-------|
| `disks /run/media/you/USB` | The drive and partition holding that path |
| `disks /dev/sdb` | That drive |
| `disks image.iso` | Write that image to a drive |
| `disks disks-space:///home/you/Videos` | What's using space in that folder |

## License

MIT. Open Runde and Maple Mono are licensed under the SIL Open Font License, included in `packages/ui/fonts/OFL.txt` and `packages/ui/fonts/MapleMono-OFL.txt`.
