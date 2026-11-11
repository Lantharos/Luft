#!/usr/bin/env bash
set -euo pipefail

SHIM=605dab50-e046-4300-abb6-3dd810dd8b23
X509_TYPE='\xa1\x59\xc0\xa5\xe4\x94\xa7\x4a\x87\xb5\xab\x15\x5c\x2b\xf0\x72'
SHIM_OWNER='\x50\xab\x5d\x60\x46\xe0\x00\x43\xab\xb6\x3d\xd8\x10\xdd\x8b\x23'
esp="$1"
code="$2"
certificate=/run/esp/EFI/luft/luft.cer
request=/run/mok-new
auth=/run/mok-auth

le32() {
  printf '%b' "$(printf '\\x%02x' $(($1 & 255)) $(($1 >> 8 & 255)) $(($1 >> 16 & 255)) $(($1 >> 24 & 255)))"
}

efi_variable() {
  { printf '\x07\x00\x00\x00'; cat "$2"; } >"$2.variable"
  cat "$2.variable" >"/sys/firmware/efi/efivars/$1-$SHIM"
}

mkdir -p /run/esp
mount -o ro "$esp" /run/esp
size="$(stat -c %s "$certificate")"
{ printf '%b' "$X509_TYPE"; le32 $((28 + 16 + size)); le32 0; le32 $((16 + size)); printf '%b' "$SHIM_OWNER"; cat "$certificate"; } >"$request"
{ cat "$request"; printf %s "$code" | iconv -t UTF-16LE; } | openssl dgst -sha256 -binary >"$auth"
umount /run/esp
efi_variable MokNew "$request"
efi_variable MokAuth "$auth"
