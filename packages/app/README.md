# luft-app

The native side every Luft app starts from, on top of Sabine: a frameless glass window with a blurred sidebar, single-instance activation, Kestrel's palette and the desktop's fonts, D-Bus connections, typed bridge commands and the desktop portals.

## Setup

Add it to an app's `desktop/Cargo.toml` by path, with the features the app needs:

```toml
luft-app = { path = "../../../packages/app", features = ["apps", "thumbnails"] }
```

```rust
use luft_app::{Events, GlassWindow};

const WINDOW: GlassWindow = GlassWindow {
    title: "Settings",
    size: (1040, 720),
    min_size: (760, 520),
    sidebar_width: 280,
    single_instance: Some("com.lantharos.settings"),
};

pub fn run_app() -> ! {
    let events = Events::default();
    luft_app::run(&events, |window| register(WINDOW.apply(window), &events), |_| {})
}
```

- `sidebar_width` must match the page's `--sidebar-width`.
- With `single_instance` set, launching the app again focuses the running window and sends the new arguments as a `singleInstance.activate` event.
- `apply_with_page_close` instead of `apply` hands the close button to the page, so `WindowControls`' `onclose` decides when to close.
- `run` connects `Events` to the page and watches Kestrel's palette and the desktop's fonts. The last closure runs at the same point, for the app's own watchers.

Flatten `Appearance` into the app's startup state so the page gets the palette and fonts. `@luft/ui`'s `appearance` store reads it, and follows the `kestrel.palette` and `appearance.typography` events after that:

```rust
#[derive(Serialize)]
struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
}

AppState { appearance: Appearance::current() }
```

Bridge commands go through the `Commands` trait on `SabineWindow`, for handlers that return `Result<T, String>`:

```rust
window
    .command("about_info", |_: Value| info())
    .with("network_open", &events, open)
```

`command` takes a function of the request; `with` also passes a shared context such as `Events` or the app's state.

## Exports

| Item | Use |
| --- | --- |
| `GlassWindow` | Window size, sidebar width and single-instance id; `apply` and `apply_with_page_close` |
| `run` | Starts the app and the palette and font watchers |
| `Events` | `emit` sends a JSON event to the page, `emit_bytes` sends raw bytes that arrive as a `Uint8Array` |
| `Appearance` | Kestrel's palette and the desktop's fonts and text size, for the startup state |
| `Commands` | `command` and `with` for typed bridge commands |
| `dbus` | `session()` and `system()` return cached blocking zbus connections, `at(address)` connects to any other bus |
| `dbus::objects` | `Objects` reads `ObjectManager` trees; `settle` debounces bursts of change signals |
| `portal` | `open_file` and `open_files` show the file chooser and return `file://` URIs; `FileChooser` for saving, folders and several filters; `path_uri` and `uri_path` convert between paths and URIs |
| `file_manager` | `show_in_folder(path)` opens the folder with the file selected, `show_folder(path)` opens the folder itself |
| `secrets` | `store`, `load`, `delete` and `names` for the app's own secrets in Luft Keyring; `register(window)` adds the `secrets_store`, `secrets_load` and `secrets_delete` bridge commands |

## Features

| Feature | Module | Use |
| --- | --- | --- |
| `apps` | `apps` | `App` with an installed app's id, name and icon path; `icon_path` and `sort_by_name` |
| `fonts` | `fonts` | `installed()` lists every font face; `user_folder`, `belongs_to_user`, `refresh` and `remove` manage the user's own fonts; `is_monospaced` and `has_fixed_advances`; `use_family`, `reset` and `defaults` set the desktop's system or monospace font |
| `ibus` | `ibus` | `address()` finds the session's IBus daemon, to connect to with `dbus::at` |
| `recovery` | `recovery` | `Sheet` saves or prints a recovery key; `computer()` names this computer |
| `thumbnails` | `thumbnails` | `Thumbnails` makes thumbnails in the shared freedesktop cache and sends them to the page in batches |

## Examples

```rust
use luft_app::portal::{self, Filter};

let chosen = portal::open_file("Open", Filter { name: "Images", patterns: vec!["*.png".into()] })?;
```

```rust
use luft_app::secrets;

secrets::store("account-token", token.as_bytes())?;
let token: Option<Vec<u8>> = secrets::load("account-token")?;
secrets::delete("account-token")?;
```

Secrets are only readable by the app that stored them, without prompts.

```rust
let thumbnails = Thumbnails::new(events.clone(), "my-app.thumbnails");
thumbnails.request(paths, ThumbnailSize::Large);
```

Each `request` replaces the previous one, so asking for the files on screen keeps the queue short while scrolling. Batches arrive under the given event name as `{ items }`, each item with the file's `path`, its `thumbnail` path or `null`, and its `modified` time.
