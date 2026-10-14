#!/usr/bin/bash
set -euo pipefail

medium=/run/initramfs/live
store=/run/luft/store
writable=/run/luft/writable
root=/run/luft/root

label() {
    local argument
    for argument in $(</proc/cmdline); do
        if [[ $argument == root=luft-live:* ]]; then
            echo "${argument#root=luft-live:}"
        fi
    done
}

layers() {
    local top lower=()
    top="$(<"$medium/LiveOS/live-layer")"
    mapfile -td: lower <"$store/overlay/$top/lower"
    printf '%s\n' "$top/diff" "${lower[@]}"
}

device="/dev/disk/by-label/$(label)"
udevadm wait --timeout=120 "$device"
mkdir -p "$medium" "$store" "$writable" "$root"
mount -o ro "$device" "$medium"
mount -t erofs -o ro,loop "$medium/LiveOS/luft.erofs" "$store"
mount -t tmpfs -o mode=0755 luft-writable "$writable"
mkdir "$writable/upper" "$writable/work"

options=userxattr
while read -r layer; do
    options+=",lowerdir+=$store/overlay/$layer"
done < <(layers)
mount -t overlay luft -o "$options,upperdir=$writable/upper,workdir=$writable/work" "$root"
