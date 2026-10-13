# luft-dbus

Blocking D-Bus helpers shared by Luft's apps and system services. Apps get it through `luft_app::dbus`; services that don't open windows depend on it directly.

```toml
luft-dbus = { path = "../../../packages/dbus" }
```

| Item | Use |
| --- | --- |
| `system()`, `session()` | Cached blocking zbus connections |
| `at(address)` | A connection to any other bus |
| `objects::Objects` | A snapshot of an `ObjectManager` tree; `settle` debounces bursts of change signals |
| `service::Service` | A system service's name, path and interface: `read` its properties, `change` calls a method allowing a password prompt, `watch` follows property changes |
