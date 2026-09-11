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

`luft-session --nested` creates a private D-Bus session. Direct `kestrel --nested` never imports its display into the host activation environment.

## Session Launcher

`luft-session` is the display-manager entry point from `data/sessions/luft.desktop`. The installed entry launches `luft-session --session`, sets Luft desktop environment variables, and starts Kestrel as a real Wayland session.

## Install A Login Session

Run the installer from the repository root:

```sh
./install.sh
```

It builds the shell web assets with Bun, builds the session binaries with the DRM/KMS backend enabled, installs the binaries to `/usr/local/bin`, installs immutable shell resources under `/usr/local/share/luft`, writes the Wayland session entry, and installs Luft's portal configuration. The installed shell does not depend on the source checkout. The installer prepares the shared CEF runtime before installing the session. Release shell launches do not download missing runtimes.

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

When run manually without an explicit backend, `luft-session` defaults to nested inside an existing Wayland session and to the session backend outside one. Nested runs use a private D-Bus session. Real login sessions use the login user bus. Once Kestrel creates its public Wayland socket, it publishes that display to D-Bus and user-service activation. Kestrel supervises the Luft portal itself and gives it a private capture-capable Wayland connection; it is not independently D-Bus activated.

```sh
cargo run -p luft-session -- --nested --socket luft-dev
cargo run -p luft-session -- --desktop-entry
cargo run -p luft-session -- --session --dry-run
```

## Locking and settings

Install `swaylock` or `waylock` before using a session. Lock requests immediately enter compositor locking and clear normal input grabs. DRM lock acknowledgement waits for secure pageflips on every active output. The logind sleep delay inhibitor is released after secure presentation; a failed or crashed locker leaves the compositor locked and is retried.

Open Settings from Quick Settings or run `luft-shell --settings appearance`. Pages include display, input, appearance, power, applications, network and sound. Network, Bluetooth and sound tools require `nm-connection-editor`, `blueman-manager` and `pavucontrol`. Logout is available in the session menu.

Hardware acceptance is still required for suspend/resume, hotplug, mixed refresh/scale and driver-specific behavior. A successful nested run does not establish these properties.

## Test DRM from a spare TTY

After building the workspace and shell, log in on a spare TTY and run:

```sh
./scripts/test-drm-session.sh
```

This uses the checkout binaries, a separate Wayland/IPC socket and D-Bus session, skips startup apps, and writes logs beneath `~/.local/state/luft-session-tests`. It exercises the real DRM backend without changing the installed desktop. Return to the existing desktop with Ctrl+Alt+F2 and end the test with Logout. Because the test bus is isolated, user-service activation and portal routing must also be checked in a normal Luft login.

Browsers and other single-instance applications may reuse a process in another desktop session when both sessions use the same user profile. A launch can therefore appear on the original desktop instead of in the test session. Use a separate VM user/profile for isolated application testing, or test from a normal Luft login after ending the other desktop session. The private test bus also cannot stand in for the login user bus when checking D-Bus and systemd activation.

## Virtual-machine acceptance

Use a full Linux guest with KVM, a virtio GPU, and a logged-in virtual console. Start `luft-session --session` from that console with the guest's normal user bus. SSH can collect logs and stage builds, but the compositor must belong to the console login so logind grants seat access. A VM is useful for repeatable Start/search, Wayland and X11 application, Settings, activation, and focus checks without sharing browser profiles with the host desktop.

The runtime needs `libwayland-server` as well as the usual client libraries. Install Xwayland and the runtime dependencies of `xwayland-satellite` when testing X11 applications. Copy the CEF runtime and the matching Sabine host together; `SABINE_HOST_PATH` selects a host built from the pinned dependency. The TTY script snapshots that host when the variable is set, alongside the compositor and shell binaries. A host staged at `target/<profile>/sabine-host` is selected automatically.

Virtual DRM exercises the compositor's KMS path. It does not establish physical connector hotplug, GPU-driver suspend/resume, VRR, or multi-GPU correctness; keep those as separate hardware acceptance checks.
