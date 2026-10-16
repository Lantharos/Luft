#!/usr/bin/bash
set -euo pipefail

medium=/run/initramfs/live
host=/run/luft/host
store=/run/luft/store
writable=/run/luft/writable
root=/run/luft/root

medium_spec() {
    local argument
    for argument in $(</proc/cmdline); do
        if [[ $argument == root=luft-live:* ]]; then
            echo "${argument#root=luft-live:}"
        fi
    done
}

medium_device() {
    case "$1" in
        LABEL=*) echo "/dev/disk/by-label/${1#LABEL=}" ;;
        PARTUUID=*) echo "/dev/disk/by-partuuid/${1#PARTUUID=}" ;;
        UUID=*/*) local uuid="${1#UUID=}"; echo "/dev/disk/by-uuid/${uuid%%/*}" ;;
        *) echo "Luft doesn't know where to start from: root=luft-live:$1" >&2; return 1 ;;
    esac
}

mount_folder() {
    local device="$1" folder="$2" options=ro
    [[ "$(blkid --output value --match-tag TYPE "$device")" == btrfs ]] && options+=,subvolid=5
    mkdir -p "$host"
    mount -o "$options" "$device" "$host"
    mount --bind "$host$folder" "$medium"
}

layers() {
    local top lower=()
    top="$(<"$medium/LiveOS/live-layer")"
    mapfile -td: lower <"$store/overlay/$top/lower"
    printf '%s\n' "$top/diff" "${lower[@]}"
}

spec="$(medium_spec)"
device="$(medium_device "$spec")"
udevadm wait --timeout=120 "$device"
mkdir -p "$medium" "$store" "$writable" "$root"
case "$spec" in
    UUID=*/*) mount_folder "$device" "/${spec#*/}" ;;
    *) mount -o ro "$device" "$medium" ;;
esac
mount -t erofs -o ro,loop "$medium/LiveOS/luft.erofs" "$store"
mount -t tmpfs -o mode=0755 luft-writable "$writable"
mkdir "$writable/upper" "$writable/work"

options=userxattr
while read -r layer; do
    options+=",lowerdir+=$store/overlay/$layer"
done < <(layers)
mount -t overlay luft -o "$options,upperdir=$writable/upper,workdir=$writable/work" "$root"
