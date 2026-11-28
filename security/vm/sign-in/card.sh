#!/usr/bin/env bash
set -euo pipefail

# Makes the NSS database behind QEMU's emulated smart card: three RSA keys with
# their certificates, the way a CAC badge carries them, behind the card's PIN.
folder="$1" pin="$2"
rm -rf "$folder"
mkdir -p "$folder"
podman run --rm --network=host -v "$folder:/card:Z" registry.fedoraproject.org/fedora:45 sh -c "
  set -e
  dnf install -y -q nss-tools >/dev/null
  printf '%s\n' '$pin' > /card/pin
  certutil -N -d sql:/card -f /card/pin
  for name in authentication signing encryption; do
    head -c 64 /dev/urandom > /card/noise
    certutil -S -d sql:/card -f /card/pin -z /card/noise -n \$name -s \"CN=Luft check \$name\" -x -t ',,' -k rsa -g 2048 -v 12 >/dev/null
  done
  rm /card/noise /card/pin
"
