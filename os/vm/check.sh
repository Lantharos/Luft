# shellcheck shell=bash
luft="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
mkdir -p "$1"
vm="$(cd "$1" && pwd)"
stage="$vm/stage"

start_stage() {
  [[ ! -d "$stage" ]] || { chmod -R u+w "$stage"; rm -rf "$stage"; }
  mkdir -p "$stage/root"
}

place() {
  install -Dm"$1" "$2" "$stage/root$3"
}

stage_part() {
  "$luft/os/image/build.sh" stage "$1" "$stage/root"
}

stage_fingerprint_reader() {
  place 755 "$luft/os/vm/fingerprint/reader.py" /usr/libexec/luft-vm-fingerprint
  place 644 "$luft/os/vm/fingerprint/luft-vm-fingerprint.service" /usr/lib/systemd/system/luft-vm-fingerprint.service
}

build_check_image() {
  local base="$1" tag="$2" setup="$3"
  printf 'kargs = ["console=ttyS0,115200"]\n' | install -Dm644 /dev/stdin "$stage/root/usr/lib/bootc/kargs.d/90-check.toml"
  podman build --quiet --no-hosts --no-hostname --build-arg "BASE=$base" --tag "$tag" --file - "$stage" >/dev/null <<CONTAINERFILE
ARG BASE
FROM \${BASE}
COPY root/ /
RUN $setup
CONTAINERFILE
}

make_root_drive() {
  rm -f "$vm/root.img"
  podman unshare sh -c "
    set -e
    tree=\$(podman image mount '$1')
    mkfs.ext4 -q -F -L luft-check-root -d \"\$tree\" '$vm/root.img' 16G
    cp \"\$tree\"/boot/EFI/Linux/*.efi '$vm/startup.efi'
    chmod 644 '$vm/startup.efi'
    podman image unmount '$1' > /dev/null
  "
  objcopy -O binary --only-section=.linux "$vm/startup.efi" "$vm/vmlinuz"
  objcopy -O binary --only-section=.initrd "$vm/startup.efi" "$vm/initramfs.img"
  rm "$vm/startup.efi"
}

boot_root_drive() {
  local log="$1" minutes="$2"
  shift 2
  rm -f "$log"
  DISK="$vm/root.img" KERNEL="$vm/vmlinuz" INITRD="$vm/initramfs.img" \
    APPEND="root=LABEL=luft-check-root rw console=ttyS0 selinux=0 systemd.unit=multi-user.target ${APPEND:-}" \
    TPM=0 NETWORK=0 HEADLESS=1 MEMORY="${MEMORY:-6144}" SERIAL="$log" TIMEOUT=$((minutes * 60)) LUFT_VM="$vm" \
    "$luft/os/vm/qemu.sh" -no-reboot "$@" || true
}

boot_drive() {
  local drive="$1" log="$2" minutes="$3"
  rm -f "$log"
  DISK="$vm/$drive" TPM=0 NETWORK=0 HEADLESS=1 MEMORY=4096 SERIAL="$log" TIMEOUT=$((minutes * 60)) LUFT_VM="$vm" \
    "$luft/os/vm/qemu.sh" || true
}

make_check_disk() {
  "$luft/os/image/seal.sh" "$1" "$1-sealed"
  LUFT_VM="$vm" "$luft/os/vm/disk.sh" "$1-sealed"
}

expect_in_log() {
  local log="$1" prefix="$2" done="$3"
  grep -a "$prefix:" "$log"
  grep -qa "$prefix: $done" "$log" && ! grep -qa "$prefix: FAIL" "$log"
}
