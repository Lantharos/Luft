# bootc patches

The image build rebuilds Fedora's bootc package with these patches ([`parts/stages/rebuild.sh`](../../parts/stages/rebuild.sh)), from the source of the version in the base image, or of 1.17.5 while the base image has an older one. The source comes from Fedora's build system, which keeps every version after the repositories move on.

| Patch | Why |
| --- | --- |
| `boot-counting.patch` | A version that's staged next to the running one gets its boot entry named with the tries in `/usr/lib/kernel/tries` (or `/etc/kernel/tries`), in the Boot Loader Specification's boot counting format, so SushiBoot goes back to the version before when it never reaches the login screen ([details](https://docs.luft.computer/developers/system/boot/#when-an-update-doesnt-start)) |
| `follow-same-root.patch` | A release is a tested nightly published again, with the same root file system. Switching to it from that nightly, or updating to it, made bootc refuse an image with the running version's fs-verity digest, so the computer kept following the nightly. Now the running version follows the new reference instead, and its boot entry takes the new image's version, so SushiBoot shows it right away |
| `grub-started.patch` | Until shim trusts Luft's key, Luft starts through Fedora's signed GRUB ([details](https://docs.luft.computer/developers/system/boot/#before-lufts-key-is-trusted)), which names itself in `LoaderInfo`. bootc took that for a GRUB system and looked for GRUB's configuration, so `bootc status` failed on those starts, and with it updates and the version in Settings. A GRUB with no GRUB directory next to the Boot Loader Specification entries now counts as starting those entries, as it does |
| `image-version.patch` | The boot entry bootc writes for each version's startup image carries the image's version, the one `bootc status` shows, instead of the startup image's `VERSION_ID`. SushiBoot shows it in its menu, so a release can be a nightly renamed without new layers |
| `root-partition.patch` | The startup image tells systemd which device the system is on, so that it finds the EFI system partition and the startup partition on the same drive and mounts them at `/boot` and `/efi` when something opens them. On an encrypted Luft it named the unlocked volume, where systemd finds no partitions, so nothing was mounted there, `systemd-bless-boot` never marked an update as good, and SushiBoot went back to the version before on the fourth start. It now names the partition the volume sits on |

The patches are against bootc 1.17.5, and the build applies them in reverse alphabetical order. A change that a bootc release carries needs no patch, and without patches the stage isn't needed.

## Upstream

`grub-started.patch` is [bootc-dev/bootc#2646](https://github.com/bootc-dev/bootc/pull/2646), which isn't merged yet: bootc 1.17.5 takes any `LoaderInfo` other than systemd-boot's or GRUB CC's for a GRUB system.

`follow-same-root.patch` and `image-version.patch` aren't upstream: bootc's main branch still refuses a switch to the running root and takes the entry's version from the startup image. [UPSTREAM.md](UPSTREAM.md) has the pull requests drafted for both.

`boot-counting.patch` isn't upstream: bootc's main branch writes its entries without a counter, though `kernel-install` gives new entries tries from `/etc/kernel/tries`.

`root-partition.patch` is a simpler form of [bootc-dev/bootc#2651](https://github.com/bootc-dev/bootc/pull/2651), which isn't merged yet: bootc's main branch still links `/run/systemd/volatile-root` to `/dev/gpt-auto-root` as it is.
