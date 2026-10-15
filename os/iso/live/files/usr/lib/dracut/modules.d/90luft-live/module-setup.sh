#!/usr/bin/bash

check() {
    return 255
}

depends() {
    echo systemd
}

installkernel() {
    hostonly="" instmods erofs overlay loop isofs exfat sr_mod cdrom usb_storage uas
}

install() {
    inst_multiple mount udevadm
    inst_hook cmdline 90 "$moddir/parse-luft-live.sh"
    inst_script "$moddir/luft-live-root.sh" /usr/libexec/luft-live-root
    inst_simple "$moddir/luft-live-root.service" "$systemdsystemunitdir/luft-live-root.service"
    inst_simple "$moddir/sysroot.conf" "$systemdsystemunitdir/sysroot.mount.d/luft-live.conf"
}
