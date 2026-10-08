# luft-software

The software handling Schelf and Settings share: which installed packages are apps and which are part of the system, a PackageKit client, Flatpak, AppImages and offline updates.

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

## Apps and the system

- A system package is an app when it owns a visible desktop entry directly in `/usr/share/applications`. Everything else is part of the system.
- Flatpak apps and AppImages are always apps. Flatpak runtimes are updated alongside apps.
- `PackageUpdates::load` splits package updates into `apps`, shown in Schelf, and `system`, shown in Settings, so every update appears in exactly one place.

## Modules

| Module | Provides |
| --- | --- |
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

## Checks

```sh
cargo clippy
cargo fmt --check
```
