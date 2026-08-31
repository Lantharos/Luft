# Running Luft

## Nested

Build both compositor and shell first:

```sh
cargo build -p kestrel -p luft-shell
cargo run -p luft-session -- --nested
```

Nested starts `luft-shell` (panel only — startup apps and XDG autostart are skipped) and prints a warning if the shell binary is missing. Kestrel prints the Wayland socket name. Launch clients against it from another terminal:

```sh
WAYLAND_DISPLAY=<printed-socket> ghostty
WAYLAND_DISPLAY=<printed-socket> wayland-info
```

When run directly for development, Kestrel wraps `luft-shell` in a private D-Bus session when possible. Set `LUFT_USE_HOST_DBUS=1` only when intentionally debugging against the host session bus.

## Session Launcher

`luft-session` is the display-manager entry point from `data/sessions/luft.desktop`. The installed entry launches `luft-session --session`, sets Luft desktop environment variables, and starts Kestrel as a real Wayland session.

## Install A Login Session

Run the installer from the repository root:

```sh
./install.sh
```

It builds the shell web assets with Bun, builds the session binaries with the DRM/KMS backend enabled, installs the binaries to `/usr/local/bin`, installs immutable shell resources under `/usr/local/share/luft`, writes the Wayland session entry, and installs Luft's portal configuration. The installed shell does not depend on the source checkout. Sabine prepares its shared CEF runtime when the shell first launches.

Override install paths or build a debug profile when needed:

```sh
PROFILE=debug ./install.sh
BIN_DIR="$HOME/.local/bin" \
DATA_DIR="$HOME/.local/share/luft" \
SESSION_DIR="$HOME/.local/share/wayland-sessions" \
PORTAL_DIR="$HOME/.local/share/xdg-desktop-portal" \
DBUS_SERVICE_DIR="$HOME/.local/share/dbus-1/services" \
./install.sh
```

Writable user destinations are installed without `sudo`. Remove the installed
files using the same path overrides with `./install.sh --uninstall`.

After that, pick Luft from the display manager's session menu.

When run manually without an explicit backend, `luft-session` defaults to nested inside an existing Wayland session and to the session backend outside one. When `dbus-run-session` is available, the session runs Kestrel under a private D-Bus session so shell services and launched apps do not attach to the host desktop session while testing nested. Once Kestrel creates its public Wayland socket, it publishes that display to D-Bus and user-service activation so the portal and other activated services connect to the Luft session.

```sh
cargo run -p luft-session -- --nested --socket luft-dev
cargo run -p luft-session -- --desktop-entry
cargo run -p luft-session -- --session --dry-run
```
