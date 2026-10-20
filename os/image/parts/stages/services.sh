#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "$0")/../../../.." && pwd)"
destdir="$1"

installer="$luft/apps/setup/installer"
cargo build --release --locked --manifest-path "$installer/Cargo.toml"
install -Dm755 "$CARGO_TARGET_DIR/release/luft-installer" "$destdir/usr/libexec/luft-installer"
install -Dm644 "$installer/data/install.toml" "$destdir/usr/lib/luft-installer/install.toml"
install -Dm644 -t "$destdir/usr/share/dbus-1/system.d" "$installer/data/com.lantharos.Installer1.conf"
install -Dm644 -t "$destdir/usr/share/dbus-1/system-services" "$installer/data/com.lantharos.Installer1.service"
install -Dm644 -t "$destdir/usr/lib/systemd/system" "$installer/data/luft-installer.service" "$installer/data/luft-installer-reclaim.service" \
  "$installer/data/luft-installer-expire-setup.service"
install -Dm644 -t "$destdir/usr/share/polkit-1/actions" "$installer/data/com.lantharos.installer.policy"
install -Dm644 -t "$destdir/usr/share/selinux/packages" "$installer/data/luft-installer.cil"
printf 'enable luft-installer-%s.service\n' reclaim expire-setup |
  install -Dm644 /dev/stdin "$destdir/usr/lib/systemd/system-preset/40-luft-installer.preset"

updater="$luft/packages/software/updater"
cargo build --release --locked --manifest-path "$updater/Cargo.toml"
install -Dm755 "$CARGO_TARGET_DIR/release/luft-updater" "$destdir/usr/libexec/luft-updater"
install -Dm644 -t "$destdir/usr/share/dbus-1/system.d" "$updater/data/com.lantharos.Updater1.conf"
install -Dm644 -t "$destdir/usr/share/dbus-1/system-services" "$updater/data/com.lantharos.Updater1.service"
install -Dm644 -t "$destdir/usr/lib/systemd/system" "$updater/data/luft-updater.service" \
  "$updater/data/luft-system-packages-link.service" "$updater/data/luft-system-packages-settle.service" \
  "$updater/data/luft-system-packages-rebuild.service"
install -Dm644 -t "$destdir/usr/share/polkit-1/actions" "$updater/data/com.lantharos.updater.policy"
install -Dm644 -t "$destdir/usr/share/polkit-1/rules.d" "$updater/data/50-luft-updater.rules"
printf 'enable luft-system-packages-%s.service\n' link settle rebuild |
  install -Dm644 /dev/stdin "$destdir/usr/lib/systemd/system-preset/40-luft-system-packages.preset"

thumbnailer="$luft/packages/software/thumbnailer"
cargo build --release --locked --manifest-path "$thumbnailer/Cargo.toml"
install -Dm755 "$CARGO_TARGET_DIR/release/luft-thumbnailer" "$destdir/usr/libexec/luft-thumbnailer"
install -Dm644 -t "$destdir/usr/share/thumbnailers" "$thumbnailer/data/luft-apps.thumbnailer"

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

sleep="$luft/packages/sleep/service"
cargo build --release --locked --manifest-path "$sleep/Cargo.toml"
install -Dm755 "$CARGO_TARGET_DIR/release/luft-sleep" "$destdir/usr/libexec/luft-sleep"
install -Dm644 -t "$destdir/usr/share/dbus-1/system.d" "$sleep/data/com.lantharos.Sleep1.conf"
install -Dm644 -t "$destdir/usr/share/dbus-1/system-services" "$sleep/data/com.lantharos.Sleep1.service"
install -Dm644 -t "$destdir/usr/lib/systemd/system" "$sleep/data/luft-sleep.service" "$sleep/data/luft-sleep-power-off.service"
install -Dm644 "$sleep/data/systemd-suspend-luft.conf" "$destdir/usr/lib/systemd/system/systemd-suspend.service.d/luft-sleep.conf"
install -Dm644 -t "$destdir/usr/share/polkit-1/actions" "$sleep/data/com.lantharos.sleep.policy"

accounts="$luft/packages/accounts/service"
cargo build --release --locked --manifest-path "$accounts/Cargo.toml"
install -Dm755 "$CARGO_TARGET_DIR/release/luft-accounts" "$destdir/usr/libexec/luft-accounts"
install -Dm644 -t "$destdir/usr/share/dbus-1/services" "$accounts/data/com.lantharos.Accounts1.service"
install -Dm644 -t "$destdir/usr/lib/systemd/user" "$accounts/data/luft-accounts.service"
printf 'enable luft-accounts.service\n' |
  install -Dm644 /dev/stdin "$destdir/usr/lib/systemd/user-preset/40-luft-accounts.preset"

speech="$luft/packages/speech/service"
(cd "$speech" && cargo build --release --locked)
install -Dm755 "$CARGO_TARGET_DIR/release/luft-speech" "$destdir/usr/libexec/luft-speech"
install -Dm644 -t "$destdir/usr/share/dbus-1/services" "$speech/data/com.lantharos.Speech1.service"
install -Dm644 -t "$destdir/usr/lib/systemd/user" "$speech/data/luft-speech.service"
install -Dm644 "$speech/data/silero-vad-LICENSE" "$destdir/usr/share/licenses/luft-speech/silero-vad-LICENSE"
