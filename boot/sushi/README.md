# Sushi

Sushi is a Rust boot splash stack for Linux: an initramfs daemon that owns the display from early boot through disk unlock and pivot, optional UEFI pre-boot graphics, and a dracut module that replaces Plymouth.

## Components

| Crate / binary | Role |
|----------------|------|
| `sushi` | Shared library: display backends (DRM/fbdev), renderer, protocol, unlock helpers |
| `sushid` | Initramfs splash daemon (`rdinit=/usr/bin/sushid`) |
| `sushictl` | Diagnostics and manual control CLI |
| `sushiboot` | UEFI `BOOTX64.EFI` — spinner before the kernel loads |
| `90sushi` | Dracut module under `initramfs/dracut/90sushi/` |

Log prefixes in serial/console output: `SushiBoot`, `Sushi`, `SushiDisplay`.

## Prerequisites

**Host builds**

- Rust 1.75+ (`rustup`)
- `rustup target add x86_64-unknown-uefi` (for SushiBoot)

**QEMU VM**

- `qemu-system-x86_64`, OVMF (`OVMF_CODE.fd`, `OVMF_VARS.fd`)
- A host kernel image (`/boot/vmlinuz-*` or set `KERNEL=`)
- `busybox` (for the minimal test root disk)
- `cpio`, `gzip`, `mkfs.ext4`, `e2fsprogs`

On Fedora:

```bash
sudo dnf install qemu-system-x86 edk2-ovmf busybox e2fsprogs cpio gzip
```

## Quick start (QEMU)

Build the ESP, initramfs, and root disk, then boot:

```bash
make vm-build    # or: ./scripts/vm/build-esp.sh
make vm-run      # or: ./scripts/vm/run-qemu.sh
```

`build-esp.sh` produces:

- `vm/esp/` — FAT ESP with `BOOTX64.EFI`, kernel, initramfs, BLS entry
- `vm/rootfs.img` — ext4 busybox root on whole `/dev/vda`
- `vm/initramfs-sushi.img` — minimal initramfs with `sushid`

Useful environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `KERNEL` | latest `/boot/vmlinuz-*` | Kernel copied to the ESP |
| `USE_DRACUT` | `0` | `1` builds initramfs via dracut (needs staging install + sudo) |
| `HEADLESS` | `0` | `1` runs QEMU with `-display none`, serial on stdout |
| `DISPLAY_BACKEND` | `gtk` | QEMU display backend when not headless |

Serial log when using the GTK window: `vm/serial.log`.

## Production install

```bash
make build
sudo make install DESTDIR=/   # installs sushid, sushictl, dracut module, themes
sudo dracut --force --omit plymouth --add sushi
```

Kernel cmdline (enabled by default when the module is installed):

```text
rd.sushi=1
```

Rebuild initramfs after upgrading `sushid` or the dracut module.

## Development

```bash
cargo test --workspace --exclude sushiboot
cargo build --workspace --exclude sushiboot
```

SushiBoot links as a UEFI application; build scripts set the required `RUSTFLAGS` (no checked-in `.cargo/` config).

```bash
RUSTFLAGS='-C link-arg=-Wl,--subsystem,efi_application' \
  cargo build -p sushiboot --target x86_64-unknown-uefi --release
```

## Boot flow (VM)

```text
SushiBoot (UEFI) → kernel + initramfs → sushid (splash + unlock) → switch_root → busybox on tty
```

The BLS entry uses `root=/dev/vda` (whole virtio disk), `rdinit=/usr/bin/sushid`, and both `console=ttyS0` and `console=tty0` for debugging.

## Troubleshooting

**Black screen after boot**

- Confirm serial shows `Sushi: caught the frame` — if not, initramfs may not be loading (`initrd=\initramfs.img` path on the ESP).
- Check `vm/serial.log` for `Sushi:` / `SushiDisplay:` lines.
- Rootfs `sbin/init` must use relative busybox symlinks (`../bin/busybox`).

**SushiBoot build fails**

```bash
rustup target add x86_64-unknown-uefi
```

## License

MIT