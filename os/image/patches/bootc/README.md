# bootc patches

The image build rebuilds Fedora's bootc package with these patches (`image/stages/bootc.sh`), from the source of the exact version in the base image.

| Patch | Why |
| --- | --- |
| `xbootldr.patch` | The composefs backend puts startup images and boot entries on an XBOOTLDR partition next to the EFI system partition when there is one. Next to Windows the EFI system partition is often 100 MB, too small for even one startup image |

The patch is against bootc 1.16.13, the version Fedora 45 ships. Once a release carries the change upstream, the patch and the stage go away.

## Upstream pull request

Not opened yet. On bootc's main branch the booted path finds the ESP from `LoaderDevicePartUUID` (`find_booted_from_esp`), so the change there looks up the XBOOTLDR partition on that ESP's disk instead of walking every disk. The version rebased onto main is `upstream/xbootldr.patch`; it needs a `Signed-off-by` line before it's sent.

Title: composefs: Use an XBOOTLDR partition for UKIs and BLS entries when there is one

> The Boot Loader Specification lets the boot loader read Type #1 entries and UKIs from an Extended Boot Loader Partition (XBOOTLDR) on the same disk as the ESP. bootc's composefs backend always writes them to the ESP today, which doesn't work when the ESP is small. That is the common case when installing next to Windows: Windows usually makes a 100 to 260 MB ESP, a UKI with a full initramfs is easily over 100 MB, and composefs keeps the booted, staged and rollback images side by side.
>
> With this change, for BLS-compatible bootloaders (systemd-boot and grub-cc), bootc looks for a VFAT XBOOTLDR partition on the ESP's disk and, if there is one, uses it for UKIs, UKI addons, Type #1 entries and their kernels and initramfs images, on install, upgrade, rollback, finalize and GC. When booted, it uses the XBOOTLDR partition on the disk of the ESP the system was started from. The boot loader itself, and everything `bootctl install` writes, stays on the ESP. Classic GRUB setups and systems without an XBOOTLDR partition behave as before.
>
> Only VFAT XBOOTLDR partitions are used, since the firmware has to read them; an ext4 /boot typed as XBOOTLDR for GRUB keeps working as it does now.
>
> We've been running this on Luft, a bootc-based desktop that boots sealed UKIs through shim and its own systemd-boot compatible boot menu. Tested in VMs with Secure Boot on: installing next to a Windows-style 100 MB ESP with a 2 GB XBOOTLDR partition, booting, upgrading and rolling back. The ESP only gets the boot loader; Windows' files on it are untouched.
>
> A follow-up could teach `bootc install to-disk` to create an XBOOTLDR partition itself, but that isn't needed for `install to-filesystem` setups, where the installer lays out the disk.
