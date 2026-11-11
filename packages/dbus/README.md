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
| `environment::yours` | Your environment as your systemd keeps it, for the programs a Luft app starts for you |
| `power::on_battery` | Whether the computer runs on its battery, as UPower sees it |
| `polkit::authorize` | Lets a call go on only when polkit allows its caller the action, asking for a password when the caller allows it |
| `polkit::is_authorized_to`, `polkit::Details` | The same check with a prompt that names what is about to change, and values for polkit rules |
| `errors!`, `error::kind` | A service's named errors, and reading their kind in an app; see [Errors from Luft's services](../../docs/dbus-errors.md) |
| `idle::serve`, `idle::until_idle` | Run a service started on demand until it has had nothing to do for half a minute (feature `service`) |
| `power::saving_battery` | Whether heavy background work should wait for the charger |
| `error_name`, `error_message`, `explain` | Read a D-Bus error reply, standard or not |

Every call is async. Apps run them on Sabine's runtime, through async bridge commands or `luft_app::spawn`.

`macros` holds `luft-dbus-macros`, whose `#[introspect]` goes above every zbus `#[interface]` and `#[proxy]` and keeps what each one exports or calls in `introspection`. See [D-Bus interfaces](../../docs/testing.md#d-bus-interfaces).
