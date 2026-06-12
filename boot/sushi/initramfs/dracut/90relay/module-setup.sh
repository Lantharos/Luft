#!/usr/bin/bash

# Relay dracut module — replaces Plymouth in the initramfs boot path.

check() {
    require_binaries relayd || return 1
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

    inst_multiple relayd relayctl
    inst_multiple \
        /usr/lib/relay/themes/default/logo.txt \
        /etc/relay/relay.conf

    inst_rules \
        "80-relay-drm.rules" \
        "$moddir/80-relay-drm.rules"

    inst_simple "$moddir/relay.conf" /etc/relay/relay.conf
    inst_hook cmdline 99 "$moddir/relay-efi-state.sh"
    inst_script "$moddir/relay-efi-state.sh" /usr/lib/relay/relay-efi-state.sh
    inst_simple "$moddir/relay-initramfs.service" \
        "$systemdsystemunitdir/relay-initramfs.service"
    inst_simple "$moddir/relay-ask-password.service" \
        "$systemdsystemunitdir/relay-ask-password.service"
    inst_simple "$moddir/relay-ask-password.path" \
        "$systemdsystemunitdir/relay-ask-password.path"

    $SYSTEMCTL -q --root "$initdir" add-wants initrd.target relay-initramfs.service
    $SYSTEMCTL -q --root "$initdir" enable relay-ask-password.path

    mkdir -p "$initdir/run/relay"
    mkdir -p "$initdir/var/log/relay"

    if dracut_module_included "plymouth"; then
        derror "Relay replaces Plymouth. Omit plymouth from the initramfs: omit_dracutmodules+=' plymouth '"
        return 1
    fi
}