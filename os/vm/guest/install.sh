#!/usr/bin/env bash
set -euo pipefail

BUS=(com.lantharos.Installer1 /com/lantharos/Installer1 com.lantharos.Installer1)
TARGET=/dev/vdb
INSTALL_TIMEOUT=1500
ESP_ID=c12a7328-f81f-11d2-ba4b-00a0c93ec93b
{ read -r user; read -r password; } </run/luft-source/account

report() { echo "luft-vm-install: $*"; }
fail() {
  report "FAIL $*"
  journalctl -b -u luft-installer --no-pager -n 60
  exit 1
}
call() { busctl --json=short call "${BUS[@]}" "$@"; }
property() { busctl --json=short get-property "${BUS[@]}" "$1" | jq -r .data; }

install_luft() {
  local survey drive deadline=$((SECONDS + INSTALL_TIMEOUT)) stage
  survey="$(call Survey | jq -r '.data[0]')" || fail "the installer didn't survey the drives"
  drive="$(jq -r --arg device "$TARGET" '.drives[] | select(.device == $device) | .block' <<<"$survey")"
  [[ -n "$drive" ]] || fail "the installer doesn't offer $TARGET"
  call Configure s '{"locale":"en_US.UTF-8","keyboard":{"layout":"us","variant":""},"timezone":"UTC","hostname":"luft-vm"}' >/dev/null
  call Install s "{\"target\":{\"kind\":\"whole\",\"drive\":\"$drive\"},\"variant\":\"default\"}" >/dev/null ||
    fail "installing didn't start"
  call CreateAccount sss "$user" "Luft VM" "$password" >/dev/null || fail "the account wasn't taken"
  while ((SECONDS < deadline)); do
    stage="$(property Stage)"
    case "$stage" in
      finished) report "installed"; return ;;
      failed) fail "installing failed: $(property Error)" ;;
    esac
    sleep 2
  done
  fail "installing took longer than $INSTALL_TIMEOUT seconds"
}

partition() {
  lsblk --list --noheadings --paths --output PATH,PARTTYPE "$TARGET" | awk -v type="$1" '$2 == type { print $1 }'
}

finish_setup() {
  local root state
  mkdir -p /run/target
  mount "$(partition 4f68bce3-e8cd-4db1-96e7-fbcaf984b709)" /run/target
  root="$(dirname "$(compgen -G '/run/target/state/deploy/*/etc' | head -n1)")"
  state=/run/target/state/os/default/var
  rm -f "$state/lib/luft-installer/first-boot" "$state/lib/kestrel-greeter/initial-session.toml" "$state"/lib/luft-keyring/*.handoff
  awk -F: -v OFS=: -v hash="$(openssl passwd -6 -stdin <<<"$password")" '$1 == "root" { $2 = hash } 1' \
    "$root/etc/shadow" >/run/shadow
  cat /run/shadow >"$root/etc/shadow"
  mkdir -p "$root/etc/systemd/system/getty.target.wants"
  ln -sf /usr/lib/systemd/system/serial-getty@.service "$root/etc/systemd/system/getty.target.wants/serial-getty@ttyS0.service"
  install -Dm644 /run/luft-source/serial-console.conf "$root/etc/systemd/system/serial-getty@ttyS0.service.d/luft-vm.conf"
  setfiles -r "$root" "$root/etc/selinux/targeted/contexts/files/file_contexts" \
    "$root/etc/systemd/system/getty.target.wants" "$root/etc/systemd/system/serial-getty@ttyS0.service.d"
  umount /run/target
  report "setup is finished and root can sign in on the serial console"
}

queue_key() {
  bash /run/luft-source/queue-key.sh "$(partition "$ESP_ID")" "$password"
  report "Luft's key is queued for shim"
}

install_luft
finish_setup
queue_key
report DONE
