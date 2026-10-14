#!/usr/bin/bash
# shellcheck disable=SC2154

check() {
    require_binaries trustctl cryptsetup || return 1
    return 0
}

depends() {
    echo crypt systemd-cryptsetup systemd-ask-password tpm2-tss
    return 0
}

installkernel() {
    hostonly='' instmods dm_crypt vfat nls_cp437 nls_iso8859-1
}

install() {
    inst_multiple trustctl systemd-creds cryptsetup udevadm cat mount umount
    inst_rules 61-trustd-drives.rules
    inst_simple "$moddir/trustd-encrypt.service" "$systemdsystemunitdir/trustd-encrypt.service"
    inst_simple "$moddir/cryptsetup-after-pcrphase.conf" "$systemdsystemunitdir/systemd-cryptsetup@.service.d/trustd.conf"
    $SYSTEMCTL -q --root "$initdir" add-wants cryptsetup.target trustd-encrypt.service
}
