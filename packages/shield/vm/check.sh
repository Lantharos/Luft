#!/usr/bin/env bash
set -uo pipefail

CHIP=(org.freedesktop.secrets /com/lantharos/Keyring1 com.lantharos.Keyring1 Chip)
SHARE=/usr/share/luft-shield-check
RUNTIME=/run/user/1000
NO_GROUP=/home/mara/.config/systemd/user/luft-keyring.service.d/no-new-privileges.conf

report() { echo "luft-shield-check: $*" > /dev/ttyS0; }
fail() {
  report "FAIL $*"
  journalctl -b --no-pager -n 60 _UID=1000 + _SYSTEMD_UNIT=luft-keyring-unlock.service > /dev/ttyS0
  systemctl poweroff --no-block
  exit 1
}
pass() { report "PASS $*"; }

as_mara() {
  runuser -u mara -- env XDG_RUNTIME_DIR="$RUNTIME" DBUS_SESSION_BUS_ADDRESS="unix:path=$RUNTIME/bus" "$@"
}

mark() {
  journalctl -b -n 0 --show-cursor -q | sed -n 's/^-- cursor: //p'
}

logged() {
  local since="$1" text="$2"
  for _ in $(seq 20); do
    journalctl -b -q -o cat --after-cursor "$since" | grep -qF "$text" && return 0
    sleep 0.5
  done
  return 1
}

main_pid() {
  as_mara systemctl --user show -p MainPID --value "$1"
}

chip() {
  as_mara busctl --user --timeout=60 get-property "${CHIP[@]}" 2>&1
}

attached() {
  for _ in $(seq 20); do
    [[ "$(chip)" =~ ^s\ \"[a-z-]+\"$ ]] && return 0
    sleep 0.5
  done
  return 1
}

shut_out() {
  local name="$1" pid="$2" probe
  probe="$(as_mara sh -c "cat /proc/$pid/environ >/dev/null 2>&1 && echo environ; cat /proc/$pid/maps >/dev/null 2>&1 && echo maps; exec 3</proc/$pid/mem 2>/dev/null && echo memory")"
  [[ -z "$probe" ]] || fail "a plain program of the same user read $name's $probe"
  awk '$1 == "Gid:" && $2 != $3 {raised = 1} END {exit !raised}' "/proc/$pid/status" || fail "$name runs without its group"
  grep -q '^NoNewPrivs:[[:space:]]*1' "/proc/$pid/status" || fail "$name took no new privileges: $(cat "/proc/$pid/status")"
  grep -q '^Seccomp:[[:space:]]*2' "/proc/$pid/status" || fail "$name has no system call filter"
  pass "$name runs with its group, and a plain program of the same user can't read its environment, maps or memory"
}

start_session() {
  systemctl start user@1000.service || fail "mara's systemd didn't start"
  echo '{"passwords": ["luft-vm"]}' | install -o mara -m 600 /dev/stdin /home/mara/prompter.json
  as_mara python3 "$SHARE/prompter.py" /home/mara/prompter.json /home/mara/prompter.log &
  for _ in $(seq 40); do
    as_mara busctl --user status com.lantharos.Kestrel >/dev/null 2>&1 && return 0
    sleep 0.5
  done
  fail "the stand-in prompter never appeared"
}

legitimate_keyring() {
  local since
  since="$(mark)"
  attached || fail "the unlock service never answered the keyring: $(chip)"
  logged "$since" "Refused" && fail "the keyring was refused somewhere"
  pass "the unlock service takes the keyring"
  shut_out luft-keyring "$(main_pid luft-keyring.service)"
}

plain_connection() {
  local since
  since="$(mark)"
  as_mara python3 -c 'import socket, sys
s = socket.socket(socket.AF_UNIX)
s.connect(sys.argv[1])
s.settimeout(5)
s.sendall(b"\0" * 8)
s.recv(64)' /run/luft-keyring/unlock >/dev/null 2>&1
  logged "$since" "Refused a connection from user 1000" || fail "the unlock service didn't refuse a plain program"
  pass "a plain program of the same user is refused by the unlock service's socket"
}

restart_keyring() {
  as_mara systemctl --user daemon-reload
  as_mara systemctl --user restart luft-keyring.service || fail "the keyring didn't start again"
}

without_its_group() {
  local since pid
  printf '[Service]\nNoNewPrivileges=yes\n' | install -D -o mara -m 644 /dev/stdin "$NO_GROUP"
  since="$(mark)"
  restart_keyring
  pid="$(main_pid luft-keyring.service)"
  awk '$1 == "Gid:" && $2 == $3 {found = 1} END {exit !found}' "/proc/$pid/status" ||
    fail "the keyring started with no new privileges got its group"
  logged "$since" "Refused a connection from user 1000" || fail "the unlock service took the keyring without its group"
  [[ "$(chip)" == 's ""' ]] || fail "the keyring without its group still reached the chip: $(chip)"
  rm "$NO_GROUP"
  restart_keyring
  attached || fail "the keyring didn't reach the unlock service once it had its group again"
  pass "the keyring started with no new privileges gets no group, so the unlock service refuses it"
}

start_session
legitimate_keyring
plain_connection
without_its_group
pass everything
systemctl poweroff --no-block
