#!/usr/bin/env bash
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
luft="$(cd "$here/../../.." && pwd)"
state="${MEET_VM:-$here/state}"
stage="$state/stage"
keys="$state/keys"

usage() {
  cat <<'USAGE'
Usage: apps/meet/vm/iso.sh

Builds a Luft ISO with this checkout's installer, Install Luft, trustd and live start-up,
on top of localhost/luft-system:45 and :45-nvidia (made by os/image/build.sh), so
Meet Luft can be tried against them without building the whole image. Writes
apps/meet/vm/state/luft-meet.iso and its .sha256 (MEET_VM picks another folder).
USAGE
}

case "${1:-}" in
  -h | --help) usage; exit 0 ;;
esac

throwaway_keys() {
  mkdir -p -m 700 "$keys"
  [[ -f "$keys/secureboot.key" ]] || openssl req -quiet -x509 -newkey rsa:2048 -nodes -days 3650 \
    -subj "/CN=Meet Luft test key/" -keyout "$keys/secureboot.key" -out "$keys/secureboot.crt"
  [[ -f "$keys/pcr.key" ]] || openssl genpkey -quiet -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$keys/pcr.key"
  export LUFT_SECUREBOOT_KEY="$keys/secureboot.key" LUFT_SECUREBOOT_CERT="$keys/secureboot.crt" LUFT_PCR_KEY="$keys/pcr.key"
}

stage_changes() {
  local installer="$luft/apps/setup/installer"
  cargo build --release --manifest-path "$installer/Cargo.toml"
  rm -rf "$stage"
  mkdir -p "$stage/root"
  install -Dm755 "$installer/target/release/luft-installer" "$stage/root/usr/libexec/luft-installer"
  "$luft/security/scripts/build.sh" "$stage/root"
  (cd "$luft" && bun install --frozen-lockfile)
  sabine install --bundle --system-wide --root "$stage/root" "$luft/apps/setup"
  printf 'ARG BASE\nFROM ${BASE}\nCOPY root/ /\n' > "$stage/Containerfile"
}

overlay() {
  local suffix="$1" system="localhost/luft-meet-system:45$1"
  podman build --quiet --build-arg "BASE=localhost/luft-system:45$suffix" --tag "$system" "$stage" > /dev/null
  "$luft/os/image/seal.sh" "$system" "localhost/luft-meet:45$suffix"
}

throwaway_keys
stage_changes
overlay ""
overlay "-nvidia"
LUFT_ISO="$state/iso" "$luft/os/iso/build.sh" localhost/luft-meet:45
built="$(ls -t "$state"/iso/luft-*.iso | head -n1)"
mv "$built" "$state/luft-meet.iso"
sed "s|$(basename "$built")|luft-meet.iso|" "$built.sha256" > "$state/luft-meet.iso.sha256"
rm "$built.sha256"
echo "$state/luft-meet.iso"
