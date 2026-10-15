# bootc patches

The image build rebuilds Fedora's bootc package with these patches (`image/stages/bootc.sh`), from the source of the exact version in the base image.

| Patch | Why |
| --- | --- |
| `xbootldr.patch` | The composefs backend puts startup images and boot entries on an XBOOTLDR partition next to the EFI system partition when there is one. Next to Windows the EFI system partition is often 100 MB, too small for even one startup image |

The patch is against bootc 1.16.13, the version Fedora 45 ships. Once a release carries the change upstream, the patch and the stage go away.

## Upstream pull request

Not opened yet. The branch is [krissedout/bootc `composefs-xbootldr`](https://github.com/krissedout/bootc/tree/composefs-xbootldr), on bootc's main branch; [open the pull request](https://github.com/bootc-dev/bootc/compare/main...krissedout:bootc:composefs-xbootldr?expand=1) with this title and description.

Upstream, only systemd-boot uses the XBOOTLDR partition, and `loader/loader.conf` stays on the ESP.

Title: composefs: Use an XBOOTLDR partition with systemd-boot

> The Boot Loader Specification lets systemd-boot read Type #1 entries and UKIs from an Extended Boot Loader Partition (XBOOTLDR) on the ESP's disk. The composefs backend always writes them to the ESP, which doesn't work when the ESP is small. That's the usual case when installing next to Windows: its ESP is often 100 MB, a UKI with a full initramfs can be bigger than that, and composefs keeps the booted, staged and rollback ones side by side.
>
> With systemd-boot, bootc now looks for a VFAT XBOOTLDR partition next to the ESP and, if there is one, puts the UKIs, BLS entries and their kernels and initramfs images there: on install, on upgrade, and through BootedStorage for rollback, finalize and GC. When booted, it uses the XBOOTLDR partition next to the ESP named by LoaderDevicePartUUID. The boot loader and loader.conf, which systemd-boot only reads from the ESP, stay on the ESP. Systems without an XBOOTLDR partition behave as before. GRUB keeps its own /boot handling, and grub-cc is left alone since I couldn't confirm it reads XBOOTLDR. Only VFAT partitions are used, so an ext4 /boot typed as XBOOTLDR for GRUB keeps working as it does now.
>
> We use this in Luft, a bootc-based desktop that boots sealed UKIs through shim and systemd-boot, where we've carried it as a patch on 1.16.13. There it's been tested in VMs with Secure Boot on: installing with bootc install to-filesystem next to a Windows-style 100 MB ESP with a 2 GB XBOOTLDR partition, booting, upgrading and rolling back. The ESP only gets the boot loader, and Windows' files on it are untouched.
>
> On this branch, just validate and just unit-tests pass, including a table-driven test for the XBOOTLDR lookup. The new tmt test, test-61-composefs-xbootldr, shrinks the VM's ESP to 100 MiB, puts a VFAT XBOOTLDR partition in the space that frees, moves bootc's entries there, then switches, upgrades and rolls back. It checks that the entries and binaries are on the XBOOTLDR partition, that GC keeps exactly what the entries refer to, and that bootc writes nothing to the ESP. It passes with systemd-boot for both BLS entries and unsealed UKIs on centos-bootc stream10, and skips itself with GRUB. My libvirt has no storage driver, so rather than through just test-tmt I ran the same script stage by stage in a qemu VM installed with bcvk to-disk.
>
> Out of scope: bootc install to-disk doesn't create an XBOOTLDR partition, so this is for install to-filesystem setups where the installer lays out the disk. bootctl install still only gets the ESP, without --boot-path, since bootc writes the entries itself.
>
> Assisted-by: AI
