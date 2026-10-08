#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"

usage() {
  cat <<'USAGE'
Usage: boot/sushi/scripts/build.sh [DESTDIR]

Builds Sushi and SushiBoot. With DESTDIR, also stages their files under it as
they would be laid out on the computer.
USAGE
}

case "${1:-}" in
  -h | --help) usage; exit 0 ;;
esac
(($# <= 1)) || { usage >&2; exit 2; }
destdir="${1:-}"

cargo build --release --manifest-path "$root/Cargo.toml"
cargo build --release --manifest-path "$root/Cargo.toml" -p sushiboot --target x86_64-unknown-uefi

[[ -n "$destdir" ]] || exit 0

release="$root/target/release"
units="$destdir/usr/lib/systemd/system"
install -Dm755 "$release/sushid" "$destdir/usr/bin/sushid"
install -Dm755 "$release/sushictl" "$destdir/usr/bin/sushictl"
install -Dm644 "$root/target/x86_64-unknown-uefi/release/sushiboot.efi" "$destdir/usr/lib/sushi/efi/SushiBoot.efi"
for unit in "$root"/data/systemd/*.service; do
  install -Dm644 "$unit" "$units/$(basename "$unit")"
done
for dropin in "$root"/data/drop-ins/*/*.conf; do
  install -Dm644 "$dropin" "$units/$(basename "$(dirname "$dropin")")/$(basename "$dropin")"
done
install -Dm755 "$root/data/dracut/module-setup.sh" "$destdir/usr/lib/dracut/modules.d/90sushi/module-setup.sh"
install -Dm644 "$root/data/sushi.conf" "$destdir/etc/sushi/sushi.conf"
install -Dm644 "$root/data/modprobe/sushi.conf" "$destdir/usr/lib/modprobe.d/sushi.conf"
