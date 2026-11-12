---
title: How Luft fits together
description: The image, the boot chain, Kestrel, the apps and the services behind them, and where each of them keeps its state.
sidebar:
  order: 1
---

Luft is a Fedora system with its own desktop, apps, boot chain and security services, all built from one repository, [Lantharos/Luft](https://github.com/Lantharos/Luft), and shipped as one signed image.

## The image

Luft ships as a [bootc](https://bootc-dev.github.io/bootc/) image built on `quay.io/fedora/fedora-bootc:45`, published as `ghcr.io/lantharos/luft:1` and `:1-nvidia`, with nightly builds as `:1-nightly` and `:1-nightly-nvidia`. Luft's versions start at 1 and don't follow Fedora's. Every build compiles Kestrel, the keyring, trustd, Sushi and the apps from the repository, and adds the codecs and NVIDIA's driver while it's built.

- The image is put together from **parts**, each an image named after a hash of its sources, so a build only remakes what changed. [Building Luft](/developers/building/#what-goes-into-a-part) explains how a folder joins a part.
- It's split into **layers by package**, so an update downloads only the layers whose packages changed. The NVIDIA image is the standard one plus the driver, so they share every layer below it.
- It's **sealed**: a signed startup image names the image's exact root file system by its composefs digest. Nothing is layered on top on the computer. Apps come from Flatpak and AppImages, command-line tools from Toolbox, and the few Fedora packages that must be part of the system are merged over it as a system extension ([System packages](/developers/system/system-packages/)).

Releases come from tags, and nightly builds from main every night it changed. [Updates and releases](/developers/system/updates/) covers how a computer moves between them.

## The boot chain

```
firmware → shim (signed by Microsoft) → SushiBoot (Luft's key)
         → startup image: kernel + initramfs + command line (Luft's key)
         → composefs root, checked file by file against the digest
```

- **SushiBoot** is Luft's UEFI boot menu. It reads Boot Loader Specification entries, counts tries for new versions and falls back to the last one that worked, and measures what it starts into the TPM like systemd-boot.
- **Sushi** is the boot splash, in place of Plymouth. It keeps the firmware logo on screen from power-on to the login screen, asks for disk passphrases, and shows update progress.
- **trustd** handles Secure Boot key enrollment, keeps shim and SushiBoot up to date, unlocks the disk with the TPM, is the one service that changes the size and place of Luft's partition, and encrypts other drives in place. `trustctl` is its command line.

[Boot and recovery](/developers/system/boot/) follows a start from power-on to the desktop, and [Keys, signatures and the build](/security/keys/) says which key signs what.

## Kestrel

Kestrel is the desktop shell and login screen:

| Part | What it is |
| --- | --- |
| `kestrel/compositor` | A patch series on Mutter 51: rounded corners, the board's transformed window group, blur, variable refresh for games, default display scales, GPU reset recovery and more |
| `kestrel/engine` | The native shell, forked from GNOME Shell 51: the St toolkit, window management, authentication, the lock screen, screenshots and the D-Bus services apps and portals use |
| `kestrel/ui` | The taskbar, Start, Quick settings and every other surface, in TypeScript, built into the engine's resources |
| `kestrel/wrapper`, `kestrel/session` | The process that starts Kestrel and keeps its display, and the session manager |
| `kestrel/settings` | `kestrel-settings`, in place of gnome-settings-daemon: XSETTINGS, Night Light, power, printing and time zones |
| `kestrel/greeter`, `kestrel/portal`, `kestrel/search`, `kestrel/post` | The login screen's service, the portal backend, the file index behind Start, and Post |
| `kestrel/keyring`, `kestrel/passkeys` | Luft Keyring and Luft Passkeys |
| `kestrel/watchdog` | Restarts cleanly when the GPU hangs |

The session identifies as `Kestrel;GNOME`, so apps that look for GNOME keep their keyring, theme and autostart behaviour. Kestrel backs every xdg-desktop-portal interface except file dialogs, which [Rover](/apps/rover/) provides, and secrets, which Luft Keyring provides. [Kestrel](/developers/desktop/kestrel/) describes the session and how it survives crashes, and [The compositor](/developers/desktop/compositor/) the Mutter patches.

## The apps

Luft's apps are built with [Sabine](https://github.com/Lantharos/Sabine): a Svelte interface on a Rust native side, running on a system-wide web runtime that ships in the image, so no app prepares anything on first launch. [Writing a Luft app](/developers/desktop/writing-apps/) starts one, and [Opening Settings and Keys](/developers/desktop/links/) has the links any app can use to open their pages.

| Package | Provides |
| --- | --- |
| `packages/web/ui` (`@luft/ui`) | Design tokens, Open Runde and Maple Mono, window chrome, controls, dialogs, the command palette, motion presets and date, size and path formatting |
| `packages/app` (`luft-app`) | The native window with its blurred sidebar, single-instance activation, Kestrel's palette, D-Bus, portals, settings files and folder watching |
| `packages/web/motion` | Motion tokens shared by Kestrel and the apps |
| `packages/dbus` | D-Bus connections, service properties and named errors |
| `packages/system/software` | System updates, Flatpak, AppImages and Toolbox, shared by Settings and Schelf |
| `packages/system/*` | What Settings and the other apps share for the system: drives, networking, accounts, fingerprints, trustd, Windows on the same computer, choosing the image, and Meet Luft's plans |

## The services

Apps reach the system through D-Bus services in `services` and `security` that run with only the rights they need: `com.lantharos.Updater1` for updates, `com.lantharos.Packages1` for system packages, `com.lantharos.Trust1` for trustd, `com.lantharos.Installer1` for the installer, `com.lantharos.Accounts1` for cloud drives, and `com.lantharos.Windows1` for Windows on the same computer. Each checks polkit for what it changes, and says why a call failed the way [D-Bus interfaces](/developers/desktop/dbus/#errors) describes.

Every name is in the `com.lantharos` namespace: app IDs such as `com.lantharos.rover`, GSettings schemas such as `com.lantharos.kestrel`, and D-Bus names such as `com.lantharos.Kestrel`.

## Where state lives

Every version of the system on the computer has its own copy of `/etc`. An update takes the running version's `/etc`, merges in what the new image changed, and gives the result to the new version; going back starts the older version with the `/etc` it had. `/var` is one folder every version shares.

So anything a service writes to `/etc` belongs to one version only. Going back loses it, and updating from there carries the loss forward for good: a software source added to `/etc/yum.repos.d` would vanish while the list of packages from it in `/var` stayed, and a drive set to unlock by itself through `/etc/crypttab` would stop doing so. The rule follows from that:

- What a Luft service writes lives in `/var/lib/<service>`.
- Defaults live in `/usr`, in the image.
- A stock tool that only reads its configuration from `/etc` gets its view at runtime: from a file in `/run`, from a generator in `/usr/lib/systemd/system-generators` that reads the state in `/var`, or from a drop-in in `/usr` that points it at `/var`. trustd's drives and remote login's choices both reach systemd through generators this way.
- `/etc` is for configuration an administrator chooses for this computer through the system's own tools: the host name, the time zone, network connections, users and groups. Those are meant to merge into each new version.

The one place Luft writes into `/etc` itself is settling system packages: configuration files that packages bring are copied there when they're missing, at every start, so a version that lacks them gets them back.

`/etc/passwd` and `/etc/group` belong to the computer, and systemd-sysusers gives a new system group the next free ID there. Image files carry a group's ID, not its name, so a group that owns files in the image has a fixed ID from 290 up, the bottom of the range Fedora hands out from the top: `luft-keyring` is 290 and `luft-passkeys` 291. The image build stops when one comes out different.

`bun .github/scripts/etc/index.ts` keeps the rule. It looks for `/etc` paths in Luft's code, and every one has to be listed in `.github/scripts/etc/allowed.json` with the reason it's fine: the code only reads it, or it's configuration an administrator chooses. A new path fails until it's listed, and a listed path that's gone from the code fails too.

## Memory

When apps ask for more memory than the computer has, Luft closes the app using the most and keeps the desktop running.

- Every app Kestrel starts gets its own systemd scope, so its memory counts against it and the whole app closes together.
- systemd-oomd closes the group reclaiming the most when apps, background tasks or containers stall on memory for 10 seconds, or memory and swap are both nearly full.
- When Kestrel itself stops drawing for 6 seconds while waiting on memory and less than a tenth of memory and swap is left, `kestrel-settings` closes the biggest app or container at once, and again every 10 seconds until Kestrel draws. It listens through the kernel's pressure notifications, so it does no work while there's enough memory. Before that point, Kestrel warns and offers to force quit the biggest app.
- Kestrel keeps 384 MB that is never reclaimed and up to 640 MB reclaimed last; the session services keep 32 MB each. If the kernel has to pick, apps score 200, Kestrel −900 and the session services −800.
- An app that holds nine tenths of memory is made to give memory back as it asks for more, so it slows down instead of the desktop, and it may run at most a tenth of the processes the computer allows.

Swap is zram with zstd, up to the size of memory and at most 8 GB, with swappiness at 180, since reading compressed memory back is much cheaper than reading a disk.
