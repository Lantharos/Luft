#!/usr/bin/env bash
set -euo pipefail

keyring="$(cd "$(dirname "$0")/../.." && pwd)"
luft="$(cd "$keyring/../.." && pwd)"
vm="${KEYRING_VM:-$luft/kestrel/run/keyring-vm}"
ovmf=/usr/share/edk2/ovmf
mode="${1:?Usage: run.sh tpm|gone|none}"
log="$vm/serial-$mode.log"

case "$mode" in
  tpm | none) cp --reflink=auto "$vm/root.img" "$vm/work.img" ;;
  gone) [[ -f "$vm/work.img" ]] || { echo "Run the tpm series first" >&2; exit 1; } ;;
  *) echo "Usage: run.sh tpm|gone|none" >&2; exit 2 ;;
esac

tpm=()
swtpm_pid=""
if [[ "$mode" == tpm ]]; then
  state="$vm/tpm"
  rm -rf "$state"
  mkdir -p "$state"
  swtpm socket --tpm2 --tpmstate "dir=$state" --ctrl "type=unixio,path=$state/swtpm.sock" --terminate &
  swtpm_pid=$!
  for _ in $(seq 50); do [[ -S "$state/swtpm.sock" ]] && break; sleep 0.1; done
  tpm=(-chardev "socket,id=tpm,path=$state/swtpm.sock" -tpmdev emulator,id=tpm0,chardev=tpm -device tpm-crb,tpmdev=tpm0)
fi
trap '[[ -n "$swtpm_pid" ]] && kill "$swtpm_pid" 2>/dev/null; true' EXIT

cp "$ovmf/OVMF_VARS.fd" "$vm/vars.fd"
rm -f "$log"
timeout "${VM_TIMEOUT:-900}" qemu-system-x86_64 \
  -machine q35,accel=kvm -cpu host -smp 4 -m 3072 \
  -drive "if=pflash,format=raw,readonly=on,file=$ovmf/OVMF_CODE.fd" \
  -drive "if=pflash,format=raw,file=$vm/vars.fd" \
  -drive "file=$vm/work.img,format=raw,if=virtio" \
  -kernel "$vm/vmlinuz" -initrd "$vm/initramfs.img" \
  -append "root=LABEL=keyring-vm rw console=ttyS0,115200 enforcing=1 keyring.test=$mode systemd.show_status=false printk.devkmsg=on" \
  "${tpm[@]}" \
  -serial "file:$log" -pidfile "$vm/qemu.pid" -display none -no-reboot || true

grep -aoE 'keyring-test: .*' "$log" | tr -d '\r' | sed 's/^keyring-test: //'
grep -aq 'LUFT-KEYRING-VM DONE passed=[0-9]* failed=0' "$log"
