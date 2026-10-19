# luft-software

The software handling Schelf and Settings share: which installed packages are apps and which are part of the system, system updates for both kinds of Luft installs, Flatpak, AppImages and command-line tools in a Toolbox container.

## Setup

Add it to an app's `desktop/Cargo.toml` by path:

```toml
luft-software = { path = "../../../packages/software" }
```

How it tells apps from the system, its modules, image and offline updates, thumbnails, Toolbox tools and system packages are in [the software library reference](../../docs/components/software.md).

## Checks

```sh
cargo clippy
cargo fmt --check
cargo test
(cd updater && cargo clippy && cargo test)
(cd thumbnailer && cargo clippy)
```
