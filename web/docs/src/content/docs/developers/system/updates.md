---
title: Updates and releases
description: Luft's images and version numbers, how the updater finds and stages a new version, and when a nightly is built.
sidebar:
  order: 9
---

Every version of Luft is one sealed bootc image with the composefs backend. An update is the next image, staged for the next restart, with the version before kept to go back to. Nothing is layered on the image: apps come from Flatpak and AppImages, command-line tools from a Toolbox container, and the few Fedora packages that must be part of the system are merged over it as [system packages](/developers/system/system-packages/). [How updates work](/system/updates/) is what people see.

## Images

| Image | For |
| --- | --- |
| `ghcr.io/lantharos/luft:1` | Any computer |
| `ghcr.io/lantharos/luft:1-nvidia` | NVIDIA graphics, with the driver built for the image's kernel and signed with Luft's key |

Nightly builds are `:1-nightly` and `:1-nightly-nvidia`, each also tagged with its version. A stable release is a nightly that was tested and promoted: `:1` gets exactly that nightly's layers, so a computer moving from the nightly to the release downloads nothing.

## Versions

| Version | Shown as | Is |
| --- | --- | --- |
| `1.1` | Luft 1.1 | A stable release: the major version and how many releases came before it, so 1.0 is the first |
| `1.2-nightly.21` | Luft 1.2 Nightly 21 | The 21st nightly on the way to 1.2 |

The major version follows Fedora: Luft 1 is Fedora 45, and Luft 2 moves to Fedora 46, starting again at 2.0. The nightly count starts at 1 after each release and goes up with every nightly published. Versions sort the way they're released, each nightly before the release it leads to.

The version lives only in the image's labels: the `org.opencontainers.image.version` label of its configuration and the same annotation on its manifest. The system inside has none, and `/etc/os-release` says `VERSION="1"`. That is what lets a promotion rename a nightly without touching its layers. Settings, the restart dialog and SushiBoot's menu all read the version that `bootc status` reports, and bootc writes it into each version's boot entry. Moving from a nightly to the release made from it renames the running version's boot entry, so the menu shows the release straight away.

What's new comes from the image's `com.lantharos.release-notes` label, or, when get.luft.computer is reachable, from the changelogs of every version between the installed one and the offered one, merged. The NVIDIA image also names its driver's version in `com.lantharos.nvidia-driver`, such as `620.70.06`, so it's known before the image starts.

## The updater

Changing the image needs root, so Settings and Schelf go through `luft-updater` (`com.lantharos.Updater1`, in `services/updater`), a small service started on demand that runs `bootc`. Its sandbox only keeps it away from home folders, kernel modules and logs, since bootc mounts the boot partitions and writes the system's deployments.

- **Finding.** The updater asks the registry for the image's layers with `skopeo` and compares them with every version on the computer, so checking needs no rights and Settings can show how much a download takes.
- **Staging.** `Download` runs `bootc upgrade --download-only`. A staged update stays locked until Kestrel's restart and power off dialog calls `Apply`, so leaving the box there unticked simply doesn't install it.
- **Going back.** `Rollback` makes the previous version start next time. Calling it again stays on the current one.
- **Switching images.** `SwitchVariant` runs `bootc switch` to the other image on the same channel and version, derived from the reference the system follows, so `:1-nightly` becomes `:1-nightly-nvidia` and `:1.1` becomes `:1.1-nvidia`.

Administrators signed in at the computer may download and stage updates without a password, also in the background. Changing the schedule, switching images or channels, and going back each ask for one, so a program running as an administrator can't quietly turn updates off or change the image.

### Never older

Every image carries its version in its configuration, which the image's signature covers. A check on schedule ignores an older image, and whatever a download or a switch stages is compared with the running version once bootc has checked its signature: when it's older, the updater removes it again with `bootc delete-deployment` and says so, and `Apply` checks once more. A switch that would start the kept version is refused the same way when that version is older. Only `Rollback` starts an older version, and only the one kept on the computer. That keeps anyone from handing a computer an old, signed image with holes fixed since. A system whose own version isn't one of Luft's, such as a development build, takes any image.

### The schedule

The updater owns when updates are looked for. The schedule (every day, every week or only on request) and whether to download what's found live in `/var/lib/luft-updater/schedule.json`, so they're the same for every account and survive going back to an earlier version.

`luft-updater-check.timer` comes by every three hours, up to an hour late so computers don't all ask at once, and after a start or a wake that missed one. It runs only on mains power, and calls `RunSchedule`, which only root may call. The updater checks when the schedule says one is due and NetworkManager doesn't call the connection metered, and downloads when the schedule says so. Either way it sends `UpdateFound`, and Kestrel shows a notification in every open session. When nothing is downloaded, the updater has `luft-packages` bring the system packages up to their newest versions instead.

### Channels

`SwitchChannel` moves a computer between `:1` and `:1-nightly`, keeping its image, and never to an older version; [How updates work](/system/updates/#releases-and-nightly-builds) says what people see while a move waits. The chosen channel stays in the schedule file until the move is done. When the stable version that ends a wait is the very nightly the computer runs, promoted, bootc points the running version at `:1` and the updater renames its boot entry, with nothing downloaded.

### NVIDIA's driver in Flatpak apps

A runtime declares the `org.freedesktop.Platform.GL` extension point with `download-if=active-gl-driver`, and apps with 32-bit parts, such as Steam, declare `org.freedesktop.Platform.GL32` the same way. Flatpak names the active drivers from `/sys/module/nvidia/version` (or `FLATPAK_GL_DRIVERS`), so 620.70.06 wants `org.freedesktop.Platform.GL.nvidia-620-70-06`, and `VAAPI.nvidia` extensions follow `have-kernel-module-nvidia`. It only adds them as related refs of an app or runtime it's installing or updating in that transaction, and only a plain `flatpak update` of everything prunes those whose driver isn't active, taking the one the previous version needs with them. After an image update with a new driver, apps that had nothing to update stay without it.

Schelf fills that in itself, in every installation, from the extension points in the installed apps' and runtimes' metadata. It installs the extensions for the running driver and for the staged version's, read from its `com.lantharos.nvidia-driver` label, on whichever branches the app's own remote has, and removes those for drivers that no version on the computer has. A version without the label could need any of them, so nothing is removed while one is kept. `luft-app-graphics.service` does this at sign-in on computers running NVIDIA's driver, after waiting for NetworkManager to report a connection when there's something to download, and `schelf --update-apps` does it every six hours, which usually fetches the next version's extensions before the restart. Installing or updating a Flatpak in Schelf ends with the same step. Without NVIDIA's driver and nothing installed for one, it reads the installations' folders and stops.

### Sabine and installed apps

Luft's apps run on Sabine's system-wide runtime. Sabine has its own releases, which reach the nightlies first and stable with the next promotion, and the image build fails when its Sabine wouldn't run one of the image's own apps. On a running system, Sabine holds back an update of itself that would stop an installed app, until that app is updated or removed, and Settings names the app.

## When a nightly is built

The Image workflow runs on `main` every night. It builds when there are new commits, Fedora published a new base image, a package Luft adds to Fedora's has an update, a newer CEF build is pinned, or an app the image ships from schelf.store has a newer release. When the commit, base image, CEF build and store releases recorded in the last nightly's labels all match and `os/image/build.sh updates` finds no package updates, the night is skipped.

The same run publishes every app, extension and command-line tool with a `schelf.toml` whose sources changed since its newest release on schelf.store, to the store's nightly channel, at the version in its manifest or the patch version after its newest release. One of them is the `schelf` command in `apps/system/schelf/cli`, the tool `lantharos/schelf`, built as one static program for Intel and one for ARM computers, each on a runner of that kind. Promoting a nightly to stable promotes the store releases it shipped with, so `schelf.store/install` hands out the `schelf` of the newest stable Luft.

Before `:1-nightly` moves, each new image is installed in a VM on the runner the way Install Luft does, started with Secure Boot, signed in to, and checked until the desktop and Settings work ([Testing](/developers/testing/)). When that fails, the nightly isn't published and `:1-nightly` stays on the last one that passed. A new major version lands on the nightlies first, and stable releases are only ever promoted from a nightly.

How the images are signed, and what the build trusts, is in [Keys, signatures and the build](/security/keys/).
