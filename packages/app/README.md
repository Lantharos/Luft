# luft-app

The native side every Luft app starts from, on top of Sabine: a frameless glass window with a blurred sidebar, single-instance activation, Kestrel's palette and the desktop's fonts, D-Bus connections, typed bridge commands and the desktop portals.

## Setup

Add it to an app's `desktop/Cargo.toml` by path, with the features the app needs:

```toml
luft-app = { path = "../../../packages/app", features = ["apps", "thumbnails"] }
```

Opening the window, bridge commands, the exports and the optional features are in [the app shell reference](../../docs/components/app.md).
