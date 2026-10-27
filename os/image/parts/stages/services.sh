#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "$0")/../../../.." && pwd)"
destdir="$1"
release="$CARGO_TARGET_DIR/release"

cd "$luft"
cargo build --release --locked -p luft-installer -p luft-updater -p luft-packages -p luft-thumbnailer \
  -p luft-windows-service -p luft-sleep -p luft-accounts-service -p luft-speech-service

installer="$luft/apps/setup/installer"
install -Dm755 "$release/luft-installer" "$destdir/usr/libexec/luft-installer"
install -Dm644 "$installer/data/install.toml" "$destdir/usr/lib/luft-installer/install.toml"
install -Dm644 -t "$destdir/usr/share/dbus-1/system.d" "$installer/data/com.lantharos.Installer1.conf"
install -Dm644 -t "$destdir/usr/share/dbus-1/system-services" "$installer/data/com.lantharos.Installer1.service"
install -Dm644 -t "$destdir/usr/lib/systemd/system" "$installer/data/luft-installer.service" \
  "$installer/data/luft-installer-expire-setup.service"
install -Dm644 -t "$destdir/usr/share/polkit-1/actions" "$installer/data/com.lantharos.installer.policy"
install -Dm644 -t "$destdir/usr/share/selinux/packages" "$installer/data/luft-installer.cil"
echo 'enable luft-installer-expire-setup.service' |
  install -Dm644 /dev/stdin "$destdir/usr/lib/systemd/system-preset/40-luft-installer.preset"

updater="$luft/services/updater"
install -Dm755 "$release/luft-updater" "$destdir/usr/libexec/luft-updater"
install -Dm644 -t "$destdir/usr/share/dbus-1/system.d" "$updater/data/com.lantharos.Updater1.conf"
install -Dm644 -t "$destdir/usr/share/dbus-1/system-services" "$updater/data/com.lantharos.Updater1.service"
install -Dm644 -t "$destdir/usr/lib/systemd/system" "$updater/data/luft-updater.service"
install -Dm644 -t "$destdir/usr/share/polkit-1/actions" "$updater/data/com.lantharos.updater.policy"
install -Dm644 -t "$destdir/usr/share/polkit-1/rules.d" "$updater/data/50-luft-updater.rules"

packages="$luft/services/packages"
install -Dm755 "$release/luft-packages" "$destdir/usr/libexec/luft-packages"
install -Dm644 -t "$destdir/usr/share/dbus-1/system.d" "$packages/data/com.lantharos.Packages1.conf"
install -Dm644 -t "$destdir/usr/share/dbus-1/system-services" "$packages/data/com.lantharos.Packages1.service"
install -Dm644 -t "$destdir/usr/lib/systemd/system" "$packages/data/luft-packages.service" \
  "$packages/data/luft-system-packages-activate.socket" "$packages/data/luft-system-packages-activate@.service" \
  "$packages/data/luft-system-packages-link.service" "$packages/data/luft-system-packages-settle.service" \
  "$packages/data/luft-system-packages-rebuild.service"
install -Dm644 -t "$destdir/usr/share/polkit-1/actions" "$packages/data/com.lantharos.packages.policy"
printf 'enable luft-system-packages-%s.service\n' link settle |
  install -Dm644 /dev/stdin "$destdir/usr/lib/systemd/system-preset/40-luft-system-packages.preset"

thumbnailer="$luft/services/thumbnailer"
install -Dm755 "$release/luft-thumbnailer" "$destdir/usr/libexec/luft-thumbnailer"
install -Dm644 -t "$destdir/usr/share/thumbnailers" "$thumbnailer/data/luft-apps.thumbnailer"

windows="$luft/services/windows"
install -Dm755 "$release/luft-windows" "$destdir/usr/libexec/luft-windows"
install -Dm644 -t "$destdir/usr/share/dbus-1/system.d" "$windows/data/com.lantharos.Windows1.conf"
install -Dm644 -t "$destdir/usr/share/dbus-1/system-services" "$windows/data/com.lantharos.Windows1.service"
install -Dm644 -t "$destdir/usr/lib/systemd/system" "$windows/data/luft-windows.service" "$windows/data/luft-windows-boot.service"
install -Dm644 -t "$destdir/usr/lib/systemd/user" "$windows/data/luft-windows-notice.service"
install -Dm644 -t "$destdir/usr/share/polkit-1/actions" "$windows/data/com.lantharos.windows.policy"
printf 'enable luft-windows-boot.service\n' |
  install -Dm644 /dev/stdin "$destdir/usr/lib/systemd/system-preset/40-luft-windows.preset"
printf 'enable luft-windows-notice.service\n' |
  install -Dm644 /dev/stdin "$destdir/usr/lib/systemd/user-preset/40-luft-windows.preset"

sleep="$luft/services/sleep"
install -Dm755 "$release/luft-sleep" "$destdir/usr/libexec/luft-sleep"
install -Dm644 -t "$destdir/usr/share/dbus-1/system.d" "$sleep/data/com.lantharos.Sleep1.conf"
install -Dm644 -t "$destdir/usr/share/dbus-1/system-services" "$sleep/data/com.lantharos.Sleep1.service"
install -Dm644 -t "$destdir/usr/lib/systemd/system" "$sleep/data/luft-sleep.service" "$sleep/data/luft-sleep-power-off.service"
install -Dm644 "$sleep/data/systemd-suspend-luft.conf" "$destdir/usr/lib/systemd/system/systemd-suspend.service.d/luft-sleep.conf"
install -Dm644 -t "$destdir/usr/share/polkit-1/actions" "$sleep/data/com.lantharos.sleep.policy"

accounts="$luft/services/accounts"
install -Dm755 "$release/luft-accounts" "$destdir/usr/libexec/luft-accounts"
install -Dm644 -t "$destdir/usr/share/dbus-1/services" "$accounts/data/com.lantharos.Accounts1.service"
install -Dm644 -t "$destdir/usr/lib/systemd/user" "$accounts/data/luft-accounts.service"

speech="$luft/services/speech"
install -Dm755 "$release/luft-speech" "$destdir/usr/libexec/luft-speech"
install -Dm644 -t "$destdir/usr/share/dbus-1/services" "$speech/data/com.lantharos.Speech1.service"
install -Dm644 -t "$destdir/usr/lib/systemd/user" "$speech/data/luft-speech.service"
install -Dm644 "$speech/data/silero-vad-LICENSE" "$destdir/usr/share/licenses/luft-speech/silero-vad-LICENSE"
