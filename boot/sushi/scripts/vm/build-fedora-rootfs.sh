#!/usr/bin/env bash
# Build a Fedora root disk for QEMU: systemd + LightDM greeter + Openbox on fbdev/Xorg.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
VM_DIR="$ROOT/vm"
ROOTFS_IMG="${1:-$VM_DIR/rootfs.img}"
ROOTFS_DIR="$VM_DIR/fedora-rootfs-tree"
SIZE_MB="${ROOTFS_SIZE_MB:-8192}"
RELEASEVER="${FEDORA_RELEASEVER:-44}"
VM_USER="${VM_USER:-sushi}"
VM_PASSWORD="${VM_PASSWORD:-sushi}"
FEDORA_IMAGE="${FEDORA_IMAGE:-docker.io/library/fedora:${RELEASEVER}}"

run_in_fedora() {
    podman run --rm --security-opt label=disable \
        -v "$ROOTFS_DIR:/installroot:Z" \
        "$FEDORA_IMAGE" \
        bash -lc "$1"
}

if ! command -v podman >/dev/null 2>&1; then
    echo "ERROR: podman not found. Install podman or use the minimal busybox VM." >&2
    exit 1
fi

echo "==> Building Fedora ${RELEASEVER} VM root disk ($ROOTFS_IMG, ${SIZE_MB}MB)"
if [[ -e "$ROOTFS_DIR" ]] && ! rm -rf "$ROOTFS_DIR" 2>/dev/null; then
    echo "ERROR: $ROOTFS_DIR is root-owned. Run: sudo rm -rf $ROOTFS_DIR" >&2
    exit 1
fi
mkdir -p "$ROOTFS_DIR"

echo "==> Pulling $FEDORA_IMAGE (if needed)"
podman pull "$FEDORA_IMAGE" >/dev/null 2>&1 || podman pull "$FEDORA_IMAGE"

echo "==> dnf installroot — graphical base + LightDM greeter"
run_in_fedora "dnf install -y \
    --releasever=${RELEASEVER} \
    --installroot=/installroot \
    --use-host-config \
    --setopt=install_weak_deps=False \
    --nodocs \
    systemd systemd-sysv \
    passwd shadow-utils \
    dbus polkit \
    bash coreutils util-linux hostname which \
    glibc-langpack-en \
    lightdm lightdm-gtk-greeter openbox \
    xorg-x11-server-Xorg xorg-x11-drv-modesetting xorg-x11-xinit \
    mesa-libGL mesa-dri-drivers"

echo "==> First-boot identity"
run_in_fedora "systemd-firstboot \
    --root=/installroot \
    --locale=en_US.UTF-8 \
    --timezone=UTC \
    --hostname=sushi-fedora \
    --setup-machine-id \
    --force"

echo "==> Accounts ($VM_USER / $VM_PASSWORD)"
run_in_fedora "echo 'root:${VM_PASSWORD}' | chroot /installroot chpasswd"
run_in_fedora "id ${VM_USER} >/dev/null 2>&1 || chroot /installroot useradd -m -G wheel -s /bin/bash ${VM_USER}"
run_in_fedora "echo '${VM_USER}:${VM_PASSWORD}' | chroot /installroot chpasswd"

echo "==> fstab + SELinux permissive for VM"
echo 'LABEL=sushi-root / ext4 defaults 0 1' >"$ROOTFS_DIR/etc/fstab"
mkdir -p "$ROOTFS_DIR/etc/selinux"
cat >"$ROOTFS_DIR/etc/selinux/config" <<'EOF'
SELINUX=permissive
SELINUXTYPE=targeted
EOF

echo "==> Xorg modesetting (QEMU ramfb / simpledrm)"
mkdir -p "$ROOTFS_DIR/etc/X11/xorg.conf.d"
cat >"$ROOTFS_DIR/etc/X11/xorg.conf.d/10-modesetting.conf" <<'EOF'
Section "Device"
    Identifier "Card0"
    Driver "modesetting"
    Option "AccelMethod" "none"
EndSection
EOF

echo "==> Openbox session for LightDM"
mkdir -p "$ROOTFS_DIR/usr/share/xsessions"
cat >"$ROOTFS_DIR/usr/share/xsessions/openbox.desktop" <<'EOF'
[Desktop Entry]
Name=Openbox
Comment=Log in to an Openbox session
Exec=/usr/bin/openbox-session
Type=Application
EOF

echo "==> LightDM greeter (no autologin — proves greeter path)"
mkdir -p "$ROOTFS_DIR/etc/lightdm/lightdm.conf.d"
cat >"$ROOTFS_DIR/etc/lightdm/lightdm.conf.d/50-sushi-vm.conf" <<'EOF'
[Seat:*]
user-session=openbox
greeter-session=lightdm-gtk-greeter
EOF

echo "==> Enable graphical boot + serial getty"
run_in_fedora "systemctl --root=/installroot set-default graphical.target"
run_in_fedora "systemctl --root=/installroot enable lightdm.service"
run_in_fedora "systemctl --root=/installroot enable getty@ttyS0.service"

if command -v setfattr >/dev/null 2>&1; then
    find "$ROOTFS_DIR" -xattrname security.selinux -exec setfattr -x security.selinux {} + 2>/dev/null || true
fi

echo "==> Packing ext4 image"
rm -f "$ROOTFS_IMG"
truncate -s "${SIZE_MB}M" "$ROOTFS_IMG"
if mkfs.ext4 -F -L sushi-root -d "$ROOTFS_DIR" "$ROOTFS_IMG" >/dev/null 2>&1; then
    :
else
    echo "==> mkfs.ext4 -d unavailable; loop-mount fallback (sudo)"
    MNT="$VM_DIR/fedora-rootfs-mnt"
    mkdir -p "$MNT"
    mkfs.ext4 -F -L sushi-root "$ROOTFS_IMG" >/dev/null
    if mount -o loop "$ROOTFS_IMG" "$MNT" 2>/dev/null; then
        cp -a "$ROOTFS_DIR"/. "$MNT/"
        sync
        umount "$MNT"
        rmdir "$MNT"
    else
        sudo mount -o loop "$ROOTFS_IMG" "$MNT"
        sudo cp -a "$ROOTFS_DIR"/. "$MNT/"
        sync
        sudo umount "$MNT"
        rmdir "$MNT"
    fi
fi

echo "==> Fedora root disk ready: $ROOTFS_IMG ($(du -h "$ROOTFS_IMG" | awk '{print $1}'))"
echo "    Login greeter user: $VM_USER  password: $VM_PASSWORD"
echo "    Serial console: root or $VM_USER (same password)"