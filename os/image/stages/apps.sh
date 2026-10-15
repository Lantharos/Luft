#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "$0")/../../.." && pwd)"
destdir="$1"

sabine_tag="$(sed -n 's|^sabine = { git = "https://github.com/Lantharos/Sabine", tag = "\([^"]*\)" }$|\1|p' "$luft/packages/app/Cargo.toml")"
cargo install --locked --root /usr/local --git https://github.com/Lantharos/Sabine --tag "$sabine_tag" \
  sabine-cli sabine-service

sabine runtime install --system-wide --root "$destdir"
strip --strip-debug "$destdir"/usr/lib/sabine/runtimes/cef/*/Release/libcef.so

installer="$luft/apps/setup/installer"
cargo build --release --locked --manifest-path "$installer/Cargo.toml"
install -Dm755 "$CARGO_TARGET_DIR/release/luft-installer" "$destdir/usr/libexec/luft-installer"
install -Dm644 "$installer/data/install.toml" "$destdir/usr/lib/luft-installer/install.toml"
install -Dm644 -t "$destdir/usr/share/dbus-1/system.d" "$installer/data/com.lantharos.Installer1.conf"
install -Dm644 -t "$destdir/usr/share/dbus-1/system-services" "$installer/data/com.lantharos.Installer1.service"
install -Dm644 -t "$destdir/usr/lib/systemd/system" "$installer/data/luft-installer.service"
install -Dm644 -t "$destdir/usr/share/polkit-1/actions" "$installer/data/com.lantharos.installer.policy"
install -Dm644 -t "$destdir/usr/share/selinux/packages" "$installer/data/luft-installer.cil"

updater="$luft/packages/software/updater"
cargo build --release --locked --manifest-path "$updater/Cargo.toml"
install -Dm755 "$CARGO_TARGET_DIR/release/luft-updater" "$destdir/usr/libexec/luft-updater"
install -Dm644 -t "$destdir/usr/share/dbus-1/system.d" "$updater/data/com.lantharos.Updater1.conf"
install -Dm644 -t "$destdir/usr/share/dbus-1/system-services" "$updater/data/com.lantharos.Updater1.service"
install -Dm644 -t "$destdir/usr/lib/systemd/system" "$updater/data/luft-updater.service"
install -Dm644 -t "$destdir/usr/share/polkit-1/actions" "$updater/data/com.lantharos.updater.policy"
install -Dm644 -t "$destdir/usr/share/polkit-1/rules.d" "$updater/data/50-luft-updater.rules"

windows="$luft/packages/windows/service"
cargo build --release --locked --manifest-path "$windows/Cargo.toml"
install -Dm755 "$CARGO_TARGET_DIR/release/luft-windows" "$destdir/usr/libexec/luft-windows"
install -Dm644 -t "$destdir/usr/share/dbus-1/system.d" "$windows/data/com.lantharos.Windows1.conf"
install -Dm644 -t "$destdir/usr/share/dbus-1/system-services" "$windows/data/com.lantharos.Windows1.service"
install -Dm644 -t "$destdir/usr/lib/systemd/system" "$windows/data/luft-windows.service" "$windows/data/luft-windows-boot.service"
install -Dm644 -t "$destdir/usr/lib/systemd/user" "$windows/data/luft-windows-notice.service"
install -Dm644 -t "$destdir/usr/share/polkit-1/actions" "$windows/data/com.lantharos.windows.policy"
printf 'enable luft-windows-boot.service\n' |
  install -Dm644 /dev/stdin "$destdir/usr/lib/systemd/system-preset/40-luft-windows.preset"
printf 'enable luft-windows-notice.service\n' |
  install -Dm644 /dev/stdin "$destdir/usr/lib/systemd/user-preset/40-luft-windows.preset"

(cd "$luft" && bun install --frozen-lockfile)
for app in "$luft"/apps/*/; do
  [[ "$app" == */apps/meet/ ]] && continue
  sabine install --bundle --system-wide --root "$destdir" "$app"
done
