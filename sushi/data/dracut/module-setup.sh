#!/usr/bin/bash
# shellcheck disable=SC2154

check() {
    require_binaries sushid sushictl || return 1
    return 255
}

depends() {
    echo systemd drm
}

install() {
    inst_multiple sushid sushictl
    inst_multiple -o cryptsetup dmsetup systemd-ask-password
    inst_multiple -o /etc/sushi/sushi.conf /usr/lib/modprobe.d/sushi.conf
    inst_multiple \
        "$systemdsystemunitdir/sushi.service" \
        "$systemdsystemunitdir/sushi-switch-root.service" \
        "$systemdsystemunitdir/systemd-ask-password-console.path.d/sushi.conf" \
        "$systemdsystemunitdir/emergency.service.d/sushi.conf" \
        "$systemdsystemunitdir/rescue.service.d/sushi.conf"
    inst_simple "$systemdsystemunitdir/emergency.service.d/sushi.conf" \
        "$systemdsystemunitdir/dracut-emergency.service.d/sushi.conf"
    $SYSTEMCTL -q --root "$initdir" add-wants sysinit.target sushi.service
    $SYSTEMCTL -q --root "$initdir" add-wants initrd-switch-root.target sushi.service
    $SYSTEMCTL -q --root "$initdir" add-wants initrd-switch-root.target sushi-switch-root.service
}
