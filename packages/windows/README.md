# luft-windows

Reads a Windows installation on the same computer straight from its NTFS partition, and carefully changes the few settings that make sharing a computer with Luft smooth. The installer uses it while installing next to Windows; `service/` is `luft-windows`, the system service that looks after Windows afterwards.

```toml
luft-windows = { path = "../../../packages/windows" }
```

| Module | Use |
| --- | --- |
| `Volume`, `Registry`, `System`, `Installation` | Files, registry values and facts about Windows (version, hibernation, Fast Startup, clock) without mounting anything |
| `change` | Turns Fast Startup off and keeps the clock in UTC in Windows' `SYSTEM` hive |
| `bluetooth` | Reads Bluetooth pairings from Windows and writes or updates them for BlueZ |
| `testing` | Building registry hives and NTFS images in tests (feature `testing`) |

## Changing Windows

`change::apply` only writes when Windows is fully shut down: not hibernated or fast-started, its drive clean and its registry saved without pending logs. It edits the hive in memory, checks that the result reads back, mounts the partition with ntfs3 in a mount namespace nobody else sees, keeps the old hive as `Windows\System32\config\SYSTEM.luft-backup`, rewrites only the pages that changed with the first page last, reads it back and restores the old one if anything differs.

## The service

`luft-windows` (`com.lantharos.Windows1`, see `service/data/com.lantharos.Windows1.xml`) is started over D-Bus and stops when idle. It also runs once at startup (`luft-windows boot`) and once in the session (`luft-windows notice`).

| File in `service/data` | Goes to |
| --- | --- |
| `com.lantharos.Windows1.conf` | `/usr/share/dbus-1/system.d/` |
| `com.lantharos.Windows1.service` | `/usr/share/dbus-1/system-services/` |
| `luft-windows.service`, `luft-windows-boot.service` | `/usr/lib/systemd/system/` |
| `luft-windows-notice.service` | `/usr/lib/systemd/user/` |
| `com.lantharos.windows.policy` | `/usr/share/polkit-1/actions/` |

`cargo test` here covers the registry changes and Bluetooth pairings. `vm/run.sh` checks the service in a VM made from `localhost/luft:45` (built by `os/image/build.sh`): it makes a Windows drive with Fast Startup on and two paired devices, turns Fast Startup off, sets the clock, brings the devices to BlueZ, then hibernates that Windows and checks that it's left alone and that the sound codec is reset. It needs Podman and QEMU with KVM; everything lives in `target/vm`.
