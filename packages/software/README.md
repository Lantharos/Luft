# luft-software

The software handling Schelf and Settings share: which installed packages are apps and which are part of the system, a PackageKit client, Flatpak, AppImages and offline updates. Add it to an app's `desktop/Cargo.toml` by path:

```toml
luft-software = { path = "../../../packages/software" }
```

## Apps and the system

`classify::Classification` decides what counts as an app. A package from the system's software sources is an app when it owns a visible desktop entry directly in `/usr/share/applications`, meaning one with `Type=Application` that isn't marked `NoDisplay` or `Hidden`. Every other package, from the kernel and firmware to libraries and services, is part of the system. Flatpak apps and AppImages are always apps, and Flatpak runtimes are the platforms those apps run on, so they are updated alongside apps.

The classification is read from the RPM database in a single query and kept until the database or the applications folder changes, so asking again is free.

`updates::PackageUpdates::load` splits the available package updates into `apps` and `system` with that rule. Schelf shows the first and Settings the second, so no update appears in both and none is missed. `updates::app_count` adds the Flatpak and AppImage updates on top, for Settings to say how many app updates are waiting in Schelf.

## PackageKit

`packagekit` talks to PackageKit over D-Bus: listing updates with their sizes and installed versions, resolving and describing packages, installing from the software sources or from a file, removing, updating, and refreshing the metadata. `removal_plan` lists what else would be removed with a package, without changing anything. Every operation that changes the system takes a `task::Task`, which reports progress and can be cancelled; installing and removing ask for permission through polkit as the system is set up to.

`packagekit::prepare` downloads updates in the background and prepares them as an offline update. They are installed the next time the computer restarts into PackageKit's offline update, which reports its progress through Plymouth's protocol, so the Sushi splash shows it. `offline::prepared` lists what is prepared and `offline::results` reports how the last offline update went. The restart and power-off dialog in Kestrel offers to install a prepared update and schedules it.

## Flatpak

`flatpak` lists installed apps and runtimes in both the user and the system installation, finds updates for both at once, and installs, updates and uninstalls with progress through the `flatpak` command. `permissions` reads what an installed app may access.

## AppImages

`appimage` reads the desktop entry and icon straight out of an AppImage's SquashFS without running it, installs it into `~/Applications` with a desktop entry and icon, lists installed AppImages, including ones another tool put elsewhere, and removes them. `check` and `update` follow the update information embedded in the file (`zsync` and `gh-releases-zsync`): the zsync control file says where the newest release is and what its SHA-1 is, which is compared with the installed file and checked again after downloading.

## Checks

```bash
cargo clippy
cargo fmt --check
```
