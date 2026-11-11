# Disks

Disks shows the drives in your computer and the ones you plug in, and looks after their partitions, formatting, encryption, health and disk images. It can also remove another system, give Luft free space next to it, and move Luft to another drive. Using it is described in [the docs](https://docs.luft.computer/apps/disks/).

Changes go through UDisks, and encryption through [trustd](../../../security/README.md). Anything that erases data asks first. Moving a partition is journalled under `~/.local/state/disks/moves`, so an interrupted move is finished the next time Disks sees the drive. The partitions the running system uses can't be changed, except that trustd grows or shrinks Luft's own partition in place, and moves it into free space in front of it, or to another drive, at the next start.

## Build and run

Install dependencies once from the repository root with `bun install`, then from this folder:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # release bundle
sabine install --bundle .
```

Installing registers Disks for `.iso` and raw disk image files.

| Argument | Opens |
|----------|-------|
| `disks /run/media/USER/LABEL` | The drive and partition holding that path |
| `disks /dev/sdb` | That drive |
| `disks image.iso` | Write that image to a drive |
| `disks disks-space:///path/to/folder` | What's using space in that folder, with what can be freed when your home folder is inside it |
| `disks disks-system://ID` | Removing that other system, as Settings opens it |
| `disks disks-luft:` | Giving Luft the free space next to it, as Meet Luft opens it on Luft |

## Testing

`kestrel/tools/session.sh capture` runs Disks against a stand-in UDisks, keyring and trustd without touching a real drive.

`vm/run.sh` installs Luft next to a Windows-like drive and an old Linux in a VM, removes both from the installed system, and checks that Luft grew and still starts. `vm/grow/run.sh` installs an encrypted Luft next to Windows, leaves free space in front of it, right after it and behind other partitions, checks what Disks offers for each, grows Luft into the space after it, then lets it move into the space in front at the next start, cuts the power in the middle of the move and checks that it finishes and starts again. `vm/move/run.sh` installs an encrypted Luft with Secure Boot on next to Windows on a SATA drive, with an NVMe drive holding an NTFS data partition and an empty drive, moves Luft into room made on the data partition with a power cut in the middle of copying, checks that the files, a Flatpak, a setting and a Wi-Fi network came along and that the TPM unlocks the new drive, removes the old copy and gives its space back to Windows, then moves Luft onto the whole empty drive. They need Podman, QEMU with KVM, OVMF, swtpm and `localhost/luft-system:45` from `os/image/build.sh`.

## License

MIT. Open Runde and Maple Mono are under the SIL Open Font License, in `packages/web/ui/fonts`.
