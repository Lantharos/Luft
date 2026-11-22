#!/usr/bin/env bash
set -uo pipefail

name=com.lantharos.UsbProtection1
path=/com/lantharos/UsbProtection1
rules=/etc/polkit-1/rules.d/50-portguard-check.rules
boot="$(sed -n 's/.*portguard.check=\([a-z]*\).*/\1/p' /proc/cmdline)"

say() { echo "portguard-check: $*" > /dev/console; }
fail() {
  say "FAIL $*"
  for device in /sys/bus/usb/devices/*; do
    echo "$(basename "$device") $(cat "$device/serial" 2>/dev/null) $(cat "$device/authorized" 2>/dev/null)" > /dev/console
  done
  loginctl list-sessions --no-pager > /dev/console
  systemctl status portguard --no-pager > /dev/console
  journalctl -b -u portguard --no-pager -o cat > /dev/console
  journalctl -b -u polkit --no-pager -o cat > /dev/console
  coredumpctl list --no-pager > /dev/console
  journalctl -b -t portguard --no-pager -o cat > /dev/console
  systemctl poweroff
  exit 1
}
eventually() {
  local label="$1"
  shift
  for _ in $(seq 100); do "$@" && return 0; sleep 0.2; done
  fail "$label"
}
property() { busctl get-property "$name" "$path" "$name" "$1"; }
as_checker() { runuser -u checker -- "$@"; }
decide() {
  printf 'polkit.addRule(function(action) {\n  if (action.id == "com.lantharos.usb-protection.allow-device") return polkit.Result.%s;\n});\n' "$1" > "$rules"
  sleep 2
}

device_of() {
  local device
  for device in /sys/bus/usb/devices/*; do
    [[ "$(cat "$device/serial" 2>/dev/null)" == "$1" ]] && { echo "$device"; return 0; }
  done
  return 1
}
present() { device_of "$1" > /dev/null; }
gone() { ! present "$1"; }
authorized() { [[ "$(cat "$(device_of "$1")/authorized")" == 1 ]]; }
part_authorized() { [[ "$(cat "$(device_of "$1")/$(basename "$(device_of "$1")"):1.0/authorized")" == 1 ]]; }
id_of() { basename "$(device_of "$1")"; }

plug() {
  say "plug $*"
  eventually "$3 doesn't show up" present "$3"
}
unplug() {
  say "unplug $1"
  eventually "$1 doesn't leave" gone "$1"
}
stays_out() {
  sleep 3
  ! authorized "$1" || fail "$2"
}

signed_in() { loginctl show-seat seat0 -p ActiveSession --value | grep -q .; }
sign_in() {
  systemd-run --quiet --unit=checker-session -p PAMName=login -p User=checker -p TTYPath=/dev/tty8 \
    -p StandardInput=tty-force -p Environment=XDG_SEAT=seat0 -p Environment=XDG_VTNR=8 sleep infinity
  chvt 8
  eventually "nobody signs in at the computer" signed_in
}

first_boot() {
  sign_in
  eventually "the keyboard plugged in at start doesn't show up" present KBDA
  authorized KBDA || fail "the keyboard doesn't connect while the mode is the default one"

  busctl call "$name" "$path" "$name" SetMode s known-only || fail "Only known devices can't be turned on"
  property Mode | grep -q '"known-only"' || fail "the mode isn't Only known devices"
  property Trusted | grep -q 'QEMU USB Keyboard' || fail "the keyboard connected when the mode was turned on isn't trusted"
  say "ok: turning on Only known devices trusts what is connected"

  decide NO
  plug stick-a 2 STICKA
  stays_out STICKA "an unknown stick connects while unlocked"
  property Waiting | grep -q "\"$(id_of STICKA)\"" || fail "the unknown stick isn't waiting for approval"
  say "ok: an unknown stick stays out while unlocked, and waits for approval"

  decide YES
  as_checker busctl call "$name" "$path" "$name" Allow s "$(id_of STICKA)" || fail "the stick can't be allowed"
  eventually "the allowed stick doesn't connect" authorized STICKA
  eventually "the allowed stick doesn't get its drive" part_authorized STICKA
  property Trusted | grep -q 'QEMU USB HARDDRIVE' || fail "the allowed stick isn't trusted"
  say "ok: approval connects the stick and trusts it"

  decide NO
  unplug stick-a
  plug stick-a 3 STICKA
  stays_out STICKA "the trusted stick connects in another port"
  say "ok: the trusted stick in another port isn't trusted"
  unplug stick-a

  decide YES
  plug stick-b 4 STICKB
  eventually "the question about a new stick isn't approved" authorized STICKB
  say "ok: plugging in an unknown stick asks, and the answer connects it"
  unplug stick-b

  busctl call "$name" "$path" "$name" SetMode s no-drives || fail "No USB drives can't be turned on"
  plug stick-c 5 STICKC
  eventually "the stick doesn't connect as a device" authorized STICKC
  sleep 3
  ! part_authorized STICKC || fail "the stick's drive connects with No USB drives"
  plug keyboard-b 6 KBDB
  eventually "a new keyboard doesn't connect with No USB drives" part_authorized KBDB
  say "ok: No USB drives keeps out the drive and lets a keyboard in"
  unplug stick-c
  unplug keyboard-b

  decide NO
  busctl call "$name" "$path" "$name" SetMode s known-only || fail "Only known devices can't be turned on again"
  say "PASS first"
}

second_boot() {
  journalctl -b -t portguard -o cat | grep -q 'Disconnected QEMU USB HARDDRIVE' || fail "the startup image didn't disconnect the stick plugged in before start"
  eventually "the stick plugged in before start doesn't show up" present STICKD
  ! authorized STICKD || fail "the stick plugged in before start is connected"
  authorized KBDA || fail "the trusted keyboard doesn't work after start"
  sign_in
  stays_out STICKD "the stick plugged in before start connects once portguard runs"
  say "ok: a stick plugged in before start stays out, the trusted keyboard works"
  say "PASS second"
}

case "$boot" in
  first) first_boot ;;
  second) second_boot ;;
esac
systemctl poweroff
