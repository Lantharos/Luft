# luft-accounts

Online accounts for Luft. Each account signs in once, keeps its tokens and passwords in Luft Keyring and shows up as a cloud drive in `~/Cloud`. [`services/accounts`](../../../services/accounts) is `luft-accounts`, the session service behind it; this crate holds the shared types and an async client for apps.

```toml
luft-accounts.workspace = true
```

| Item | Use |
| --- | --- |
| `types` | Accounts, sign-in steps, drives, file states and conflicts, as they travel over D-Bus |
| `client` | `accounts`, `sign_in`, `answer`, `drives`, `states`, `keep`, `free`, `share_link`, `web_address` and the rest, over the session bus; `signals` streams the service's changes |
