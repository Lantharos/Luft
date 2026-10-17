# Security

Luft's device security services:

- **trustd** handles how the computer starts and how the disk is protected: adding Luft's Secure Boot key to shim, keeping shim and SushiBoot on the EFI system partition up to date, unlocking the disk with the TPM, and encrypting or decrypting disks in place. Settings shows it on its Security page; `trustctl` does the same from the command line.
- **luft-usb-protection** holds back new USB devices while the screen is locked, except keyboards, mice and security keys.

How the pieces protect the computer is in [docs/security.md](../docs/security.md). Boot and recovery steps are in [docs/boot.md](../docs/boot.md).

| Crate | Builds |
| --- | --- |
| `crates/trust` | `trustd` and `trustctl` |
| `crates/usb` | `luft-usb-protection` |
| `crates/access` | Shared polkit and idle-exit helpers |

## Build

`security/scripts/build.sh DESTDIR` builds the services and stages their files the way the [Luft image](../os/README.md) installs them. trustd keeps `/var/lib/trustd`, which holds the sealed recovery key copy.

## trustctl

All commands need root.

| Command | Does |
| --- | --- |
| `trustctl status` | Shows Secure Boot, the TPM, the key, the startup and the disk |
| `trustctl secure-boot enroll` | Asks shim to trust Luft's key at the next restart and prints the steps |
| `trustctl secure-boot cancel` | Withdraws that request |
| `trustctl secure-boot remove-others` / `keep-others` | Asks shim to remove the keys added from elsewhere at the next restart, or withdraws that |
| `trustctl anti-cheat` | Checks what games with anti-cheat look for ([details](../docs/security.md#games-with-anti-cheat)) |
| `trustctl startup install [--esp DIR]` | Puts shim and SushiBoot on the EFI system partition and makes Luft the firmware's boot entry |
| `trustctl tpm enroll [--pin]` | Lets the TPM unlock the encrypted disk, optionally with a PIN |
| `trustctl tpm remove` | Removes the TPM unlock |
| `trustctl recovery-key show` / `replace` | Shows or replaces the disk's recovery key |
| `trustctl encryption check` / `on` / `off` | Checks whether the disk can be encrypted, or encrypts or decrypts it in place |

`encryption initrd` runs in the initramfs, and `startup went-back` from `trustd-went-back.service` after SushiBoot went back from an update that didn't start ([details](../docs/boot.md#when-an-update-doesnt-start)).

`trustd.service` starts at boot to continue encrypting or decrypting, follow up on the key enrollment, and bring shim and SushiBoot on the EFI system partition up to the running version's, along with the Fedora-signed way to start that stays until Luft's key is added ([details](../docs/boot.md#adding-lufts-secure-boot-key)). Otherwise it exits after a minute without requests.

## D-Bus

| Name | Interface file | Polkit actions |
| --- | --- | --- |
| `com.lantharos.Trust1` | `data/trust/com.lantharos.Trust1.xml` | `com.lantharos.trust.check`, `.manage-encryption`, `.manage-drive-encryption`, `.show-recovery-key` (asked every time), `.manage-secure-boot`, `.remove-other-systems`, `.confirm-startup` (allowed for the active session) |
| `com.lantharos.UsbProtection1` | `data/usb/com.lantharos.UsbProtection1.xml` | `com.lantharos.usb-protection.configure` |

- Reading state is open to everyone. So is `Drives.Continue`, which a udev rule calls to resume drive encryption.
- Kestrel calls `ConfirmStartup` once the login screen or desktop has been up for a few seconds, which marks the running version as one that starts.
- Other drives are on `com.lantharos.Trust1.Drives` at the same object.
- `OtherStartups` lists other systems' boot loaders on the EFI system partition and their start entries. `RemoveStartups`, `RemoveOldSystem` and `GrowSystem` let Disks remove another system and give Luft its space ([details](https://docs.luft.lanth.me/system/remove-other-systems/)).
- `UsbProtection1` has `Enabled`, `Guarding` and `Held` properties, `SetEnabled(b)`, the `Released(a(ss))` signal and `TakeReleased()`, which lets the session announce what was connected at unlock.

## Testing

[os/vm](../os/README.md#try-it-in-a-vm) starts the image with Secure Boot and a TPM, which covers key enrollment, the startup and TPM unlock.
