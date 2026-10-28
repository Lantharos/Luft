#!/usr/bin/env bash
set -euo pipefail

os="$(cd "$(dirname "$0")/.." && pwd)"

usage() {
  cat <<'USAGE'
Usage: os/vm/qemu.sh [QEMU OPTIONS...]

Starts a VM whose firmware variables, TPM, serial log and second drive are
kept in the folder LUFT_VM (default os/vm/state), from LUFT_VM/disk.qcow2,
made by os/vm/disk.sh when missing. os/vm/control.py looks at and uses it.
QEMU OPTIONS are passed on, such as more drives.

  DISK=path         start from another drive, raw unless it ends in .qcow2;
                    DISK= without a path starts with none
  DRIVES="a.img b.qcow2:ro"  attach more drives after DISK, in this order;
                    :ro attaches one read-only
  DISK_BUS=nvme     attach the drives as NVMe instead of virtio
  SECOND=64G        add an empty second drive of that size, kept in LUFT_VM
  ISO=luft.iso      also attach a start medium and start from it, with an
                    empty LUFT_VM/target.qcow2 to install onto unless DISK is set
  MEDIA=cd          attach the ISO as a DVD instead of a USB stick
  SHARE=folder      share a folder read-only, as the 9p tag "share"
  KERNEL=vmlinuz    start this kernel directly, with INITRD and APPEND
  SECURE_BOOT=1     firmware with Secure Boot on and Microsoft's keys enrolled
  BIOS=1            SeaBIOS instead of UEFI, whose sleep QEMU can wake from
  TPM=0             no TPM; TPM=1.2 for an old one (default 2, kept in LUFT_VM)
  GPU=vga           QEMU's standard VGA instead of virtio
  XRES=3440 YRES=1440  the monitor's resolution (default 1920x1080)
  FRAMEBUFFER=1024x768 hand the boot loader a smaller framebuffer, as some
                    firmware does (Secure Boot off)
  EDID=1            describe the monitor to the boot loader (Secure Boot off)
  WINDOWS=1         Hyper-V enlightenments, USB input, an Intel network card,
                    VGA and NVMe drives, for Windows
  AUDIO=out.wav     an Intel HD Audio card whose playback is recorded to out.wav
  AGENT=1           a channel for the QEMU guest agent
  NETWORK=0         no network card
  MEMORY=4096       memory in MB (default 8192)
  CPUS=2            processors (default 4)
  HEADLESS=1        no window
  SERIAL=path       where the serial console is logged (default LUFT_VM/serial.log)
  TIMEOUT=600       switch the VM off after that many seconds, and fail

The firmware is the one QEMU's firmware descriptors name for a q35 machine,
so the same VM starts on Fedora and on Ubuntu.
USAGE
}

case "${1:-}" in
  -h | --help) usage; exit 0 ;;
esac

mkdir -p "${LUFT_VM:-$os/vm/state}"
vm="$(cd "${LUFT_VM:-$os/vm/state}" && pwd)"
sockets="${XDG_RUNTIME_DIR:-/tmp}/luft-vm/$(printf '%s' "$vm" | sha256sum | cut -c1-12)"
windows="${WINDOWS:-0}"
bus="${DISK_BUS:-virtio}"
[[ "$windows" == 1 ]] && bus=nvme
xres="${XRES:-1920}"
yres="${YRES:-1080}"
disk="${DISK-$vm/disk.qcow2}"
drives=()

format_of() {
  if [[ "$1" == *.qcow2 ]]; then echo qcow2; else echo raw; fi
}

attach() {
  local file="${1%:ro}" boot="${2:-}" id="drive$((${#drives[@]} / 4))" readonly=""
  [[ "$1" != *:ro ]] || readonly=",readonly=on"
  drives+=(-drive "if=none,id=$id,format=$(format_of "$file"),cache=unsafe,discard=unmap,file=$file$readonly")
  case "$bus" in
    virtio) drives+=(-device "virtio-blk-pci,drive=$id$boot") ;;
    nvme) drives+=(-device "nvme,serial=$id,drive=$id$boot") ;;
  esac
}

descriptor() {
  jq -rs --argjson secure "$1" '
    [.[] | select(.["interface-types"] == ["uefi"] and .mapping.device == "flash" and (.mapping.mode // "split") == "split")
         | select(any(.targets[]; .architecture == "x86_64" and any(.machines[]; startswith("pc-q35"))))
         | select((.features | index("secure-boot") != null) == $secure)
         | select($secure == false or (.features | index("enrolled-keys") != null))
         | select(.features | index("amd-sev-snp") == null and index("intel-tdx") == null)][0].mapping
    | "\(.executable.filename) \(.executable.format) \(.["nvram-template"].filename) \(.["nvram-template"].format)"
  ' /usr/share/qemu/firmware/*.json
}

firmware() {
  local code code_format template format
  machine=q35,accel=kvm
  secure=()
  pflash=()
  [[ "$windows" == 1 ]] || machine+=,kernel-irqchip=split
  [[ "${BIOS:-0}" != 1 ]] || return 0
  if [[ "${SECURE_BOOT:-0}" == 1 ]]; then
    machine+=,smm=on
    secure=(-global "driver=cfi.pflash01,property=secure,value=on")
    read -r code code_format _ <<<"$(descriptor true)"
  else
    read -r code code_format _ <<<"$(descriptor false)"
  fi
  read -r _ _ template format <<<"$(descriptor true)"
  vars="$vm/vars.$format"
  [[ -f "$vars" ]] || cp "$template" "$vars"
  pflash=(-drive "if=pflash,format=$code_format,readonly=on,file=$code" -drive "if=pflash,format=$format,file=$vars")
}

start_medium() {
  media=()
  [[ -n "${ISO:-}" ]] || return 0
  [[ -n "${DISK+set}" ]] || disk="$vm/target.qcow2"
  [[ -f "$disk" ]] || qemu-img create -q -f qcow2 "$disk" 64G
  case "${MEDIA:-usb}" in
    usb) media=(-drive "if=none,id=stick,format=raw,readonly=on,file=$ISO" -device "usb-storage,bus=usb.0,drive=stick,removable=on,bootindex=0") ;;
    cd) media=(-drive "if=none,id=dvd,media=cdrom,readonly=on,file=$ISO" -device "ide-cd,drive=dvd,bootindex=0") ;;
    *) usage >&2; exit 2 ;;
  esac
}

system_drives() {
  local drive
  if [[ -n "$disk" ]]; then
    [[ -f "$disk" || "$disk" != "$vm/disk.qcow2" ]] || "$os/vm/disk.sh"
    attach "$disk" "${ISO:+,bootindex=1}"
  fi
  for drive in ${DRIVES:-}; do
    attach "$drive"
  done
  [[ -n "${SECOND:-}" ]] || return 0
  [[ -f "$vm/second.qcow2" ]] || qemu-img create -q -f qcow2 "$vm/second.qcow2" "$SECOND"
  attach "$vm/second.qcow2"
}

display_loader() {
  local esp="$vm/display" efi="${CARGO_TARGET_DIR:-$os/../target}/x86_64-unknown-uefi/release/vm-display.efi"
  loader=()
  [[ -n "${FRAMEBUFFER:-}" || "${EDID:-0}" == 1 ]] || return 0
  [[ "${SECURE_BOOT:-0}" != 1 ]] || { echo "FRAMEBUFFER and EDID need Secure Boot off: the display loader isn't signed" >&2; exit 2; }
  cargo build --release --quiet -p vm-display --manifest-path "$os/../Cargo.toml" --target x86_64-unknown-uefi
  rm -rf "$esp"
  install -Dm644 "$efi" "$esp/EFI/BOOT/BOOTX64.EFI"
  {
    [[ -z "${FRAMEBUFFER:-}" ]] || echo "framebuffer $FRAMEBUFFER"
    [[ "${EDID:-0}" != 1 ]] || echo "monitor ${xres}x$yres"
  } >"$esp/vm-display.conf"
  loader=(-drive "if=none,id=display,format=raw,readonly=on,file=fat:$esp" -device "virtio-blk-pci,drive=display,bootindex=0")
}

devices() {
  cpu=host
  input=(-device virtio-keyboard-pci -device virtio-tablet-pci)
  nic=virtio-net-pci
  gpu=(-device "pcie-root-port,id=display-port,chassis=1"
    -device "virtio-vga,bus=display-port,x-pcie-pm-no-soft-reset=on,xres=$xres,yres=$yres")
  iommu=(-device "intel-iommu,intremap=on")
  if [[ "$windows" == 1 ]]; then
    cpu=host,-svm,-vmx,hv_relaxed,hv_vapic,hv_spinlocks=0x1fff,hv_time,hv_vpindex,hv_synic,hv_stimer
    input=(-device "usb-tablet,bus=usb.0" -device "usb-kbd,bus=usb.0")
    nic=e1000e
    iommu=()
  fi
  [[ "${GPU:-}" == vga || "$windows" == 1 ]] && gpu=(-device "VGA,xres=$xres,yres=$yres,edid=on,vgamem_mb=64")
  network=(-nic "user,model=$nic")
  [[ "${NETWORK:-1}" == 0 ]] && network=(-nic none)
  extras=()
  [[ -z "${AUDIO:-}" ]] || extras+=(-audiodev "wav,id=sound,path=$AUDIO" -device ich9-intel-hda -device "hda-output,audiodev=sound")
  [[ -z "${SHARE:-}" ]] || extras+=(-virtfs "local,path=$SHARE,mount_tag=share,security_model=none,readonly=on")
  [[ "${AGENT:-0}" != 1 ]] || extras+=(-device virtio-serial -chardev "socket,id=agent,path=$sockets/agent.sock,server=on,wait=off"
    -device "virtserialport,chardev=agent,name=org.qemu.guest_agent.0")
  [[ -z "${KERNEL:-}" ]] || extras+=(-kernel "$KERNEL" -initrd "$INITRD" -append "$APPEND")
  serial=(-chardev "socket,id=serial,path=$sockets/serial.sock,server=on,wait=off,logfile=${SERIAL:-$vm/serial.log},logappend=off"
    -serial chardev:serial)
  display=(-display "${DISPLAY_BACKEND:-gtk},show-cursor=on")
  [[ "${HEADLESS:-0}" == 1 ]] && display=(-display none)
}

start_tpm() {
  tpm=()
  local version="${TPM:-2}" state="$vm/tpm" options=(--tpm2)
  [[ "$version" != 0 ]] || return 0
  [[ "$version" != 1.2 ]] || { state="$vm/tpm1.2"; options=(); }
  mkdir -p "$state"
  swtpm socket "${options[@]}" --tpmstate "dir=$state" --ctrl "type=unixio,path=$sockets/tpm.sock" --terminate &
  swtpm=$!
  trap 'kill "$swtpm" 2>/dev/null || true' EXIT
  until [[ -S "$sockets/tpm.sock" ]]; do sleep 0.1; done
  tpm=(-chardev "socket,id=tpm,path=$sockets/tpm.sock" -tpmdev "emulator,id=tpm,chardev=tpm" -device "tpm-tis,tpmdev=tpm")
}

mkdir -p "$sockets"
rm -f "$sockets"/*.sock
firmware
start_medium
system_drives
display_loader
devices
start_tpm

timeout=()
[[ -z "${TIMEOUT:-}" ]] || timeout=(timeout "$TIMEOUT")
"${timeout[@]}" qemu-system-x86_64 -machine "$machine" -cpu "$cpu" -smp "${CPUS:-4}" -m "${MEMORY:-8192}" "${secure[@]}" \
  "${iommu[@]}" \
  "${pflash[@]}" -device qemu-xhci,id=usb \
  "${loader[@]}" "${drives[@]}" "${media[@]}" "${tpm[@]}" "${gpu[@]}" "${input[@]}" "${network[@]}" "${extras[@]}" "${serial[@]}" \
  -qmp "unix:$sockets/qmp.sock,server=on,wait=off" \
  -pidfile "$vm/qemu.pid" \
  "${display[@]}" "$@"
