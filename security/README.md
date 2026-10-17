# Security

Luft's device security services. **trustd** adds Luft's Secure Boot key to shim, keeps shim and SushiBoot up to date, unlocks the disk with the TPM, and encrypts or decrypts disks in place; Settings shows it on its Security page and `trustctl` from the command line. **luft-usb-protection** holds back new USB devices while the screen is locked, except keyboards, mice and security keys.

How the pieces protect the computer is in [docs/security.md](../docs/security.md), boot and recovery in [docs/boot.md](../docs/boot.md), and what people see in [Security](https://docs.luft.computer/system/security/).

| Crate | Builds |
| --- | --- |
| `crates/trust` | `trustd` and `trustctl` |
| `crates/usb` | `luft-usb-protection` |
| `crates/access` | Shared polkit and idle-exit helpers |

## Build

`security/scripts/build.sh DESTDIR` builds the services and stages their files the way the [Luft image](../os/README.md) installs them. [os/vm](../os/README.md#try-it-in-a-vm) starts the image with Secure Boot and a TPM, which covers key enrollment, the startup and TPM unlock.

## trustctl

All commands need root.

| Command | Does |
| --- | --- |
| `trustctl status` | Shows Secure Boot, the TPM, the key, the startup and the disk |
| `trustctl secure-boot enroll` / `cancel` | Asks shim to trust Luft's key at the next restart, or withdraws that |
| `trustctl secure-boot remove-others` / `keep-others` | Asks shim to remove keys added from elsewhere at the next restart, or withdraws that |
| `trustctl anti-cheat` | Checks what games with anti-cheat look for ([details](../docs/security.md#games-with-anti-cheat)) |
| `trustctl startup install [--esp DIR]` | Puts shim and SushiBoot on the EFI system partition and makes Luft the firmware's boot entry |
| `trustctl tpm enroll [--pin]` / `remove` | Lets the TPM unlock the encrypted disk, optionally with a PIN, or removes that |
| `trustctl recovery-key show` / `replace` | Shows or replaces the disk's recovery key |
| `trustctl encryption check` / `on` / `off` | Checks whether the disk can be encrypted, or encrypts or decrypts it in place |

## D-Bus

| Name | Interface file | Polkit actions |
| --- | --- | --- |
| `com.lantharos.Trust1` | `data/trust/com.lantharos.Trust1.xml` | `com.lantharos.trust.*` |
| `com.lantharos.UsbProtection1` | `data/usb/com.lantharos.UsbProtection1.xml` | `com.lantharos.usb-protection.configure` |

Reading state is open to everyone. Showing the recovery key asks every time, and confirming that a version started is allowed for the active session. Other drives are on `com.lantharos.Trust1.Drives` at the same object.
