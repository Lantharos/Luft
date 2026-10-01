# Sushi

Sushi is the boot splash for Luft. It keeps the firmware logo on screen from the moment the computer powers on, adds a spinner below it, asks for the disk passphrase when the disk is encrypted, follows the screen when the graphics driver takes over, and hands the display to the login screen without the screen going black or showing text in between. It replaces Plymouth.

In the Luft monorepo, Sushi lives at `boot/sushi`. Run the commands below from that directory.

## What a boot looks like

1. The firmware draws its logo. Sushi draws the same logo in the same place, so the first frame it shows is identical to what's already there, then fades a spinner in underneath.
2. If the disk is encrypted, the spinner gives way to a passphrase field. A wrong passphrase shakes the field and says so; Caps Lock shows a warning. Keys are read through the console keymap, so the layout set in `/etc/vconsole.conf` applies.
3. When the system switches from the initramfs to the installed system, Sushi keeps running and keeps the splash on screen.
4. When the graphics driver loads and replaces the firmware framebuffer, Sushi redraws on the new device straight away. If a display arrangement was saved by the login screen, Sushi uses that mode, so the monitor only switches modes once.
5. When the login screen starts, Sushi fades the spinner out, leaves the logo on screen, and lets go of the display. The login screen's first frame shows the same logo before its own interface fades in.
6. Sushi then stays in the background holding the display open, so that when one session ends and the next begins (signing in, signing out), the last frame stays on screen instead of the kernel's text console taking over.

## Components

| Crate | Role |
|-------|------|
| `sushi-scene` | The scene every stage draws: firmware logo placement, spinner, passphrase field, text in Open Runde. Works without the standard library so SushiBoot shares it. |
| `sushi` | Display handling (DRM/KMS), console and keyboard, password requests, the control socket |
| `sushid` | The splash itself |
| `sushictl` | Talks to `sushid` |
| `sushiboot` | An optional UEFI boot menu drawn with the same scene |
| `sushi-bootctl` | Installs SushiBoot on the EFI system partition |

`data/` holds the systemd units, the drop-ins for greetd and the console password agent, the dracut module, and the default configuration.

## Installing on Fedora

Sushi installs next to Plymouth. Both are in the initramfs, and the kernel command line decides which one runs, so Plymouth stays as a fallback until you're happy with Sushi.

```bash
boot/sushi/scripts/install.sh install   # build, install, rebuild the initramfs
boot/sushi/scripts/install.sh try       # use Sushi for the next boot only
boot/sushi/scripts/install.sh enable    # use Sushi on every boot
boot/sushi/scripts/install.sh disable   # back to Plymouth on every boot
boot/sushi/scripts/install.sh remove    # take Sushi off the computer entirely
```

`try` adds a boot entry with Sushi turned on and tells GRUB to use it once. If anything goes wrong, restarting brings back the usual entry. `enable` and `disable` change the arguments of every installed kernel, and kernels installed later inherit them.

The script needs `sudo`, `grubby`, and `grub2-reboot`, which Fedora has by default.

### Kernel arguments

These are what `try` and `enable` add:

| Argument | Why |
|----------|-----|
| `sushi` | Turns Sushi on |
| `plymouth.enable=0` | Keeps Plymouth from starting alongside it |
| `quiet loglevel=3` | Only critical kernel messages reach the screen |
| `systemd.show_status=false` | No service status lines on the console, not even on slow boots |
| `rd.udev.log_level=3 udev.log_level=3` | Quiet device setup in the initramfs and after it |
| `vt.global_cursor_default=0` | No blinking cursor on the console |
| `fbcon=vc:0-5` | The text console only draws on the first six virtual terminals, so the seventh, where the login screen and sessions run, never shows text |

`rd.systemd.show_status` isn't needed: systemd reads `systemd.show_status` in the initramfs too.

Keep the firmware's boot menu and GRUB's menu hidden so nothing draws between the firmware logo and Sushi. On Fedora that's GRUB's default after a successful boot.

### The login screen

Sushi works with any display manager that starts its compositor after running `sushictl deactivate` and draws its first frame within a few seconds. For greetd, Sushi installs a drop-in that does exactly that. Display managers Sushi doesn't know about are handled by `sushi-quit.service`, which closes the splash when the system has finished starting.

With Kestrel's login screen, set greetd to the seventh virtual terminal (`vt = 7` in `/etc/greetd/config.toml`, which Kestrel's `greetd.toml` already does), so the text console never shares a terminal with graphical sessions.

`/etc/sushi/sushi.conf` has one setting:

```ini
monitors = /var/lib/kestrel-greeter/display/monitors.xml
```

Kestrel copies your display arrangement there whenever you change it, and Sushi and the login screen both start in that mode.

### NVIDIA

Keep `nvidia-drm.fbdev=1` (the default with current drivers). Without it, the driver turns every screen off whenever a program lets go of the display, which undoes the hand-over. Sushi doesn't need the NVIDIA driver in the initramfs; it follows the screen when the driver loads later.

## sushictl

```bash
sushictl status        # showing, leaving, waiting, or holding
sushictl deactivate    # fade the spinner out and let the next program take the display
sushictl quit          # close the splash and return to the text console
```

`sushictl update-root` is used by the initramfs while switching to the installed system.

`journalctl -u sushi` shows what Sushi did on this boot: which display it used, when it handed over, and how long the next program took to draw.

## SushiBoot

SushiBoot is an optional UEFI boot menu. It reads [Boot Loader Specification](https://uapi-group.org/specifications/specs/boot_loader_specification/) entries from every EFI system partition, finds Windows and other installed boot loaders, and draws the menu below the firmware logo. With `timeout 0` in `loader/loader.conf` it starts the default entry without showing anything; holding any key while it starts shows the menu.

```bash
sudo sushi-bootctl install --esp /boot/efi --efi-entry
```

With Secure Boot on, SushiBoot has to be signed with a key the firmware trusts (`sushi-bootctl sign` uses `sbctl`). On a computer that boots through shim and GRUB, the splash works without SushiBoot.

## Development

```bash
make build    # release build of everything, including SushiBoot
make check    # formatting, clippy for Linux and UEFI, tests
```

### Virtual machine

The VM is a Fedora 45 system built with Podman, with greetd and Kestrel's login screen, booting through SushiBoot under QEMU and OVMF. The firmware framebuffer starts the boot; the virtio GPU driver loads after the switch to the installed system and replaces it, the same way the NVIDIA driver does on real hardware. Nothing on the host is installed or changed, and no step needs `sudo`.

```bash
scripts/vm/tree.sh       # Fedora root tree (first run downloads packages)
scripts/vm/kestrel.sh    # build Kestrel into the tree
scripts/vm/disk.sh       # install Sushi, build the initramfs, root disk and ESP
scripts/vm/run.sh        # boot it in a window
```

`LUKS=1 scripts/vm/disk.sh` encrypts the root disk (the passphrase is `sushi-vm`, as is the password of the `sushi` account). `MENU_TIMEOUT=3` shows SushiBoot's menu.

`scripts/vm/record.py` boots the VM without a window, types at given times, runs commands on the serial console, and saves every frame, which is how the hand-overs are checked frame by frame:

```bash
scripts/vm/record.py /tmp/frames --seconds 40 --type "16:sushi-vm"
scripts/vm/journal.sh -b 0 -u sushi    # the VM's journal, read from its disk after it shuts down
```

## License

MIT
