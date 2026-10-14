#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "$0")/../../.." && pwd)"
destdir="$1"

sabine_revision="$(sed -n 's|^sabine = { git = "https://github.com/Lantharos/Sabine", rev = "\([0-9a-f]*\)" }$|\1|p' "$luft/packages/app/Cargo.toml")"
cargo install --locked --root /usr/local --git https://github.com/Lantharos/Sabine --rev "$sabine_revision" \
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

(cd "$luft" && bun install --frozen-lockfile)
for app in "$luft"/apps/*/; do
  sabine install --bundle --system-wide --root "$destdir" "$app"
done
