#!/usr/bin/env bash
set -euo pipefail

dev="$(cd "$(dirname "$0")" && pwd)"
state=/var/lib/luft/dev-layer
work="$state/work"
tree="$work/luft-working-tree"
link=/run/extensions/luft-working-tree.raw
boot_only=(usr/lib/sushi/efi usr/lib/dracut usr/lib/bootc)
file_contexts=/etc/selinux/targeted/contexts/files/file_contexts

usage() {
  cat <<'USAGE'
Usage: os/dev/merge.sh apply COMMIT PARTS STAGE...
       os/dev/merge.sh reset

Run as root by os/dev/layer.sh.
USAGE
}

booted() {
  tr ' ' '\n' </proc/cmdline | sed -n 's/^composefs\.digest=[^:]*://p'
}

gather() {
  local stage file
  rm -rf "$work"
  mkdir -p "$tree"
  for stage; do
    cp -a --no-preserve=ownership "$stage/usr" "$tree/"
    (cd "$stage" && find etc -type f 2>/dev/null) | while read -r file; do
      cmp -s "$stage/$file" "/$file" || echo "/$file differs from this build, and only /usr is laid over." >&2
    done
  done
  (cd "$tree" && rm -rf "${boot_only[@]}")
}

describe() {
  local commit="$1" parts="$2" release="$tree/usr/lib/extension-release.d/extension-release.luft-working-tree"
  mkdir -p "$(dirname "$release")"
  cat >"$release" <<EOF
ID=luft
VERSION_ID=$(. /usr/lib/os-release && echo "$VERSION_ID")
EXTENSION_RELOAD_MANAGER=1
LUFT_DEV_DEPLOYMENT=$(booted)
LUFT_DEV_COMMIT=$commit
LUFT_DEV_PARTS=$parts
LUFT_DEV_BUILT=$(date '+%Y-%m-%d %H:%M')
EOF
}

refresh_caches_over() {
  local mutable=/var/lib/extensions.mutable made="" status=0
  [[ -d "$mutable" ]] || { mkdir "$mutable"; made=1; }
  unshare --mount --propagation private "$dev/caches.sh" "$tree" "$mutable" "$link" || status=$?
  [[ -z "$made" ]] || rmdir "$mutable"
  return "$status"
}

pack() {
  setfiles -F -r "$tree" "$file_contexts" "$tree"
  mkfs.erofs --quiet -zlz4hc "$work/luft-working-tree.raw" "$tree"
  mv "$work/luft-working-tree.raw" "$state/luft-working-tree.raw"
  cp "$tree/usr/lib/extension-release.d/extension-release.luft-working-tree" "$state/release"
  system_services >"$state/units"
  rm -rf "$work"
}

system_services() {
  local unit
  for unit in "$tree"/usr/lib/systemd/system/*.service; do
    [[ ! -e "$unit" || "$unit" == *@* ]] || echo "${unit##*/}"
  done
}

running_daemons() {
  local unit
  while read -r unit; do
    [[ "$(systemctl show --property=Type --value "$unit")" != oneshot ]] && systemctl --quiet is-active "$unit" && echo "$unit"
  done <"$1"
}

settle() {
  local units="$1" uid daemons
  mapfile -t daemons < <(running_daemons "$units")
  systemctl reload dbus-broker.service
  ((${#daemons[@]} == 0)) || systemctl try-restart "${daemons[@]}"
  for uid in $(loginctl list-users --no-legend | awk '{print $1}'); do
    systemctl --user --machine="$(id -nu "$uid")@.host" daemon-reload
  done
}

apply() {
  local commit="$1" parts="$2"
  shift 2
  mkdir -p "$state"
  rm -f /run/luft-dev-layer-dropped
  mkdir -p /run/extensions
  gather "$@"
  describe "$commit" "$parts"
  refresh_caches_over
  pack
  ln -sfn "$state/luft-working-tree.raw" "$link"
  systemd-sysext refresh >/dev/null
  echo "$parts from $commit is laid over /usr."
  settle "$state/units"
  [[ " $parts " != *" kestrel "* ]] || echo "Log out and back in to run this Kestrel."
}

reset() {
  local units parts
  [[ -f "$state/release" ]] || { echo "No development build is laid over /usr."; return; }
  units="$(mktemp)"
  cp "$state/units" "$units"
  parts="$(sed -n 's/^LUFT_DEV_PARTS=//p' "$state/release")"
  rm -f "$link"
  rm -rf "$state"
  systemd-sysext refresh >/dev/null
  echo "Luft runs its signed image as it is again."
  settle "$units"
  rm "$units"
  [[ " $parts " != *" kestrel "* ]] || echo "Log out and back in to run its Kestrel."
}

case "${1:-}" in
  apply) (($# >= 4)) || { usage >&2; exit 2; }; apply "${@:2}" ;;
  reset) reset ;;
  *) usage >&2; exit 2 ;;
esac
