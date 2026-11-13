#!/usr/bin/env bash
set -uo pipefail

report() { echo "luft-headless-check: $*" > /dev/ttyS0; }
fail() {
  report "FAIL $*"
  journalctl -b -u sushi -u sushi-drivers -u greetd --no-pager -n 60 > /dev/ttyS0
  journalctl -b -t kestrel -t kestrel-greeter --no-pager -n 30 > /dev/ttyS0
  systemctl poweroff --no-block
  exit 1
}
pass() { report "PASS $*"; }

within() {
  local deadline=$((SECONDS + $1))
  shift
  until "$@"; do
    ((SECONDS < deadline)) || return 1
    sleep 0.2
  done
}

connector() { compgen -G '/sys/class/drm/card*-Virtual-1' | head -n1; }
cards() { compgen -G '/sys/class/drm/card*' | grep -c '/card[0-9]*$'; }
masters() {
  mountpoint -q /sys/kernel/debug || mount -t debugfs debugfs /sys/kernel/debug
  awk 'FNR == 1 { for (i = 1; i <= NF; i++) if ($i == "master") column = i; next } $column == "y" { print $1 }' \
    /sys/kernel/debug/dri/*/clients 2> /dev/null | sort -u | xargs
}
login_screen_holds_the_card() { [[ -n "$(masters)" && "$(masters)" != *sushid* ]]; }
plug_in_a_display() {
  echo detect > "$(connector)/status"
  echo "change $(cat /proc/sys/kernel/random/uuid) HOTPLUG=1" > "$(realpath "$(connector)/..")/uevent"
}
lit() { [[ "$(cat "$(connector)/status")" == connected && "$(cat "$(connector)/enabled")" == enabled ]]; }

if grep -qw luft-headless-check.late-driver /proc/cmdline; then
  modprobe virtio_gpu || fail "the graphics driver doesn't load"
  report "loaded the graphics driver after the login screen started"
fi
within 60 connector || fail "no graphics card appeared"
[[ "$(cards)" == 1 && "$(cat "$(connector)/status")" == disconnected ]] ||
  fail "the firmware left a framebuffer or a display is connected: $(cards) cards, $(cat "$(connector)/status")"
pass "the only graphics card has nothing connected"

within 60 login_screen_holds_the_card || fail "the login screen didn't take the graphics card, its master is '$(masters)'"
sleep 5
login_screen_holds_the_card && ! journalctl -b -q -g EBUSY | grep -q . ||
  fail "the login screen lost the graphics card, its master is '$(masters)'"
pass "the login screen holds the graphics card with no display connected: $(masters)"

plug_in_a_display
within 20 lit || fail "the login screen didn't light the display connected after it started: $(cat "$(connector)/status"), $(cat "$(connector)/enabled")"
pass "the login screen lit the display connected after it started"
report DONE
systemctl poweroff --no-block
