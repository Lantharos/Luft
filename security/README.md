# Security

Luft's device security services. **trustd** adds Luft's Secure Boot key to shim, keeps shim and SushiBoot up to date, unlocks the disk with the TPM, changes the size and place of Luft's partition, and encrypts or decrypts other drives in place; Settings shows it on its Security page and `trustctl` from the command line. **luft-usb-protection** holds back new USB devices while the screen is locked, except keyboards, mice and security keys. **luft-firewall** keeps devices on the network from connecting to the computer, except to the apps people allowed, on home networks or everywhere. **luft-remote-login** turns SSH on and off for Settings, with Luft's defaults, and changes who may sign in and with which keys.

How the pieces protect the computer is in [docs/security.md](../docs/security.md), boot and recovery in [docs/boot.md](../docs/boot.md), and what people see in [Security](https://docs.luft.computer/system/security/).

| Crate | Builds |
| --- | --- |
| `crates/trust` | `trustd` and `trustctl` |
| `crates/firewall` | `luft-firewall` |
| `crates/usb` | `luft-usb-protection` |
| `crates/remote-login` | `luft-remote-login` and `luft-remote-login-generator` |

## Build

`bun os/image/parts/components/install.ts DESTDIR security` builds the services and stages their files the way the [Luft image](../os/README.md) installs them, as `image.toml` lists them. [os/vm](../os/README.md#try-it-in-a-vm) starts the image with Secure Boot and a TPM, which covers key enrollment, the startup and TPM unlock. `vm/firewall/run.sh` and `vm/remote-login/run.sh` check the firewall and remote login in a VM with SELinux enforcing.

## trustctl

All commands need root.

| Command | Does |
| --- | --- |
| `trustctl status` | Shows Secure Boot, the TPM, the key, the startup and the disk |
| `trustctl secure-boot enroll [--state DIR]` / `cancel` | Asks shim to trust Luft's key at the next restart, or withdraws that. `--state` keeps the request in a system that hasn't started yet, as Install Luft does |
| `trustctl secure-boot remove-others` / `keep-others` | Asks shim to remove keys added from elsewhere at the next restart, or withdraws that |
| `trustctl anti-cheat` | Checks what games with anti-cheat look for ([details](../docs/security.md#games-with-anti-cheat)) |
| `trustctl startup install [--esp DIR]` | Puts shim and SushiBoot on the EFI system partition and makes Luft the firmware's boot entry |
| `trustctl tpm enroll [--pin]` / `remove` | Lets the TPM unlock the encrypted disk, optionally with a PIN, or removes that |
| `trustctl recovery-key show` / `replace` | Shows or replaces the disk's recovery key |
| `trustctl encryption format` / `seal` | What Install Luft uses to encrypt Luft's partition and link the TPM before the first start |
| `trustctl system-disk continue` | Carries on with the plan in `/var/lib/trustd/system-disk.json`, or makes one from what Meet Luft asked for ([details](../docs/meet.md#changing-lufts-size)) |
| `trustctl system-disk move` | The startup step that copies Luft to the drive Disks asked it to move to ([details](../docs/boot.md#moving-to-another-drive)) |

## D-Bus

| Name | Interface file | Polkit actions |
| --- | --- | --- |
| `com.lantharos.Trust1` | `data/trust/com.lantharos.Trust1.xml` | `com.lantharos.trust.*` |
| `com.lantharos.UsbProtection1` | `data/usb/com.lantharos.UsbProtection1.xml` | `com.lantharos.usb-protection.configure` |
| `com.lantharos.Firewall1` | `data/firewall/com.lantharos.Firewall1.xml` | `com.lantharos.firewall.*` |
| `com.lantharos.RemoteLogin1` | `data/remote-login/com.lantharos.RemoteLogin1.xml` | `com.lantharos.remote-login.*` |

Reading state is open to everyone. Showing the recovery key asks every time, and confirming that a version started is allowed for the active session. Other drives are on `com.lantharos.Trust1.Drives` at the same object.
