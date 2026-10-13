#!/usr/bin/env bash
set -uo pipefail

BUS=(com.lantharos.Installer1 /com/lantharos/Installer1 com.lantharos.Installer1)
TARGET=/run/luft-check/target
SOURCE=/run/luft-source
INSTALL_TIMEOUT=1800

report() { echo "luft-installer-check: $*" > /dev/ttyS0; }
fail() {
  report "FAIL $*"
  journalctl -b -u luft-installer --no-pager -n 40 > /dev/ttyS0
  exit 1
}
pass() { report "PASS $*"; }
call() { busctl --json=short call "${BUS[@]}" "$@"; }
stage() { busctl --json=short get-property "${BUS[@]}" Stage | jq -r .data; }

wait_for_install() {
  local deadline=$((SECONDS + INSTALL_TIMEOUT)) current shown=""
  while ((SECONDS < deadline)); do
    current="$(stage) $(busctl --json=short get-property "${BUS[@]}" Progress | jq -r '.data * 100 | floor')%"
    [[ "$current" != "$shown" ]] && report "$current"
    shown="$current"
    case "$current" in
      finished*) return 0 ;;
      failed*) fail "installing failed: $(busctl --json=short get-property "${BUS[@]}" Error | jq -r .data)" ;;
    esac
    sleep 2
  done
  fail "installing took longer than $INSTALL_TIMEOUT seconds"
}

deployment() {
  local root=$1
  compgen -G "$root/ostree/deploy/default/deploy/*.0" | head -n1
}

check_whole_drive() {
  local survey drive
  survey="$(call Survey | jq -r '.data[0]')" || fail "the survey failed"
  drive="$(jq -r '.drives[] | select(.device == "/dev/vdb") | .block' <<< "$survey")"
  [[ -n "$drive" && "$(jq -r '.drives[] | select(.device == "/dev/vda") | .blocked' <<< "$survey")" == running ]] ||
    fail "the survey doesn't offer the empty drive or offers the running one"
  pass "the survey offers the empty drive and keeps the running one out"
  call Configure s '{"locale":"en_GB.UTF-8","keyboard":{"layout":"de","variant":"nodeadkeys"},"timezone":"Europe/Berlin","hostname":"ada-laptop"}' > /dev/null ||
    fail "the regional settings weren't taken"
  call Install s "{\"target\":{\"kind\":\"whole\",\"drive\":\"$drive\"},\"variant\":\"default\"}" > /dev/null || fail "installing didn't start"
  call CreateAccount sss ada "Ada Lovelace" "correct horse" > /dev/null || fail "the account wasn't taken"
  wait_for_install

  mkdir -p "$TARGET" && mount /dev/vdb4 "$TARGET" || fail "the new system's partition doesn't mount"
  local root state
  root="$(deployment "$TARGET")"
  state="$TARGET/ostree/deploy/default/var"
  [[ -d "$root" ]] || fail "bootc made no deployment"
  [[ "$(lsblk -no PARTTYPE,FSTYPE /dev/vdb | xargs)" == "21686148-6449-6e6f-744e-656564454649 c12a7328-f81f-11d2-ba4b-00a0c93ec93b vfat 0fc63daf-8483-4772-8e79-3d69d8477de4 ext4 4f68bce3-e8cd-4db1-96e7-fbcaf984b709 btrfs" ]] ||
    fail "the partitions aren't EFI, boot and root: $(lsblk -no PARTTYPE,FSTYPE /dev/vdb | xargs)"
  pass "the drive has BIOS boot and EFI system partitions, a boot partition and Luft's btrfs"
  grep -q '^ada:.*:Ada Lovelace:/var/home/ada:' "$root/etc/passwd" && grep -q '^wheel:.*ada' "$root/etc/group" &&
    grep -q '^ada:\$' "$root/etc/shadow" || fail "the account isn't in the new system"
  [[ "$(stat -c '%u %a' "$state/home/ada" 2>&1)" == "1000 700" ]] ||
    fail "the home folder is missing or not private: $(stat -c '%u %a' "$state/home/ada" 2>&1)"
  pass "the account, its password and its home folder are in the new system"
  [[ "$(readlink "$root/etc/localtime")" == ../usr/share/zoneinfo/Europe/Berlin ]] && grep -q '^LANG=en_GB.UTF-8$' "$root/etc/locale.conf" &&
    grep -q '^XKBLAYOUT=de$' "$root/etc/vconsole.conf" && grep -q '"nodeadkeys"' "$root/etc/X11/xorg.conf.d/00-keyboard.conf" &&
    [[ "$(cat "$root/etc/hostname")" == ada-laptop ]] || fail "the regional settings aren't in the new system"
  pass "the time zone, language, keyboard and name are in the new system"
  grep -q '^\[initial_session\]' "$root/etc/greetd/config.toml" && grep -q '^user = "ada"' "$root/etc/greetd/config.toml" &&
    [[ "$(cat "$state/lib/luft-installer/first-boot")" == ada ]] || fail "the first start won't open setup"
  pass "the first start signs ada in once, into setup"
  grep -rqs 'ghcr.io/lantharos/luft:45' "$TARGET/ostree/deploy/default/deploy/"*.origin || fail "updates won't come from Luft's image"
  pass "updates come from ghcr.io/lantharos/luft:45"
  umount "$TARGET"
}

check_free_space() {
  systemctl stop luft-installer
  local survey drive offset
  survey="$(call Survey | jq -r '.data[0]')" || fail "the second survey failed"
  drive="$(jq -r '.drives[] | select(.device == "/dev/vdc") | .block' <<< "$survey")"
  offset="$(jq -r '.drives[] | select(.device == "/dev/vdc") | .free[0].offset' <<< "$survey")"
  [[ -n "$drive" && "$offset" =~ ^[0-9]+$ ]] || fail "the survey doesn't offer the free space"
  call Configure s '{"locale":"en_US.UTF-8","keyboard":{"layout":"us","variant":""},"timezone":"UTC","hostname":"grace-computer"}' > /dev/null
  call Install s "{\"target\":{\"kind\":\"free\",\"drive\":\"$drive\",\"offset\":$offset},\"variant\":\"default\"}" > /dev/null ||
    fail "installing into free space didn't start"
  call CreateAccount sss grace "Grace Hopper" "cobol" > /dev/null
  wait_for_install
  mkdir -p "$TARGET" && mount -o ro /dev/vdc1 "$TARGET" && [[ "$(cat "$TARGET/kept")" == "still here" ]] ||
    fail "the partition that was already there changed"
  umount "$TARGET"
  [[ "$(lsblk -no FSTYPE /dev/vdc | xargs)" == "ext4 vfat ext4 btrfs" ]] || fail "Luft's partitions aren't in the free space"
  pass "Luft goes into free space and leaves the partition before it alone"
}

check_first_boot_finish() {
  systemctl stop luft-installer
  useradd ada
  mkdir -p /var/lib/luft-installer
  echo ada > /var/lib/luft-installer/first-boot
  printf '\n[initial_session]\nuser = "ada"\ncommand = "kestrel-session --setup"\n' >> /etc/greetd/config.toml
  [[ "$(busctl --json=short get-property "${BUS[@]}" Phase | jq -r .data)" == first-boot ]] || fail "the installed system doesn't know setup is pending"
  ! call FinishFirstBoot > /dev/null 2>&1 || fail "someone other than the new account could end setup"
  runuser -u ada -- busctl call "${BUS[@]}" FinishFirstBoot > /dev/null || fail "the new account couldn't end setup"
  ! grep -q initial_session /etc/greetd/config.toml && [[ ! -e /var/lib/luft-installer/first-boot ]] ||
    fail "the computer would still sign in by itself"
  pass "only the new account ends setup, and the login screen comes back"
}

mkdir -p "$SOURCE" && mount -o ro LABEL=luft-source "$SOURCE" || fail "the source disk doesn't mount"
check_whole_drive
check_free_space
check_first_boot_finish
report DONE
