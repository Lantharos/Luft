# Sushi

Sushi ([`sushi`](../../sushi)) is Luft's boot splash, and SushiBoot the UEFI boot menu Luft starts through. Building and installing them is in [the folder's README](../../sushi/README.md), and how they fit into the boot chain in [Boot](../boot.md).

## Configuration

| Setting | Default | Purpose |
| --- | --- | --- |
| `monitors` in `/etc/sushi/sushi.conf` | `/var/lib/kestrel-greeter/display/monitors.xml` | Display arrangement to start in, that of whoever signed in last |
| `/usr/lib/modprobe.d/sushi.conf` | NVIDIA's display driver | Drivers Sushi loads itself; a file with the same name in `/etc/modprobe.d` replaces it |

Each screen starts in the mode from that arrangement, or else in its preferred mode. On HDMI, a mode faster than 340 MHz needs the monitor to turn on scrambling, which some monitors miss straight out of standby and stay black. So the splash uses the fastest mode of the same size that doesn't need it, and the desktop switches to the faster mode once the monitor is awake.

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
| `sushictl failure` | Says why the computer couldn't start and offers what can be done, in place of the emergency and rescue shells ([details](../boot.md#when-luft-cant-start)) |

A notice file has one field per line: `title`, `line` and `step` (both repeatable), `footer` (where `{seconds}` counts down), `countdown` and `key`, a letter that dismisses it besides Enter.

`journalctl -u sushi` shows which display Sushi used and when it handed over. To preview the update screen:

```sh
sudo plymouth change-mode --updates
sudo plymouth system-update --progress=40
sudo plymouth display-message --text="Upgrading firefox"
```

## SushiBoot

SushiBoot reads unified kernel images and [Boot Loader Specification](https://uapi-group.org/specifications/specs/boot_loader_specification/) entries, finds Windows and other systems, and draws its menu under the firmware logo. With another system on the computer the menu shows itself for 10 seconds, starting the system started last when nobody picks one; otherwise it stays hidden, and holding any key while it starts shows it.

- Startup images listed by BLS entries, such as the ones bootc writes for each version of Luft, show the newest and keep the others under Previous versions, each named by its operating system and version, such as Luft Alizé 1.2 Nightly 21. The version is the startup image's `IMAGE_VERSION`, or else the entry's `version`, where bootc writes the image's version for Luft.
- `loader/loader.conf` takes `timeout` and `default`, which accepts patterns such as `luft-*`. `timeout 0` hides the menu even next to another system, and any other number shows it for that many seconds even without one. trustd adds a comment saying so the first time it updates the boot files, and removes the `timeout 0` it used to write.
- The other system started last is kept in `LuftBootLast` (vendor `b6a4c1e2-3f5d-4c8a-9e71-2d0f6a8b5c3e`), written only when it changes, and starting Luft clears it, so Luft always means its newest version. A one-shot entry or a default set with `bootctl` comes first.
- Windows isn't started from SushiBoot: BitLocker checks with the TPM that the firmware started Windows' boot manager itself, and asks for its recovery key otherwise. SushiBoot sets `BootNext` to the firmware's entry for that file on that partition and restarts, like systemd-boot's `reboot-for-bitlocker`, and only starts it directly when the firmware has no such entry.
- Entry IDs and the Boot Loader Interface match systemd-boot's, so `bootctl status`, `bootctl list` and `bootctl set-oneshot ID` work.
- Boot counting works like systemd-boot's: an entry named `…+LEFT-DONE.conf` is renamed with one try fewer each time it starts, `LoaderBootCountPath` names it for `systemd-bless-boot`, and an entry with no tries left goes after the others, so a new version that never reaches the login screen goes back to the version before ([details](../boot.md#when-an-update-doesnt-start)).
- With Secure Boot on it must be signed, has no command line editor, and skips entries that start a kernel directly. It measures what it starts into the TPM like systemd-boot.
