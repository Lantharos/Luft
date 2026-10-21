# App shell

`luft-app` ([packages/app](../../packages/app)) is the native side every Luft app starts from, on top of Sabine: a frameless glass window with a blurred sidebar, single-instance activation, Kestrel's palette and the desktop's fonts, D-Bus connections, typed bridge commands and the desktop portals.

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

Flatten `Appearance` into the app's startup state so the page gets the palette, fonts, motion preference and the session's languages. `@luft/ui`'s `appearance` store reads it, and follows the `kestrel.palette`, `appearance.typography` and `appearance.motion` events after that:

```rust
#[derive(Serialize)]
struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
}

AppState { appearance: Appearance::current().await }
```

Bridge commands go through the `Commands` trait on `SabineWindow`, for handlers that return `Result<T, String>`:

```rust
window
    .command("about_info", |_: Value| info())
    .with("network_open", &events, open)
    .command_async("disks_list", list)
```

`command` takes a function of the request; `with` also passes a shared context such as `Events` or the app's state. `command_async` and `with_async` take async functions, awaited on Sabine's runtime; anything that waits on D-Bus belongs there. `spawn` runs background work on the same runtime, and `block_on` waits on it from a thread of the app's own, such as a long job.

## Exports

| Item | Use |
| --- | --- |
| `GlassWindow` | Window size, sidebar width and single-instance id; `apply` and `apply_with_page_close` |
| `run` | Starts the app and the palette and font watchers |
| `Events` | `emit` sends a JSON event to the page, `emit_bytes` sends raw bytes that arrive as a `Uint8Array` |
| `Appearance` | Kestrel's palette, the desktop's fonts and text size, and the languages and formats locale the app should use, for the startup state |
| `i18n` | [luft-i18n](../../packages/i18n): the `localizer!` and `t!` macros for the app's own translated messages |
| `Commands` | `command`, `with`, `command_async` and `with_async` for typed bridge commands |
| `spawn`, `block_on` | Run or wait for async work on Sabine's runtime |
| `dbus` | [luft-dbus](../../packages/dbus): async `session()` and `system()` connections, `at(address)` connects to any other bus |
| `dbus::objects` | `Objects` reads `ObjectManager` trees; `signals` and `settle` follow their changes |
| `portal` | `open_file` and `open_files` show the file chooser and return `file://` URIs; `FileChooser` for saving, folders and several filters; `path_uri` and `uri_path` convert between paths and URIs |
| `file_manager` | `show_in_folder(path, token)` opens the folder with the file selected, `show_folder(path, token)` opens the folder itself |
| `launch` | `pass_token` gives a launched program the activation token a page got from `activationToken()` in `@luft/ui`, or clears the one the app was started with; `Token` takes a command's `token` alone |
| `secrets` | `store`, `load` and `delete` for the app's own secrets in Luft Keyring |
| `files` | `replace(path, bytes)` writes a file in one step, so readers never see it half written |

## Features

| Feature | Module | Use |
| --- | --- | --- |
| `apps` | `apps` | `App` with an installed app's id, name and icon path; `icon_path` and `sort_by_name` |
| `fonts` | `fonts` | `installed()` lists every font face; `user_folder`, `belongs_to_user`, `refresh` and `remove` manage the user's own fonts; `is_monospaced` and `has_fixed_advances`; `use_family`, `reset` and `defaults` set the desktop's system or monospace font |
| `ibus` | `ibus` | `address()` finds the session's IBus daemon, to connect to with `dbus::at` |
| `launch` | `launch::context` | A launch context that hands the page's activation token to the app it starts, so its window comes to the front |
| `recovery` | `recovery` | `Sheet` saves or prints a recovery key; `computer()` names this computer |
| `settings` | `settings` | `load` and `save` a JSON file in the user's configuration folder, such as `"tern/settings.json"` |
| `thumbnails` | `thumbnails` | `Thumbnails` makes thumbnails in the shared freedesktop cache and sends them to the page in batches |

## Examples

```rust
use luft_app::portal::{self, Filter};

let chosen = portal::open_file("Open", Filter { name: "Images", patterns: vec!["*.png".into()] }).await?;
```

```rust
use luft_app::secrets;

secrets::store("account-token", token.as_bytes()).await?;
let token: Option<Vec<u8>> = secrets::load("account-token").await?;
secrets::delete("account-token").await?;
```

Secrets are only readable by the app that stored them, without prompts.

```rust
let thumbnails = Thumbnails::new(events.clone(), "my-app.thumbnails");
thumbnails.request(paths, ThumbnailSize::Large);
```

Each `request` replaces the previous one, so asking for the files on screen keeps the queue short while scrolling. Batches arrive under the given event name as `{ items }`, each item with the file's `path`, its `thumbnail` path or `null`, and its `modified` time.

Files that need one of the system's thumbnailers from `/usr/share/thumbnailers` are handed to it inside a bubblewrap sandbox that sees only `/usr`, the file itself and a private folder for the result, with no network and no way to open new user namespaces. GStreamer keeps its plugin cache for these runs in `~/.cache/com.lantharos.thumbnailers`.
