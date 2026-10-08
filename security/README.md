# Security

Luft's device security services:

- **trustd** handles how the computer starts and how the disk is protected: Luft's own Secure Boot key, signed kernel images started by SushiBoot, unlocking the disk with the TPM, and encrypting or decrypting disks in place. Settings shows it on its Security page; `trustctl` does the same from the command line.
- **luft-usb-protection** holds back new USB devices while the screen is locked, except keyboards, mice and security keys.

How the pieces protect the computer is in [docs/security.md](../docs/security.md). Boot, recovery and GRUB removal steps are in [docs/boot.md](../docs/boot.md).

| Crate | Builds |
| --- | --- |
| `crates/trust` | `trustd` and `trustctl` |
| `crates/usb` | `luft-usb-protection` |
| `crates/access` | Shared polkit and idle-exit helpers |

## Install

```sh
security/scripts/install.sh install   # build, install and start both services
security/scripts/install.sh remove    # stop and remove them
```

- `security/scripts/build.sh DESTDIR` builds and stages the files without installing.
- Installing changes nothing about how the computer starts or how the disk is protected. Each of those is a separate step in Settings or `trustctl`.
- Removing keeps `/var/lib/trustd`, which holds the sealed keys and the recovery key copy. Once GRUB is removed, the signed startup is how the computer starts and `trustd` has to stay.

## trustctl

All commands need root.

| Command | Does |
| --- | --- |
| `trustctl status` | Shows Secure Boot, the TPM, the key, the startup and the disk |
| `trustctl secure-boot enroll` | Makes the Luft key and asks shim to trust it at the next restart |
| `trustctl secure-boot cancel` | Withdraws that request |
| `trustctl startup install` | Installs SushiBoot, the signed kernel images and the Luft boot entry |
| `trustctl startup uninstall` | Removes them while GRUB is still installed |
| `trustctl startup rebuild` | Rebuilds the initramfs and every signed image |
| `trustctl startup refresh` | Rebuilds images whose kernel got new or changed modules (for example after akmods) |
| `trustctl startup arguments [--add ARGS] [--remove NAMES] [--once]` | Shows or changes the kernel command line inside the signed images |
| `trustctl tpm enroll [--pin]` | Lets the TPM unlock the encrypted disk, optionally with a PIN |
| `trustctl tpm remove` | Removes the TPM unlock |
| `trustctl recovery-key show` / `replace` | Shows or replaces the disk's recovery key |
| `trustctl encryption check` / `on` / `off` | Checks whether the disk can be encrypted, or encrypts or decrypts it in place |
| `trustctl sign efi IN OUT` | Signs an EFI program with the Luft key |

`startup add`, `startup remove`, `sign module` and `encryption initrd` are called by kernel-install, DKMS and the initramfs.

`trustd.service` starts at boot to continue encrypting or decrypting, restore the Luft boot entry, clean up `--once` profiles, note images that failed to start and refresh images after driver builds. Otherwise it exits after a minute without requests.

## Scripts

| Script | Does |
| --- | --- |
| `scripts/install.sh` | Installs or removes the services |
| `scripts/build.sh` | Builds and stages into a folder |
| `scripts/remove-grub-and-gnome.sh` | Final setup step: replaces GRUB and the GNOME services Kestrel replaces ([details](../docs/boot.md#removing-grub-and-gnome-services)) |
| `scripts/recovery-stick.sh` | Writes a verified Fedora Workstation live image to a USB stick |

## D-Bus

| Name | Interface file | Polkit actions |
| --- | --- | --- |
| `com.lantharos.Trust1` | `data/trust/com.lantharos.Trust1.xml` | `com.lantharos.trust.check`, `.manage-encryption`, `.manage-drive-encryption`, `.show-recovery-key` (asked every time), `.manage-secure-boot` |
| `com.lantharos.UsbProtection1` | `data/usb/com.lantharos.UsbProtection1.xml` | `com.lantharos.usb-protection.configure` |

- Reading state is open to everyone. So are `StartupFinished`, which the login screen calls to mark the running image as working, and `Drives.Continue`, which a udev rule calls to resume drive encryption.
- Other drives are on `com.lantharos.Trust1.Drives` at the same object.
- `UsbProtection1` has `Enabled`, `Guarding` and `Held` properties, `SetEnabled(b)`, the `Released(a(ss))` signal and `TakeReleased()`, which lets the session announce what was connected at unlock.

## Testing

`boot/sushi/scripts/vm/security.sh` builds these services into the Sushi VM's root tree before `disk.sh`; see [docs/testing.md](../docs/testing.md#boot-vm).
