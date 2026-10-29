# Software library

`luft-software` ([packages/system/software](../../packages/system/software)) is the software handling Schelf and Settings share: image updates, system packages, Flatpak, AppImages and command-line tools in a Toolbox container.

## Setup

Add it to an app's `desktop/Cargo.toml`; the root `Cargo.toml` says where it lives:

```toml
luft-software.workspace = true
```

```rust
use luft_software::apps::updates;
use luft_software::system::image::Deployments;

let status = Deployments::load().await?.status();
let waiting_in_schelf = updates::count();
```

Without its default `system` feature (`default-features = false`) it leaves out `image` and `system_packages`, and with them D-Bus and `luft-app`.

The image updater and the system packages service are reached over D-Bus, so their functions are async. Flatpak, Toolbox and AppImage work runs programs and downloads, so it stays synchronous and belongs on a thread of its own; a job on such a thread waits for the async parts with `luft_app::block_on`.

## The system

Luft is a sealed system started from a bootc image with the composefs backend, such as `ghcr.io/lantharos/luft:1`. System updates are new versions of the image, with the previous version kept to go back to. Nothing is layered on the image: apps come from Flatpak and AppImages, command-line tools from a Toolbox container, and the few Fedora packages that must be part of the system, such as services, are merged over it as a system extension.

Changing the image needs root, so the image side talks to `luft-updater` (in [`services/updater`](../../services/updater)), a small service started on demand over D-Bus that runs `bootc` for it. Updates are found by comparing the image's layers with the registry's through `skopeo inspect`, so checking needs no administrator rights.

## Modules

Modules come in two groups: `apps` for apps however they're installed, and `system` for the system itself.

| Module | Provides |
| --- | --- |
| `system::image` | `Deployments` (`load`, `status`, `check`, `lacks`, `variant_offer`, `switch_size`), `download`, `switch`, `rollback`, and `downloading`, `follow` and `changes` for a download started anywhere |
| `variant` | [`luft-variant`](../../packages/system/variant/README.md), which image suits this computer |
| `system::system_packages` | `list`, `install`, `install_file` and `remove` packages merged over an image system as a system extension, through `luft-packages`, and `describe`, `add_repository` and `remove_repository` for the software sources they come from besides Fedora |
| `system::repositories` | `fetch` gets a repository file from the address of a `.repo` file, `copr:owner/project` or a vendor in `KNOWN`, with the keys it names, as a `Draft`; `bundled` reads the one a package file ships or its scriptlets write, `desktop_entry` the menu entry a package file brings, and `added_ids` and `is_added` what's added already |
| `apps::toolbox` | `available` lists Fedora's packages, or those of the added software sources; `install`, `install_file`, `remove`, `installed`, `updates` and `update` manage them in the default Toolbox container, with their commands in `~/.local/bin` |
| `apps::updates` | `appimages()` for AppImages with an update, and `count()` for every Flatpak and AppImage update |
| `apps::flatpak` | `installed`, `updates`, `install`, `install_ref`, `update`, `uninstall`, `add_remote`, `ensure_flathub` and `permissions`, for the user and system `Installation`; `set_full_access` opens an app's sandbox for the account with a Flatpak override and records it in the [permission store](../security.md#app-permissions), or puts it back, and `has_full_access` reads the store; `integrate` turns on touchpad scrolling that follows the fingers on Wayland for installed Chromium-based apps through the flags file their launcher reads, joining the features already listed there and leaving a file that already names the feature alone; it only writes regular text files inside the app's own config folder, never through links |
| `apps::appimage` | `inspect` reads an AppImage's name and icon without running it, and `icons` only its icons; `install` moves it into `~/Applications` and `install_link` links it there from where it is, with a desktop entry named after its app ID and its icon; the app ID is the name of the desktop entry inside it, or else the AppImage's own file name, when that is a reverse-DNS ID such as `org.example.App` outside `com.lantharos` that no other app or entry uses, and `org.appimage.<name>` otherwise; the entry starts it through Schelf's sandbox (`schelf --sandbox APP-ID`, with `@@`/`@@u` around the files and links it's opened with), with touchpad scrolling that follows the fingers for Chromium-based apps, which `X-Luft-Chromium` marks; `set_full_access` lets it start without the sandbox; `placement` tells where it would go; `repair` rewrites the menu entry and icons of AppImages whose icons don't match their sizes or whose entry starts another Schelf; `list`, `find`, `remove`, `is_appimage`, `payload_offset`; `check` and `update` follow the update information embedded in the file (`zsync` and `gh-releases-zsync`) over HTTPS only, check the download against its SHA-256 when the release publishes one and its SHA-1 otherwise, and when the installed version carries a signing key, only accept an update signed with that key |
| `task` | `Task` (a progress `report` and a `Cancel`) passed to every operation that changes the system; `Cancel::while_running` and `while_awaiting` stop work when it's cancelled; `exclusive` waits until no other process is changing the account's software, reporting `Waiting` meanwhile, and holds that until it's dropped |
| `progress` | `Progress`, `Stage` and `Report` |
| `http` | Shared HTTP agent with `text` and `download` |

## Image updates

`Deployments::status()` gives the running version, a downloaded one waiting for a restart, the previous version, and the previous version when going back to it is queued. `check()` asks the registry for the newest image and how much of it is new. `download` fetches it with `bootc upgrade --download-only`, with progress from bootc's `--progress-fd`. A downloaded update stays locked until Kestrel's restart and power off dialog unlocks it with `Apply`, so leaving the box unticked simply doesn't install it. `rollback` makes the previous version start next time, and calling it again stays on the current one.

`variant_offer` names the other image when it suits the computer better: the NVIDIA one with NVIDIA graphics, the standard one without. `switch` asks the updater to `bootc switch` to it, on the same channel and version, derived from the reference `bootc status` follows; it's staged for the next restart, and the current image stays as the previous version. `switch_size` is how much of it isn't on the computer yet.

Versions and release notes come from the image's labels:

| Label | Shown as |
|-------|----------|
| `org.opencontainers.image.version` | The version, such as 1.1 or 1.2-nightly.21 |
| `com.lantharos.release-notes` | What's new, as the image's [changelog](../releases.md#changelogs) |

When get.luft.computer is reachable, What's new instead merges the changelogs of every version between the installed one and the offered one.

### Schedule

The updater owns when updates are looked for. The schedule, every day, every week or only when someone checks, and whether what's found is downloaded too, is kept in `/var/lib/luft-updater/schedule.json` with the time of the last check, so it's the same for every account and survives going back to an earlier version. Settings reads it from the `Schedule`, `DownloadAutomatically` and `LastChecked` properties and changes it with `SetSchedule`.

`luft-updater-check.timer`, a system timer, comes by every hour and calls `RunSchedule`, which only root may call. The updater checks when the schedule says one is due, the computer isn't running on its battery and NetworkManager doesn't call the connection metered; otherwise it waits for the next hour. It asks the registry for the image's layers with `skopeo` and compares them with every version on the computer, then downloads and stages the update like `Download` does when the schedule says so. Either way it sends `UpdateFound`, and Kestrel shows a notification for it in every session that's open, which opens System in Settings. When Settings opens after a check on schedule that came after the account's own, it checks again, so it shows what was found.

`services/updater/data` has the service's D-Bus, systemd and polkit files, and `com.lantharos.Updater1.xml` describes its interface. Administrators signed in at the computer can download and install updates, switch images and change the schedule without a password, also in the background; going back to the previous version asks. The updater runs `bootc`, which mounts the boot partitions and writes the system's deployments, so its sandbox only keeps it away from home folders, the kernel's modules and logs, and other namespaces than mounts.

## Thumbnails

`luft-thumbnailer` (in [`services/thumbnailer`](../../services/thumbnailer)) is a freedesktop thumbnailer that shows the app's own icon for AppImages, Flatpak bundles and `.flatpakref` files, in Rover and anything else that reads the shared thumbnail cache. It reads an AppImage's icons from its squashfs without running or unpacking it, a bundle's from its header, and a reference's from the icons Flatpak already downloaded for its remotes, so it never goes online. SVG icons are drawn at the size asked for, with only the images embedded in them, never files they point to.

## Command-line tools

Schelf installs Fedora packages into the default Toolbox container, `fedora-toolbox-45`, creating it the first time from Fedora's toolbox image, pulled through Podman's API so the download shows its progress. Updates for the tools come from `dnf` inside the container and appear in Schelf's Updates. Each command a package puts in `/usr/bin` gets a small launcher in `~/.local/bin`, unless the system already has a command by that name, so it runs from Tern like any other. The list of tools installed this way is kept in `~/.local/share/luft/tools.json`.

## System packages

`luft-packages` (in [`services/packages`](../../services/packages)) builds the system packages: packages from Fedora, from software sources that were added and from package files, merged over the image as one system extension, rebuilt for every version on the computer, including an update right after `luft-updater` downloads it. It builds in a tight sandbox and hands each finished build to a small activation service that brings it into the running system. [System packages](../system-packages.md) explains how. Changing them, or the software sources, always asks for an administrator's password.

`services/packages/data` has its D-Bus, systemd and polkit files, and `com.lantharos.Packages1.xml` describes its interface.
