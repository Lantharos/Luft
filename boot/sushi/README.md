# Sushi

Sushi is Luft's boot splash, in place of Plymouth. It keeps the firmware logo on screen from power-on to the login screen, asks for the disk passphrase when the TPM can't unlock it, shows update progress, and brings the logo back at shutdown, without the screen going black or showing text in between. SushiBoot, in the same folder, is the UEFI boot menu Luft starts through.

How shim, SushiBoot, the signed startup images and the TPM fit together is in [docs/boot.md](../../docs/boot.md).

| Crate | Role |
| --- | --- |
| `sushi-scene` | The scene every stage draws (logo, spinner, prompts, text). `no_std`, shared with SushiBoot |
| `sushi` | DRM/KMS, console and keyboard, password requests, control socket, Plymouth protocol |
| `sushid` | The splash |
| `sushictl` | Controls `sushid` |
| `sushiboot` | The boot menu |

`data/` holds the systemd units, the dracut module, the driver list and the default configuration.

## Build

```sh
make build   # release build, including SushiBoot
make check   # rustfmt, clippy for Linux and UEFI, tests
```

The VM used to test boots, hand-overs and updates is described in [docs/testing.md](../../docs/testing.md#boot-vm).

## Install on Fedora

The Luft image carries Sushi. On a regular Fedora install it goes next to Plymouth:

```sh
boot/sushi/scripts/install.sh install   # build, install and rebuild the initramfs
boot/sushi/scripts/install.sh enable    # use Sushi on every boot
boot/sushi/scripts/install.sh disable   # go back to Plymouth
boot/sushi/scripts/install.sh remove    # uninstall
```

Keep the `plymouth` package installed: updaters such as `dnf5 offline`, PackageKit and fwupd report progress through its tool, and Sushi answers it. `enable` adds the `sushi` kernel argument along with the ones that keep the kernel, systemd and the console quiet.

- Display managers other than greetd need to run `sushictl deactivate` before starting their compositor, or rely on `sushi-quit.service`.
- greetd should run on the seventh virtual terminal (`vt = 7`), as Kestrel's `greetd.toml` does.
- With NVIDIA, keep `nvidia-drm.fbdev=1`, the default with current drivers.

## Configuration

| Setting | Default | Purpose |
| --- | --- | --- |
| `monitors` in `/etc/sushi/sushi.conf` | `/var/lib/kestrel-greeter/display/monitors.xml` | Display arrangement to start in, kept up to date by Kestrel |
| `/usr/lib/modprobe.d/sushi.conf` | NVIDIA's display driver | Drivers Sushi loads itself; a file with the same name in `/etc/modprobe.d` replaces it |

## sushictl

| Command | Does |
| --- | --- |
| `sushictl status` | Whether the splash is showing, handing over or holding the display |
| `sushictl deactivate` | Fades the spinner out and hands the display to the next program, keeping the last frame on screen |
| `sushictl quit` | Closes the splash and returns to the text console |
| `sushictl update-root ROOT` | Moves the splash into another root file system, as `sushi-switch-root.service` does with `/sysroot` when the initramfs hands over to the installed system |
| `sushictl show MODE` | Takes the display back: `boot-up`, `shutdown` (or `reboot`), `updates`, `system-upgrade`, `firmware-upgrade` or `encrypting` |
| `sushictl load-drivers` | Loads the drivers Sushi takes over |
| `sushictl notice key-enrollment CODE [--again]` | Explains shim's key enrollment screen at the next restart |
| `sushictl notice show FILE` | Shows a notice and waits until it's dismissed |
| `sushictl notice clear` | Withdraws a pending notice |

A notice file has one field per line: `title`, `line` and `step` (both repeatable), `footer` (where `{seconds}` counts down), `countdown` and `key`, a letter that dismisses it besides Enter.

`journalctl -u sushi` shows which display Sushi used and when it handed over. To preview the update screen:

```sh
sudo plymouth change-mode --updates
sudo plymouth system-update --progress=40
sudo plymouth display-message --text="Upgrading firefox"
```

## SushiBoot

SushiBoot reads unified kernel images and [Boot Loader Specification](https://uapi-group.org/specifications/specs/boot_loader_specification/) entries, finds Windows and other systems, and draws its menu under the firmware logo. Holding any key while it starts shows the menu.

- Startup images listed by BLS entries, such as the ones bootc writes for each version of Luft, show the newest and keep the others under Previous versions.
- `loader/loader.conf` takes `timeout` and `default`, which accepts patterns such as `luft-*`.
- Entry IDs and the Boot Loader Interface match systemd-boot's, so `bootctl status`, `bootctl list` and `bootctl set-oneshot ID` work.
- A new version gets three tries before SushiBoot goes back to the one that last worked ([details](../../docs/boot.md#when-an-update-doesnt-start)).
- With Secure Boot on it must be signed, has no command line editor, and skips entries that start a kernel directly. It measures what it starts into the TPM like systemd-boot.

## License

MIT
