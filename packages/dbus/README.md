# luft-dbus

Async D-Bus helpers on zbus 6, shared by Luft's apps and system services. Apps get it through `luft_app::dbus`; services that don't open windows depend on it directly.

```toml
luft-dbus = { path = "../../../packages/dbus" }
```

| Item | Use |
| --- | --- |
| `system()`, `session()` | Connections made once, on the Tokio runtime that first asks for them |
| `at(address)` | A connection to any other bus |
| `objects::Objects` | A snapshot of an `ObjectManager` tree; `signals` streams what a service sends and `settle` waits out a burst of them |
| `service::Service` | A system service's name, path and interface: `read` its properties, `change` calls a method allowing a password prompt, `changes` streams its property changes |
| `error_name`, `error_message`, `explain` | Read a D-Bus error reply, standard or not |

Every call is async. Apps run them on Sabine's runtime, through async bridge commands or `luft_app::spawn`.
