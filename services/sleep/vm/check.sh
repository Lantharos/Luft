#!/usr/bin/env bash
set -uo pipefail

SUPPLIES=/run/luft-sleep-check/supplies

report() { echo "luft-sleep-check: $*" > /dev/ttyS0; }
fail() {
  report "FAIL $*"
  journalctl -b -u systemd-suspend.service -u luft-sleep-power-off.service --no-pager -n 30 > /dev/ttyS0
  systemctl poweroff --no-block
  exit 1
}
pass() { report "PASS $*"; }

battery() {
  mkdir -p "$SUPPLIES/BAT0"
  printf 'Battery\n' > "$SUPPLIES/BAT0/type"
  printf '%s\n' "$1" > "$SUPPLIES/BAT0/status"
  printf '%s\n' "$2" > "$SUPPLIES/BAT0/capacity"
  mountpoint -q /sys/class/power_supply || mount --bind "$SUPPLIES" /sys/class/power_supply
}

suspends() { journalctl -b -u systemd-suspend.service -g 'Finished' -o cat --no-pager | wc -l; }

sleep_until_woken() {
  local before started=$SECONDS
  before="$(suspends)"
  systemd-run --quiet --on-active=20 --timer-property=WakeSystem=yes /usr/bin/true || fail "setting a wake-up timer"
  systemctl suspend || fail "systemctl suspend"
  for _ in $(seq 120); do
    if (($(suspends) > before)); then
      report "woke after $((SECONDS - started)) s"
      return
    fi
    sleep 1
  done
  fail "$1: didn't wake up"
}

woken_early() {
  battery Discharging 50
  sleep_until_woken early
  [[ -z "$(systemctl list-jobs --no-legend luft-sleep-power-off.service)$(journalctl -b -q -o cat -u luft-sleep-power-off.service)" ]] ||
    fail "shut down after being woken"
  pass "waking it up early leaves it on"
  umount /sys/class/power_supply
  sleep_until_woken plain
  pass "sleeps as usual without a battery"
  systemctl poweroff --no-block
}

low_battery() {
  journalctl -f -o cat -u systemd-suspend.service -u luft-sleep-power-off.service | sed -u 's/^/luft-sleep-check: journal /' > /dev/ttyS0 &
  gdbus monitor --system --dest org.freedesktop.login1 --object-path /org/freedesktop/login1 |
    stdbuf -oL grep -E 'PrepareFor(Sleep|Shutdown)' | sed -u 's/^/luft-sleep-check: logind /' > /dev/ttyS0 &
  systemd-inhibit --what=shutdown --mode=delay --who=check --why="Saving work" sleep infinity &
  battery Discharging 5
  report "SLEEPING on a low battery"
  systemctl suspend || fail "systemctl suspend"
  sleep 900
  fail "still on after sleeping on a low battery"
}

mkdir -p "$SUPPLIES"
mount -t tmpfs tmpfs "$SUPPLIES"
if grep -qw 'luft.sleep-check=low' /proc/cmdline; then
  low_battery
else
  woken_early
fi
