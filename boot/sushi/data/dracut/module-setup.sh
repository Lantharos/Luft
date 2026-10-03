#!/usr/bin/bash

check() {
    require_binaries sushid sushictl || return 1
    return 255
}

depends() {
    echo systemd drm
}

deferred_config() {
    local config
    for config in /etc/modprobe.d/sushi.conf /usr/lib/modprobe.d/sushi.conf; do
        [[ -e $config ]] && echo "$config" && return
    done
}

deferred_drivers() {
    local config="$1" deferred device module
    deferred=" $(sed -n 's/^[[:space:]]*blacklist[[:space:]]\+//p' "$config" | tr '\n-' ' _') "
    for device in /sys/bus/pci/devices/*; do
        [[ $(< "$device/class") == 0x03* ]] || continue
        for module in $(modprobe --set-version "$kernel" --resolve-alias "$(< "$device/modalias")" 2> /dev/null); do
            module=${module//-/_}
            [[ $deferred == *" $module "* ]] && echo "$module"
        done
    done | sort -u
}

dependencies() {
    local module
    for module in "$@"; do
        modprobe --set-version "$kernel" --show-depends "$module" 2> /dev/null
    done | sed -n 's|.*/\([^/]*\)\.ko.*|\1|p' | tr - _
}

softdeps() {
    modprobe --set-version "$kernel" --showconfig 2> /dev/null \
        | awk -v modules=" $* " '$1 == "softdep" && index(modules, " " $2 " ") { for (i = 3; i <= NF; i++) if ($i !~ /:$/) print $i }' \
        | tr - _
}

omitted_except() {
    local needed=" $* " entry kept=()
    local -a entries
    IFS='|' read -ra entries <<< "$omit_drivers"
    for entry in "${entries[@]}"; do
        [[ $needed == *" ${entry:1:-1} "* ]] || kept+=("$entry")
    done
    local IFS='|'
    echo "${kept[*]}"
}

nvidia_firmware_families() {
    local device
    for device in /sys/bus/pci/devices/*; do
        [[ $(< "$device/vendor") == 0x10de && $(< "$device/class") == 0x03* ]] || continue
        if (($(< "$device/device") < 0x2200)); then
            echo tu10x
        else
            echo ga10x
        fi
    done
}

keep_nvidia_firmware_for_present_cards() {
    local families firmware family
    families=" $(nvidia_firmware_families | tr '\n' ' ') "
    for firmware in "$initdir"/usr/lib/firmware/nvidia/*/*_{tu10x,ga10x}.bin*; do
        [[ -e $firmware ]] || continue
        family=${firmware##*_}
        family=${family%%.*}
        [[ $families == *" $family "* ]] || rm -f "$firmware"
    done
}

installkernel() {
    local config
    local -a modules
    config="$(deferred_config)"
    [[ -n $config ]] || return 0
    mapfile -t modules < <(deferred_drivers "$config")
    ((${#modules[@]})) || return 0
    mapfile -t -O "${#modules[@]}" modules < <(softdeps $(dependencies "${modules[@]}"))
    omit_drivers="$(omitted_except $(dependencies "${modules[@]}"))" hostonly='' instmods "${modules[@]}"
    keep_nvidia_firmware_for_present_cards
}

install() {
    inst_multiple sushid sushictl
    inst_multiple -o /etc/sushi/sushi.conf /usr/lib/modprobe.d/sushi.conf /etc/modprobe.d/sushi.conf
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
