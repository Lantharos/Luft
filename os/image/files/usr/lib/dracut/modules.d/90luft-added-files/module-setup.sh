#!/usr/bin/bash
# shellcheck disable=SC2154

check() {
    return 0
}

depends() {
    echo systemd-pcrextend tpm2-tss
}

install() {
    inst_simple "$moddir/luft-added-files.service" "$systemdsystemunitdir/luft-added-files.service"
    $SYSTEMCTL -q --root "$initdir" add-wants sysinit.target luft-added-files.service
}
