# Kestrel

Kestrel is Luft's desktop and login screen. It runs on its own patched Mutter 51 and brings its own taskbar, Start, quick settings, notification center, lock screen, session manager, settings service and portal backend. What it does for people is in the [docs](https://docs.luft.computer/desktop/overview/).

<picture>
  <source media="(prefers-color-scheme: light)" srcset="../docs/screenshots/notification-center-light.png">
  <img src="../docs/screenshots/notification-center.png" alt="The notification center and calendar">
</picture>

| Folder | What it is |
| --- | --- |
| [`engine`](engine/README.md) | The native shell, started from GNOME Shell 51.0 |
| `ui` | Taskbar, Start, quick settings and every other surface, in TypeScript |
| [`compositor`](compositor/README.md) | Mutter patch series |
| `settings` | `kestrel-settings`: XSETTINGS, night light, power, printing, housekeeping, time zone |
| `search` | `kestrel-search`, the file index behind Start's search |
| `greeter` | `kestrel-greeter-service`, which stores the login screen's settings |
| [`keyring`](keyring/README.md) | Luft Keyring |
| [`passkeys`](passkeys/README.md) | Luft Passkeys |
| `openconnect` | `kestrel-openconnect`, OpenConnect VPN sign-in |
| `watchdog` | `kestrel-watchdog`, restarts cleanly when the GPU hangs |
| `peek` | `peek`, lets other programs see and use windows |
| `tools` | Development sessions, checks and the install script |

## Build and run

[Building Luft](https://docs.luft.computer/developers/building/) sets up the dependencies and builds Kestrel into `kestrel/build`. To try it in a window:

```sh
kestrel/tools/session.sh nested
```

`kestrel/tools/session.sh capture` runs every check headless and saves a screenshot of every surface. The other modes and options are in [docs/testing.md](../docs/testing.md).

To use a development build as your session on a regular Fedora install:

```sh
kestrel/tools/install.sh install     # into /opt/kestrel, with Luft Keyring, the login screen service and the watchdog
sudo cp /opt/kestrel/share/kestrel/greetd.toml /etc/greetd/config.toml
sudo systemctl disable gdm && sudo systemctl enable greetd
```

`kestrel/tools/install.sh remove` takes it out again. If the login screen doesn't appear after a restart, press Ctrl+Alt+F3, sign in, and check `journalctl -b -u greetd`.

Its session services, settings schemas and `peek`, which lets programs see and use windows, are in [the Kestrel reference](../docs/components/kestrel.md).
