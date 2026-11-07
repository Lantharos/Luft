#!/usr/bin/env bash
set -uo pipefail

STATE=/var/lib/luft-move-check
SATA=/dev/sda
NVME=/dev/nvme0n1
EMPTY=/dev/nvme1n1
ROOT_TYPE=4f68bce3-e8cd-4db1-96e7-fbcaf984b709
TRUST=(com.lantharos.Trust1 /com/lantharos/Trust1 com.lantharos.Trust1)
APP=com.lantharos.MoveCheck
NOTE="written before Luft moved"
GIB=$((1024 ** 3))

report() { echo "luft-move-check: $*" > /dev/ttyS0; }
fail() {
  report "FAIL $*"
  lsblk -o NAME,TYPE,FSTYPE,PARTTYPE,SIZE,MOUNTPOINTS > /dev/ttyS0
  journalctl -b -t trustd --no-pager -n 60 > /dev/ttyS0
  systemctl poweroff --no-block
  exit 1
}
pass() { report "PASS $*"; }
as_ada() { runuser -u ada -- /usr/libexec/luft-other-systems "$@"; }
disk() { busctl --json=short get-property "${TRUST[@]}" Disk | jq -r ".data.$1.data"; }
drive_id() { busctl --json=short get-property org.freedesktop.UDisks2 "/org/freedesktop/UDisks2/block_devices/${1#/dev/}" org.freedesktop.UDisks2.Block Drive | jq -r .data; }
root_partition() { ls "/sys/class/block/$(basename "$(readlink -f /dev/mapper/root)")/slaves"; }
running_on() { basename "$(readlink -f "/sys/class/block/$(root_partition)/..")"; }
settled() { while systemctl is-active --quiet trustd-system-disk.service; do sleep 2; done; }
destination() { jq -c ".destinations[] | select(.drive == \"$(drive_id "$1")\")" <<< "$2"; }
gsettings_as_ada() { runuser -u ada -- dbus-run-session gsettings "$@"; }
partitions() { lsblk -lnpo NAME,PARTTYPE,FSTYPE,SIZE "$1" | tail -n +2 | xargs; }

seed() {
  runuser -u ada -- mkdir -p /var/home/ada/Documents
  runuser -u ada -- sh -c "echo '$NOTE' > /var/home/ada/Documents/note.txt && head -c 768M /dev/urandom > /var/home/ada/Documents/large.bin"
  sha256sum /var/home/ada/Documents/large.bin | cut -d' ' -f1 > "$STATE/large.sha256"
  stat -c %C /var/home/ada/Documents/note.txt > "$STATE/label"
  /usr/libexec/luft-move-flatpak || fail "the Flatpak couldn't be installed"
  gsettings_as_ada set org.gnome.desktop.interface clock-format 12h || fail "a setting couldn't be changed"
  install -m600 /dev/stdin /etc/NetworkManager/system-connections/Cafe.nmconnection << 'CONNECTION'
[connection]
id=Cafe
uuid=6f1c2b8e-34d0-4a77-9a3e-5d0c8b1e2f47
type=wifi

[wifi]
mode=infrastructure
ssid=Cafe

[wifi-security]
key-mgmt=wpa-psk
psk=espresso-please

[ipv4]
method=auto

[ipv6]
method=auto
CONNECTION
  nmcli connection reload
  pass "home files, a Flatpak, a setting and a Wi-Fi network are in place before the move"
}

carried_over() {
  [[ "$(cat /var/home/ada/Documents/note.txt)" == "$NOTE" ]] || fail "the note in the home folder didn't come along"
  [[ "$(sha256sum /var/home/ada/Documents/large.bin | cut -d' ' -f1)" == "$(cat "$STATE/large.sha256")" ]] ||
    fail "the large file in the home folder changed"
  [[ "$(stat -c %U /var/home/ada/Documents/note.txt)" == ada ]] || fail "the home folder's files changed owner"
  report "home folder came along"
  timeout 60 flatpak info --system "$APP" > /dev/null || fail "the Flatpak didn't come along"
  report "the Flatpak came along"
  [[ "$(runuser -u ada -- dconf read /org/gnome/desktop/interface/clock-format)" == "'12h'" ]] || fail "the setting didn't come along"
  report "the setting came along"
  [[ "$(timeout 60 nmcli -s -g 802-11-wireless-security.psk connection show Cafe)" == espresso-please ]] ||
    fail "the Wi-Fi network didn't come along"
  [[ "$(cat /etc/hostname)" == ada-laptop ]] || fail "the computer's name didn't come along"
  [[ "$(stat -c %C /var/home/ada/Documents/note.txt)" == "$(cat "$STATE/label")" ]] || fail "SELinux labels didn't come along"
  pass "the home folder, the Flatpak, the setting, the Wi-Fi network, the computer's name and SELinux labels came along"
}

tpm_unlocked() { journalctl -b -u systemd-cryptsetup@root --no-pager | grep -q "TPM2 token unlocks volume"; }

unlocked_by_tpm() {
  tpm_unlocked || fail "the TPM didn't unlock the disk: $(journalctl -b -u systemd-cryptsetup@root --no-pager | tail -5)"
  pass "the TPM unlocked the disk on $(running_on)"
}

confirm_start() {
  busctl call "${TRUST[@]}" ConfirmStartup || fail "the start couldn't be confirmed"
  [[ "$(disk Move)" == "" ]] || fail "the move is still waiting after the start was confirmed: $(disk Move)"
  efibootmgr | grep -q "Luft on" && fail "the start entry for trying the new drive is still there: $(efibootmgr)"
  local first esp
  first="$(efibootmgr | sed -n 's/^BootOrder: \([0-9A-F]*\).*/\1/p')"
  esp="$(lsblk -lnpo PARTUUID,PARTTYPE "$(running_disk)" | awk '$2 == "c12a7328-f81f-11d2-ba4b-00a0c93ec93b" { print $1 }')"
  efibootmgr -v | grep "^Boot$first" | grep -qi "$esp" ||
    fail "the firmware doesn't start from $(running_on) first: $(efibootmgr -v)"
  pass "once the start was confirmed, the firmware starts Luft from $(running_on) first"
}

remove_earlier() {
  local removed listed give
  listed="$(as_ada list | jq -c '.[] | select(.kind == "earlier-luft")')"
  [[ -n "$listed" ]] || fail "Disks doesn't offer to remove Luft's earlier copy: $(as_ada list)"
  pass "Disks offers to remove $(jq -r .name <<< "$listed") on its drive, $(jq -r '.parts | length' <<< "$listed") partitions"
  removed="$(as_ada remove earlier-luft)" || fail "the earlier copy couldn't be removed: $removed"
  report "removed $removed"
  sleep 3
  [[ -z "$(disk EarlierCopy | jq -r '.[]?')" ]] || fail "trustd still remembers the earlier copy"
  give="$(jq -c .giveBack <<< "$removed")"
  echo "$give"
}

give_back_to_windows() {
  local give="$1" before refused
  [[ "$give" != null ]] || fail "Disks doesn't offer the space to Windows, which sits right before it"
  before="$(lsblk -dbno SIZE "${SATA}3")"
  refused="$(as_ada give-back "$(jq -r .block <<< "$give")" "$(jq -r .size <<< "$give")" 2>&1)" &&
    fail "Windows grew although it waits to check its drive"
  (($(lsblk -dbno SIZE "${SATA}3") == before)) || fail "Windows' partition kept a size its file system doesn't have"
  pass "Windows, which waits to check its drive since it shrank, keeps its size: $refused"
  ntfsfix -d "${SATA}3" > /dev/null || fail "Windows' check couldn't be stood in for"
  as_ada give-back "$(jq -r .block <<< "$give")" "$(jq -r .size <<< "$give")" > /dev/null || fail "Windows didn't grow"
  (($(lsblk -dbno SIZE "${SATA}3") > before + 30 * GIB)) || fail "Windows only has $(lsblk -dbno SIZE "${SATA}3") bytes"
  ntfsresize --info --force --no-action "${SATA}3" > /dev/null || fail "Windows' file system isn't readable after growing"
  pass "Windows took back the space: $(partitions "$SATA")"
}

no_luft_on() {
  local esp
  lsblk -no FSTYPE "$1" | grep -q crypto_LUKS && fail "Luft's encryption is still on $1"
  lsblk -no PARTTYPE "$1" | grep -qi "$ROOT_TYPE" && fail "a Luft partition is still on $1"
  esp="$(lsblk -lnpo NAME,PARTTYPE "$1" | awk '$2 == "c12a7328-f81f-11d2-ba4b-00a0c93ec93b" { print $1 }')"
  [[ -z "$esp" ]] && return
  mkdir -p /run/luft-move-check && mount -o ro "$esp" /run/luft-move-check || fail "the EFI system partition doesn't mount"
  [[ ! -e /run/luft-move-check/EFI/luft ]] || fail "Luft's boot files are still on $esp"
  if [[ -e /run/luft-move-check/EFI/Microsoft/Boot/bootmgfw.efi ]]; then
    cmp -s /run/luft-move-check/EFI/Microsoft/Boot/bootmgfw.efi /run/luft-move-check/EFI/BOOT/BOOTX64.EFI ||
      fail "Windows' boot manager isn't the fallback on $esp again"
  fi
  umount /run/luft-move-check
}

refusals() {
  local options="$1" refused nvme
  refused="$(as_ada move "{\"kind\":\"erase\",\"drive\":\"$(drive_id "$(running_disk)")\"}" 2>&1)" &&
    fail "Luft takes a move onto its own drive"
  pass "moving onto its own drive is refused: $refused"
  nvme="$(destination "$NVME" "$options")"
  refused="$(as_ada move "{\"kind\":\"free\",\"drive\":\"$(drive_id "$NVME")\",\"offset\":1048576,\"size\":$GIB}" 2>&1)" &&
    fail "Luft takes a space that isn't free"
  pass "a space that isn't free is refused: $refused"
  jq -e '.erase.refused == null' <<< "$nvme" > /dev/null || fail "the data drive can't be erased: $nvme"
}

running_disk() { echo "/dev/$(running_on)"; }

shrink_and_move() {
  local options nvme data needs smaller refused free
  options="$(as_ada move-options)" || fail "Disks couldn't say where Luft can move"
  report "options $options"
  [[ "$(jq -r .refused <<< "$options")" == null ]] || fail "Luft can't move: $(jq -r .refused <<< "$options")"
  [[ -z "$(destination "$SATA" "$options")" ]] || fail "Luft's own drive is offered"
  nvme="$(destination "$NVME" "$options")"
  data="$(jq -c '.shrink[0]' <<< "$nvme")"
  [[ "$(jq -r .filesystem <<< "$data")" == ntfs ]] || fail "the NTFS data partition isn't offered to shrink: $nvme"
  [[ -n "$(destination "$EMPTY" "$options" | jq -r 'select(.erase.refused == null) | .drive')" ]] ||
    fail "the empty drive can't be used whole"
  refusals "$options"
  needs="$(jq .needs.luft <<< "$options")"
  smaller=$(((($(jq .size <<< "$data") - needs - $(jq .startup <<< "$data") - 4 * GIB) / 1048576) * 1048576))
  refused="$(as_ada move "{\"kind\":\"shrink\",\"drive\":\"$(drive_id "$NVME")\",\"block\":$(jq .block <<< "$data"),\"size\":$smaller,\"luft\":$((4 * GIB))}" 2>&1)" &&
    fail "Luft takes a space too small for it"
  pass "a space too small for Luft is refused, after “Data” shrank: $refused"
  free="$(as_ada move-options | jq -c ".destinations[] | select(.drive == \"$(drive_id "$NVME")\") | .free")"
  [[ "$free" != null ]] || fail "no free space came after shrinking the data partition"
  as_ada move "{\"kind\":\"free\",\"drive\":\"$(drive_id "$NVME")\",\"offset\":$(jq .offset <<< "$free"),\"size\":$(jq .size <<< "$free")}" ||
    fail "Luft didn't take the space freed on the data drive"
  [[ "$(disk Move)" == waiting ]] || fail "trustd doesn't say the move waits: $(disk Move)"
  [[ "$(cryptsetup luksUUID "$(lsblk -lnpo NAME,PARTTYPE "$NVME" | awk -v type="$ROOT_TYPE" '$2 == type { print $1 }')")" == \
    "$(cryptsetup luksUUID "/dev/$(root_partition)")" ]] ||
    fail "the new partition doesn't carry the same encryption"
  pass "Luft waits to move into the space freed on the data drive: $(partitions "$NVME")"
}

data_kept() {
  mkdir -p /run/luft-move-check && ntfs-3g -o ro "${NVME}p1" /run/luft-move-check || fail "the data partition doesn't mount"
  [[ "$(sha256sum /run/luft-move-check/Photos/holiday.raw | cut -d' ' -f1)" == "$(cat "$STATE/data.sha256")" ]] ||
    fail "the files on the data partition changed"
  umount /run/luft-move-check
  pass "the files on the shrunk data partition are unchanged"
}

erase_and_move() {
  local options empty
  options="$(as_ada move-options)" || fail "Disks couldn't say where Luft can move"
  jq -e "$(printf '.destinations[] | select(.drive == "%s") | .erase.refused | test("Windows")' "$(drive_id "$SATA")")" <<< "$options" > /dev/null ||
    fail "the drive with Windows can be erased: $(destination "$SATA" "$options")"
  pass "the drive with Windows can't be erased: $(destination "$SATA" "$options" | jq -r .erase.refused)"
  as_ada move "{\"kind\":\"erase\",\"drive\":\"$(drive_id "$SATA")\"}" > /dev/null 2>&1 && fail "trustd erases the drive Windows starts from"
  empty="$(destination "$EMPTY" "$options")"
  as_ada move "{\"kind\":\"erase\",\"drive\":$(jq .drive <<< "$empty")}" || fail "Luft didn't take the whole empty drive"
  [[ "$(disk Move)" == waiting ]] || fail "trustd doesn't say the move waits"
  pass "Luft waits to move onto the whole empty drive: $(partitions "$EMPTY")"
}

next() {
  echo "$1" > "$STATE/stage"
  sync
  systemctl reboot
}

settled
case "$(cat "$STATE/stage")" in
  1)
    [[ "$(running_disk)" == "$SATA" ]] || fail "Luft didn't start from the SATA drive"
    tpm_unlocked && pass "the TPM unlocked the disk at the first start" || report "the first start asked for the passphrase, and trustd sealed the disk key to how it starts"
    seed
    shrink_and_move
    report MOVING
    next 2
    ;;
  2)
    [[ "$(running_disk)" == "$NVME" ]] || fail "Luft still runs from $(running_disk): $(disk MoveFailed)"
    pass "Luft started from the NVMe drive after moving: $(partitions "$NVME")"
    unlocked_by_tpm
    carried_over
    data_kept
    confirm_start
    give_back_to_windows "$(remove_earlier | tail -1)"
    no_luft_on "$SATA"
    pass "nothing of Luft is left on the SATA drive"
    next 3
    ;;
  3)
    [[ "$(running_disk)" == "$NVME" ]] || fail "the firmware didn't start Luft from the NVMe drive"
    pass "the firmware starts Luft from the NVMe drive by itself"
    erase_and_move
    next 4
    ;;
  4)
    [[ "$(running_disk)" == "$EMPTY" ]] || fail "Luft still runs from $(running_disk): $(disk MoveFailed)"
    pass "Luft started from the drive it erased and took whole: $(partitions "$EMPTY")"
    unlocked_by_tpm
    carried_over
    confirm_start
    remove_earlier > /dev/null
    no_luft_on "$NVME"
    data_kept
    pass "the data drive holds only its data partition and free space again: $(partitions "$NVME")"
    rm -r "$STATE"
    report DONE
    systemctl poweroff --no-block
    ;;
esac
