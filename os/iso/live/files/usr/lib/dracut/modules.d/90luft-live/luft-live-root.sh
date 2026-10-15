#!/usr/bin/bash
set -euo pipefail

medium=/run/initramfs/live
store=/run/luft/store
writable=/run/luft/writable
root=/run/luft/root

medium_device() {
    local argument spec=""
    for argument in $(</proc/cmdline); do
        [[ $argument == root=luft-live:* ]] && spec="${argument#root=luft-live:}"
    done
    case "$spec" in
        LABEL=*) echo "/dev/disk/by-label/${spec#LABEL=}" ;;
        PARTUUID=*) echo "/dev/disk/by-partuuid/${spec#PARTUUID=}" ;;
        *) echo "Luft doesn't know where to start from: root=luft-live:$spec" >&2; return 1 ;;
    esac
}

layers() {
    local top lower=()
    top="$(<"$medium/LiveOS/live-layer")"
    mapfile -td: lower <"$store/overlay/$top/lower"
    printf '%s\n' "$top/diff" "${lower[@]}"
}

device="$(medium_device)"
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
