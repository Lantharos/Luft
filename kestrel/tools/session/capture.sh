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
declare -A laptops=([laptop]=1920x1200:302x189mm [laptop15]=1920x1080:344x194mm)
laptop_areas=(board input:dictation input:scrolling panel:battery panel:repaints panel:screenshot tablet:keyboard tablet:longPress windows:serverDecorations windows:x11Frames)
taskbar_positions=(left top right)
position_areas=(taskbar start panel tiling)
two_display_groups=(tiling:monitors system:dimming)
second_display=1280x720

usage() {
  echo "Usage: kestrel/tools/session.sh capture [--only GROUPS] [--jobs N] [--list]"
  echo "kestrel/tools/session.sh --help explains the options."
}

all_groups() {
  local area laptop
  (cd "$tools/checks" && find . -mindepth 2 -maxdepth 2 -name '*.ts' -not -path './lib/*' -not -path './greeter/*' -not -path './setup/*' -not -path './scaling/*') \
    | sed 's|^\./||; s|\.ts$||; s|/|:|' | sort
  {
    for laptop in "${!laptops[@]}"; do variants "$laptop" "${laptop_areas[@]}"; done
    for position in "${taskbar_positions[@]}"; do variants "$position" "${position_areas[@]}"; done
  } | sort
  printf '%s\n' greeter setup scaling
}

variants() {
  local variant="$1" area
  shift
  for area in "$@"; do
    if [[ "$area" == *:* ]]; then
      echo "$area+$variant"
    else
      (cd "$tools/checks/$area" && find . -maxdepth 1 -name '*.ts') | sed "s|^\./|$area:|; s|\.ts$|+$variant|"
    fi
  done
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
  local index=0 group size
  while read -r group; do
    if standalone "$group"; then
      separate+=("$group")
    else
      printf -v index '%03d' $((10#$index + 1))
      size=default
      [[ "$group" == *+* ]] && size="${group##*+}"
      if [[ " ${two_display_groups[*]} " == *" ${group%+*} "* ]]; then
        size=dual
        [[ "$group" == *+* ]] && size="dual-${group##*+}"
      fi
      mkdir -p "$out/queue/$size"
      : > "$out/queue/$size/$index-$group"
    fi
  done < <(select_groups | longest_first)
}

queued() {
  compgen -G "$out/queue/*/*" > /dev/null
}

next_size() {
  local queue best="" best_share=-1 serving share
  for queue in "$out"/queue/*; do
    serving=$(printf '%s\n' "${sizes[@]}" | grep -c "^${queue##*/}$" || true)
    share=$(($(find "$queue" -type f | wc -l) * 100 / (serving + 1)))
    if ((share > best_share)); then
      best="${queue##*/}"
      best_share=$share
    fi
  done
  echo "$best"
}

seconds_since() {
  awk -v from="$1" -v to="$EPOCHREALTIME" 'BEGIN { printf "%.1f", to - from }'
}

start_worker() {
  local name="worker-$((++workers))" size capture_size="${KESTREL_CAPTURE_SIZE:-1440x900}" captures="$KESTREL_CAPTURE_DIR"
  local secondary="${KESTREL_CAPTURE_SECONDARY_SIZE:-}" position="" variant
  size=$(next_size)
  variant="$size"
  if [[ "$variant" == dual* ]]; then
    secondary="$second_display"
    variant="${variant#dual}"
    variant="${variant#-}"
  fi
  if [[ " ${taskbar_positions[*]} " == *" $variant "* ]]; then
    position="$variant"
    captures="$KESTREL_CAPTURE_DIR/taskbar-$variant"
  elif [[ -n "$variant" && "$variant" != default ]]; then
    capture_size="${laptops[$variant]}"
    captures="$KESTREL_CAPTURE_DIR/$variant"
  fi
  mkdir -p "$captures"
  KESTREL_SESSION_DIR="$out/workers/$name" KESTREL_CAPTURE_WORKER="$name" KESTREL_CAPTURE_QUEUE="$out/queue/$size" \
    KESTREL_CAPTURE_CLAIMED="$out/claimed" KESTREL_CAPTURE_RESULTS="$out/results" \
    KESTREL_CAPTURE_SIZE="$capture_size" KESTREL_CAPTURE_SECONDARY_SIZE="$secondary" KESTREL_CAPTURE_DIR="$captures" \
    KESTREL_CAPTURE_TASKBAR="$position" \
    timeout "$session_timeout" "$tools/session/desktop.sh" capture > "$out/workers/$name.log" 2>&1 &
  running[$!]="$name"
  sizes[$!]="$size"
}

standalone() {
  [[ "$1" == greeter || "$1" == setup || "$1" == scaling ]]
}

start_standalone() {
  local command=("$tools/session/desktop.sh" "$1")
  [[ "$1" == greeter ]] && command=("$tools/session/greeter.sh")
  started_at[$1]=$EPOCHREALTIME
  KESTREL_SESSION_DIR="$out/workers/$1" timeout "$session_timeout" "${command[@]}" > "$out/logs/$1.log" 2>&1 &
  running[$!]="$1"
}

record_standalone() {
  local seconds message
  seconds=$(seconds_since "${started_at[$1]}")
  if [[ "$2" -eq 0 ]]; then
    printf 'pass\t%s\t\n' "$seconds" > "$out/results/$1.tsv"
  else
    message=$(grep -m1 -o 'check failed: .*\|Timed out .*' "$out/logs/$1.log" || echo "its session exited with status $2")
    printf 'fail\t%s\t%s\n' "$seconds" "$message" > "$out/results/$1.tsv"
  fi
}

finished_worker() {
  if compgen -G "$out/queue/$2/*" > /dev/null && ! compgen -G "$out/claimed/*@$1" > /dev/null && ((++startup_failures >= max_startup_failures)); then
    echo "Sessions keep ending before running a check, see $out/workers/$1.log" >&2
    exit 1
  fi
}

run_sessions() {
  local pid status queued_groups group
  queued_groups=$(find "$out/queue" -type f | wc -l)
  for group in "${separate[@]}"; do start_standalone "$group"; done
  while ((${#running[@]} < jobs && workers < queued_groups)); do start_worker; done
  while ((${#running[@]} > 0)); do
    status=0
    wait -n -p pid || status=$?
    if standalone "${running[$pid]}"; then
      record_standalone "${running[$pid]}" "$status"
    else
      finished_worker "${running[$pid]}" "${sizes[$pid]}"
    fi
    unset "running[$pid]" "sizes[$pid]"
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
declare -A sizes=()
declare -A started_at=()
separate=()
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
