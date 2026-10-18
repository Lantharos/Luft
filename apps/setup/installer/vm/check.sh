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
  compgen -G "$root/state/deploy/*/etc" | head -n1 | xargs dirname
}

join_wifi() {
  install -Dm600 /dev/stdin /etc/NetworkManager/system-connections/Lovelace.nmconnection <<'KEYFILE'
[connection]
id=Lovelace
uuid=5f0c1d2e-8a7b-4c3d-9e1f-2a3b4c5d6e7f
type=wifi
permissions=user:liveuser;

[wifi]
mode=infrastructure
ssid=Lovelace

[wifi-security]
key-mgmt=wpa-psk
psk-flags=0
psk=analytical engine
KEYFILE
}

check_wifi_carried() {
  local root=$1 carried
  carried="$root/etc/NetworkManager/system-connections/Lovelace.nmconnection"
  [[ "$(stat -c '%u %a' "$carried" 2>&1)" == "0 600" ]] || fail "the Wi-Fi joined before installing isn't kept for root alone: $(stat -c '%u %a' "$carried" 2>&1)"
  grep -qx 'psk=analytical engine' "$carried" && ! grep -q '^permissions=' "$carried" ||
    fail "the Wi-Fi joined before installing won't connect by itself on the new system"
  pass "the Wi-Fi joined before installing connects by itself on the new system, its password readable by root alone"
}

HINTS='{"language":"en_US","locale":"sr_RS@latin","timezone":"Europe/Belgrade","keyboards":[{"layout":"rs","variant":"latin"},{"layout":"us","variant":""}]}'
ASKED=/run/luft-check/asked-for-code
CODE=31415926

check_meet_hints() {
  local hints
  mkdir -p /run/initramfs/live
  printf '{"intent":"install","bootEntry":7,"start":"0a1b2c3d-0000-4000-8000-00000000aaaa","live":"0a1b2c3d-0000-4000-8000-00000000bbbb","hints":%s}' "$HINTS" \
    > /run/initramfs/live/meet.json
  hints="$(call Survey | jq -r '.data[0]' | jq -cS .hints)" || fail "the survey with Meet Luft's notes failed"
  [[ "$hints" == "$(jq -cS . <<< "$HINTS")" ]] || fail "the survey doesn't hand setup the language, time zone and keyboards Meet Luft noted: $hints"
  pass "the survey hands setup the language, formats, time zone and keyboards Meet Luft noted"
  rm -r /run/initramfs/live
  systemctl stop luft-installer
}

write_trust_stand_in() {
  cat > /run/luft-check/trust.js <<'TRUST'
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import system from 'system';

const [state, code, asked] = system.programArgs;
const TRUST = `<node><interface name="com.lantharos.Trust1">
  <property name="SecureBoot" type="s" access="read"/>
  <property name="SigningKey" type="a{sv}" access="read"/>
  <method name="EnrollSigningKey"><arg type="s" direction="out"/></method>
</interface></node>`;

const trust = Gio.DBusExportedObject.wrapJSObject(TRUST, {
  SecureBoot: 'on',
  SigningKey: {State: new GLib.Variant('s', state), Available: new GLib.Variant('b', true)},
  EnrollSigningKey: () => {
    GLib.file_set_contents(asked, code);
    return code;
  },
});
trust.export(Gio.DBus.system, '/com/lantharos/Trust1');
Gio.bus_own_name_on_connection(Gio.DBus.system, 'com.lantharos.Trust1', Gio.BusNameOwnerFlags.NONE, null, null);
new GLib.MainLoop(null, false).run();
TRUST
}

trust_says() {
  systemctl stop luft-check-trust 2> /dev/null
  rm -f "$ASKED"
  systemd-run --quiet --unit=luft-check-trust gjs -m /run/luft-check/trust.js "$1" "$CODE" "$ASKED"
  for _ in $(seq 20); do
    [[ "$(busctl --json=short get-property com.lantharos.Trust1 /com/lantharos/Trust1 com.lantharos.Trust1 SigningKey 2> /dev/null |
      jq -r .data.State.data)" == "$1" ]] && return
    sleep 0.5
  done
  fail "the stand-in for trustd didn't start"
}

check_secure_boot_code() {
  local expected="$1" what="$2" code asked=false wanted=false
  code="$(busctl --json=short get-property "${BUS[@]}" SecureBootCode | jq -r .data)"
  [[ -e "$ASKED" ]] && asked=true
  [[ -n "$expected" ]] && wanted=true
  [[ "$code" == "$expected" && "$asked" == "$wanted" ]] || fail "$what: the code is '$code' and trustd was asked: $asked"
  pass "$what"
}

check_whole_drive() {
  local survey drive
  join_wifi
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

  mkdir -p "$TARGET" && mount /dev/vdb2 "$TARGET" || fail "the new system's partition doesn't mount"
  local root state
  root="$(deployment "$TARGET")"
  state="$TARGET/state/os/default/var"
  [[ -d "$root" ]] || fail "bootc made no deployment"
  [[ "$(lsblk -no PARTTYPE,FSTYPE /dev/vdb | xargs)" == "c12a7328-f81f-11d2-ba4b-00a0c93ec93b vfat 4f68bce3-e8cd-4db1-96e7-fbcaf984b709 btrfs" ]] ||
    fail "the partitions aren't EFI and root: $(lsblk -no PARTTYPE,FSTYPE /dev/vdb | xargs)"
  pass "the drive has an EFI system partition and Luft's btrfs"
  grep -q '^ada:.*:Ada Lovelace:/var/home/ada:' "$root/etc/passwd" && grep -q '^wheel:.*ada' "$root/etc/group" &&
    grep -q '^luft-setup:.*:ada$' "$root/etc/group" &&
    grep -q '^ada:\$' "$root/etc/shadow" || fail "the account isn't in the new system"
  [[ "$(stat -c '%u %a' "$state/home/ada" 2>&1)" == "1000 700" ]] ||
    fail "the home folder is missing or not private: $(stat -c '%u %a' "$state/home/ada" 2>&1)"
  pass "the account, its password and its home folder are in the new system"
  [[ "$(readlink "$root/etc/localtime")" == ../usr/share/zoneinfo/Europe/Berlin ]] && grep -q '^LANG=en_GB.UTF-8$' "$root/etc/locale.conf" &&
    grep -q '^XKBLAYOUT=de$' "$root/etc/vconsole.conf" && grep -q '"nodeadkeys"' "$root/etc/X11/xorg.conf.d/00-keyboard.conf" &&
    [[ "$(cat "$root/etc/hostname")" == ada-laptop ]] || fail "the regional settings aren't in the new system"
  pass "the time zone, language, keyboard and name are in the new system"
  check_wifi_carried "$root"
  [[ "$(sed -n '/^\[initial_session\]/,$p' "$root/etc/greetd/config.toml" | xargs)" == "[initial_session] user = ada command = /usr/bin/kestrel-session" ]] ||
    fail "starting doesn't sign ada in by itself"
  [[ "$(cat "$state/lib/luft-installer/first-boot")" == ada ]] || fail "the first start won't open setup"
  pass "every start signs ada straight into setup until it's finished"
  local tag=45
  grep -q '^\[images\.nvidia\]$' /usr/lib/luft-installer/install.toml && tag=45-nvidia
  grep -rqsx ".*ghcr.io/lantharos/luft:$tag" "$TARGET"/state/deploy/*/*.origin || fail "updates won't come from the image the stick carries"
  pass "updates come from ghcr.io/lantharos/luft:$tag, the image the stick carries"
  umount "$TARGET"
  mount -o ro /dev/vdb1 "$TARGET" || fail "the EFI system partition doesn't mount"
  [[ -f "$TARGET/EFI/luft/grubx64.efi" && -f "$TARGET/EFI/BOOT/BOOTX64.EFI" && ! -e "$TARGET/EFI/systemd" ]] &&
    compgen -G "$TARGET/EFI/Linux/bootc/*.efi" > /dev/null && grep -qs '^uki ' "$TARGET"/loader/entries/*.conf ||
    fail "shim, SushiBoot and the startup image aren't on the EFI system partition"
  pass "the computer starts through shim, SushiBoot and the signed startup image"
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
  [[ "$(lsblk -no FSTYPE /dev/vdc | xargs)" == "ext4 vfat btrfs" ]] || fail "Luft's partitions aren't in the free space"
  pass "Luft goes into free space and leaves the partition before it alone"
}

prepare_windows() {
  printf 'label: gpt\nsize=100MiB, type=uefi\nsize=16MiB, type=e3c9e316-0b5c-4db8-817d-f92df00215ae\ntype=ebd0a0a2-b9e5-4433-87c0-68b6b72699c7\n' |
    sfdisk --quiet /dev/vde || fail "the Windows drive couldn't be partitioned"
  udevadm settle
  mkfs.vfat -F 32 -n SYSTEM /dev/vde1 > /dev/null && mkntfs -Q -q -L Windows /dev/vde3 || fail "Windows' partitions couldn't be formatted"
  mkdir -p "$TARGET" && mount /dev/vde1 "$TARGET"
  mkdir -p "$TARGET/EFI/Microsoft/Boot" "$TARGET/EFI/Boot"
  head -c 2M /dev/urandom > "$TARGET/EFI/Microsoft/Boot/bootmgfw.efi"
  head -c 300K /dev/urandom > "$TARGET/EFI/Microsoft/Boot/BCD"
  cp "$TARGET/EFI/Microsoft/Boot/bootmgfw.efi" "$TARGET/EFI/Boot/bootx64.efi"
  (cd "$TARGET" && find EFI/Microsoft -type f -exec sha256sum {} +) > /run/windows-esp.sha256
  umount "$TARGET"
  ntfs-3g /dev/vde3 "$TARGET" || fail "Windows' partition doesn't mount"
  mkdir -p "$TARGET/Windows/System32/config" "$TARGET/Users/Ada/Documents"
  cp "$SOURCE/windows/SYSTEM" "$TARGET/Windows/System32/config/SYSTEM"
  echo "notes from Windows" > "$TARGET/Users/Ada/Documents/notes.txt"
  umount "$TARGET"
}

check_alongside_windows() {
  systemctl stop luft-installer
  prepare_windows
  local survey drive size unexpected
  survey="$(call Survey | jq -r '.data[0]')" || fail "the third survey failed"
  drive="$(jq -r '.drives[] | select(.device == "/dev/vde") | .block' <<< "$survey")"
  [[ "$(jq -r '.drives[] | select(.device == "/dev/vde") | .windows.blocked' <<< "$survey")" == null &&
    "$(jq -r '.drives[] | select(.device == "/dev/vde") | .startupSpace' <<< "$survey")" == 2147483648 ]] ||
    fail "Windows with a small EFI system partition can't be shared: $(jq -c '.drives[] | select(.device == "/dev/vde")' <<< "$survey")"
  pass "Windows with a 100 MB EFI system partition can share its drive"
  size=$((40 * 1024 * 1024 * 1024))
  call Configure s '{"locale":"en_US.UTF-8","keyboard":{"layout":"us","variant":""},"timezone":"UTC","hostname":"ada-laptop"}' > /dev/null
  call Install s "{\"target\":{\"kind\":\"alongside\",\"drive\":\"$drive\",\"size\":$size},\"variant\":\"default\"}" > /dev/null ||
    fail "installing next to Windows didn't start"
  call CreateAccount sss ada "Ada Lovelace" "correct horse" > /dev/null
  wait_for_install

  [[ "$(lsblk -no PARTTYPE,FSTYPE /dev/vde | xargs)" == "c12a7328-f81f-11d2-ba4b-00a0c93ec93b vfat e3c9e316-0b5c-4db8-817d-f92df00215ae ebd0a0a2-b9e5-4433-87c0-68b6b72699c7 ntfs bc13c2ff-59e6-4262-a352-b275fd6f7172 vfat 4f68bce3-e8cd-4db1-96e7-fbcaf984b709 btrfs" ]] ||
    fail "the drive isn't Windows' partitions, a startup partition and Luft: $(lsblk -no PARTTYPE,FSTYPE /dev/vde | xargs)"
  pass "Luft adds a startup partition next to Windows' small EFI system partition"
  ntfs-3g -o ro /dev/vde3 "$TARGET" && [[ "$(cat "$TARGET/Users/Ada/Documents/notes.txt")" == "notes from Windows" ]] ||
    fail "Windows' files didn't survive"
  umount "$TARGET"
  pass "Windows keeps its files"
  mount -o ro /dev/vde1 "$TARGET" || fail "Windows' EFI system partition doesn't mount"
  (cd "$TARGET" && sha256sum --quiet -c /run/windows-esp.sha256) || fail "Windows' boot files changed"
  unexpected="$(cd "$TARGET" && find . -type f | grep -v -i -e '^./EFI/Microsoft/' -e '^./EFI/luft/' -e '^./EFI/luft-start/' -e '^./EFI/BOOT/' -e '^./loader/' | xargs)"
  [[ -z "$unexpected" ]] || fail "Luft left more on Windows' EFI system partition: $unexpected"
  [[ -f "$TARGET/EFI/luft/grubx64.efi" && -f "$TARGET/EFI/luft/luft.cer" && -f "$TARGET/EFI/luft-start/grub.cfg" ]] &&
    ! compgen -G "$TARGET/EFI/Linux/*" > /dev/null || fail "shim and SushiBoot aren't on Windows' EFI system partition"
  umount "$TARGET"
  pass "Windows' boot files stay, next to shim, SushiBoot and Luft's certificate"
  mount -o ro /dev/vde4 "$TARGET" || fail "the startup partition doesn't mount"
  compgen -G "$TARGET/EFI/Linux/bootc/*.efi" > /dev/null && grep -qs '^uki ' "$TARGET"/loader/entries/*.conf &&
    [[ -f "$TARGET/EFI/luft-start/linux" && -f "$TARGET/EFI/luft-start/initrd" ]] ||
    fail "the startup images aren't on the startup partition"
  umount "$TARGET"
  pass "the signed startup images and their entries are on the startup partition"
}

SETUP_ACTIONS=(com.lantharos.trust.manage-encryption com.lantharos.trust.manage-secure-boot net.reactivated.fprint.device.enroll)

switch_to() {
  local console="$1" state="$2"
  chvt "$console"
  for _ in $(seq 20); do
    [[ "$(loginctl show-user ada -p State --value 2> /dev/null)" == "$state" ]] && return
    sleep 0.5
  done
  fail "ada's session didn't become $state on tty$console"
}

sign_in_ada() {
  systemd-run --quiet --unit=ada-session -p PAMName=login -p User=ada -p TTYPath=/dev/tty3 -p StandardInput=tty sleep infinity
  switch_to 3 active
}

answers() {
  local action="$1" pid
  pid="$(systemctl show -p MainPID --value ada-session)"
  pkcheck --action-id "$action" --process "$pid" > /dev/null 2>&1
  echo $?
}

check_setup_needs_no_password() {
  local action
  for action in "${SETUP_ACTIONS[@]}"; do
    [[ "$(answers "$action")" == 0 ]] || fail "$action asks for a password during setup"
  done
  [[ "$(answers com.lantharos.trust.show-recovery-key)" == 2 ]] || fail "setup lets the new account see the recovery key without its password"
  switch_to 1 online
  [[ "$(answers net.reactivated.fprint.device.enroll)" != 0 ]] || fail "setup's exceptions reach a session that isn't in front"
  switch_to 3 active
  pass "setup turns on encryption, Secure Boot and fingerprints without asking for the new password"
}

check_password_needed_after_setup() {
  local action
  for action in "${SETUP_ACTIONS[@]}"; do
    [[ "$(answers "$action")" == 2 ]] || fail "$action still needs no password after setup"
  done
  pass "after setup, encryption, Secure Boot and fingerprints ask for the password again"
}

check_first_boot_finish() {
  systemctl stop luft-installer
  useradd ada
  groupadd --system luft-setup
  usermod --append --groups luft-setup ada
  mkdir -p /var/lib/luft-installer
  echo ada > /var/lib/luft-installer/first-boot
  cp /etc/greetd/config.toml /run/greetd.toml
  printf '\n[initial_session]\nuser = "ada"\ncommand = "/usr/bin/kestrel-session"\n' >> /etc/greetd/config.toml
  [[ "$(busctl --json=short get-property "${BUS[@]}" Phase | jq -r .data)" == first-boot ]] || fail "the installed system doesn't know setup is pending"
  sign_in_ada
  check_setup_needs_no_password
  ! call FinishFirstBoot > /dev/null 2>&1 || fail "someone other than the new account could end setup"
  runuser -u ada -- busctl call "${BUS[@]}" FinishFirstBoot > /dev/null || fail "the new account couldn't end setup"
  [[ ! -e /var/lib/luft-installer/first-boot ]] || fail "setup would open again at the next sign-in"
  cmp -s /etc/greetd/config.toml /run/greetd.toml || fail "the next start would still sign ada in by itself"
  pass "only the new account ends setup"
  check_password_needed_after_setup
}

mkdir -p "$SOURCE" && mount -o ro LABEL=luft-source "$SOURCE" || fail "the source disk doesn't mount"
check_meet_hints
systemctl mask --runtime --now trustd.service
mkdir -p /run/luft-check && write_trust_stand_in
trust_says enrolled
check_whole_drive
check_secure_boot_code "" "a computer that already trusts Luft's key gets no code to type"
trust_says none
check_free_space
check_secure_boot_code "$CODE" "a computer that doesn't trust Luft's key yet gets the code trustd queued"
systemctl stop luft-check-trust && systemctl unmask --runtime trustd.service
check_alongside_windows
check_first_boot_finish
report DONE
