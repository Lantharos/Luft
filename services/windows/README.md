# luft-windows

The system service that looks after a Windows installation on the same computer, built on the [luft-windows crate](../../packages/system/windows).

`luft-windows` (`com.lantharos.Windows1`, see `data/com.lantharos.Windows1.xml`) is started over D-Bus and stops when idle. It also runs once at startup (`luft-windows boot`) and once in the session (`luft-windows notice`).

| File in `data` | Goes to |
| --- | --- |
| `com.lantharos.Windows1.conf` | `/usr/share/dbus-1/system.d/` |
| `com.lantharos.Windows1.service` | `/usr/share/dbus-1/system-services/` |
| `luft-windows.service`, `luft-windows-boot.service` | `/usr/lib/systemd/system/` |
| `luft-windows-notice.service` | `/usr/lib/systemd/user/` |
| `com.lantharos.windows.policy` | `/usr/share/polkit-1/actions/` |

`vm/run.sh` checks the service in a VM made from `localhost/luft:45` (built by `os/image/build.sh`): it makes a Windows drive with Fast Startup on and two paired devices, turns Fast Startup off, sets the clock, brings the devices to BlueZ, then hibernates that Windows and checks that it's left alone and that the sound codec is reset. It needs Podman and QEMU with KVM; everything lives in `target/vm`.
