# bootc patches

The image build rebuilds Fedora's bootc package with these patches ([`parts/stages/bootc.sh`](../../parts/stages/bootc.sh)), from the source of the exact version in the base image.

| Patch | Why |
| --- | --- |
| `local-store.patch` | Installing from an image in containers-storage, as the USB stick and Meet Luft's folder have, reads it straight from the store's layers. Going through skopeo would copy every layer to `/var/tmp` first, several at once, which is in memory on the stick: about 4 GB for the NVIDIA image, more than a computer with 8 GB of RAM has to spare |
| `require-verity.patch` | The startup image mounts the system only when the image's fs-verity digest is the one its signed command line names, and with fs-verity required on every file in it. bootc's install creates the composefs repository through a pre-flight check that leaves fs-verity off in its `meta.json`, and the initramfs took that as permission to mount an image without fs-verity and without checking any file, so replacing the image file was enough to start something else |
| `xbootldr.patch` | The composefs backend puts startup images and boot entries on an XBOOTLDR partition next to the EFI system partition when there is one. Next to Windows the EFI system partition is often 100 MB, too small for even one startup image |

The patches are against bootc 1.16.13, the version Fedora 45 ships. A change that a bootc release carries needs no patch, and without patches the stage isn't needed.

## Upstream

`require-verity.patch` isn't upstream: bootc's main branch still lets `meta.json` decide whether the initramfs checks fs-verity, even when the command line asks for it. It has fixed the pre-flight check, so new installs there get a repository that requires fs-verity.

`local-store.patch` isn't upstream: bootc's direct pull leaves composefs' containers-storage import off and only uses it for its unified storage.

`xbootldr.patch` is a backport of [bootc-dev/bootc#2573](https://github.com/bootc-dev/bootc/pull/2573). As there, only systemd-boot uses the XBOOTLDR partition, and `loader/loader.conf` stays on the EFI system partition. A running system keeps using the partition that holds the entry it started from, so a Luft installed onto a shared EFI system partition stays there even if another system adds an XBOOTLDR partition later.

The pull request's documentation and tests aren't part of the patch, nor is moving the partition type list into the block device crate; the patch adds just the XBOOTLDR type there.
