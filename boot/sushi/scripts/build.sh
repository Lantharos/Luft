#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
destdir="${1:-}"

cargo build --release --manifest-path "$root/Cargo.toml"
cargo build --release --manifest-path "$root/Cargo.toml" -p sushiboot --target x86_64-unknown-uefi

[[ -n "$destdir" ]] || exit 0

release="$root/target/release"
units="$destdir/usr/lib/systemd/system"
install -Dm755 "$release/sushid" "$destdir/usr/bin/sushid"
install -Dm755 "$release/sushictl" "$destdir/usr/bin/sushictl"
install -Dm755 "$release/sushi-bootctl" "$destdir/usr/bin/sushi-bootctl"
install -Dm644 "$root/target/x86_64-unknown-uefi/release/sushiboot.efi" "$destdir/usr/lib/sushi/efi/SushiBoot.efi"
for unit in "$root"/data/systemd/*.service; do
  install -Dm644 "$unit" "$units/$(basename "$unit")"
done
for dropin in "$root"/data/drop-ins/*/*.conf; do
  install -Dm644 "$dropin" "$units/$(basename "$(dirname "$dropin")")/$(basename "$dropin")"
done
install -Dm755 "$root/data/dracut/module-setup.sh" "$destdir/usr/lib/dracut/modules.d/90sushi/module-setup.sh"
install -Dm755 "$root/data/kernel-install/90-sushi.install" "$destdir/usr/lib/kernel/install.d/90-sushi.install"
install -Dm644 "$root/data/sushi.conf" "$destdir/etc/sushi/sushi.conf"
