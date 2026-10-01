# Sushi

Sushi is the boot splash for Luft. It keeps the firmware logo on screen from the moment the computer powers on, adds a spinner below it, asks for the disk passphrase when the disk is encrypted, follows the screen when the graphics driver takes over, and hands the display to the login screen without the screen going black or showing text in between. It shows progress while updates install, and brings the logo back when the computer restarts or shuts down. It replaces Plymouth.

In the Luft monorepo, Sushi lives at `boot/sushi`. Run the commands below from that directory.

## What a boot looks like

1. The firmware draws its logo. Sushi draws the same logo in the same place, so the first frame it shows is identical to what's already there, then fades a spinner in underneath.
2. If the disk is encrypted, the spinner gives way to a passphrase field. A wrong passphrase shakes the field and says so; Caps Lock shows a warning. Keys are read through the console keymap, so the layout set in `/etc/vconsole.conf` applies.
3. When the system switches from the initramfs to the installed system, Sushi keeps running and keeps the splash on screen.
4. When the graphics driver loads and replaces the firmware framebuffer, Sushi redraws on the new device as soon as the system has finished setting the device up. If a display arrangement was saved by the login screen, Sushi uses that mode, so the monitor only switches modes once.
5. When the login screen starts, Sushi fades the spinner out, leaves the logo on screen, and lets go of the display. The login screen's first frame shows the same logo before its own interface fades in.
6. Sushi then stays in the background holding the display open, so that when one session ends and the next begins (signing in, signing out), the last frame stays on screen instead of the kernel's text console taking over.
7. When the computer restarts or shuts down, Sushi takes the display back the moment the login screen or session lets go of it, clears the pointer and anything else they left on screen, and shows the logo and spinner until the computer turns off.

## Updates

Sushi understands the commands of Plymouth's `plymouth` tool, so anything that reports progress through Plymouth works with it unchanged: `dnf5 offline` and `dnf5 system-upgrade`, PackageKit's offline updates, and fwupd. While updates install, the spinner stays where it is and a few lines appear below it:

- "Installing updates", "Upgrading Fedora Linux" (the name comes from `/etc/os-release`), or "Updating firmware"
- a progress bar and "42% complete. Don't turn off your computer." once the updater reports progress
- the package being installed, such as "Upgrading firefox", when the updater says so in plain words

When the updater restarts the computer, the text fades out and the logo and spinner stay until the computer restarts.

Requests that need someone at the keyboard, like Plymouth password prompts, are declined; disk passphrases still go through Sushi's own prompt. `plymouth quit` returns to the text console, as it does with Plymouth, which is what the emergency and rescue shells rely on.

## Components

| Crate | Role |
|-------|------|
| `sushi-scene` | The scene every stage draws: firmware logo placement, spinner, passphrase field, text in Open Runde. Works without the standard library so SushiBoot shares it. |
| `sushi` | Display handling (DRM/KMS), console and keyboard, password requests, the control socket, Plymouth's client protocol |
| `sushid` | The splash itself |
| `sushictl` | Talks to `sushid` |
| `sushiboot` | An optional UEFI boot menu drawn with the same scene |
| `sushi-bootctl` | Installs SushiBoot on the EFI system partition |

`data/` holds the systemd units, the drop-ins for greetd, Plymouth's boot units and the console password agent, the dracut module, and the default configuration.

## Installing on Fedora

Sushi installs next to Plymouth. Both are in the initramfs, and the kernel command line decides which one runs, so Plymouth stays as a fallback until you're happy with Sushi. Keep the `plymouth` package installed either way: its `plymouth` tool is what updaters use to report progress, and Sushi answers it.

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

Sushi works with any display manager that starts its compositor after running `sushictl deactivate` and draws its first frame within a few seconds. For greetd, Sushi installs a drop-in that does exactly that, after waiting for the graphics driver to finish loading so the login screen never starts on a framebuffer that's about to disappear. Display managers Sushi doesn't know about are handled by `sushi-quit.service`, which closes the splash when the system has finished starting. While Sushi runs, Plymouth's own `plymouth-quit` units stay out of the way.

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
sushictl show updates  # take the display back and show the splash for boot-up, shutdown, updates, system-upgrade or firmware-upgrade
```

`sushictl update-root` is used by the initramfs while switching to the installed system, and `sushi-shutdown.service` runs `sushictl show shutdown` when the computer restarts or shuts down.

The `plymouth` tool works too, for example to preview the update screen:

```bash
sudo plymouth change-mode --updates
sudo plymouth system-update --progress=40
sudo plymouth display-message --text="Upgrading firefox"
```

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

The VM is a Fedora 45 system built with Podman, with greetd and Kestrel's login screen, booting through SushiBoot under QEMU and OVMF with SELinux enforcing. The firmware framebuffer starts the boot; the virtio GPU driver loads after the switch to the installed system and replaces it, the same way the NVIDIA driver does on real hardware. The VM's udev takes half a second to finish setting up each new display device, so programs that open the device too early run into SELinux the way they would on a slow machine. Nothing on the host is installed or changed, and no step needs `sudo`.

```bash
scripts/vm/tree.sh       # Fedora root tree (first run downloads packages)
scripts/vm/kestrel.sh    # build Kestrel into the tree
scripts/vm/disk.sh       # install Sushi, build the initramfs, root disk and ESP
scripts/vm/run.sh        # boot it in a window
```

Everything lives in `vm/`; set `SUSHI_VM` to another folder to keep a second machine next to it. `LUKS=1 scripts/vm/disk.sh` encrypts the root disk (the passphrase is `sushi-vm`, as is the password of the `sushi` account). `MENU_TIMEOUT=3` shows SushiBoot's menu.

`LAYOUT=fedora scripts/vm/disk.sh` builds the disk the way Fedora's installer does instead: one GPT disk with an EFI system partition holding Fedora's shim and GRUB, `/boot` on its own ext4 partition with the kernels and boot entries, and a btrfs root partition with `root` and `home` subvolumes. The firmware finds shim on its own and adds a Fedora entry on the first start, as on a fresh install. `KERNEL=7.2.7-300.fc45 scripts/vm/tree.sh` installs a specific kernel, which leaves room to test a kernel update later.

`run.sh` takes a few switches for the machine itself:

| Variable | Effect |
|----------|--------|
| `SECURE_BOOT=1` | OVMF with Secure Boot on and Microsoft's keys enrolled, so only signed boot loaders start |
| `TPM=2` | A software TPM 2.0 (swtpm) whose state stays in `tpm2/` next to the disk, like a TPM soldered to the board |
| `TPM=1.2` | An old TPM 1.2 instead |

`scripts/vm/record.py` boots the VM without a window, types at given times, answers prompts on the serial console, and saves every frame, which is how the hand-overs are checked frame by frame:

```bash
scripts/vm/record.py /tmp/frames --seconds 40 --type "16:sushi-vm"
scripts/vm/frames.py /tmp/frames        # when the screen went black, froze, or changed resolution
scripts/vm/journal.sh -b 0 -u sushi    # the VM's journal, read from its disk after it shuts down
```

To watch an offline update, stage one in the VM's root tree, rebuild the disk, and start it from the serial console:

```bash
scripts/vm/update.sh
scripts/vm/disk.sh
scripts/vm/record.py /tmp/frames --seconds 60 \
  --serial "login: =>root" --serial "Password: =>sushi-vm" --serial "]# =>dnf5 offline reboot -y"
```

## License

MIT
