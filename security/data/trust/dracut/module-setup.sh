#!/usr/bin/bash

check() {
    require_binaries luft-trust cryptsetup || return 1
    return 0
}

depends() {
    echo crypt systemd-cryptsetup systemd-ask-password
    [[ -e /dev/tpmrm0 ]] && echo tpm2-tss
    return 0
}

installkernel() {
    hostonly='' instmods dm_crypt ext4 vfat
}

install() {
    inst_multiple luft-trust systemd-creds cryptsetup udevadm
    inst_simple "$moddir/luft-trust-encrypt.service" "$systemdsystemunitdir/luft-trust-encrypt.service"
    $SYSTEMCTL -q --root "$initdir" add-wants cryptsetup.target luft-trust-encrypt.service
    if [[ -f /var/lib/luft-trust/stage/plan.json ]]; then
        local file
        for file in /var/lib/luft-trust/stage/*; do
            inst_simple "$file" "/etc/luft-trust/stage/${file##*/}"
        done
    fi
}
