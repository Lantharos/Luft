#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
destdir="${1:-}"
libexecdir="${LIBEXECDIR:-/usr/libexec}"

cargo build --release --manifest-path "$root/Cargo.toml"

[[ -n "$destdir" ]] || exit 0

release="$root/target/release"
place() {
  sed "s|@libexecdir@|$libexecdir|g" "$1" | install -Dm644 /dev/stdin "$destdir$2"
}

usb="$root/data/usb"
install -Dm755 "$release/luft-usb-protection" "$destdir$libexecdir/luft-usb-protection"
place "$usb/luft-usb-protection.service" /usr/lib/systemd/system/luft-usb-protection.service
place "$usb/com.lantharos.UsbProtection1.service" /usr/share/dbus-1/system-services/com.lantharos.UsbProtection1.service
place "$usb/com.lantharos.UsbProtection1.conf" /usr/share/dbus-1/system.d/com.lantharos.UsbProtection1.conf
place "$usb/com.lantharos.UsbProtection1.xml" /usr/share/dbus-1/interfaces/com.lantharos.UsbProtection1.xml
place "$usb/com.lantharos.usb-protection.policy" /usr/share/polkit-1/actions/com.lantharos.usb-protection.policy

trust="$root/data/trust"
install -Dm755 "$release/trustd" "$destdir$libexecdir/trustd"
install -Dm755 "$release/trustctl" "$destdir/usr/bin/trustctl"
for unit in "$trust"/systemd/*; do
  place "$unit" "/usr/lib/systemd/system/$(basename "$unit")"
done
place "$trust/com.lantharos.Trust1.service" /usr/share/dbus-1/system-services/com.lantharos.Trust1.service
place "$trust/com.lantharos.Trust1.conf" /usr/share/dbus-1/system.d/com.lantharos.Trust1.conf
place "$trust/com.lantharos.Trust1.xml" /usr/share/dbus-1/interfaces/com.lantharos.Trust1.xml
place "$trust/com.lantharos.trust.policy" /usr/share/polkit-1/actions/com.lantharos.trust.policy
place "$trust/61-trustd-drives.rules" /usr/lib/udev/rules.d/61-trustd-drives.rules
place "$trust/90-trustd.conf" /usr/lib/dracut/dracut.conf.d/90-trustd.conf
place "$trust/dracut/trustd-encrypt.service" /usr/lib/dracut/modules.d/90trustd/trustd-encrypt.service
place "$trust/dracut/cryptsetup-after-pcrphase.conf" /usr/lib/dracut/modules.d/90trustd/cryptsetup-after-pcrphase.conf
install -Dm755 "$trust/dracut/module-setup.sh" "$destdir/usr/lib/dracut/modules.d/90trustd/module-setup.sh"
install -Dm755 "$trust/92-trustd.install" "$destdir/usr/lib/kernel/install.d/92-trustd.install"
install -Dm755 "$trust/sign-module" "$destdir$libexecdir/trustd-sign-module"
