#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "$0")/../../../.." && pwd)"
sushi="$luft/boot/sushi"
destdir="$1"
key="$2"
certificate="$3"
boot_menu="$destdir/usr/lib/sushi/efi/SushiBoot.efi"

"$luft/security/scripts/build.sh" "$destdir"
"$sushi/scripts/build.sh" "$destdir"
sbsign --key "$key" --cert "$certificate" --output "$boot_menu" "$boot_menu"
printf 'add_dracutmodules+=" sushi "\n' | install -Dm644 /dev/stdin "$destdir/usr/lib/dracut/dracut.conf.d/90-sushi.conf"
install -Dm644 "$sushi/data/kargs.toml" "$destdir/usr/lib/bootc/kargs.d/10-sushi.toml"
install -Dm644 "$sushi/data/sushi.preset" "$destdir/usr/lib/systemd/system-preset/40-luft-sushi.preset"
printf 'enable %s\n' trustd.service trustd-follow-up.service trustd-went-back.service trustd-before-restart.service luft-usb-protection.service |
  install -Dm644 /dev/stdin "$destdir/usr/lib/systemd/system-preset/40-luft-boot.preset"
