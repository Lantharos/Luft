#!/usr/bin/env bash
set -euo pipefail

iso="$(cd "$(dirname "$0")/.." && pwd)"
label="$1"
live_image="$2"
output="$3"
live=/live
work=/work
tree="$work/tree"
esp="$work/esp"

live_layer() {
  jq -er --arg name "$live_image" '.[] | select(.names | index($name)) | .layer' "$work/store/overlay-images/images.json"
}

kernel_arguments() {
  printf 'rd.live.image '
  sed -n 's/^kargs = \[\(.*\)\]$/\1/p' "$live"/usr/lib/bootc/kargs.d/*.toml | grep -o '"[^"]*"' | tr -d '"' | tr '\n' ' '
}

pack_store() {
  "$iso/stages/contexts.sh" "$live/etc/selinux/targeted/contexts/files/file_contexts" >"$work/file_contexts"
  mkdir -p "$tree/LiveOS"
  mkfs.erofs --quiet -zzstd,level=12 -C1048576 \
    -T"$SOURCE_DATE_EPOCH" --mkfs-time --file-contexts="$work/file_contexts" \
    "$tree/LiveOS/luft.erofs" "$work/store"
  live_layer >"$tree/LiveOS/live-layer"
}

copy_kernel() {
  install -Dm644 "$work/initrd.img" "$tree/boot/initrd.img"
  objcopy -O binary --only-section=.linux "$live"/boot/EFI/Linux/luft.efi "$tree/boot/vmlinuz"
}

make_esp() {
  rm -rf "$esp"
  "$iso/loader/grub.sh" "$esp" "$tree" "$label" "$(kernel_arguments)"
  find "$esp" "$tree" -exec touch --no-dereference --date="@$SOURCE_DATE_EPOCH" {} +
  local size=$(($(du -sk "$esp" | cut -f1) + 2048))
  rm -f "$work/esp.img"
  mkfs.fat -C -n LUFT-EFI -i "$(printf '%08X' $((SOURCE_DATE_EPOCH & 0xffffffff)))" "$work/esp.img" "$size" >/dev/null
  mcopy -s -m -i "$work/esp.img" "$esp/EFI" ::/
}

make_iso() {
  rm -f "$output"
  xorriso -as mkisofs -quiet -output "$output" \
    -iso-level 3 -full-iso9660-filenames -joliet -joliet-long -rational-rock \
    -volid "$label" -appid Luft -publisher Luft \
    -partition_offset 16 \
    -append_partition 2 C12A7328-F81F-11D2-BA4B-00A0C93EC93B "$work/esp.img" -appended_part_as_gpt \
    -e --interval:appended_partition_2:all:: -no-emul-boot \
    "$tree"
  (cd "$(dirname "$output")" && sha256sum "$(basename "$output")" >"$(basename "$output").sha256")
}

pack_store
copy_kernel
make_esp
make_iso
