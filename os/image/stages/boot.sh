#!/usr/bin/env bash
set -euo pipefail

luft="$(cd "$(dirname "$0")/../../.." && pwd)"
destdir="$1"
key="$2"
certificate="$3"
boot_menu="$destdir/usr/lib/sushi/efi/SushiBoot.efi"

# shellcheck source=../../../boot/sushi/scripts/install.sh
source "$luft/boot/sushi/scripts/install.sh"

"$luft/security/scripts/build.sh" "$destdir"
"$luft/boot/sushi/scripts/build.sh" "$destdir"
sbsign --key "$key" --cert "$certificate" --output "$boot_menu" "$boot_menu"
printf 'add_dracutmodules+=" sushi "\n' | install -Dm644 /dev/stdin "$destdir/usr/lib/dracut/dracut.conf.d/90-sushi.conf"
read -ra sushi_arguments <<<"$arguments"
printf 'kargs = [%s]\n' "$(printf '"%s", ' "${sushi_arguments[@]}" | sed 's/, $//')" |
  install -Dm644 /dev/stdin "$destdir/usr/lib/bootc/kargs.d/10-sushi.toml"

DESTDIR="$destdir" "$luft/kestrel/passkeys/install.sh" install /usr
cp -a "$destdir/usr/local/." "$destdir/usr/"
rm -rf "$destdir/usr/local"

{
  printf 'enable %s\n' "${units[@]}" trustd.service luft-usb-protection.service luft-passkeys-relay.socket
} | install -Dm644 /dev/stdin "$destdir/usr/lib/systemd/system-preset/40-luft-boot.preset"
printf 'enable luft-passkeys.service\n' |
  install -Dm644 /dev/stdin "$destdir/usr/lib/systemd/user-preset/40-luft-passkeys.preset"
