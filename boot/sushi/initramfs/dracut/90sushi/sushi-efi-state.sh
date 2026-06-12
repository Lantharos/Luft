#!/usr/bin/sh
# Early initramfs: persist EFI SushiVisualState and TPM/LUKS handoff before sushid.

SUSHI_STATE="/run/sushi/state"
EFI_TPM_ROOT="/run/sushi/efi-tpm"
EFI_LUKS_KEY="/run/sushi/efi-luks-key"

mkdir -p /run/sushi "$EFI_TPM_ROOT"
state_done=0

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
                    state_done=1
                    break
                fi
                ;;
        esac
    done
fi

# Cmdline fallback written by SushiBoot.
for param in $(cat /proc/cmdline); do
    case "$param" in
        sushi.state=b64:*)
            if [ ! -f "$SUSHI_STATE" ]; then
                payload=${param#sushi.state=b64:}
                printf '%s' "$payload" | base64 -d > "$SUSHI_STATE" 2>/dev/null && state_done=1
            fi
            ;;
        sushi.state=*)
            if [ ! -f "$SUSHI_STATE" ]; then
                payload=${param#sushi.state=}
                printf '%s' "$payload" > "$SUSHI_STATE" && state_done=1
            fi
            ;;
        sushi.luks.key=b64:*)
            payload=${param#sushi.luks.key=b64:}
            umask 077
            printf '%s' "$payload" | base64 -d > "$EFI_LUKS_KEY" 2>/dev/null
            chmod 600 "$EFI_LUKS_KEY" 2>/dev/null
            ;;
    esac
done

# EFI variables staged by SushiBoot (TPM sealed blobs for initramfs retry).
if [ -d /sys/firmware/efi/efivars ]; then
    name="root"
    if [ -f /sys/firmware/efi/efivars/SushiTpmName-a7b3c4d5-e6f7-4890-abcd-ef1234567890 ]; then
        name=$(tr -d '\000' < /sys/firmware/efi/efivars/SushiTpmName-a7b3c4d5-e6f7-4890-abcd-ef1234567890 | tr -cd '[:alnum:]_-')
        [ -n "$name" ] || name="root"
    fi
    dest="$EFI_TPM_ROOT/$name"
    mkdir -p "$dest"
    for var in /sys/firmware/efi/efivars/SushiTpm*-a7b3c4d5-e6f7-4890-abcd-ef1234567890; do
        [ -f "$var" ] || continue
        base=$(basename "$var")
        case "$base" in
            SushiTpmName-*)
                continue
                ;;
            SushiTpm*)
                leaf=${base#SushiTpm}
                leaf=${leaf%-a7b3c4d5-e6f7-4890-abcd-ef1234567890}
                # Drop EFI attribute suffix (last 4 bytes).
                head -c -4 "$var" > "$dest/$leaf" 2>/dev/null
                ;;
        esac
    done
fi