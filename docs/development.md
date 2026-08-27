# Development

## Dependencies

The workspace uses Rust and Bun. The shell UI is built with the shared Sabine CEF runtime and embeds a generated single-file web bundle into `luft-shell`.

For X11 application support, install `xwayland-satellite` and `Xwayland`. Luft starts the satellite process automatically when `compositor.xwayland = true`.

The DRM/KMS backend requires libseat and graphics/input development packages. The Luft screencast portal also requires PipeWire development headers and libclang for Rust binding generation. On Fedora, install `libseat-devel`, `systemd-devel`, `mesa-libgbm-devel`, `mesa-libEGL-devel`, `mesa-libGLES-devel`, `libxkbcommon-devel`, `libudev-devel`, `libinput-devel`, `pipewire-devel`, `clang`, `xwayland-satellite`, `xorg-x11-server-Xwayland`, and `xdg-desktop-portal`. On Arch-based systems, install `seatd`, `pipewire`, and `clang`. On Debian/Ubuntu-style systems, install `libseat-dev`, `libpipewire-0.3-dev`, and `clang`.

For a complete login session, install `dbus-run-session`, `dbus-update-activation-environment`, and a PolicyKit authentication agent.

## Shell UI

Build the shell web bundle after UI changes:

```sh
cd crates/luft-shell/web
bun install
bun run build
```

The generated bundle is embedded by `luft-shell`.

## Validation

```sh
cargo fmt --check
cargo check --workspace
cargo check -p kestrel --features session-backend
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
```
