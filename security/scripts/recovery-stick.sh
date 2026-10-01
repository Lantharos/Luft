#!/usr/bin/env bash
set -euo pipefail

mirror=https://download.fedoraproject.org/pub/fedora/linux/releases
cache="${XDG_CACHE_HOME:-$HOME/.cache}/luft"

usage() {
  cat <<'USAGE'
Usage: security/scripts/recovery-stick.sh [IMAGE]

Writes a Fedora Workstation live image to a USB stick. The stick starts with
Secure Boot on, without Luft's key, so it works even when this computer's own
startup doesn't. Without IMAGE, the image for this Fedora release (or the one
before it, if this release isn't out yet) is downloaded and checked against
Fedora's signed checksums first.
USAGE
  exit 2
}

ask() {
  local answer
  read -r -p "$1 " answer
  printf '%s' "$answer"
}

release_folder() {
  local version
  version="$(. /etc/os-release && echo "$VERSION_ID")"
  for candidate in "$version" "$((version - 1))"; do
    if curl -fsIL "$mirror/$candidate/Workstation/x86_64/iso/" >/dev/null; then
      echo "$candidate"
      return
    fi
  done
  echo "No Fedora Workstation release was found at $mirror." >&2
  exit 1
}

download_image() {
  local release folder listing checksum keyring image
  release="$(release_folder)"
  folder="$mirror/$release/Workstation/x86_64/iso"
  listing="$(curl -fsL "$folder/")"
  checksum="$(grep -o 'Fedora-Workstation-[A-Za-z0-9._-]*-CHECKSUM' <<<"$listing" | head -1)"
  [[ -n "$checksum" ]] || { echo "Fedora's checksum file wasn't found in $folder." >&2; exit 1; }
  mkdir -p "$cache"
  curl -fsL -o "$cache/$checksum" "$folder/$checksum"
  keyring="$(mktemp)"
  trap 'rm -f "$keyring"' RETURN
  gpg --dearmor <"/usr/share/pki/rpm-gpg/RPM-GPG-KEY-fedora-$release-primary" >"$keyring"
  rm -f "$cache/$checksum.signed"
  if ! gpgv --keyring "$keyring" --output "$cache/$checksum.signed" "$cache/$checksum" 2>/dev/null; then
    echo "The checksum file isn't signed by Fedora $release's key. Nothing was written." >&2
    exit 1
  fi
  image="$(sed -n 's/^SHA256 (\(Fedora-Workstation-Live-[^)]*\.iso\)) = .*/\1/p' "$cache/$checksum.signed" | head -1)"
  [[ -n "$image" ]] || { echo "The checksum file names no live image." >&2; exit 1; }
  echo "Downloading $image into $cache" >&2
  curl -fL -C - -o "$cache/$image" "$folder/$image" >&2
  if ! (cd "$cache" && grep -F "($image)" "$checksum.signed" | sha256sum -c --quiet -); then
    rm -f "$cache/$image"
    echo "The download doesn't match Fedora's checksum and was deleted." >&2
    exit 1
  fi
  echo "$cache/$image"
}

pick_stick() {
  local sticks device
  mapfile -t sticks < <(lsblk -dnpo PATH,TRAN | awk '$2 == "usb" { print $1 }')
  if ((${#sticks[@]} == 0)); then
    echo "Plug in a USB stick of at least 4 GB and run this again." >&2
    exit 1
  fi
  echo "USB sticks:" >&2
  for device in "${sticks[@]}"; do
    echo "  $device  $(lsblk -dno SIZE,VENDOR,MODEL "$device" | tr -s ' ')" >&2
  done
  device="$(ask "Which one? Everything on it will be erased:")"
  printf '%s\n' "${sticks[@]}" | grep -qxF -- "$device" || { echo "$device isn't one of them." >&2; exit 1; }
  echo "$device"
}

write_stick() {
  local image="$1" device="$2" size
  size="$(stat -c %s "$image")"
  if (($(lsblk -bdno SIZE "$device") < size)); then
    echo "$device is smaller than the image." >&2
    exit 1
  fi
  [[ "$(ask "Type $(basename "$device") to erase it and write the image:")" == "$(basename "$device")" ]] || exit 1
  lsblk -lnpo PATH,MOUNTPOINT "$device" | awk '$2 != "" { print $1 }' | xargs -r -n1 sudo umount
  sudo dd if="$image" of="$device" bs=4M conv=fsync oflag=direct status=progress
  sync
  if [[ "$(sudo head -c "$size" "$device" | sha256sum)" != "$(sha256sum <"$image")" ]]; then
    echo "What was written doesn't read back the same. Try another stick." >&2
    exit 1
  fi
  echo "The recovery stick is ready. Keep it somewhere safe."
}

[[ "${1:-}" == -h || "${1:-}" == --help ]] && usage
image="${1:-}"
[[ -n "$image" ]] || image="$(download_image)"
[[ -f "$image" ]] || { echo "$image doesn't exist." >&2; exit 1; }
write_stick "$image" "$(pick_stick)"
