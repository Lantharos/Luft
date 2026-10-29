# Image components

The image is built from parts (see [os/README.md](../os/README.md#build-the-image)). Every app, service and Kestrel piece that goes into one has an `image.toml` next to it, which says which part it belongs to and what it installs. The build reads these files: each part gets only the sources its components need, its cache key hashes exactly those, and its programs and files are installed from them.

## A component's sources

A part is built from its components' folders, everything they depend on and the workspace's `Cargo.toml`, `Cargo.lock`, `package.json` and `bun.lock`. Dependencies are found on their own:

- the path dependencies of every crate in the folder, and theirs, from `Cargo.toml`;
- the `workspace:` packages in `package.json`, and theirs.

Anything else the build reads, such as a file another folder's code includes or a relative import into another package, goes in `sources`, as paths from the top of the repository. `bun os/image/parts/components/check.ts` finds `include_str!`, `include_bytes!`, imports and Meson paths that reach outside a part's sources, and the Checks workflow runs it.

## image.toml

```toml
part = "services"
sources = ["kestrel/engine/data/emoji.json"]

[cargo]
profile = "release-abort"
target = "x86_64-unknown-uefi"

[programs]
"/usr/libexec/" = ["luft-updater"]
"/usr/lib64/security/pam_luft_keyring.so" = "libpam_luft_keyring.so"

[files]
"/usr/lib/systemd/system/" = ["data/luft-updater.service", "data/systemd/*.service"]
"/usr/lib/tmpfiles.d/trustd.conf" = "data/trustd.tmpfiles"
"/usr/lib/dracut/modules.d/90trustd/" = [{ from = "data/dracut/module-setup.sh", mode = "755" }]

[links]
"/usr/share/fonts/luft" = "../kestrel/fonts"

[enable]
system = ["luft-updater-check.timer"]
user = ["luft-windows-notice.service"]
```

| Key | Means |
| --- | --- |
| `part` | `kestrel`, `boot`, `services`, or `app-NAME` for an app, which gets a part of its own |
| `sources` | Extra paths the build reads |
| `cargo` | The Cargo profile (default `release`) and target the programs are built with |
| `programs` | Programs built from the crates in the folder, installed with mode 755 |
| `files` | Files from the folder, installed with mode 644; a pattern installs every match |
| `links` | Symbolic links to make |
| `enable` | System and user units turned on by default, written to `40-luft-FOLDER.preset` |

A destination ending in `/` is a folder, and each file keeps its name there. `mode` changes a file's mode. `@libexecdir@`, `@bindir@` and `@pamdir@` in installed files become `/usr/libexec`, `/usr/bin` and `/usr/lib64/security`. Apps install their own programs and desktop files through Sabine, so their `image.toml` only lists units, portals and D-Bus services.

Every file is placed on its own with `install -DZ`, so the same command can stage components anywhere:

```sh
bun os/image/parts/components/install.ts DESTDIR security apps/setup/installer
```

## Adding a component

1. Add `image.toml` to its folder with its part, programs, files and units to enable.
2. Run `bun os/image/parts/components/check.ts`, and add what it reports to `sources`.
3. Build the part with `os/image/build.sh part PART`, or see what it installs with `os/image/build.sh stage PART FOLDER`.

A new part also needs a stage of its own, named after it, in `os/image/parts/Containerfile`.
