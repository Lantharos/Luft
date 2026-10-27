# luft-software

The software handling Schelf and Settings share: image updates, system packages, Flatpak, AppImages and command-line tools in a Toolbox container.

## Setup

Add it to an app's `desktop/Cargo.toml`; the root `Cargo.toml` says where it lives:

```toml
luft-software.workspace = true
```

Its modules, image updates, thumbnails, Toolbox tools and system packages are in [the software library reference](../../../docs/components/software.md).

## Checks

```sh
cargo clippy -p luft-software -p luft-updater -p luft-packages -p luft-thumbnailer --all-targets
cargo fmt --check -p luft-software -p luft-updater -p luft-packages -p luft-thumbnailer
cargo test -p luft-software -p luft-updater -p luft-packages -p luft-thumbnailer
```
