# Sushi

Sushi is Luft's boot splash, in place of Plymouth. It keeps the firmware logo on screen from power-on to the login screen, asks for the disk passphrase when the TPM can't unlock it, shows update progress, and brings the logo back at shutdown, without the screen going black or showing text in between. SushiBoot, in the same folder, is the UEFI boot menu Luft starts through.

How shim, SushiBoot, the signed startup images and the TPM fit together is in [docs/boot.md](../docs/boot.md).

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

The VM used to test boots and hand-overs is described in [docs/testing.md](../docs/testing.md#boot-vm).

Its configuration, `sushictl` and SushiBoot's menu and entries are in [the Sushi reference](../docs/components/sushi.md).

## License

GPL-3.0-or-later
