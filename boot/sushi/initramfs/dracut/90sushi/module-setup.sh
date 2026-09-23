#!/usr/bin/bash

# Sushi dracut module — replaces Plymouth in the initramfs boot path.

check() {
    require_binaries sushid || return 1
    return 0
}

depends() {
    echo systemd systemd-ask-password systemd-cryptsetup drm bash
    return 0
}

install() {
    local systemdutildir="$systemdutildir"
    local systemdsystemunitdir="$systemdsystemunitdir"
    local moddir="$moddir"
    local initdir="$initdir"

    inst_multiple sushid sushictl cryptsetup
    for _tpm_tool in tpm2 tpm2_unseal tpm2_startauthsession tpm2_policypcr \
        tpm2_createprimary tpm2_createpolicy tpm2_create tpm2_load; do
        if command -v "$_tpm_tool" >/dev/null 2>&1; then
            inst "$_tpm_tool"
        fi
    done
    inst_multiple \
        /usr/lib/sushi/themes/default/logo.txt \
        /etc/sushi/sushi.conf

    inst_rules \
        "80-sushi-drm.rules" \
        "$moddir/80-sushi-drm.rules"

    inst_simple "$moddir/sushi.conf" /etc/sushi/sushi.conf
    inst_hook cmdline 99 "$moddir/sushi-efi-state.sh"
    inst_script "$moddir/sushi-efi-state.sh" /usr/lib/sushi/sushi-efi-state.sh
    inst_simple "$moddir/sushi-initramfs.service" \
        "$systemdsystemunitdir/sushi-initramfs.service"
    inst_simple "$moddir/sushi-ask-password.service" \
        "$systemdsystemunitdir/sushi-ask-password.service"
    inst_simple "$moddir/sushi-ask-password.path" \
        "$systemdsystemunitdir/sushi-ask-password.path"

    $SYSTEMCTL -q --root "$initdir" add-wants initrd.target sushi-initramfs.service
    $SYSTEMCTL -q --root "$initdir" enable sushi-ask-password.path

    mkdir -p "$initdir/run/sushi"
    mkdir -p "$initdir/var/log/sushi"

    if dracut_module_included "plymouth"; then
        derror "Sushi replaces Plymouth. Omit plymouth from the initramfs: omit_dracutmodules+=' plymouth '"
        return 1
    fi
}