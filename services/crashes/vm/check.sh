#!/usr/bin/env bash
set -uo pipefail

BUS=(com.lantharos.CrashCollector1 /com/lantharos/CrashCollector1 com.lantharos.CrashCollector1)
SPOOL=/var/lib/luft-crash-collector/reports
COREDUMP=fc2e22bc6ee647b6b90729ab34a250b1

report() { echo "luft-crashes-check: $*" > /dev/ttyS0; }
fail() {
  report "FAIL $*"
  journalctl -b -u luft-crash-collector.service -u luft-crash-collector-poke.service -u 'systemd-coredump@*' --no-pager -n 40 > /dev/ttyS0
  systemctl poweroff --no-block
  exit 1
}
pass() { report "PASS $*"; }

crash_as_a_service() {
  systemd-run --quiet --wait "$@" >/dev/null 2>&1
}

dumped() {
  local program="$1"
  for _ in $(seq 60); do
    journalctl -q -o cat --output-fields=COREDUMP_EXE "MESSAGE_ID=$COREDUMP" | grep -qx "$program" && return 0
    sleep 1
  done
  fail "systemd-coredump never recorded $program"
}

spooled() {
  for _ in $(seq 30); do
    compgen -G "$SPOOL/$1/*.json" >/dev/null && return 0
    sleep 1
  done
  return 1
}

sandbox() {
  [[ "$(systemctl show -p User --value luft-crash-collector.service)" == luft-crash-reports ]] || fail "the collector doesn't run as its own account"
  report "exposure $(systemd-analyze security --no-pager luft-crash-collector.service | tail -1)"
  pass "runs sandboxed as its own account"
}

core_dump_of_a_system_service() {
  crash_as_a_service /usr/libexec/luft-crash-fixture segv
  dumped /usr/libexec/luft-crash-fixture
  spooled system || fail "a crashed system service left no report"
  journalctl -b -u luft-crash-collector-poke.service -o cat | grep -q 'Finished' || fail "systemd-coredump didn't wake the collector"
  grep -q '"kind":"signal"' "$SPOOL"/system/*.json || fail "the report isn't of a signal: $(cat "$SPOOL"/system/*.json)"
  grep -q '"frames":\[{' "$SPOOL"/system/*.json || fail "the report has no stack: $(cat "$SPOOL"/system/*.json)"
  pass "a system service's core dump wakes the collector and leaves a report with its stack"
}

taken_by_the_person_who_asks() {
  local taken
  taken="$(runuser -u mara -- busctl --system call "${BUS[@]}" Take)" || fail "a person couldn't take reports"
  [[ "$taken" == *luft-crash-fixture* && "$taken" == *SIGSEGV* ]] || fail "the person didn't get the system's report: $taken"
  compgen -G "$SPOOL/system/*.json" >/dev/null && fail "a report was kept after it was taken"
  [[ "$(busctl --system call "${BUS[@]}" Take)" == "as 0" ]] || fail "a report was handed over twice"
  pass "the system's reports go to the first person who asks, once"
}

panic_wakes_the_collector() {
  systemctl stop luft-crash-collector.service
  crash_as_a_service /usr/libexec/luft-crash-fixture panic
  spooled system || fail "a panic left no report"
  grep -q '"kind":"panic"' "$SPOOL"/system/*.json || fail "the report isn't of a panic: $(cat "$SPOOL"/system/*.json)"
  busctl --system call "${BUS[@]}" Take >/dev/null
  pass "a panic wakes the collector through its socket"
}

other_programs_are_left_out() {
  crash_as_a_service /usr/bin/crash-fixture segv
  dumped /usr/bin/crash-fixture
  sleep 5
  [[ "$(busctl --system call "${BUS[@]}" Take)" == "as 0" ]] || fail "a program that isn't Luft's was reported"
  pass "a program that isn't Luft's crashing leaves no report"
}

systemctl is-active -q luft-crash-collector.socket || fail "the collector's socket isn't listening"
sandbox
core_dump_of_a_system_service
taken_by_the_person_who_asks
panic_wakes_the_collector
other_programs_are_left_out
pass "everything"
systemctl poweroff --no-block
