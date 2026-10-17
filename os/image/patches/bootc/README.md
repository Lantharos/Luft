# bootc patches

The image build rebuilds Fedora's bootc package with these patches (`image/parts/stages/bootc.sh`), from the source of the exact version in the base image.

| Patch | Why |
| --- | --- |
| `local-store.patch` | Installing from an image in containers-storage, as the USB stick and Meet Luft's folder have, reads it straight from the store's layers. Through skopeo, every layer was first copied to `/var/tmp`, several at once, which is in memory on the stick: about 4 GB for the NVIDIA image, more than a computer with 8 GB of RAM has to spare |
| `xbootldr.patch` | The composefs backend puts startup images and boot entries on an XBOOTLDR partition next to the EFI system partition when there is one. Next to Windows the EFI system partition is often 100 MB, too small for even one startup image |

The patches are against bootc 1.16.13, the version Fedora 45 ships. Once a release carries a change upstream, its patch goes away, and the stage with the last one.

## Upstream

`local-store.patch` isn't upstream yet: bootc's direct pull leaves composefs' containers-storage import off and only uses it for its unified storage.

`xbootldr.patch` is a backport of [bootc-dev/bootc#2573](https://github.com/bootc-dev/bootc/pull/2573). As there, only systemd-boot uses the XBOOTLDR partition, and `loader/loader.conf` stays on the EFI system partition. A running system keeps using the partition that holds the entry it started from, so a Luft installed onto a shared EFI system partition stays there even if another system adds an XBOOTLDR partition later.

The pull request's documentation and tests aren't part of the patch, nor is moving the partition type list into the block device crate; the patch adds just the XBOOTLDR type there.
