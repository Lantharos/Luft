#!/usr/bin/env bash
set -euo pipefail

digest="$1"
key="$2"
certificate="$3"
pcr_key="$4"
out="$5"
kernel="$(ls /usr/lib/modules)"
work="$(mktemp -d)"
rescue_drops=(quiet rhgb loglevel systemd.show_status sushi plymouth.enable)
unused_modules=(
  network-manager network nfs iscsi nvmf fcoe plymouth ostree lvm mdraid dmraid multipath nvdimm resume
  memstrack walinuxagent qemu-net clevis clevis-pin-file clevis-pin-null clevis-pin-sss clevis-pin-tang clevis-pin-tpm2
)

kernel_arguments() {
  bootc container inspect --json | python3 -c 'import json, sys; print(" ".join(json.load(sys.stdin)["kargs"]))'
}

without() {
  local argument dropped kept=()
  for argument in $1; do
    for dropped in "${rescue_drops[@]}"; do
      [[ "${argument%%=*}" == "$dropped" ]] && continue 2
    done
    kept+=("$argument")
  done
  echo "${kept[*]}"
}

main="$(kernel_arguments) composefs=$digest"
rescue="$(without "$main") systemd.unit=rescue.target systemd.setenv=SYSTEMD_SULOGIN_FORCE=1"

dracut --quiet --force --no-hostonly --omit "${unused_modules[*]}" --omit-drivers nouveau \
  --kver "$kernel" "$work/initramfs.img"
ukify build --profile=$'ID=rescue\nTITLE=Rescue' --cmdline="$rescue" --output="$work/rescue.efi"
mkdir -p "$out"
ukify build \
  --linux="/usr/lib/modules/$kernel/vmlinuz" \
  --initrd="$work/initramfs.img" \
  --uname="$kernel" \
  --os-release=@/usr/lib/os-release \
  --cmdline="$main" \
  --profile=ID=main \
  --join-profile="$work/rescue.efi" \
  --signtool=sbsign \
  --secureboot-private-key="$key" \
  --secureboot-certificate="$certificate" \
  --pcr-private-key="$pcr_key" \
  --phases=enter-initrd \
  --sign-initrd-pcrs \
  --pcr-banks=sha256 \
  --sign-profile=main \
  --output="$out/luft.efi"
python3 -I /usr/local/lib/luft-check-policy.py "$out/luft.efi" /usr/share/luft/secure-boot/pcr-policy.pem
rm -rf "$work"
