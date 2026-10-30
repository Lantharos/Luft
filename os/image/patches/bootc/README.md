# bootc patches

The image build rebuilds Fedora's bootc package with these patches ([`parts/stages/rebuild.sh`](../../parts/stages/rebuild.sh)), from the source of the version in the base image, or of 1.17.3 while the base image has an older one. The source comes from Fedora's build system, which keeps every version after the repositories move on.

| Patch | Why |
| --- | --- |
| `boot-counting.patch` | A version that's staged next to the running one gets its boot entry named with the tries in `/usr/lib/kernel/tries` (or `/etc/kernel/tries`), in the Boot Loader Specification's boot counting format, so SushiBoot goes back to the version before when it never reaches the login screen ([details](../../../../docs/boot.md#when-an-update-doesnt-start)) |
| `follow-same-root.patch` | A release is a tested nightly published again, with the same root file system. Switching to it from that nightly, or updating to it, made bootc refuse an image with the running version's fs-verity digest, so the computer kept following the nightly. Now the running version follows the new reference instead, and its boot entry takes the new image's version, so SushiBoot shows it right away |
| `image-version.patch` | The boot entry bootc writes for each version's startup image carries the image's version, the one `bootc status` shows, instead of the startup image's `VERSION_ID`. SushiBoot shows it in its menu, so a release can be a nightly renamed without new layers |
| `require-verity.patch` | The startup image mounts the system only when the image's fs-verity digest is the one its signed command line names, and with fs-verity required on every file in it. The initramfs otherwise lets the composefs repository's `meta.json` decide whether to check fs-verity, and a repository without fs-verity there, as bootc's install before 1.17 made it, mounts an image without checking any file, so replacing the image file was enough to start something else |
| `rollback-entry-names.patch` | `bootc rollback` rewrote both boot entries as `bootc_bootc-…` with matching sort keys, instead of keeping the `bootc_luft-…` names every other change writes. It now keeps the name the entries carry and only swaps which one comes first |
| `staged-entries.patch` | Staging an update over one that was already staged left the earlier version's boot entry next to the new one, since each entry is named after its version. Clean-up then took that version's image away while its entry stayed, and `bootc status` failed from then on, so no update could be staged. Staging now replaces the staged entries |
| `xbootldr.patch` | The composefs backend puts startup images and boot entries on an XBOOTLDR partition next to the EFI system partition when there is one. Next to Windows the EFI system partition is often 100 MB, too small for even one startup image |

The patches are against bootc 1.17.3. A change that a bootc release carries needs no patch, and without patches the stage isn't needed.

## Upstream

`follow-same-root.patch` and `image-version.patch` aren't upstream: bootc's main branch still refuses a switch to the running root and takes the entry's version from the startup image. [UPSTREAM.md](UPSTREAM.md) has the pull requests drafted for both.

`boot-counting.patch` isn't upstream: bootc's main branch writes its entries without a counter, though `kernel-install` gives new entries tries from `/etc/kernel/tries`.

`staged-entries.patch` isn't upstream: bootc's main branch still writes a staged UKI's entries next to those already staged.

`rollback-entry-names.patch` isn't upstream: bootc's main branch still rolls back with `bootc` as the name.

`require-verity.patch` isn't upstream: bootc 1.17.3 and its main branch still let `meta.json` decide whether the initramfs checks fs-verity, even when the command line asks for it.

`xbootldr.patch` is a backport of [bootc-dev/bootc#2573](https://github.com/bootc-dev/bootc/pull/2573), which isn't merged yet; 1.17 still lists a separate XBOOTLDR partition as unsupported. As in the pull request, only systemd-boot uses the XBOOTLDR partition, and `loader/loader.conf` stays on the EFI system partition. A running system keeps using the partition that holds the entry it started from, so a Luft installed onto a shared EFI system partition stays there even if another system adds an XBOOTLDR partition later.

The pull request's documentation and tests aren't part of the patch, nor is moving the partition type list into the block device crate; the patch adds just the XBOOTLDR type there.
