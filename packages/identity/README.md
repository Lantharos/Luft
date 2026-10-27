# luft-identity

Who calls Luft's services, and what each app was allowed. Every service and app that decides something about its caller uses this crate, so they all follow the rules in [Who an app is](../../docs/security.md#who-an-app-is). Apps get it through `luft_app::identity`.

```toml
luft-identity.workspace = true
```

| Item | Use |
| --- | --- |
| `caller::of_sender`, `caller::of_process` | Who sent a message or runs a process: you, a sandboxed app by its app ID, or an unknown sandbox, counting apps with full access as you |
| `caller::sandboxed` | The same from the sandbox alone, before full access |
| `caller::refuse_sandboxed`, `caller::uid` | Turning away anything but you, and the caller's account |
| `sandbox-cases.ini` | How processes are judged, case by case, checked against this crate and Kestrel's compositor alike |
| `permissions` | The desktop portal's permission store: `lookup`, `answer`, `allowed`, `values`, `set`, `set_values`, `forget`, `remove`, `entries` and `changes`, with the tables Luft keeps there |
