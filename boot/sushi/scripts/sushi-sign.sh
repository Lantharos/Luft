#!/usr/bin/env bash
# Sign SushiBoot.efi for MOK / custom Secure Boot (requires sbctl).
set -euo pipefail

EFI="${1:-/boot/efi/EFI/sushi/SushiBoot.efi}"

if ! command -v sbctl >/dev/null 2>&1; then
    echo "ERROR: sbctl not found. Install: sudo dnf install sbctl" >&2
    exit 1
fi

if [[ ! -f "$EFI" ]]; then
    echo "ERROR: $EFI not found. Run: sudo sushi-bootctl install" >&2
    exit 1
fi

if ! sbctl status 2>/dev/null | grep -q "Secure Boot.*enabled"; then
    echo "Note: Secure Boot is not enabled — signing is optional but harmless."
fi

if ! sbctl list 2>/dev/null | grep -q "SushiBoot"; then
    echo "==> Enrolling sbctl keys (first time only)"
    echo "    sudo sbctl create-keys"
    echo "    sudo sbctl enroll -m   # enrolls MOK, reboot to confirm"
fi

sudo sbctl sign -s "$EFI"
echo "==> Signed $EFI"
echo "    With Secure Boot: enroll MOK if prompted after sbctl enroll -m"