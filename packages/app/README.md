# luft-app

The native side every Luft app starts from: a frameless glass window with a blurred sidebar, single-instance activation, Kestrel's wallpaper palette, D-Bus connections and typed bridge commands on top of Sabine.

Add it to an app's `desktop/Cargo.toml` by path:

```toml
luft-app = { path = "../../../packages/app" }
```

## Window

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

`GlassWindow::apply` makes the window frameless and translucent, blurs the sidebar (`sidebar_width` must match the web side's `--sidebar-width`), keeps the content opaque, rounds the input region and places the minimize, maximize and close hit areas where `WindowControls` draws them. With `single_instance` set, launching the app again focuses the running window and sends the new arguments as a `singleInstance.activate` event.

The close button normally closes the window straight away. Apps that need to finish something first, such as writing unsaved work somewhere safe, use `apply_with_page_close` instead: the page's close button then receives the click, and `WindowControls`' `onclose` decides when to close.

`luft_app::run` starts the app, connects `Events` to the page once it exists, and starts watching Kestrel's wallpaper palette and the desktop's fonts. The last closure runs at the same point, for any other watchers the app needs.

`Events::emit` sends a JSON event to the page and `Events::emit_bytes` sends raw bytes, which the page receives as a `Uint8Array`. Use bytes for large or frequent updates that would be wasteful as JSON.

## Startup state

Flatten `Appearance` into the app's startup state so the page knows which accent, colors and fonts to use:

```rust
#[derive(Serialize)]
struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
}

AppState { appearance: Appearance::current() }
```

`Appearance` also carries Kestrel's palette as `palette`: the accent, the accent the wallpaper gives on its own, whether Pure black is on, the palette roles and the terminal colors of both styles, and the app icon style with its colors and the folder of app glyphs. It carries the desktop's fonts too, as `typography`: the families of the `org.gnome.desktop.interface` `font-name` and `monospace-font-name` settings and the `text-scaling-factor`, read through the same portal. Palette changes arrive on the page as `kestrel.palette` events and font or text size changes as `appearance.typography` events, which `@luft/ui`'s `appearance` store listens for. The light or dark style comes from Sabine, which the store asks directly.

## Commands

`Commands` adds two helpers to `SabineWindow` for handlers that return `Result<T, String>`:

```rust
window
    .command("about_info", |_: Value| info())
    .with("network_open", &events, open)
```

`command` takes a plain function of the request; `with` also passes a shared context such as `Events` or the app's own state.

## D-Bus

`dbus::session()` and `dbus::system()` return cached blocking zbus connections, and `dbus::at(address)` opens a new one to any other bus, such as IBus's. They run on a dedicated Tokio runtime with one worker thread, because bridge handlers aren't called from inside a runtime and zbus needs one. `dbus::objects` reads `ObjectManager` trees and debounces bursts of change signals.

## File chooser

`portal::open_file` and `portal::open_files` show the desktop's file chooser through the `org.freedesktop.portal.FileChooser` portal and return the chosen `file://` URIs, or nothing when the chooser is closed:

```rust
use luft_app::portal::{self, Filter};

let chosen = portal::open_file("Open", Filter { name: "Images", patterns: vec!["*.png".into()] })?;
```

`portal::path_uri` turns a path into a `file://` URI, and `portal::uri_path` turns one back.

## Showing files

`file_manager::show_in_folder(path)` opens the file manager at the folder containing `path` with it selected, and `file_manager::show_folder(path)` opens the folder itself. Both go through the `org.freedesktop.FileManager1` D-Bus interface, so they work with whichever file manager the desktop uses.

## Secrets

`secrets` keeps tokens, API keys and sign-ins in Luft Keyring where only the app that stored them can read them back, without prompts. Other apps are told there's nothing there.

```rust
use luft_app::secrets;

secrets::store("account-token", token.as_bytes())?;
let token: Option<Vec<u8>> = secrets::load("account-token")?;
secrets::delete("account-token")?;
```

`secrets::register(window)` adds `secrets_store({name, value})`, `secrets_load({name})` and `secrets_delete({name})` bridge commands for text secrets, for apps whose page handles sign-in itself.

## Fonts

With the `fonts` feature, `fonts::installed()` lists every font face fontconfig knows about, with its family, style, PostScript name, face index and file. `fonts::user_folder()` is the user's own fonts folder, `~/.local/share/fonts`, and `fonts::belongs_to_user` tells whether a font file lives there or in `~/.fonts`. After adding files to the folder, `fonts::refresh()` rebuilds its fontconfig cache so other apps see them. `fonts::remove` moves font files to the trash and refreshes the cache, and refuses anything outside the user's own font folders. `fonts::is_monospaced` and `fonts::has_fixed_advances` tell whether a face's letters are all the same width, which is more reliable than what font files claim about themselves. `fonts::use_family(Role::Interface, family)` makes a family the desktop's system font, or with `Role::Monospace` its monospace font, keeping the size already chosen; `fonts::reset` goes back to the default, and `fonts::defaults()` names the default families.

## Thumbnails

With the `thumbnails` feature, `thumbnails::Thumbnails` makes thumbnails for files in the shared freedesktop thumbnail cache, so other apps reuse them and the other way round. Common image formats are decoded in process; everything else goes through the thumbnailers installed on the system, such as those for videos, PDFs and fonts. Work runs on a few low priority threads, and each request replaces the previous one, so asking for the files currently on screen keeps the queue short while scrolling:

```rust
let thumbnails = Thumbnails::new(events.clone(), "my-app.thumbnails");
thumbnails.request(paths, ThumbnailSize::Large);
```

Finished thumbnails arrive on the page in batches under the given event name, each item with the file's `path`, its `thumbnail` path or `null` when none could be made, and the file's `modified` time. Files that can't be thumbnailed are remembered in the cache so they aren't tried again until they change.

## IBus

With the `ibus` feature, `ibus::address()` finds the address of the session's IBus daemon the same way IBus's own library does: from `IBUS_ADDRESS`, the file named by `IBUS_ADDRESS_FILE`, or the file IBus writes for the current display under `~/.config/ibus/bus`. Connect to it with zbus to list input methods or to serve one.
