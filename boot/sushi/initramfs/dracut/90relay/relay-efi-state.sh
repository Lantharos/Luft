#!/usr/bin/sh
# Early initramfs: persist EFI RelayVisualState before relayd starts.

RELAY_STATE="/run/relay/state"
RELAY_GUID="a7b3c4d5-e6f7-4890-abcd-ef1234567890"

[ -f "$RELAY_STATE" ] && exit 0
mkdir -p /run/relay

# Kernel exports EFI config tables at /sys/firmware/efi/config_tables/<guid>/data
if [ -d /sys/firmware/efi/config_tables ]; then
    for dir in /sys/firmware/efi/config_tables/*; do
        [ -d "$dir" ] || continue
        base=$(basename "$dir")
        case "$base" in
            *a7b3c4d5*e6f7*4890*abcd*ef1234567890*|*a7b3c4d5-e6f7-4890-abcd-ef1234567890*)
                if [ -f "$dir/data" ]; then
                    cp "$dir/data" /run/relay/efi-state.json
                    cp "$dir/data" "$RELAY_STATE"
                    exit 0
                fi
                ;;
        esac
    done
fi

# Cmdline fallback written by RelayBoot: relay.state=b64:... or relay.state={json}
for param in $(cat /proc/cmdline); do
    case "$param" in
        relay.state=b64:*)
            payload=${param#relay.state=b64:}
            printf '%s' "$payload" | base64 -d > "$RELAY_STATE" 2>/dev/null && exit 0
            ;;
        relay.state=*)
            payload=${param#relay.state=}
            printf '%s' "$payload" > "$RELAY_STATE" && exit 0
            ;;
    esac
done