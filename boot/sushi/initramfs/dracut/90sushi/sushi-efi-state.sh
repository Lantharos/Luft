#!/usr/bin/sh
# Early initramfs: persist EFI SushiVisualState before sushid starts.

SUSHI_STATE="/run/sushi/state"

[ -f "$SUSHI_STATE" ] && exit 0
mkdir -p /run/sushi

# Kernel exports EFI config tables at /sys/firmware/efi/config_tables/<guid>/data
if [ -d /sys/firmware/efi/config_tables ]; then
    for dir in /sys/firmware/efi/config_tables/*; do
        [ -d "$dir" ] || continue
        base=$(basename "$dir")
        case "$base" in
            *a7b3c4d5*e6f7*4890*abcd*ef1234567890*|*a7b3c4d5-e6f7-4890-abcd-ef1234567890*)
                if [ -f "$dir/data" ]; then
                    cp "$dir/data" /run/sushi/efi-state.json
                    cp "$dir/data" "$SUSHI_STATE"
                    exit 0
                fi
                ;;
        esac
    done
fi

# Cmdline fallback written by SushiBoot: sushi.state=b64:... or sushi.state={json}
for param in $(cat /proc/cmdline); do
    case "$param" in
        sushi.state=b64:*)
            payload=${param#sushi.state=b64:}
            printf '%s' "$payload" | base64 -d > "$SUSHI_STATE" 2>/dev/null && exit 0
            ;;
        sushi.state=*)
            payload=${param#sushi.state=}
            printf '%s' "$payload" > "$SUSHI_STATE" && exit 0
            ;;
    esac
done