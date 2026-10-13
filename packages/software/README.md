# luft-software

The software handling Schelf and Settings share: which installed packages are apps and which are part of the system, system updates for both kinds of Luft installs, Flatpak and AppImages.

## Setup

Add it to an app's `desktop/Cargo.toml` by path:

```toml
luft-software = { path = "../../../packages/software" }
```

```rust
use luft_software::packagekit::Mode;
use luft_software::updates::{self, PackageUpdates};

let updates = PackageUpdates::load(Mode::Quiet)?;
let waiting_in_schelf = updates::app_count(&updates);
```

## Two kinds of systems

`System::current()` tells them apart at runtime:

- **Packages**: a regular Fedora install. Packages, updates and offline updates go through PackageKit.
- **Image**: a system booted from a bootc image, such as `ghcr.io/lantharos/luft:45`. System updates are new versions of the image, downloaded and staged in the background and applied at the next restart, with the previous version kept to go back to. Fedora packages installed from Schelf are layered on top of the image and also arrive at the next restart.

The image side talks to rpm-ostree's daemon over D-Bus. It reads the same deployments as `bootc status`, and keeps working once packages are layered, which `bootc upgrade` refuses. Updates are found by comparing the image's layers with the registry's through `skopeo inspect`, so checking needs no administrator rights.

## Apps and the system

- A system package is an app when it owns a visible desktop entry directly in `/usr/share/applications`. Everything else is part of the system.
- Flatpak apps and AppImages are always apps. Flatpak runtimes are updated alongside apps.
- `PackageUpdates::load` splits package updates into `apps`, shown in Schelf, and `system`, shown in Settings, so every update appears in exactly one place.

## Modules

| Module | Provides |
| --- | --- |
| `system` | `System::current()`, `Packages` or `Image` |
| `packages` | Installing, removing and updating Fedora packages on either kind of system, and `Packages::current()` with what changes at the next restart |
| `image` | `Deployments` (`load`, `status`, `check`, `lacks`), `download`, `rollback`, `install`, `remove`, `install_file`, `follow`, and `running` for transactions in progress |
| `classify` | `Classification::current()`, with `is_app`, `desktop_ids` and `apps`; cached until the RPM database or the applications folder changes |
| `updates` | `PackageUpdates` (`load`, `apps`, `system`), `appimages()` for AppImages with an update, and `app_count` for every app update including Flatpak and AppImage |
| `packagekit` | `refresh`, `updates`, `resolve`, `resolve_available`, `details`, `install`, `install_file`, `removal_plan`, `remove`, `update`, `prepare` and `follow`; `Mode` (`Quiet`, `Interactive`, `Background`), `Package`, `PackageId`, `PackageDetails`, `Update` and the `filter` flags |
| `packagekit::offline` | `prepared()` lists the prepared offline update and `results()` reports how the last one went |
| `packagekit::running` | `running()` lists PackageKit transactions in progress and `watch` calls back when they change |
| `flatpak` | `installed`, `updates`, `install`, `install_ref`, `update`, `uninstall`, `add_remote`, `ensure_flathub` and `permissions`, for the user and system `Installation` |
| `appimage` | `inspect` reads an AppImage's name and icon without running it; `install` puts it in `~/Applications` with a desktop entry and icon; `list`, `find`, `remove`, `is_appimage`; `check` and `update` follow the update information embedded in the file (`zsync` and `gh-releases-zsync`) |
| `task` | `Task` (a progress `report` and a `Cancel`) passed to every operation that changes the system |
| `progress` | `Progress`, `Stage` and `Report` |
| `http` | Shared HTTP agent with `text` and `download` |

## Offline updates

`packagekit::prepare` downloads updates in the background and prepares them as an offline update. They are installed at the next restart into PackageKit's offline update, with progress on the Sushi splash. Kestrel's restart and power off dialog offers to install a prepared update.

## Image updates

`Deployments::status()` gives the running version, a downloaded one waiting for a restart, the previous version and any packages that change at the restart. `check()` asks the registry for the newest image and how much of it is new. `download` stages it and `rollback` makes the previous version start next time; calling `rollback` again stays on the current one. Kestrel's restart and power off dialog names the waiting version, and unticking it removes the download.

Versions and release notes come from the image's labels:

| Label | Shown as |
|-------|----------|
| `org.opencontainers.image.version` | The version, such as 45.2 |
| `com.lantharos.release-notes` | What's new, as plain text |

Images install `data/50-luft-system-updates.rules` to `/usr/share/polkit-1/rules.d/`, so administrators can check for and download updates without a password, also in the background. Going back and changing packages still ask.

## Checks

```sh
cargo clippy
cargo fmt --check
cargo test
```
