#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
manifest=/usr/lib/sushi/installed-files
dracut_config=/etc/dracut.conf.d/90-sushi.conf
units=(sushi.service sushi-quit.service sushi-shutdown.service sushi-drivers.service)
arguments="sushi plymouth.enable=0 quiet loglevel=3 systemd.show_status=false rd.udev.log_level=3 udev.log_level=3 vt.global_cursor_default=0 fbcon=vc:0-5"

usage() {
  cat <<'USAGE'
Usage: boot/sushi/scripts/install.sh ACTION

  install   Put Sushi on this computer next to Plymouth and rebuild the initramfs.
            Nothing changes at boot until you enable it.
  enable    Use Sushi on every boot.
  disable   Go back to Plymouth on every boot. Sushi stays installed.
  remove    Disable Sushi, remove it, and rebuild the initramfs without it.
USAGE
}

kernel_arguments() {
  sudo grubby --update-kernel=ALL "$@"
}

rebuild_initramfs() {
  sudo dracut --force --kver "$(uname -r)"
}

install_everything() {
  local stage files file
  stage="$(mktemp -d)"
  files="$(mktemp)"
  trap 'rm -rf "$stage" "$files"' RETURN
  "$root/scripts/build.sh" "$stage"
  (cd "$stage" && find . -type f | sed 's|^\.||' | sort) > "$files"
  [[ -f "$manifest" ]] && comm -23 <(sort "$manifest") "$files" | xargs -r sudo rm -f
  while IFS= read -r file; do
    sudo install -DZ -o root -g root -m "$(stat -c %a "$stage$file")" "$stage$file" "$file"
  done < "$files"
  sudo install -DZ -m644 "$files" "$manifest"
  printf 'add_dracutmodules+=" sushi "\n' | sudo install -DZ -m644 /dev/stdin "$dracut_config"
  sudo systemctl daemon-reload
  sudo systemctl enable "${units[@]}"
  rebuild_initramfs
}

enable_everywhere() {
  kernel_arguments --args="$arguments"
  echo "Sushi now shows on every boot."
}

disable_everywhere() {
  kernel_arguments --remove-args="$arguments"
  echo "Plymouth shows on every boot again."
}

remove_everything() {
  disable_everywhere
  sudo systemctl disable "${units[@]}"
  sudo rm -f "$dracut_config"
  if [[ -f "$manifest" ]]; then
    xargs -a "$manifest" sudo rm -f
    xargs -a "$manifest" -n1 dirname | sort -ru | xargs -r -d '\n' sudo rmdir --ignore-fail-on-non-empty
    sudo rm -f "$manifest"
    sudo rmdir --ignore-fail-on-non-empty "$(dirname "$manifest")"
  fi
  sudo systemctl daemon-reload
  rebuild_initramfs
  echo "Sushi is removed."
}

[[ "${BASH_SOURCE[0]}" == "$0" ]] || return 0

case "${1:-}" in
  install) install_everything ;;
  enable) enable_everywhere ;;
  disable) disable_everywhere ;;
  remove) remove_everything ;;
  -h | --help) usage ;;
  *) usage >&2; exit 2 ;;
esac
