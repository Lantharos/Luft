#!/usr/bin/env bash
set -euo pipefail

release="$(cd "$(dirname "$0")/../helium" && pwd)"
destdir="$1"
version="$(cat "$release/version")"
appimage="helium-$version-x86_64.AppImage"
work="/var/tmp/helium"

section() {
  readelf --wide --section-headers "$work/$appimage" | sed -n 's/^ *\[ *[0-9]*\] *//p' |
    awk -v name="$2" '$1 == name {print strtonum("0x" $4), strtonum("0x" $5)}' | {
    read -r offset size
    case "$1" in
      contents) dd if="$work/$appimage" bs=1 skip="$offset" count="$size" status=none | tr -d '\0' ;;
      blank) dd if=/dev/zero of="$work/unsigned" bs=1 seek="$offset" count="$size" conv=notrunc status=none ;;
    esac
  }
}

verify() {
  gpg --dearmor <"$release/signing-key.asc" >"$work/signing-key.gpg"
  section contents .sha256_sig >"$work/signature.asc"
  cp "$work/$appimage" "$work/unsigned"
  section blank .sha256_sig
  section blank .sig_key
  sha256sum "$work/unsigned" | cut -d' ' -f1 | tr -d '\n' >"$work/digest"
  gpgv --keyring "$work/signing-key.gpg" "$work/signature.asc" "$work/digest"
}

mkdir -p "$work"
curl -fsSL --retry 5 --retry-all-errors -o "$work/$appimage" \
  "https://github.com/imputnet/helium-linux/releases/download/$version/$appimage"
verify
install -Dm644 "$work/$appimage" "$destdir/usr/share/luft/preinstall/helium.AppImage"
rm -rf "$work"
