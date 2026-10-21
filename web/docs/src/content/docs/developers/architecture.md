---
title: How Luft fits together
description: The image, the boot chain, Kestrel, the apps and the services behind them.
sidebar:
  order: 1
---

Luft is a Fedora system with its own desktop, apps, boot chain and security services, all built from one repository, [Lantharos/Luft](https://github.com/Lantharos/Luft), and shipped as one signed image.

## The image

Luft ships as a [bootc](https://bootc-dev.github.io/bootc/) image built on `quay.io/fedora/fedora-bootc:45`, published as `ghcr.io/lantharos/luft:1` and `:1-nvidia`, with nightly builds as `:1-nightly` and `:1-nightly-nvidia`. Luft's versions start at 1 and don't follow Fedora's. Every build compiles Kestrel, the keyring, trustd, Sushi and the apps from the repository, and adds the codecs and NVIDIA's driver while it's built.

- The image is put together from **parts**, each an image named after a hash of its sources, so a build only remakes what changed.
- It's split into **layers by package**, so an update downloads only the layers whose packages changed. The NVIDIA image is the standard one plus the driver, so they share every layer below it.
- It's **sealed**: a signed startup image names the image's exact root file system by its composefs digest. Nothing is layered on top on the computer; apps come from Flatpak and AppImages, and command-line tools from Toolbox.

Releases come from tags, and nightly builds from main every night it changed. [Updates](/system/updates/) describes what users see.

## The boot chain

```
firmware → shim (signed by Microsoft) → SushiBoot (Luft's key)
         → startup image: kernel + initramfs + command line (Luft's key)
         → composefs root, checked file by file against the digest
```

- **SushiBoot** is Luft's UEFI boot menu. It reads Boot Loader Specification entries, counts tries for new versions and falls back to the last one that worked, and measures what it starts into the TPM like systemd-boot.
- **Sushi** is the boot splash, in place of Plymouth. It keeps the firmware logo on screen from power-on to the login screen, asks for disk passphrases, and shows update progress.
- **trustd** handles Secure Boot key enrollment, keeps shim and SushiBoot up to date, unlocks the disk with the TPM, and encrypts disks in place. `trustctl` is its command line.

[Boot and recovery](/reference/boot/) and the [Security model](/reference/security/) go into the details.

## Kestrel

Kestrel is the desktop shell and login screen:

| Part | What it is |
| --- | --- |
| `kestrel/compositor` | A patch series on Mutter 51: rounded corners, the board's transformed window group, blur, variable refresh for games, default display scales, GPU reset recovery and more |
| `kestrel/engine` | The native shell, forked from GNOME Shell 51: the St toolkit, window management, authentication, the lock screen, screenshots and the D-Bus services apps and portals use |
| `kestrel/ui` | The taskbar, Start, Quick settings and every other surface, in TypeScript, built into the engine's resources |
| `kestrel/settings` | `kestrel-settings`, in place of gnome-settings-daemon: XSETTINGS, Night Light, power, printing and time zones |
| `kestrel/search` | `kestrel-search`, the file index behind Start |
| `kestrel/keyring`, `kestrel/passkeys` | Luft Keyring and Luft Passkeys |
| `kestrel/watchdog` | Restarts cleanly when the GPU hangs |

The session identifies as `Kestrel;GNOME`, so apps that look for GNOME keep their behaviour. Kestrel backs every xdg-desktop-portal interface except file dialogs, which [Rover](/apps/rover/) provides, and secrets, which Luft Keyring provides.

## The apps

Luft's apps are built with [Sabine](https://github.com/Lantharos/Sabine): a Svelte interface on a Rust native side, running on a system-wide web runtime that ships in the image, so no app prepares anything on first launch.

| Package | Provides |
| --- | --- |
| `packages/web/ui` (`@luft/ui`) | Design tokens, Open Runde and Maple Mono, window chrome, controls, dialogs, the command palette, motion presets and date, size and path formatting |
| `packages/app` (`luft-app`) | The native window with its blurred sidebar, single-instance activation, Kestrel's palette, D-Bus, portals, settings files and folder watching |
| `packages/web/motion` | Motion tokens shared by Kestrel and the apps |
| `packages/dbus` | D-Bus connections and service properties |
| `packages/system/software` | System updates, Flatpak, AppImages and Toolbox, shared by Settings and Schelf |
| `packages/system/accounts` | Online accounts and the cloud drives they bring |
| `packages/system/disks`, `network`, `fingerprint`, `windows`, `variant`, `meet` | Drives, networking, fingerprints, Windows on the same computer, choosing the image, and Meet Luft's plans |
| `packages/web/network` (`@luft/network`) | The TypeScript calls Settings and Install Luft make to `luft-network` |
| `packages/web/settings-pages` | Settings' pages with their titles and search words, which Start searches too |
| `packages/system/trust` | Calls to trustd, the security service, with its errors translated |

Apps reach the system through D-Bus services that run with only the rights they need, most of them from `services`: `com.lantharos.Updater1` for updates, `com.lantharos.Trust1` for trustd, `com.lantharos.Installer1` for the installer, `com.lantharos.Accounts1` for cloud drives, and `com.lantharos.Windows1` for Windows on the same computer. Each checks polkit for what it changes.

Every name is in the `com.lantharos` namespace: app IDs such as `com.lantharos.rover`, GSettings schemas such as `com.lantharos.kestrel`, and D-Bus names such as `com.lantharos.Kestrel`.

## Colours and motion

Kestrel derives a palette from the wallpaper and publishes it on D-Bus and as files, so apps match the desktop. Kestrel and the apps share one set of motion tokens, so they move at the same pace. See [Wallpaper colours](/reference/appearance/) and [Motion](/reference/motion/).
