#!/usr/bin/bash
# shellcheck disable=SC2154

check() {
    require_binaries trustctl cryptsetup || return 1
    return 0
}

depends() {
    echo crypt systemd-cryptsetup systemd-ask-password systemd-pcrextend tpm2-tss
    return 0
}

installkernel() {
    hostonly='' instmods dm_crypt vfat nls_cp437 nls_iso8859-1
}

install() {
    inst_multiple trustctl systemd-creds cryptsetup udevadm cat mount umount
    inst_rules 61-trustd-drives.rules
    inst_simple "$moddir/trustd-move.service" "$systemdsystemunitdir/trustd-move.service"
    inst_multiple "$systemdsystemunitdir/systemd-pcrextend.socket" "$systemdsystemunitdir/systemd-pcrextend@.service" \
        "$systemdutildir/systemd-tpm2-setup" "$systemdsystemunitdir/systemd-tpm2-setup-early.service"
    inst_simple "$moddir/cryptsetup-after-pcrphase.conf" "$systemdsystemunitdir/systemd-cryptsetup@.service.d/trustd.conf"
    inst_simple "$moddir/cryptsetup-root-retries.conf" "$systemdsystemunitdir/systemd-cryptsetup@root.service.d/trustd.conf"
    inst_simple "$moddir/root-waits-for-unlock.conf" "$systemdsystemunitdir/"'dev-gpt\x2dauto\x2droot.device.d/trustd.conf'
    inst_simple "$moddir/90-luft-root-partition.rules" "$udevrulesdir/90-luft-root-partition.rules"
    $SYSTEMCTL -q --root "$initdir" add-wants sockets.target systemd-pcrextend.socket
    $SYSTEMCTL -q --root "$initdir" add-wants sysinit.target systemd-tpm2-setup-early.service
    $SYSTEMCTL -q --root "$initdir" add-wants cryptsetup.target trustd-move.service
}
