#!/usr/bin/env bash
set -uo pipefail

PASSKEYS=(com.lantharos.Passkeys /com/lantharos/Passkeys1 com.lantharos.Passkeys1)
HELPER=/usr/libexec/luft-passkeys
SHARE=/usr/share/luft-shield-check
RUNTIME=/run/user/1000

report() { echo "luft-shield-check: $*" > /dev/ttyS0; }
fail() {
  report "FAIL $*"
  journalctl -b --no-pager -n 60 _UID=1000 + _SYSTEMD_UNIT=luft-keyring-unlock.service + SYSLOG_IDENTIFIER=luft-passkeys-relay > /dev/ttyS0
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

legitimate_caller() {
  local since listed
  since="$(mark)"
  listed="$(as_mara busctl --user --timeout=60 call "${PASSKEYS[@]}" List 2>&1)" ||
    fail "Luft Passkeys couldn't list passkeys through the keyring: $listed"
  [[ "$listed" == "a"* ]] || fail "Luft Passkeys listed something odd: $listed"
  logged "$since" "has no session on this computer's screen" || fail "the relay never looked at Luft Passkeys' session"
  logged "$since" "Refused" && fail "Luft Passkeys was refused somewhere"
  pass "Luft Passkeys lists passkeys through the keyring, and the relay takes it"
  shut_out luft-keyring "$(main_pid luft-keyring.service)"
  shut_out luft-passkeys "$(main_pid luft-passkeys.service)"
}

plain_connections() {
  local since read
  since="$(mark)"
  read="$(as_mara python3 -c 'import socket, sys
s = socket.socket(socket.AF_UNIX)
s.connect(sys.argv[1])
print(len(s.recv(64)))' /run/luft-passkeys/relay 2>&1)"
  [[ "$read" == 0 ]] || fail "the relay answered a plain program: $read"
  logged "$since" "Refused user 1000: it didn't start Luft Passkeys with its group" || fail "the relay didn't refuse a plain program"
  since="$(mark)"
  as_mara python3 -c 'import socket, sys
s = socket.socket(socket.AF_UNIX)
s.connect(sys.argv[1])
s.settimeout(5)
s.sendall(b"\0" * 8)
s.recv(64)' /run/luft-keyring/unlock >/dev/null 2>&1
  logged "$since" "Refused a connection from user 1000" || fail "the unlock service didn't refuse a plain program"
  pass "a plain program of the same user is refused by the relay's and the unlock service's sockets"
}

run_by_hand() {
  as_mara "$@" &
  for _ in $(seq 40); do
    pid="$(as_mara busctl --user status "${PASSKEYS[0]}" 2>/dev/null | sed -n 's/^PID=//p')"
    [[ -n "$pid" ]] && return 0
    sleep 0.25
  done
  fail "$* never took Luft Passkeys' name"
}

stop_by_hand() {
  kill "$pid"
  for _ in $(seq 40); do
    [[ -d "/proc/$pid" ]] || return 0
    sleep 0.25
  done
  fail "Luft Passkeys started by hand didn't stop"
}

lists() {
  as_mara busctl --user --timeout=60 call "${PASSKEYS[@]}" List >/dev/null 2>&1
}

without_its_group() {
  local since
  as_mara systemctl --user stop luft-passkeys.service
  since="$(mark)"
  run_by_hand setpriv --no-new-privs "$HELPER"
  awk '$1 == "Gid:" && $2 == $3 {found = 1} END {exit !found}' "/proc/$pid/status" ||
    fail "Luft Passkeys started with no new privileges got its group"
  lists && fail "Luft Passkeys without its group still listed passkeys"
  logged "$since" "it didn't start with its program's group" || fail "the keyring didn't say why it refused Luft Passkeys"
  logged "$since" "Refused user 1000: it didn't start Luft Passkeys with its group" || fail "the relay took Luft Passkeys without its group"
  stop_by_hand
  pass "Luft Passkeys started with no new privileges gets no group, so the keyring and the relay refuse it"
}

started_by_hand() {
  run_by_hand "$HELPER"
  shut_out "luft-passkeys started by hand" "$pid"
  lists || fail "Luft Passkeys started by hand with its group couldn't list passkeys"
  stop_by_hand
  pass "Luft Passkeys started by hand gets its group and works"
}

start_session
legitimate_caller
plain_connections
without_its_group
started_by_hand
pass everything
systemctl poweroff --no-block
