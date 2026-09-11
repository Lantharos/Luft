# Development

## Dependencies

The workspace uses Rust and Bun. The shell UI is built with the shared Sabine CEF runtime and loads a generated single-file web bundle from its installed resource directory.

For X11 application support, install `xwayland-satellite` and `Xwayland`. Luft starts the satellite process automatically when `compositor.xwayland = true`.

The DRM/KMS backend requires libseat and graphics/input development packages. The Luft screencast portal also requires PipeWire development headers and libclang for Rust binding generation. On Fedora, install `wayland-devel`, `libwayland-server`, `libdisplay-info-devel`, `glib2-devel`, `libseat-devel`, `systemd-devel`, `mesa-libgbm-devel`, `mesa-libEGL-devel`, `mesa-libGLES-devel`, `libxkbcommon-devel`, `libudev-devel`, `libinput-devel`, `pipewire-devel`, `clang`, `xwayland-satellite`, `xorg-x11-server-Xwayland`, and `xdg-desktop-portal`. On Arch-based systems, install `seatd`, `pipewire`, and `clang`. On Debian/Ubuntu-style systems, install `libseat-dev`, `libpipewire-0.3-dev`, and `clang`.

For a complete login session, install `dbus-run-session`, `dbus-update-activation-environment`, a PolicyKit authentication agent, and `swaylock` or `waylock`. Prepare the shared browser runtime with `sabine runtime prepare` before logging in. GIO desktop launching requires the GLib/GIO development packages.

## Shell UI

Build the shell web bundle after UI changes:

```sh
cd crates/luft-shell/web
bun install
bun run build
```

Debug builds load `crates/luft-shell/web/dist`; installed builds load `share/luft/shell` beside the installation prefix. `LUFT_SHELL_WEB_DIR` selects a development resource directory.

## Validation

```sh
cargo fmt --check
cargo check --workspace
cargo check -p kestrel --features session-backend
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
```
