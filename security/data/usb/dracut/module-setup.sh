#!/usr/bin/bash
# shellcheck disable=SC2154

check() {
    require_binaries /usr/libexec/portguard-early || return 1
    return 0
}

depends() {
    return 0
}

install() {
    inst_binary /usr/libexec/portguard-early
    inst_simple "$moddir/portguard-early.service" "$systemdsystemunitdir/portguard-early.service"
    $SYSTEMCTL -q --root "$initdir" add-wants initrd.target portguard-early.service
}
