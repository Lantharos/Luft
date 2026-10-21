# luft-accounts

The session service behind online accounts and their cloud drives. Apps talk to it through the [luft-accounts crate](../../packages/system/accounts).

`luft-accounts` owns `com.lantharos.Accounts1` (see `data/com.lantharos.Accounts1.xml`). It starts at login, runs one `rclone rcd` and mounts every account with rclone's VFS cache, so files download when opened. Folders and files kept on the device live in `~/.local/share/luft-accounts/kept` and sync both ways with `rclone bisync`. Background syncing pauses on metered connections and below 20% battery, and drives reconnect after sleep and network changes.

| File in `data` | Goes to |
| --- | --- |
| `com.lantharos.Accounts1.service` | `/usr/share/dbus-1/services/` |
| `luft-accounts.service` | `/usr/lib/systemd/user/` |

It needs `rclone` 1.75.2 or newer and `fusermount3`. OneDrive and Dropbox sign in with rclone's own app registrations unless Luft's are built in; see [cloud drives](../../../docs/cloud.md#app-registrations).

`cargo test` here covers token handling, filters, conflict names and error messages. [docs/cloud.md](../../../docs/cloud.md#testing) has the end-to-end checks.
