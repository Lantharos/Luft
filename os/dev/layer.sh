#!/usr/bin/env bash
set -euo pipefail

dev="$(cd "$(dirname "$0")" && pwd)"
layer_state=/var/lib/luft/dev-layer
dropped=/run/luft-dev-layer-dropped

# shellcheck source=os/image/build.sh
source "$dev/../image/build.sh"

layer_usage() {
  cat <<'USAGE'
Usage: os/dev/layer.sh apply [PART...]
       os/dev/layer.sh status
       os/dev/layer.sh reset

Runs this working tree's build of Luft's own parts on an installed Luft, without
touching its signed image. apply builds the parts the way the image build does
(default: kestrel) and lays them over /usr as a system extension. It stays
across restarts until reset, and is taken off by itself when Luft updates.

  kestrel     Kestrel, its settings, search, greeter, keyring, passkeys and watchdog
  boot        trustd, USB protection and Sushi, as far as they run after startup
  services    The installer, updater, sleep, accounts, speech and Windows services
  app-NAME    An app from apps/NAME
USAGE
}

field() {
  sed -n "s/^$1=//p" "$2"
}

check_parts() {
  local name
  for name; do
    case "$name" in
      kestrel | boot | services) ;;
      app-meet) echo "Meet Luft runs on Windows, not on Luft." >&2; exit 2 ;;
      app-*) [[ -d "$luft/apps/${name#app-}" ]] || { echo "There is no app called ${name#app-}." >&2; exit 2; } ;;
      *) layer_usage >&2; exit 2 ;;
    esac
  done
}

require_luft() {
  [[ "$(. /usr/lib/os-release && echo "$ID")" == luft && -f /usr/share/luft/base-image ]] && return
  echo "Development layers go over an installed Luft whose image records what it was built on." >&2
  exit 1
}

build_layer_parts() {
  local name ref
  base="$(</usr/share/luft/base-image)"
  podman_options=()
  while read -r name ref; do
    part_exists "$ref" || build_part "$name" "$ref"
    extract_part "$name" "$ref"
  done < <(part_refs "$@")
}

missing_libraries() {
  local name provided
  provided="$(for name; do cat "$state/parts/$name/provided.txt"; done)"
  for name; do cat "$state/parts/$name/needed.txt"; done | sort -u |
    grep -vxF -f <(printf '%s\n' "$provided"; /usr/sbin/ldconfig -p | awk 'NR > 1 {print $1}') || true
}

missing_typelibs() {
  local namespace
  [[ -f "$state/parts/kestrel/typelibs.txt" ]] || return 0
  while read -r namespace; do
    compgen -G "/usr/lib*/*/$namespace-*.typelib" >/dev/null ||
      compgen -G "$state/parts/kestrel/stage/usr/lib*/*/$namespace-*.typelib" >/dev/null || echo "$namespace"
  done <"$state/parts/kestrel/typelibs.txt"
}

check_running_system() {
  local missing
  missing="$(missing_libraries "$@"; missing_typelibs)"
  [[ -z "$missing" ]] && return
  echo "This build needs what the installed Luft doesn't have, so it needs a new image:" >&2
  echo "$missing" >&2
  exit 1
}

commit() {
  local described
  described="$(git -C "$luft" rev-parse --short HEAD)"
  [[ -z "$(git -C "$luft" status --porcelain)" ]] || described+=" with changes"
  echo "$described"
}

apply() {
  local parts=("${@:-kestrel}") name stages=()
  check_parts "${parts[@]}"
  require_luft
  build_layer_parts "${parts[@]}"
  check_running_system "${parts[@]}"
  for name in "${parts[@]}"; do stages+=("$state/parts/$name/stage"); done
  sudo "$dev/merge.sh" apply "$(commit)" "${parts[*]}" "${stages[@]}"
}

status() {
  if [[ -f "$dropped" ]]; then
    echo "The build of $(field LUFT_DEV_COMMIT "$dropped") was taken off when Luft updated."
  fi
  if [[ ! -f "$layer_state/release" ]]; then
    echo "Luft runs its signed image as it is."
    return
  fi
  echo "Laid over /usr: $(field LUFT_DEV_PARTS "$layer_state/release")"
  echo "From: $(field LUFT_DEV_COMMIT "$layer_state/release"), built $(field LUFT_DEV_BUILT "$layer_state/release")"
  if [[ -f /usr/lib/extension-release.d/extension-release.luft-working-tree ]]; then
    echo "Merged: yes"
  else
    echo "Merged: no, run os/dev/layer.sh apply again"
  fi
}

case "${1:-}" in
  apply) apply "${@:2}" ;;
  status) status ;;
  reset) sudo "$dev/merge.sh" reset ;;
  -h | --help) layer_usage ;;
  *) layer_usage >&2; exit 2 ;;
esac
