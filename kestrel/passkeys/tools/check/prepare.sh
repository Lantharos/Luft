#!/usr/bin/env bash
set -euo pipefail

check="$(cd "$(dirname "$0")" && pwd)"
passkeys="$(cd "$check/../.." && pwd)"
luft="$(cd "$passkeys/../.." && pwd)"
keyring="$luft/kestrel/keyring"
vm="${SUSHI_VM:?Set SUSHI_VM to the folder of the virtual machine}"
tree="$vm/tree"
stage="$vm/passkeys"
prefix="$vm/kestrel/prefix"
libexec="$prefix/libexec"
packages=(chromium firefox python3-gobject fprintd-pam)

[[ -d "$prefix" ]] || { echo "Build Kestrel into the VM first: SUSHI_VM=$vm boot/sushi/scripts/vm/kestrel.sh" >&2; exit 1; }

if [[ "$(cat "$vm/.passkeys-packages" 2>/dev/null)" != "${packages[*]}" ]]; then
  podman run --rm --security-opt label=disable -v "$tree:/installroot" "registry.fedoraproject.org/fedora:45" \
    dnf install -y -q --releasever=45 --installroot=/installroot --use-host-config --setopt=install_weak_deps=False --nodocs "${packages[@]}"
  echo "${packages[*]}" > "$vm/.passkeys-packages"
fi

rm -rf "$stage"
DESTDIR="$stage" "$passkeys/install.sh" install "$prefix"

cargo build --release --manifest-path "$keyring/Cargo.toml"
install -Dm755 -t "$stage$libexec" "$keyring/target/release/luft-keyring" "$keyring/target/release/luft-keyring-unlock"
install -Dm755 "$keyring/target/release/libpam_luft_keyring.so" "$stage/usr/lib64/security/pam_luft_keyring.so"

stand_in() {
  sed "s|@libexecdir@|$libexec|g" "$check/stand-ins/$1" | install -Dm644 /dev/stdin "$stage$2"
}
stand_in luft-keyring.service /usr/local/lib/systemd/user/luft-keyring.service
stand_in org.freedesktop.secrets.service /usr/local/share/dbus-1/services/org.freedesktop.secrets.service
stand_in com.lantharos.Keyring1.service /usr/local/share/dbus-1/services/com.lantharos.Keyring1.service
stand_in luft-keyring-unlock.socket /usr/local/lib/systemd/system/luft-keyring-unlock.socket
stand_in luft-keyring-unlock.service /usr/local/lib/systemd/system/luft-keyring-unlock.service
stand_in kestrel-unlock.pam /etc/pam.d/kestrel-unlock
stand_in kestrel-unlock-fingerprint.pam /etc/pam.d/kestrel-unlock-fingerprint
sed '/^auth.*system-auth/a auth       optional    pam_luft_keyring.so' "$tree/usr/lib/pam.d/greetd" | install -Dm644 /dev/stdin "$stage/etc/pam.d/greetd"
mkdir -p "$stage/usr/local/lib/systemd/system"
for unit in kestrel-authenticate.socket kestrel-authenticate@.service; do
  ln -sfn "$prefix/lib/systemd/system/$unit" "$stage/usr/local/lib/systemd/system/$unit"
done
for unit in luft-passkeys-relay@ kestrel-authenticate@; do
  printf '[Service]\nProtectHome=read-only\n' | install -Dm644 /dev/stdin "$stage/etc/systemd/system/$unit.service.d/home.conf"
done

install -Dm644 -t "$stage/usr/local/share/passkeys-check" "$check/index.html" "$check/serve.py" "$check/fprintd.py" "$check/firefox-user.js"
install -Dm644 "$check/fprintd.conf" "$stage/etc/dbus-1/system.d/net.reactivated.Fprint-check.conf"
install -Dm644 "$check/fprintd-check.service" "$stage/etc/systemd/system/fprintd-check.service"

podman unshare sh -c "cp -a '$stage/.' '$tree/' && chown -R 0:0 '$tree$libexec' '$tree/usr/lib64/security/pam_luft_keyring.so'"
podman run --rm --security-opt label=disable --rootfs "$tree" sh -c "
  systemctl enable luft-passkeys-relay.socket luft-keyring-unlock.socket kestrel-authenticate.socket fprintd-check.service
  systemctl --global enable luft-passkeys.service
"
