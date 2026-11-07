#!/usr/bin/env bash
set -uo pipefail

STATE=/var/lib/luft-grow-check
DRIVE=/dev/vda
ROOT_TYPE=4f68bce3-e8cd-4db1-96e7-fbcaf984b709
STARTUP_TYPE=bc13c2ff-59e6-4262-a352-b275fd6f7172
PASSPHRASE='correct horse battery'
TRUST=(com.lantharos.Trust1 /com/lantharos/Trust1 com.lantharos.Trust1)
GIB=$((1024 ** 3))

report() { echo "luft-grow-check: $*" > /dev/ttyS0; }
fail() {
  report "FAIL $*"
  journalctl -b -t trustd --no-pager -n 40 > /dev/ttyS0
  systemctl poweroff --no-block
  exit 1
}
pass() { report "PASS $*"; }
as_ada() { runuser -u ada -- /usr/libexec/luft-other-systems "$@"; }
partition_of() { lsblk -lnpo PATH,PARTTYPE "$DRIVE" | awk -v type="$1" '$2 == type { print $1 }'; }
start_of() { echo $(($(cat "/sys/class/block/${1#/dev/}/start") * 512)); }
size_of() { lsblk -dbno SIZE "$1"; }
waiting() { busctl --json=short get-property "${TRUST[@]}" Disk | jq -r .data.Resize.data; }
room() { jq -c "[.[] | select(.reach.kind == \"$1\")][0] // empty" <<< "$2"; }
remember() { echo "$2" > "$STATE/$1"; }
recalled() { cat "$STATE/$1"; }
settled() {
  while systemctl is-active --quiet trustd-system-disk.service; do sleep 2; done
}

classify() {
  local rooms gift
  rooms="$(as_ada rooms)" || fail "Disks couldn't tell where the free space is"
  report "rooms $rooms"
  [[ -n "$(room before "$rooms")" && -n "$(room after "$rooms")" ]] || fail "the free space before and after Luft isn't told apart"
  [[ "$(jq -r '[.[] | select(.reach.kind == "apart")] | length' <<< "$rooms")" == 2 ]] ||
    fail "the free space behind the data and recovery partitions isn't marked as apart"
  pass "Disks finds free space right before Luft, right after it, and two spaces behind other partitions"
  gift="$(as_ada gift "$(room after "$rooms" | jq .offset)")"
  [[ "$(jq -r '.kind + " " + .growth' <<< "$gift")" == "ready now" ]] || fail "the space after Luft isn't given right away: $gift"
  gift="$(as_ada gift "$(room before "$rooms" | jq .offset)")"
  [[ "$(jq -r '.kind + " " + .growth' <<< "$gift")" == "ready at-start" ]] || fail "the space before Luft doesn't wait for the next start: $gift"
  gift="$(as_ada gift "$(jq -c '[.[] | select(.reach.kind == "apart")][0].offset' <<< "$rooms")")"
  [[ "$(jq -r '.kind + " " + .name + " " + .growth' <<< "$gift")" == "move-first “Data” now" ]] ||
    fail "the space behind the data partition isn't offered by moving it first: $gift"
  gift="$(as_ada gift "$(jq -c '[.[] | select(.reach.kind == "apart")][1].offset' <<< "$rooms")")"
  [[ "$(jq -r .kind <<< "$gift")" == refused ]] || fail "the space behind Windows' recovery partition is offered: $gift"
  pass "the space after Luft goes now, the space before at the next start, the data partition moves first, and the recovery partition stays: $(jq -r .reason <<< "$gift")"
}

grow_now() {
  local root before grown
  root="$(partition_of "$ROOT_TYPE")"
  before="$(size_of "$root")"
  if ! grown="$(as_ada grow "" 2>&1)"; then
    report "growing without a key: $grown"
    grown="$(as_ada grow "$PASSPHRASE")" || fail "Luft didn't grow into the space after it: $grown"
    pass "Luft asked for the passphrase, since the TPM can't unlock it, and grew with it"
  fi
  ((grown >= 4 * GIB - 16 * 1024 ** 2 && $(size_of "$root") == before + grown)) ||
    fail "Luft grew by $grown bytes, from $before to $(size_of "$root")"
  [[ "$(findmnt -nbo SIZE /sysroot)" -gt $((before + 3 * GIB)) ]] || fail "Luft's file system didn't grow along: $(findmnt -nbo SIZE /sysroot)"
  pass "Luft grew online by $grown bytes into the free space right after it, encryption and file system included"
}

ask_at_start() {
  local root startup luks
  root="$(partition_of "$ROOT_TYPE")"
  startup="$(partition_of "$STARTUP_TYPE")"
  luks="$(cryptsetup luksUUID "$root")"
  as_ada grow-at-start > /dev/null || fail "Luft didn't take the request to grow at the next start"
  [[ "$(waiting)" == grow ]] || fail "trustd doesn't say a grow is waiting: $(waiting)"
  as_ada cancel > /dev/null && [[ "$(waiting)" == "" ]] || fail "calling off the grow didn't clear it"
  as_ada grow-at-start > /dev/null && [[ "$(waiting)" == grow ]] || fail "asking again didn't work"
  pass "Luft waits to move into the space in front of it at the next start, and the wait can be called off"
  remember partuuid "$(lsblk -no PARTUUID "$root")"
  remember luks "$luks"
  remember size "$(size_of "$root")"
  remember gap "$(as_ada rooms | jq "[.[] | select(.reach.kind == \"before\")][0].offset")"
  remember startup "$(size_of "$startup")"
}

follow_the_move() {
  journalctl -b -f -t trustd -o cat | while read -r line; do report "trustd $line"; done &
  settled
  sleep 1
  kill %1 2> /dev/null
}

check_moved() {
  local root startup size
  root="$(partition_of "$ROOT_TYPE")"
  startup="$(partition_of "$STARTUP_TYPE")"
  [[ -z "$(cat /var/lib/trustd/system-disk.json 2> /dev/null)" ]] || fail "the move didn't finish: $(cat /var/lib/trustd/system-disk.json)"
  [[ "$(lsblk -no PARTUUID "$root")" == "$(recalled partuuid)" && "$(cryptsetup luksUUID "$root")" == "$(recalled luks)" ]] ||
    fail "Luft's partition or encryption didn't get its IDs back"
  (($(start_of "$startup") - $(recalled gap) < 1024 ** 2 && $(start_of "$startup") + $(recalled startup) == $(start_of "$root"))) ||
    fail "the startup partition and Luft didn't move to the start of the free space: $(sfdisk -d "$DRIVE" | grep '^/dev' | xargs)"
  size="$(size_of "$root")"
  ((size >= $(recalled size) + 29 * GIB)) || fail "Luft only has $size bytes after moving"
  [[ "$(btrfs filesystem show /sysroot | grep -c devid)" == 1 ]] || fail "Luft's file system still spans two partitions"
  [[ "$(findmnt -nbo SIZE /sysroot)" -gt $(($(recalled size) + 28 * GIB)) ]] || fail "Luft's file system didn't grow along"
  [[ "$(waiting)" == "" ]] || fail "trustd still says a change is waiting"
  pass "Luft moved into the free space in front of it with its startup partition and grew from $(recalled size) to $size bytes, keeping its IDs"
  if as_ada grow-at-start 2> "$STATE/refused"; then
    fail "Luft takes a request to grow at the next start with no free space before it"
  fi
  pass "with no free space before it, Luft says: $(cat "$STATE/refused")"
}

case "$(cat "$STATE/stage")" in
  1)
    settled
    pass "Luft starts encrypted next to Windows: $(sfdisk -d "$DRIVE" | grep '^/dev' | tr -s ' ' | xargs)"
    classify
    grow_now
    ask_at_start
    echo 2 > "$STATE/stage"
    sync
    systemctl reboot
    ;;
  2)
    report MOVING
    follow_the_move
    check_moved
    echo 3 > "$STATE/stage"
    sync
    systemctl reboot
    ;;
  3)
    pass "Luft starts again after moving: $(lsblk -no NAME,SIZE,PARTTYPE "$DRIVE" | xargs)"
    rm -r "$STATE"
    report DONE
    systemctl poweroff --no-block
    ;;
esac
