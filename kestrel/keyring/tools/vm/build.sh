#!/usr/bin/env bash
set -euo pipefail

keyring="$(cd "$(dirname "$0")/../.." && pwd)"
luft="$(cd "$keyring/../.." && pwd)"
vm="${KEYRING_VM:-$luft/kestrel/run/keyring-vm}"
tree="$vm/tree"
release="${FEDORA_RELEASE:-45}"
prefix=/opt/kestrel
pamdir=/usr/local/lib64/security
authenticator="${KESTREL_AUTHENTICATE:-$luft/kestrel/build/src/authenticate/kestrel-authenticate}"
units="$luft/kestrel/engine/data/system"

packages=(
  systemd systemd-udev systemd-pam dracut kernel-core kernel-modules-core kbd util-linux passwd shadow-utils
  sudo polkit dbus-broker dbus-daemon greetd selinux-policy-targeted procps-ng glibc-langpack-en authselect
  tpm2-tss tpm2-tools fprintd-pam python3-gobject libsecret json-glib openssh-clients e2fsprogs
)

mkdir -p "$vm"
if [[ "$(cat "$vm/.packages" 2>/dev/null)" != "${packages[*]}" ]]; then
  podman unshare rm -rf "$tree"
  mkdir -p "$tree"
  podman run --rm --security-opt label=disable -v "$tree:/installroot" "registry.fedoraproject.org/fedora:$release" \
    dnf install -y -q --releasever="$release" --installroot=/installroot --use-host-config \
    --setopt=install_weak_deps=False --nodocs "${packages[@]}"
  podman run --rm --security-opt label=disable --rootfs "$tree" bash -c "
    systemd-firstboot --locale=en_US.UTF-8 --keymap=us --timezone=UTC --setup-machine-id --force
    useradd -m -G wheel person
    echo 'person:sign-in words' | chpasswd
    echo 'root:sign-in words' | chpasswd
    authselect select local with-fingerprint --force
    systemctl set-default graphical.target
    systemctl enable greetd.service
    systemctl mask fprintd.service
  "
  echo "${packages[*]}" > "$vm/.packages"
fi

PKG_CONFIG_PATH="${PKG_CONFIG_PATH:-}" cargo build --release --manifest-path "$keyring/Cargo.toml"
built="$keyring/target/release"
stage="$vm/stage"
rm -rf "$stage"
fill() {
  sed -e "s|@libexecdir@|$prefix/libexec|g" -e "s|@pamdir@|$pamdir|g" "$1" | install -Dm644 /dev/stdin "$stage$2"
}
install -Dm755 "$built/luft-keyring" "$stage$prefix/libexec/luft-keyring"
install -Dm755 "$built/luft-keyring-unlock" "$stage$prefix/libexec/luft-keyring-unlock"
install -Dm755 "$built/libpam_luft_keyring.so" "$stage$pamdir/pam_luft_keyring.so"
install -Dm755 "$authenticator" "$stage$prefix/libexec/kestrel-authenticate"
fill "$keyring/data/system/luft-keyring-unlock.socket" /etc/systemd/system/luft-keyring-unlock.socket
fill "$keyring/data/system/luft-keyring-unlock.service" /etc/systemd/system/luft-keyring-unlock.service
fill "$units/kestrel-authenticate.socket" /etc/systemd/system/kestrel-authenticate.socket
fill "$units/kestrel-authenticate@.service.in" /etc/systemd/system/kestrel-authenticate@.service
fill "$keyring/data/user/luft-keyring.service" /etc/systemd/user/luft-keyring.service
fill "$keyring/data/user/luft-keyring.socket" /etc/systemd/user/luft-keyring.socket
fill "$keyring/data/dbus/org.freedesktop.secrets.service" /usr/share/dbus-1/services/org.freedesktop.secrets.service
fill "$keyring/data/dbus/com.lantharos.Keyring1.service" /usr/share/dbus-1/services/com.lantharos.Keyring1.service
for stack in greetd kestrel-unlock kestrel-unlock-fingerprint; do
  fill "$keyring/data/pam/$stack" "/etc/pam.d/$stack"
done
for script in "$keyring"/tools/vm/guest/* "$keyring"/tools/session/prompter.py; do
  install -Dm755 "$script" "$stage/usr/local/libexec/keyring-test/$(basename "$script")"
done
install -Dm644 "$keyring/data/selinux/luft-keyring.cil" "$stage/usr/local/share/luft-keyring/luft-keyring.cil"
install -Dm644 "$keyring/tools/vm/guest/keyring-test.service" "$stage/etc/systemd/system/keyring-test.service"
printf '[terminal]\nvt = 7\n\n[default_session]\ncommand = "/usr/local/libexec/keyring-test/greeter.sh"\nuser = "greetd"\n' \
  | install -Dm644 /dev/stdin "$stage/etc/greetd/config.toml"

kernels=("$tree"/lib/modules/*)
kernel="${kernels[0]##*/}"
podman unshare sh -c "
  set -e
  cp -r --preserve=mode '$stage/.' '$tree/'
  chown -R 0:0 '$tree$prefix' '$tree$pamdir' '$tree/usr/local/libexec/keyring-test'
"
podman run --rm --security-opt label=disable --rootfs "$tree" sh -c "
  semodule -N -i /usr/local/share/luft-keyring/luft-keyring.cil
  systemctl set-default graphical.target
  systemctl enable luft-keyring-unlock.socket kestrel-authenticate.socket keyring-test.service
  dracut --quiet --force --no-hostonly --add-drivers 'virtio_blk virtio_pci ext4' --kver '$kernel'
"
policies=("$tree"/etc/selinux/targeted/policy/policy.*)
podman unshare setfiles -c "${policies[-1]}" -r "$tree" "$tree/etc/selinux/targeted/contexts/files/file_contexts" "$tree"
podman unshare sh -c "cat '$tree/lib/modules/$kernel/vmlinuz' > '$vm/vmlinuz'; cat '$tree/boot/initramfs-$kernel.img' > '$vm/initramfs.img'"
rm -f "$vm/root.img"
truncate -s 4G "$vm/root.img"
podman unshare mkfs.ext4 -q -F -L keyring-vm -d "$tree" "$vm/root.img"
echo "The keyring test machine is ready in $vm"
