#!/usr/bin/env bash
set -euo pipefail

tree="$1"
mutable="$2"
link="$3"
names=()
targets=()

mount --make-rshared /
for extension in /run/extensions/*; do
  [[ -e "$extension" && "$extension" != "$link" ]] || continue
  names+=("${extension##*/}")
  targets+=("$(readlink -f "$extension")")
done
mount -t tmpfs tmpfs /run/extensions
for i in "${!names[@]}"; do ln -s "${targets[$i]}" "/run/extensions/${names[$i]}"; done
ln -s "$tree" "/run/extensions/${tree##*/}"
mount -t tmpfs tmpfs "$mutable"
mkdir "$mutable/usr"
systemd-sysext refresh --mutable=yes --no-reload >/dev/null 2>&1

# shellcheck source=os/image/stages/finalize.sh
source "$(dirname "$0")/../image/stages/finalize.sh"
refresh_caches >/dev/null 2>&1
[[ ! -f "$tree/usr/libexec/luft-keyring" ]] || give_keyring_its_group

find "$mutable/usr" \( -type c -o -name .systemd-sysext \) -prune -exec rm -rf {} +
chmod -R go-w "$mutable/usr"
cp -r --preserve=mode,ownership,timestamps "$mutable/usr/." "$tree/usr/"
