#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
action="${1:-}"
manifest=/usr/lib/sushi/installed-files
dracut_config=/etc/dracut.conf.d/90-sushi.conf
trial_suffix=-sushi-trial
arguments="sushi plymouth.enable=0 quiet loglevel=3 systemd.show_status=false rd.udev.log_level=3 udev.log_level=3 vt.global_cursor_default=0 fbcon=vc:0-5"

usage() {
  cat <<'EOF'
Usage: boot/sushi/scripts/install.sh ACTION

  install   Put Sushi on this computer next to Plymouth and rebuild the initramfs.
            Nothing changes at boot until you try or enable it.
  try       Boot once with Sushi. The next boot after that returns to your usual boot.
  enable    Use Sushi on every boot.
  disable   Go back to Plymouth on every boot. Sushi stays installed.
  remove    Disable Sushi, remove it, and rebuild the initramfs without it.
EOF
  exit 2
}

default_entry() {
  sudo grubby --default-kernel
}

entry_file() {
  sudo grubby --info="$1" | sed -n 's/^id="\(.*\)"$/\1/p' | head -1
}

rebuild_initramfs() {
  sudo dracut --force --kver "$(uname -r)"
}

install_files() {
  local stage
  stage="$(mktemp -d)"
  trap 'rm -rf "$stage"' RETURN
  "$root/scripts/build.sh" "$stage"
  (cd "$stage" && find . -type f -o -type l) | sed 's|^\.||' | sort > "$stage.list"
  sudo cp -a --no-preserve=ownership "$stage/." /
  sudo install -Dm644 "$stage.list" "$manifest"
  rm -f "$stage.list"
  printf 'add_dracutmodules+=" sushi "\n' | sudo install -Dm644 /dev/stdin "$dracut_config"
  sudo systemctl daemon-reload
  sudo systemctl enable sushi.service sushi-quit.service
  rebuild_initramfs
}

remove_trial_entry() {
  local entries=/boot/loader/entries
  sudo find "$entries" -name "*$trial_suffix.conf" -delete
}

try_once() {
  remove_trial_entry
  local kernel id trial
  kernel="$(default_entry)"
  id="$(entry_file "$kernel")"
  trial="$id$trial_suffix"
  sudo sed -e "s/^title \(.*\)$/title \1 with Sushi/" -e "s/^options \(.*\)$/options \1 $arguments/" \
    "/boot/loader/entries/$id.conf" | sudo tee "/boot/loader/entries/$trial.conf" >/dev/null
  sudo grub2-reboot "$trial"
  echo "The next boot uses Sushi once. Restart when you're ready."
}

enable_everywhere() {
  remove_trial_entry
  sudo grubby --update-kernel=ALL --args="$arguments"
  echo "Sushi now shows on every boot."
}

disable_everywhere() {
  remove_trial_entry
  sudo grubby --update-kernel=ALL --remove-args="sushi plymouth.enable=0 fbcon=vc:0-5"
  echo "Plymouth shows on every boot again."
}

remove_everything() {
  disable_everywhere
  sudo systemctl disable sushi.service sushi-quit.service
  sudo rm -f "$dracut_config"
  if [[ -f "$manifest" ]]; then
    xargs -a "$manifest" sudo rm -f
    xargs -a "$manifest" -n1 dirname | sort -ru | xargs sudo rmdir --ignore-fail-on-non-empty 2>/dev/null || true
    sudo rm -f "$manifest"
    sudo rmdir --ignore-fail-on-non-empty /usr/lib/sushi
  fi
  sudo systemctl daemon-reload
  rebuild_initramfs
  echo "Sushi is removed."
}

case "$action" in
  install) install_files ;;
  try) try_once ;;
  enable) enable_everywhere ;;
  disable) disable_everywhere ;;
  remove) remove_everything ;;
  *) usage ;;
esac
