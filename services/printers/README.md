# luft-printers

The system side of printing: it sets up printers plugged in by USB and lets Settings add, change and remove printers. How printing fits together is in [printing](../../docs/printing.md).

| Command | Use |
| --- | --- |
| `luft-printers` | `com.lantharos.Printers1` (see `data/com.lantharos.Printers1.xml`), started over D-Bus; stops when idle. Changes need `com.lantharos.printers.manage` |
| `luft-printers usb` | Run by `luft-printer-setup.service` when the printer interface of a USB printer without IPP over USB appears: gives each one without a queue the driver made for its model |

| File in `data` | Goes to |
| --- | --- |
| `com.lantharos.Printers1.conf` | `/usr/share/dbus-1/system.d/` |
| `com.lantharos.Printers1.service` | `/usr/share/dbus-1/system-services/` |
| `luft-printers.service`, `luft-printer-setup.service` | `/usr/lib/systemd/system/` |
| `60-luft-printers.rules` | `/usr/lib/udev/rules.d/` |
| `com.lantharos.printers.policy` | `/usr/share/polkit-1/actions/` |

`cargo test` here covers queue names. `vm/run.sh` boots a VM made from `localhost/luft:45` (or `LUFT_IMAGE`) with SELinux enforcing, this checkout's services and `kestrel-settings`, a printer from `ippeveprinter` on a dummy network and a Canon MX490 made with FunctionFS on `dummy_hcd`, and checks that both set themselves up and print. It needs Podman and QEMU with KVM.
