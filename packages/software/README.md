# luft-software

The software handling Schelf and Settings share: which installed packages are apps and which are part of the system, system updates for both kinds of Luft installs, Flatpak, AppImages and command-line tools in a Toolbox container.

## Setup

Add it to an app's `desktop/Cargo.toml` by path:

```toml
luft-software = { path = "../../../packages/software" }
```

```rust
use luft_software::packagekit::Mode;
use luft_software::updates::{self, PackageUpdates};

let updates = PackageUpdates::load(Mode::Quiet).await?;
let waiting_in_schelf = updates::app_count(updates.apps.len());
```

PackageKit and the image updater are reached over D-Bus, so their functions are async. Flatpak, Toolbox and AppImage work runs programs and downloads, so it stays synchronous and belongs on a thread of its own; a job on such a thread waits for the async parts with `luft_app::block_on`.

## Two kinds of systems

`System::current()` tells them apart at runtime:

- **Packages**: a regular Fedora install. Packages, updates and offline updates go through PackageKit.
- **Image**: a sealed system started from a bootc image with the composefs backend, such as `ghcr.io/lantharos/luft:45`, recognised by `composefs=` on the kernel command line. System updates are new versions of the image, with the previous version kept to go back to. Nothing is layered on the image: apps come from Flatpak and AppImages, and command-line tools from a Toolbox container.

Changing the image needs root, so the image side talks to `luft-updater` (in `updater/`), a small service started on demand over D-Bus that runs `bootc` for it. Updates are found by comparing the image's layers with the registry's through `skopeo inspect`, so checking needs no administrator rights.

## Apps and the system

- A system package is an app when it owns a visible desktop entry directly in `/usr/share/applications`. Everything else is part of the system.
- Flatpak apps and AppImages are always apps. Flatpak runtimes are updated alongside apps.
- `PackageUpdates::load` splits package updates into `apps`, shown in Schelf, and `system`, shown in Settings, so every update appears in exactly one place.

## Modules

| Module | Provides |
| --- | --- |
| `system` | `System::current()`, `Packages` or `Image` |
| `packages` | Installing, removing and updating Fedora packages through PackageKit |
| `image` | `Deployments` (`load`, `status`, `check`, `lacks`, `variant_offer`, `switch_size`), `download`, `switch`, `rollback`, and `downloading`, `follow` and `changes` for a download started anywhere |
| `variant` | [`luft-variant`](../variant/README.md), which image suits this computer |
| `toolbox` | `available` lists Fedora's packages; `install`, `install_file`, `remove`, `installed`, `updates` and `update` manage them in the default Toolbox container, with their commands in `~/.local/bin` |
| `classify` | `Classification::current()`, with `is_app`, `desktop_ids` and `apps`; cached until the RPM database or the applications folder changes |
| `updates` | `PackageUpdates` (`load`, `apps`, `system`), `appimages()` for AppImages with an update, and `app_count` for every app update including Flatpak and AppImage |
| `packagekit` | `refresh`, `updates`, `resolve`, `resolve_available`, `details`, `install`, `install_file`, `removal_plan`, `remove`, `update`, `prepare` and `follow`; `Mode` (`Quiet`, `Interactive`, `Background`), `Package`, `PackageId`, `PackageDetails`, `Update` and the `filter` flags |
| `packagekit::offline` | `prepared()` lists the prepared offline update and `results()` reports how the last one went |
| `packagekit::running` | `running()` lists PackageKit transactions in progress and `changes()` streams their changes |
| `flatpak` | `installed`, `updates`, `install`, `install_ref`, `update`, `uninstall`, `add_remote`, `ensure_flathub` and `permissions`, for the user and system `Installation` |
| `appimage` | `inspect` reads an AppImage's name and icon without running it; `install` moves it into `~/Applications` and `install_copy` copies it there, with a desktop entry named like the one inside it and its icon; `placement` tells where it would go; `list`, `find`, `remove`, `is_appimage`; `check` and `update` follow the update information embedded in the file (`zsync` and `gh-releases-zsync`) |
| `task` | `Task` (a progress `report` and a `Cancel`) passed to every operation that changes the system; `Cancel::while_running` and `while_awaiting` stop work when it's cancelled |
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
| `org.opencontainers.image.version` | The version, such as 45.2 |
| `com.lantharos.release-notes` | What's new, as plain text |

`updater/data` has the service's D-Bus, systemd and polkit files, and `com.lantharos.Updater1.xml` describes its interface. Administrators can download and install updates, and switch images, without a password, also in the background; going back to the previous version asks.

## Command-line tools

On image systems Schelf installs Fedora packages into the default Toolbox container, `fedora-toolbox-45`, creating it the first time from Fedora's toolbox image, pulled through Podman's API so the download shows its progress. Updates for the tools come from `dnf` inside the container and appear in Schelf's Updates. Each command a package puts in `/usr/bin` gets a small launcher in `~/.local/bin`, unless the system already has a command by that name, so it runs from Tern like any other. The list of tools installed this way is kept in `~/.local/share/luft/tools.json`.

## Checks

```sh
cargo clippy
cargo fmt --check
cargo test
(cd updater && cargo clippy && cargo test)
```
