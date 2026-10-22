# Disks

Disks shows the drives in your computer and the ones you plug in, and looks after their partitions, formatting, encryption, health and disk images. It can also remove another system and give Luft its space. Using it is described in [the docs](https://docs.luft.computer/apps/disks/).

Changes go through UDisks, and encryption through [trustd](../../security/README.md). Anything that erases data asks first. The partitions the running system uses can't be changed, except that trustd grows or shrinks Luft's own partition in place.

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
| `disks disks-space:///path/to/folder` | What's using space in that folder |
| `disks disks-system://ID` | Removing that other system, as Settings opens it |

## Testing

`kestrel/tools/session.sh capture` runs Disks against a stand-in UDisks, keyring and trustd without touching a real drive.

`vm/run.sh` installs Luft next to a Windows-like drive and an old Linux in a VM, removes both from the installed system, and checks that Luft grew and still starts. It needs Podman, QEMU with KVM, OVMF and `localhost/luft-system:45` from `os/image/build.sh`.

## License

MIT. Open Runde and Maple Mono are under the SIL Open Font License, in `packages/web/ui/fonts`.
