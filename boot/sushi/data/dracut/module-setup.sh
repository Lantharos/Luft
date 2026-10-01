#!/usr/bin/bash

check() {
    require_binaries sushid sushictl || return 1
    return 255
}

depends() {
    echo systemd drm
}

install() {
    inst_multiple sushid sushictl
    inst_multiple -o /etc/sushi/sushi.conf
    local monitors
    monitors="$(sed -n 's/^[[:space:]]*monitors[[:space:]]*=[[:space:]]*//p' /etc/sushi/sushi.conf 2>/dev/null)"
    [[ -n "$monitors" ]] && inst_multiple -o "$monitors"
    inst_multiple \
        "$systemdsystemunitdir/sushi.service" \
        "$systemdsystemunitdir/sushi-switch-root.service" \
        "$systemdsystemunitdir/systemd-ask-password-console.path.d/sushi.conf"
    $SYSTEMCTL -q --root "$initdir" add-wants sysinit.target sushi.service
    $SYSTEMCTL -q --root "$initdir" add-wants initrd-switch-root.target sushi.service
    $SYSTEMCTL -q --root "$initdir" add-wants initrd-switch-root.target sushi-switch-root.service
}
