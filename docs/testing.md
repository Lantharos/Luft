# Testing

Every test here runs in isolation: test sessions use their own D-Bus buses, stand-ins for system services and a scratch profile, and the VMs change nothing on the host.

## Kestrel sessions

Build Kestrel first (see the [repository README](../README.md#build)). Then from the repository root:

| Command | Runs |
| --- | --- |
| `kestrel/tools/session.sh nested` | A visible nested session in Mutter's development kit window, for trying things by hand |
| `kestrel/tools/session.sh capture` | The full headless check suite, saving screenshots of every surface, then the login screen checks |
| `kestrel/tools/session.sh greeter` | Only the login screen checks, against a stand-in greetd |
| `kestrel/tools/session.sh performance` | Startup memory, search, notification bursts, actor reuse and idle paints |

`capture` splits the checks into groups and runs several sessions side by side:

| Option | Effect |
| --- | --- |
| `--only GROUPS` | Only these comma-separated groups. An area such as `apps` runs every group in it |
| `--jobs N` | Up to N sessions at once (default: one per four processors); `--jobs 1` runs everything in one session |
| `--list` | Lists the groups |

The nested session copies the host's wallpaper, interface settings, keyboard layout and favorite apps. Closing its window ends it. Edits to `kestrel/engine/data/theme/kestrel.css` reload live.

| Variable | Default | Purpose |
| --- | --- | --- |
| `KESTREL_SESSION_DIR` | `kestrel/run` | Settings, caches and app data of the test session. Point it at an empty folder for a clean profile or to run sessions side by side |
| `KESTREL_CAPTURE_DIR` | `docs/screenshots` | Where captures are saved |
| `KESTREL_CAPTURE_SIZE` | `1440x900` | Size of the virtual monitor |
| `KESTREL_CAPTURE_SECONDARY_SIZE` | none | Adds a second virtual monitor, such as `1280x720` |
| `KESTREL_DEV_APPS` | none | Luft apps to test from their build folders instead of the installed ones, such as `rover,settings` (run `bun run desktop:build` in each first) |

Optional tools widen the capture: with `rclone` installed Rover connects to local WebDAV and FTP servers, and with `stalwart` Mailman signs in to a local mail server.

Polkit, real network credentials, unlocking with the computer's own sign-in rules, physical displays and suspend still need a real login session.

## Apps and packages

From an app's folder, `bun run check` type-checks its interface. The Rust side builds with `bun run desktop:build`. Shared Rust crates have their own `cargo test`.

## Luft Keyring and Passkeys

See [Luft Keyring](../kestrel/keyring/README.md#testing) and [Luft Passkeys](../kestrel/passkeys/README.md#development).

## Boot VM

A Fedora system built with Podman, with greetd and Kestrel's login screen, booting through SushiBoot under QEMU and OVMF with SELinux enforcing. It needs no `sudo`. From `boot/sushi`:

```sh
scripts/vm/tree.sh       # Fedora root tree (first run downloads packages)
scripts/vm/kestrel.sh    # build Kestrel into the tree
scripts/vm/security.sh   # build trustd and USB protection into the tree
scripts/vm/disk.sh       # install Sushi, build the initramfs, root disk and ESP
scripts/vm/run.sh        # boot it in a window
```

`make vm-build`, `make vm-build-luks`, `make vm-run` and `make vm-clean` wrap the same steps.

Everything lives in `boot/sushi/vm`; set `SUSHI_VM` to use another folder. The `sushi` account's password, and the disk passphrase, is `sushi-vm`.

`disk.sh` options:

| Variable | Effect |
| --- | --- |
| `LUKS=1` | Encrypts the root disk |
| `MENU_TIMEOUT=3` | Shows SushiBoot's menu |
| `LAYOUT=fedora` | Lays the disk out like Fedora's installer, with shim and GRUB |
| `DRIVER=initramfs` (default) | Sushi loads the graphics driver itself in the initramfs, as with NVIDIA. Use with `GPU=vga` |
| `DRIVER=system` | The driver isn't in the initramfs, as right after a kernel update |
| `DRIVER=udev` | udev loads the driver, which switches the screen off on its own |

`run.sh` options:

| Variable | Effect |
| --- | --- |
| `SECURE_BOOT=1` | Secure Boot on, with Microsoft's keys enrolled |
| `TPM=2` / `TPM=1.2` | A software TPM, kept next to the disk |
| `XRES=3440 YRES=1440` | Monitor resolution (default 1920×1080) |
| `GPU=vga` | QEMU's standard VGA instead of virtio |
| `FRAMEBUFFER=1024x768` | Hands SushiBoot a smaller framebuffer, as some firmware does |
| `EDID=0` | Doesn't describe the monitor to SushiBoot |

Recording boots frame by frame:

```sh
scripts/vm/record.py /tmp/frames --seconds 40 --type "16:sushi-vm"   # type the passphrase at 16 s
scripts/vm/frames.py /tmp/frames                                     # when the screen went black, froze or changed mode
scripts/vm/journal.sh -b 0 -u sushi                                  # the VM's journal, after it shuts down
```

To watch an offline update:

```sh
scripts/vm/update.sh
scripts/vm/disk.sh
scripts/vm/record.py /tmp/frames --seconds 60 \
  --serial "login: =>root" --serial "Password: =>sushi-vm" --serial "]# =>dnf5 offline reboot -y"
```
