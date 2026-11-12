# luft-software

The software handling Schelf and Settings share: image updates, system packages, Flatpak, AppImages and command-line tools in a Toolbox container.

## Setup

Add it to an app's `desktop/Cargo.toml`; the root `Cargo.toml` says where it lives:

```toml
luft-software.workspace = true
```

How image updates work is in [Updates and releases](https://docs.luft.computer/developers/system/updates/).

## Checks

```sh
cargo clippy -p luft-software -p luft-updater -p luft-packages -p luft-thumbnailer --all-targets
cargo fmt --check -p luft-software -p luft-updater -p luft-packages -p luft-thumbnailer
cargo test -p luft-software -p luft-updater -p luft-packages -p luft-thumbnailer
```
