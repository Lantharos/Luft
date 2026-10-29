# luft-dbus

Async D-Bus helpers on zbus 6, shared by Luft's apps, Kestrel's services and the system services. Apps get it through `luft_app::dbus`; services that don't open windows depend on it directly.

```toml
luft-dbus.workspace = true
```

| Item | Use |
| --- | --- |
| `system()`, `session()` | Connections made once, on the Tokio runtime that first asks for them |
| `at(address)` | A connection to any other bus |
| `objects::Objects` | A snapshot of an `ObjectManager` tree; `signals` streams what a service sends and `settle` waits out a burst of them |
| `service::Service` | A system service's name, path and interface: `read` its properties, `change` calls a method allowing a password prompt, `changes` streams its property changes |
| `polkit::is_authorized` | Whether polkit lets a service's caller take an action, asking for a password when the caller allows it |
| `idle::Idle` | Holds a service up while calls are running, and tells it when it has been idle long enough to exit |
| `error_name`, `error_message`, `explain` | Read a D-Bus error reply, standard or not |

Every call is async. Apps run them on Sabine's runtime, through async bridge commands or `luft_app::spawn`.

`macros` holds `luft-dbus-macros`, whose `#[introspect]` goes above every zbus `#[interface]` and `#[proxy]` and keeps what each one exports or calls in `introspection`. See [D-Bus interfaces](../../docs/testing.md#d-bus-interfaces).
