#!/usr/bin/env bash
# Build a minimal ext4 root disk for QEMU (busybox + shell console).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
VM_DIR="$ROOT/vm"
ROOTFS_IMG="${1:-$VM_DIR/rootfs.img}"
ROOTFS_DIR="$VM_DIR/rootfs-tree"
SIZE_MB="${ROOTFS_SIZE_MB:-256}"

BUSYBOX="${BUSYBOX:-$(command -v busybox || true)}"
if [[ -z "$BUSYBOX" || ! -x "$BUSYBOX" ]]; then
    echo "ERROR: busybox not found. Install it (dnf install busybox) or set BUSYBOX=/path/to/busybox" >&2
    exit 1
fi

echo "==> Building VM root disk ($ROOTFS_IMG, ${SIZE_MB}MB)"
if [[ -e "$ROOTFS_DIR" ]] && ! rm -rf "$ROOTFS_DIR" 2>/dev/null; then
    echo "ERROR: $ROOTFS_DIR is root-owned (left over from a prior sudo/LUKS build)." >&2
    echo "       Run: sudo rm -rf $ROOTFS_DIR" >&2
    echo "       Then: make vm-build" >&2
    exit 1
fi
mkdir -p "$ROOTFS_DIR"/{bin,sbin,etc,proc,sys,dev,tmp,root,usr/bin,var/log,run}

cp -L "$BUSYBOX" "$ROOTFS_DIR/bin/busybox"
chmod 755 "$ROOTFS_DIR/bin/busybox"

for app in sh ash init getty login mount umount switch_root cat echo hostname sleep mknod mkdir chvt; do
    ln -sf busybox "$ROOTFS_DIR/bin/$app"
done
ln -sf ../bin/busybox "$ROOTFS_DIR/sbin/init"
ln -sf ../bin/busybox "$ROOTFS_DIR/sbin/getty"

cat > "$ROOTFS_DIR/etc/inittab" << 'EOF'
::sysinit:/etc/init.d/rcS
::respawn:/sbin/getty -L 115200 ttyS0 vt100
::respawn:/sbin/getty -L 115200 tty1 vt100
::ctrlaltdel:/sbin/reboot
::shutdown:/bin/umount -a -r
EOF

mkdir -p "$ROOTFS_DIR/etc/init.d"
cat > "$ROOTFS_DIR/etc/init.d/rcS" << 'EOF'
#!/bin/sh
mount -t proc proc /proc
mount -t sysfs sysfs /sys
mount -t devtmpfs devtmpfs /dev 2>/dev/null || mount -t tmpfs tmpfs /dev
mkdir -p /dev/pts /dev/shm
mount -t devpts devpts /dev/pts 2>/dev/null || true
mount -t tmpfs tmpfs /dev/shm 2>/dev/null || true
hostname sushi-vm
# fbcon on ramfb needs devtmpfs + bound vtconsole before getty.
for vtc in /sys/class/vtconsole/*/name; do
    case "$(cat "$vtc" 2>/dev/null)" in
        *frame*buffer*|*Frame*buffer*)
            echo 1 > "${vtc%/name}/bind" 2>/dev/null || true
            ;;
    esac
done
if [ -f /sys/module/fbcon/parameters/logo ]; then
    echo 0 > /sys/module/fbcon/parameters/logo
fi
chvt 1 2>/dev/null || true
chvt 1 2>/dev/null || true
# Keep the splash scanout — getty will draw the login prompt when it starts.
for vt in /dev/tty1 /dev/tty0; do
    if [ -c "$vt" ]; then
        printf '\033[?25h' > "$vt"
    fi
done
EOF
chmod +x "$ROOTFS_DIR/etc/init.d/rcS"

cat > "$ROOTFS_DIR/etc/profile" << 'EOF'
export PS1='\u@sushi-vm:\w\$ '
EOF

cat > "$ROOTFS_DIR/etc/passwd" << 'EOF'
root:x:0:0:root:/root:/bin/sh
EOF

# Empty root password for the VM demo (login: root, just press Enter).
cat > "$ROOTFS_DIR/etc/shadow" << 'EOF'
root::19000:0:99999:7:::
EOF

cat > "$ROOTFS_DIR/etc/group" << 'EOF'
root:x:0:
EOF

# Strip host SELinux xattrs — they break visibility when the VM kernel has no SELinux.
if command -v setfattr >/dev/null 2>&1; then
    find "$ROOTFS_DIR" -xattrname security.selinux -exec setfattr -x security.selinux {} + 2>/dev/null || true
fi

if [[ "${ROOTFS_TREE_ONLY:-0}" == "1" ]]; then
    echo "==> Rootfs tree ready at $ROOTFS_DIR (image not created)"
    exit 0
fi

rm -f "$ROOTFS_IMG"
truncate -s "${SIZE_MB}M" "$ROOTFS_IMG"

# mkfs.ext4 -d packs a directory tree without loop-mount (e2fsprogs >= 1.43).
if mkfs.ext4 -F -L sushi-root -d "$ROOTFS_DIR" "$ROOTFS_IMG" >/dev/null 2>&1; then
    :
else
    echo "==> mkfs.ext4 -d unavailable; falling back to loop mount"
    MNT="$VM_DIR/rootfs-mnt"
    mkdir -p "$MNT"
    mount -o loop "$ROOTFS_IMG" "$MNT"
    cp -a "$ROOTFS_DIR"/. "$MNT/"
    sync
    umount "$MNT"
    rmdir "$MNT"
fi

echo "==> Root disk ready: $ROOTFS_IMG ($(du -h "$ROOTFS_IMG" | awk '{print $1}'))"