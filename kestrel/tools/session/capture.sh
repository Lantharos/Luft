#!/usr/bin/env bash
set -euo pipefail

# shellcheck source-path=SCRIPTDIR
source "$(dirname "$0")/environment.sh"
state="${KESTREL_SESSION_DIR:-$root/kestrel/run}"
out="$state/capture"
durations="$state/capture-durations.tsv"
session_timeout=30m
max_startup_failures=3
inotify_per_session=24

usage() {
  echo "Usage: kestrel/tools/session.sh capture [--only GROUPS] [--jobs N] [--list]"
  echo "kestrel/tools/session.sh --help explains the options."
}

all_groups() {
  (cd "$tools/checks" && find . -mindepth 2 -maxdepth 2 -name '*.js' -not -path './lib/*' -not -path './greeter/*') \
    | sed 's|^\./||; s|\.js$||; s|/|:|' | sort
  echo greeter
}

select_groups() {
  local token group matched
  if [[ -z "$only" ]]; then
    all_groups
    return
  fi
  for token in ${only//,/ }; do
    matched=false
    while read -r group; do
      if [[ "$group" == "$token" || "$group" == "$token":* ]]; then
        echo "$group"
        matched=true
      fi
    done < <(all_groups)
    if ! $matched; then
      echo "No group matches $token. kestrel/tools/session.sh capture --list shows them." >&2
      exit 2
    fi
  done | sort -u
}

longest_first() {
  awk -F '\t' 'FILENAME == ARGV[1] { seconds[$1] = $2; next } { print ($0 in seconds ? seconds[$0] : 1e9) "\t" $0 }' \
    <(cat "$durations" 2> /dev/null) - | sort -t $'\t' -k1,1gr | cut -f2
}

queue_groups() {
  local index=0 group
  while read -r group; do
    if [[ "$group" == greeter ]]; then
      run_greeter=true
    else
      printf -v index '%03d' $((10#$index + 1))
      : > "$out/queue/$index-$group"
    fi
  done < <(select_groups | longest_first)
}

queued() {
  compgen -G "$out/queue/*" > /dev/null
}

seconds_since() {
  awk -v from="$1" -v to="$EPOCHREALTIME" 'BEGIN { printf "%.1f", to - from }'
}

start_worker() {
  local name="worker-$((++workers))"
  KESTREL_SESSION_DIR="$out/workers/$name" KESTREL_CAPTURE_WORKER="$name" KESTREL_CAPTURE_QUEUE="$out/queue" \
    KESTREL_CAPTURE_CLAIMED="$out/claimed" KESTREL_CAPTURE_RESULTS="$out/results" \
    timeout "$session_timeout" "$tools/session/desktop.sh" capture > "$out/workers/$name.log" 2>&1 &
  running[$!]="$name"
}

start_greeter() {
  greeter_started=$EPOCHREALTIME
  KESTREL_SESSION_DIR="$out/workers/greeter" timeout "$session_timeout" "$tools/session/greeter.sh" \
    > "$out/logs/greeter.log" 2>&1 &
  running[$!]=greeter
}

record_greeter() {
  local seconds message
  seconds=$(seconds_since "$greeter_started")
  if [[ "$1" -eq 0 ]]; then
    printf 'pass\t%s\t\n' "$seconds" > "$out/results/greeter.tsv"
  else
    message=$(grep -m1 -o 'check failed: .*\|Timed out .*' "$out/logs/greeter.log" || echo "the login screen exited with status $1")
    printf 'fail\t%s\t%s\n' "$seconds" "$message" > "$out/results/greeter.tsv"
  fi
}

finished_worker() {
  if queued && ! compgen -G "$out/claimed/*@$1" > /dev/null && ((++startup_failures >= max_startup_failures)); then
    echo "Sessions keep ending before running a check, see $out/workers/$1.log" >&2
    exit 1
  fi
}

run_sessions() {
  local pid status queued_groups
  queued_groups=$(find "$out/queue" -type f | wc -l)
  if $run_greeter; then start_greeter; fi
  while ((${#running[@]} < jobs && workers < queued_groups)); do start_worker; done
  while ((${#running[@]} > 0)); do
    status=0
    wait -n -p pid || status=$?
    if [[ "${running[$pid]}" == greeter ]]; then
      record_greeter "$status"
    else
      finished_worker "${running[$pid]}"
    fi
    unset "running[$pid]"
    if queued && ((${#running[@]} < jobs)); then start_worker; fi
  done
}

split_logs() {
  local log
  for log in "$out"/workers/worker-*.log; do
    [[ -f "$log" ]] || continue
    awk -v logs="$out/logs" '
      match($0, /Kestrel group started: [^ ]+/) { file = logs "/" substr($0, RSTART + 23, RLENGTH - 23) ".log" }
      file { print > file }
    ' "$log"
  done
}

summarize() {
  local group result seconds message passed failed
  : > "$out/durations.tsv"
  while read -r group; do
    if [[ -f "$out/results/$group.tsv" ]]; then
      IFS=$'\t' read -r result seconds message < "$out/results/$group.tsv"
    elif compgen -G "$out/claimed/*-$group@*" > /dev/null; then
      result=fail seconds=- message="its session ended while it ran"
    else
      result=fail seconds=- message="it did not run"
    fi
    if [[ "$result" == pass ]]; then
      printf '%-32s passed  %6s s\n' "$group" "$seconds"
    else
      printf '%-32s FAILED  %6s s  %s\n' "$group" "$seconds" "$message"
      printf '%-32s         log: %s\n' "" "$out/logs/$group.log"
    fi
    if [[ "$seconds" != - ]]; then printf '%s\t%s\n' "$group" "$seconds" >> "$out/durations.tsv"; fi
  done < <(select_groups) | tee "$out/summary.txt"
  passed=$(grep -c ' passed ' "$out/summary.txt" || true)
  failed=$(grep -c ' FAILED ' "$out/summary.txt" || true)
  printf '\n%d passed, %d failed in %s s with up to %d sessions. Screenshots are in %s\n' \
    "$passed" "$failed" "$(seconds_since "$started")" "$jobs" "$KESTREL_CAPTURE_DIR" | tee -a "$out/summary.txt"
  cat "$out/durations.tsv" <(cat "$durations" 2> /dev/null) | awk -F '\t' '!seen[$1]++' > "$durations.new"
  mv "$durations.new" "$durations"
  [[ "$failed" -eq 0 ]]
}

inotify_instances_in_use() {
  { find /proc/[0-9]*/fd -user "$(id -u)" -lname 'anon_inode:inotify' 2> /dev/null || true; } | wc -l
}

fit_jobs_to_inotify() {
  local free fitting
  free=$(($(< /proc/sys/fs/inotify/max_user_instances) - $(inotify_instances_in_use)))
  fitting=$((free / inotify_per_session))
  ((fitting >= 1)) || fitting=1
  if ((jobs > fitting)); then
    echo "Running $fitting sessions side by side instead of $jobs: only $free inotify instances are free." >&2
    jobs=$fitting
  fi
}

stop_sessions() {
  if ((${#running[@]} > 0)); then
    kill "${!running[@]}" 2> /dev/null || true
    wait "${!running[@]}" 2> /dev/null || true
  fi
}

only=""
jobs=$(($(nproc) / 4))
list=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --only) only="${2:?--only needs a list of groups}"; shift 2 ;;
    --only=*) only="${1#*=}"; shift ;;
    --jobs) jobs="${2:?--jobs needs a number}"; shift 2 ;;
    --jobs=*) jobs="${1#*=}"; shift ;;
    --list) list=true; shift ;;
    -h | --help) usage; exit 0 ;;
    *) usage >&2; exit 2 ;;
  esac
done
[[ "$jobs" =~ ^[0-9]+$ ]] || { usage >&2; exit 2; }
((jobs >= 1)) || jobs=1

if $list; then
  all_groups
  exit 0
fi

require_build
build_helpers
fit_jobs_to_inotify
started=$EPOCHREALTIME
declare -A running=()
run_greeter=false
greeter_started=0
workers=0
startup_failures=0
rm -rf "$out"
mkdir -p "$out"/{queue,claimed,results,logs,workers} "$KESTREL_CAPTURE_DIR"
trap stop_sessions EXIT
trap 'exit 130' INT TERM
queue_groups
run_sessions
split_logs
summarize
