# luft-app

The native side every Luft app starts from: a frameless glass window with a blurred sidebar, single-instance activation, the Kestrel accent color, D-Bus connections and typed bridge commands on top of Sabine.

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
    single_instance: Some("dev.lantharos.settings"),
};

pub fn run_app() -> ! {
    let events = Events::default();
    luft_app::run(&events, |window| register(WINDOW.apply(window), &events), |_| {})
}
```

`GlassWindow::apply` makes the window frameless and translucent, blurs the sidebar (`sidebar_width` must match the web side's `--sidebar-width`), keeps the content opaque, rounds the input region and places the minimize, maximize and close hit areas where `WindowControls` draws them. With `single_instance` set, launching the app again focuses the running window and sends the new arguments as a `singleInstance.activate` event.

`luft_app::run` starts the app, connects `Events` to the page once it exists, and starts watching Kestrel's accent color and the desktop's light or dark style. The last closure runs at the same point, for any other watchers the app needs.

## Startup state

Flatten `Appearance` into the app's startup state so the page knows whether the window is translucent and which accent to use:

```rust
#[derive(Serialize)]
struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
}

AppState { appearance: Appearance::current() }
```

`Appearance` also carries the desktop's light or dark style, read from the `org.freedesktop.appearance` `color-scheme` portal setting. Accent changes arrive on the page as `kestrel.accent` events and style changes as `appearance.scheme` events, which `@luft/ui`'s `appearance` store listens for.

## Commands

`Commands` adds two helpers to `SabineWindow` for handlers that return `Result<T, String>`:

```rust
window
    .command("about_info", |_: Value| info())
    .with("network_open", &events, open)
```

`command` takes a plain function of the request; `with` also passes a shared context such as `Events` or the app's own state.

## D-Bus

`dbus::session()` and `dbus::system()` return cached blocking zbus connections. They run on a dedicated Tokio runtime with one worker thread, because bridge handlers aren't called from inside a runtime and zbus needs one. `dbus::objects` reads `ObjectManager` trees and debounces bursts of change signals.
