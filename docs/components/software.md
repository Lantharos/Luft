# Software library

`luft-software` ([packages/system/software](../../packages/system/software)) is the software handling Schelf and Settings share: which installed packages are apps and which are part of the system, system updates for both kinds of Luft installs, Flatpak, AppImages and command-line tools in a Toolbox container.

## Setup

Add it to an app's `desktop/Cargo.toml`; the root `Cargo.toml` says where it lives:

```toml
luft-software.workspace = true
```

```rust
use luft_software::system::packagekit::Mode;
use luft_software::system::updates::{self, PackageUpdates};

let updates = PackageUpdates::load(Mode::Quiet).await?;
let waiting_in_schelf = updates::app_count(updates.apps.len());
```

Without its default `system` feature (`default-features = false`) it leaves out `packages`, `packagekit`, `image`, `system_packages` and `updates`, and with them D-Bus and `luft-app`.

PackageKit and the image updater are reached over D-Bus, so their functions are async. Flatpak, Toolbox and AppImage work runs programs and downloads, so it stays synchronous and belongs on a thread of its own; a job on such a thread waits for the async parts with `luft_app::block_on`.

## Two kinds of systems

`System::current()` tells them apart at runtime:

- **Packages**: a regular Fedora install. Packages, updates and offline updates go through PackageKit.
- **Image**: a sealed system started from a bootc image with the composefs backend, such as `ghcr.io/lantharos/luft:1`, recognised by `composefs=` on the kernel command line. System updates are new versions of the image, with the previous version kept to go back to. Nothing is layered on the image: apps come from Flatpak and AppImages, command-line tools from a Toolbox container, and the few Fedora packages that must be part of the system, such as services, are merged over it as a system extension.

`LUFT_KERNEL_COMMAND_LINE` names a file to read in place of `/proc/cmdline`, to try either kind on any computer (see [Testing](../testing.md#image-systems)).

Changing the image needs root, so the image side talks to `luft-updater` (in [`services/updater`](../../services/updater)), a small service started on demand over D-Bus that runs `bootc` for it. Updates are found by comparing the image's layers with the registry's through `skopeo inspect`, so checking needs no administrator rights.

## Apps and the system

- A system package is an app when it owns a visible desktop entry directly in `/usr/share/applications`. Everything else is part of the system.
- Flatpak apps and AppImages are always apps. Flatpak runtimes are updated alongside apps.
- `PackageUpdates::load` splits package updates into `apps`, shown in Schelf, and `system`, shown in Settings, so every update appears in exactly one place.

## Modules

Modules come in two groups: `apps` for apps however they're installed, and `system` for the system itself.

| Module | Provides |
| --- | --- |
| `system` | `System::current()`, `Packages` or `Image` |
| `system::packages` | Installing, removing and updating Fedora packages through PackageKit |
| `system::image` | `Deployments` (`load`, `status`, `check`, `lacks`, `variant_offer`, `switch_size`), `download`, `switch`, `rollback`, and `downloading`, `follow` and `changes` for a download started anywhere |
| `variant` | [`luft-variant`](../../packages/system/variant/README.md), which image suits this computer |
| `system::system_packages` | `list`, `install`, `install_file` and `remove` packages merged over an image system as a system extension, through `luft-packages`, and `describe`, `add_repository` and `remove_repository` for the software sources they come from besides Fedora |
| `system::repositories` | `fetch` gets a repository file from the address of a `.repo` file, `copr:owner/project` or a vendor in `KNOWN`, with the keys it names, as a `Draft`; `bundled` reads the one a package file ships or its scriptlets write, `desktop_entry` the menu entry a package file brings, and `added_ids` and `is_added` what's added already |
| `apps::toolbox` | `available` lists Fedora's packages, or those of the added software sources; `install`, `install_file`, `remove`, `installed`, `updates` and `update` manage them in the default Toolbox container, with their commands in `~/.local/bin` |
| `apps::classify` | `Classification::current()`, with `is_app`, `desktop_ids` and `apps`; cached until the RPM database or the applications folder changes |
| `system::updates` | `PackageUpdates` (`load`, `apps`, `system`), `appimages()` for AppImages with an update, and `app_count` for every app update including Flatpak and AppImage |
| `system::packagekit` | `refresh`, `updates`, `resolve`, `resolve_available`, `details`, `install`, `install_file`, `removal_plan`, `remove`, `update`, `prepare` and `follow`; `Mode` (`Quiet`, `Interactive`, `Background`), `Package`, `PackageId`, `PackageDetails`, `Update` and the `filter` flags |
| `system::packagekit::offline` | `prepared()` lists the prepared offline update and `results()` reports how the last one went |
| `system::packagekit::running` | `running()` lists PackageKit transactions in progress and `changes()` streams their changes |
| `apps::flatpak` | `installed`, `updates`, `install`, `install_ref`, `update`, `uninstall`, `add_remote`, `ensure_flathub` and `permissions`, for the user and system `Installation`; `set_full_access` opens an app's sandbox for the account with a Flatpak override and records it in the [permission store](../security.md#app-permissions), or puts it back, and `has_full_access` reads the store; `integrate` turns on touchpad scrolling that follows the fingers on Wayland for installed Chromium-based apps through the flags file their launcher reads, joining the features already listed there and leaving a file that already names the feature alone; it only writes regular text files inside the app's own config folder, never through links |
| `apps::appimage` | `inspect` reads an AppImage's name and icon without running it, and `icons` only its icons; `install` moves it into `~/Applications` and `install_link` links it there from where it is, with a desktop entry named like the one inside it when no other app or entry uses that name (`appimage-<name>` otherwise) and its icon; the entry starts it through Schelf's sandbox (`schelf --sandbox APP-ID`, with `@@`/`@@u` around the files and links it's opened with), with touchpad scrolling that follows the fingers for Chromium-based apps, which `X-Luft-Chromium` marks; `set_full_access` lets it start without the sandbox; `placement` tells where it would go; `repair` rewrites the menu entry and icons of AppImages whose icons don't match their sizes or whose entry starts another Schelf; `list`, `find`, `remove`, `is_appimage`, `payload_offset`; `check` and `update` follow the update information embedded in the file (`zsync` and `gh-releases-zsync`) over HTTPS only, check the download against its SHA-256 when the release publishes one and its SHA-1 otherwise, and when the installed version carries a signing key, only accept an update signed with that key |
| `task` | `Task` (a progress `report` and a `Cancel`) passed to every operation that changes the system; `Cancel::while_running` and `while_awaiting` stop work when it's cancelled; `exclusive` waits until no other process is changing the account's software, reporting `Waiting` meanwhile, and holds that until it's dropped |
| `progress` | `Progress`, `Stage` and `Report` |
| `http` | Shared HTTP agent with `text` and `download` |

## Offline updates

`packagekit::prepare` downloads updates in the background and prepares them as an offline update. They are installed at the next restart into PackageKit's offline update, with progress on the Sushi splash. Kestrel's restart and power off dialog offers to install a prepared update.

## Image updates

`Deployments::status()` gives the running version, a downloaded one waiting for a restart, the previous version, and the previous version when going back to it is queued. `check()` asks the registry for the newest image and how much of it is new. `download` fetches it with `bootc upgrade --download-only`, with progress from bootc's `--progress-fd`. A downloaded update stays locked until Kestrel's restart and power off dialog unlocks it with `Apply`, so leaving the box unticked simply doesn't install it. `rollback` makes the previous version start next time, and calling it again stays on the current one.

`variant_offer` names the other image when it suits the computer better: the NVIDIA one with NVIDIA graphics, the standard one without. `switch` asks the updater to `bootc switch` to it, on the same channel and version, derived from the reference `bootc status` follows; it's staged for the next restart, and the current image stays as the previous version. `switch_size` is how much of it isn't on the computer yet.

Versions and release notes come from the image's labels:

| Label | Shown as |
|-------|----------|
| `org.opencontainers.image.version` | The version, such as 1.20261020.57 |
| `com.lantharos.release-notes` | What's new, as the image's [changelog](../releases.md#changelogs) |

When get.luft.computer is reachable, What's new instead merges the changelogs of every version between the installed one and the offered one.

`services/updater/data` has the service's D-Bus, systemd and polkit files, and `com.lantharos.Updater1.xml` describes its interface. Administrators signed in at the computer can download and install updates, and switch images, without a password, also in the background; going back to the previous version asks. The updater runs `bootc`, which mounts the boot partitions and writes the system's deployments, so its sandbox only keeps it away from home folders, the kernel's modules and logs, and other namespaces than mounts.

## Thumbnails

`luft-thumbnailer` (in [`services/thumbnailer`](../../services/thumbnailer)) is a freedesktop thumbnailer that shows the app's own icon for AppImages, Flatpak bundles and `.flatpakref` files, in Rover and anything else that reads the shared thumbnail cache. It reads an AppImage's icons from its squashfs without running or unpacking it, a bundle's from its header, and a reference's from the icons Flatpak already downloaded for its remotes, so it never goes online. SVG icons are drawn at the size asked for, with only the images embedded in them, never files they point to.

## Command-line tools

On image systems Schelf installs Fedora packages into the default Toolbox container, `fedora-toolbox-45`, creating it the first time from Fedora's toolbox image, pulled through Podman's API so the download shows its progress. Updates for the tools come from `dnf` inside the container and appear in Schelf's Updates. Each command a package puts in `/usr/bin` gets a small launcher in `~/.local/bin`, unless the system already has a command by that name, so it runs from Tern like any other. The list of tools installed this way is kept in `~/.local/share/luft/tools.json`.

## System packages

`luft-packages` (in [`services/packages`](../../services/packages)) builds the system packages: packages from Fedora, from software sources that were added and from package files, merged over the image as one system extension, rebuilt for every version on the computer, including an update right after `luft-updater` downloads it. It builds in a tight sandbox and hands each finished build to a small activation service that brings it into the running system. [System packages](../system-packages.md) explains how. Changing them, or the software sources, always asks for an administrator's password.

`services/packages/data` has its D-Bus, systemd and polkit files, and `com.lantharos.Packages1.xml` describes its interface.
