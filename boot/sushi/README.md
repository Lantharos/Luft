# Sushi

Sushi is Luft's boot splash and replaces Plymouth. It keeps the firmware logo on screen from power-on to the login screen, asks for the disk passphrase, shows update progress, and brings the logo back at shutdown, without the screen going black or showing text in between.

SushiBoot, in the same folder, is the UEFI boot menu Luft starts through.

## Features

- Draws the firmware logo exactly where the firmware left it, with a spinner below
- Unlocks encrypted disks: nothing to type when the TPM unlocks, otherwise a PIN, passphrase or recovery key prompt that says why it is asking
- Follows the graphics driver taking over and sets the saved display mode, so the monitor never switches modes again at the login screen
- Loads NVIDIA's driver itself while the splash shows, so the monitor goes dark only once per boot
- Corrects for firmware that hands over a stretched, lower-resolution framebuffer
- Holds the display between sessions, so signing in and out never shows the text console
- Answers Plymouth's `plymouth` tool, so `dnf5 offline`, `dnf5 system-upgrade`, PackageKit and fwupd show progress unchanged
- Shows notices before the login screen, such as the Secure Boot key enrollment steps

## Crates

| Crate | Role |
| --- | --- |
| `sushi-scene` | The scene every stage draws (logo, spinner, prompts, text). `no_std`, shared with SushiBoot |
| `sushi` | DRM/KMS, console and keyboard, password requests, control socket, Plymouth protocol |
| `sushid` | The splash |
| `sushictl` | Controls `sushid` |
| `sushiboot` | The boot menu |

`data/` holds the systemd units, drop-ins for greetd and Plymouth's units, the dracut module, the driver list and the default configuration.

## Install

Sushi installs next to Plymouth, and the kernel command line picks which one runs. Keep the `plymouth` package installed: updaters use its tool to report progress.

```sh
boot/sushi/scripts/install.sh install   # build, install, rebuild the initramfs and signed images
boot/sushi/scripts/install.sh try       # use Sushi for the next boot only
boot/sushi/scripts/install.sh enable    # use Sushi on every boot
boot/sushi/scripts/install.sh disable   # go back to Plymouth
boot/sushi/scripts/install.sh remove    # uninstall
```

The script needs `sudo` and Luft's signed startup: the command line lives inside the signed kernel images and is changed through `trustctl startup arguments` (see [security](../../security/README.md)).

`try` and `enable` add these kernel arguments:

| Argument | Why |
| --- | --- |
| `sushi` | Turns Sushi on |
| `plymouth.enable=0` | Keeps Plymouth from starting too |
| `quiet loglevel=3` | Only critical kernel messages |
| `systemd.show_status=false` | No service status lines (also applies in the initramfs) |
| `rd.udev.log_level=3 udev.log_level=3` | Quiet device setup |
| `vt.global_cursor_default=0` | No console cursor |
| `fbcon=vc:0-5` | The text console stays off the seventh terminal, where the login screen runs |

Keep the firmware's own boot menu hidden so nothing draws between the firmware logo and Sushi.

## Configuration

| Setting | Default | Purpose |
| --- | --- | --- |
| `monitors` in `/etc/sushi/sushi.conf` | `/var/lib/kestrel-greeter/display/monitors.xml` | Display arrangement to start in. Kestrel keeps it up to date, and the initramfs carries a copy |
| `/usr/lib/modprobe.d/sushi.conf` | NVIDIA's display driver | Drivers Sushi loads itself (`blacklist` lines keep udev from loading them). A file with the same name in `/etc/modprobe.d` replaces it |

- `sushi-drivers.service` loads those drivers when Sushi isn't running, after 20 seconds at most.
- With NVIDIA, keep `nvidia-drm.fbdev=1` (the default with current drivers).
- Any display manager works if it runs `sushictl deactivate` before starting its compositor. Sushi ships a drop-in for greetd; others are covered by `sushi-quit.service`.
- greetd should run on the seventh virtual terminal (`vt = 7`), as Kestrel's `greetd.toml` does.

## sushictl

| Command | Does |
| --- | --- |
| `sushictl status` | Shows whether the splash is showing, handing over or holding the display |
| `sushictl deactivate` | Fades the spinner out and hands the display to the next program |
| `sushictl quit` | Closes the splash and returns to the text console (so does `plymouth quit`) |
| `sushictl show MODE` | Takes the display back: `boot-up`, `shutdown`, `updates`, `system-upgrade`, `firmware-upgrade` or `encrypting` |
| `sushictl load-drivers` | Loads the drivers Sushi takes over |
| `sushictl notice key-enrollment CODE [--again]` | Explains shim's key enrollment screen at the next restart |
| `sushictl notice show FILE` | Shows a notice and waits until it is dismissed, printing the key that dismissed it |
| `sushictl notice clear` | Withdraws a pending notice |

A notice file has one field per line:

| Field | Meaning |
| --- | --- |
| `title` | Heading |
| `line` | A paragraph (repeatable) |
| `step` | A numbered step (repeatable) |
| `footer` | Text at the bottom; `{seconds}` counts down |
| `countdown` | Seconds until it closes by itself |
| `key` | A letter that dismisses it besides Enter |

`journalctl -u sushi` shows which display Sushi used and when it handed over. To preview the update screen:

```sh
sudo plymouth change-mode --updates
sudo plymouth system-update --progress=40
sudo plymouth display-message --text="Upgrading firefox"
```

## SushiBoot

SushiBoot reads unified kernel images and [Boot Loader Specification](https://uapi-group.org/specifications/specs/boot_loader_specification/) entries from every EFI system partition, finds Windows and other systems, and draws its menu under the firmware logo. Holding any key while it starts shows the menu.

- Menu: the newest image of each system, its titled profiles (such as Rescue), Previous versions, BLS entries, other systems, and Firmware settings.
- `loader/loader.conf` takes `timeout` and `default`. `default` accepts patterns such as `luft-*`.
- Entry IDs match systemd-boot's, such as `luft-7.2.8-300.fc45.x86_64.efi@rescue`, and the Boot Loader Interface variables are supported, so `bootctl status`, `bootctl list` and `bootctl set-oneshot ID` work.
- Boot counting uses systemd-boot's file names (`luft-VERSION+3.efi`). An image with no tries left moves to Previous versions.
- It switches to the monitor's own resolution before Linux starts.
- With Secure Boot on, it must be signed (it carries an SBAT section), passes nothing to what it starts but a profile number, has no command line editor, and skips entries that start a kernel directly.

How SushiBoot, the signed images and the TPM fit together, and what to do when a kernel doesn't start, is in [docs/boot.md](../../docs/boot.md).

## Development

```sh
make build   # release build, including SushiBoot
make check   # rustfmt, clippy for Linux and UEFI, tests
```

The Fedora VM used to test boots, hand-overs and updates is described in [docs/testing.md](../../docs/testing.md#boot-vm).

## License

MIT
