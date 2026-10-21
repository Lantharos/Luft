# luft-windows

Reads a Windows installation on the same computer straight from its NTFS partition, and carefully changes the few settings that make sharing a computer with Luft smooth. The installer uses it while installing next to Windows; [`services/windows`](../../../services/windows) is `luft-windows`, the system service that looks after Windows afterwards.

```toml
luft-windows.workspace = true
```

| Module | Use |
| --- | --- |
| `Volume`, `Registry`, `System`, `Installation` | Files, registry values and facts about Windows (version, hibernation, Fast Startup, clock) without mounting anything |
| `change` | Turns Fast Startup off and keeps the clock in UTC in Windows' `SYSTEM` hive |
| `bluetooth` | Reads Bluetooth pairings from Windows and writes or updates them for BlueZ |
| `testing` | Building registry hives and NTFS images in tests (feature `testing`) |

## Changing Windows

`change::apply` only writes when Windows is fully shut down: not hibernated or fast-started, its drive clean and its registry saved without pending logs. It edits the hive in memory, checks that the result reads back, mounts the partition with ntfs3 in a mount namespace nobody else sees, keeps the old hive as `Windows\System32\config\SYSTEM.luft-backup`, rewrites only the pages that changed with the first page last, reads it back and restores the old one if anything differs.

## Testing

`cargo test` here covers the registry changes and Bluetooth pairings.
