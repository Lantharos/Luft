# luft-accounts

Online accounts for Luft. Each account signs in once, keeps its tokens and passwords in Luft Keyring and shows up as a cloud drive in `~/Cloud`. `service/` is `luft-accounts`, the session service behind it; this crate holds the shared types and an async client for apps.

```toml
luft-accounts = { path = "../../../packages/accounts" }
```

| Item | Use |
| --- | --- |
| `types` | Accounts, sign-in steps, drives, file states and conflicts, as they travel over D-Bus |
| `client` | `accounts`, `sign_in`, `answer`, `drives`, `states`, `keep`, `free`, `share_link`, `web_address` and the rest, over the session bus; `signals` streams the service's changes |

## The service

`luft-accounts` owns `com.lantharos.Accounts1` (see `service/data/com.lantharos.Accounts1.xml`). It starts at login, runs one `rclone rcd` and mounts every account with rclone's VFS cache, so files download when opened. Folders and files kept on the device live in `~/.local/share/luft-accounts/kept` and sync both ways with `rclone bisync`. Background syncing pauses on metered connections and below 20% battery, and drives reconnect after sleep and network changes.

| File in `service/data` | Goes to |
| --- | --- |
| `com.lantharos.Accounts1.service` | `/usr/share/dbus-1/services/` |
| `luft-accounts.service` | `/usr/lib/systemd/user/` |

It needs `rclone` 1.75.2 or newer and `fusermount3`. OneDrive and Dropbox sign in with rclone's own app registrations unless Luft's are built in; see [cloud drives](../../docs/cloud.md#app-registrations).

`cargo test` in `service` covers token handling, filters, conflict names and error messages. [docs/cloud.md](../../docs/cloud.md#testing) has the end-to-end checks.
