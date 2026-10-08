#!/usr/bin/bash
# shellcheck disable=SC2154

check() {
    require_binaries trustctl cryptsetup || return 1
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
    inst_multiple trustctl systemd-creds cryptsetup udevadm cat
    inst_rules 61-trustd-drives.rules
    inst_simple "$moddir/trustd-encrypt.service" "$systemdsystemunitdir/trustd-encrypt.service"
    inst_simple "$moddir/cryptsetup-after-pcrphase.conf" "$systemdsystemunitdir/systemd-cryptsetup@.service.d/trustd.conf"
    $SYSTEMCTL -q --root "$initdir" add-wants cryptsetup.target trustd-encrypt.service
    if [[ -f /var/lib/trustd/stage/plan.json ]]; then
        local file
        for file in /var/lib/trustd/stage/*; do
            inst_simple "$file" "/etc/trustd/stage/${file##*/}"
        done
    fi
    if [[ -d /etc/trustd/decrypting ]]; then
        local mask
        for mask in /etc/trustd/decrypting/*; do
            inst_simple "$mask" "$mask"
        done
    fi
}
