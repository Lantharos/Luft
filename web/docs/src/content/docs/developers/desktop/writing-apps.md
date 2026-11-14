---
title: Writing a Luft app
description: Set up a Sabine app with luft-app and @luft/ui, open its glass window, talk to its native side, and bring its windows back after a restart.
sidebar:
  order: 5
---

A Luft app is a [Sabine](https://github.com/Lantharos/Sabine) app with two halves: a Svelte page styled with `@luft/ui` (`packages/web/ui`), and a Rust native side built on `luft-app` (`packages/app`). Copy the layout of an app in `apps/system` or `apps/store`, such as Rover, and change what you need.

## The native side

Add `luft-app` to the app's `desktop/Cargo.toml` with the features it needs, such as `apps`, `thumbnails`, `watch`, `fonts` or `camera`:

```toml
luft-app = { workspace = true, features = ["apps", "thumbnails"] }
```

```rust
use luft_app::{Backdrop, Events, GlassWindow};

const WINDOW: GlassWindow = GlassWindow {
    title: "Settings",
    size: (1040, 720),
    min_size: (760, 520),
    sidebar_width: 280,
    single_instance: Some("com.lantharos.settings"),
    backdrop: Backdrop::WINDOW,
};

pub fn run_app() -> ! {
    let events = Events::default();
    luft_app::run(&events, |window| register(WINDOW.apply(window), &events), |_| {})
}
```

- `sidebar_width` must match the page's `--sidebar-width`.
- `backdrop` says what the glass is for and which material it would like, see [Glass](#glass).
- With `single_instance` set, launching the app again focuses the running window and sends the new arguments as a `singleInstance.activate` event, which bridge commands take as an `Activation`, the same type `Activation::current_process()` gives for the app's own launch.
- `apply_with_page_close` instead of `apply` hands the close button to the page, so `WindowControls`' `onclose` decides when to close.
- `run` watches Kestrel's palette and the desktop's fonts for the page. The last closure runs at the same point, for the app's own watchers.

Bridge commands go through the `Commands` trait, for handlers that return `Result<T, String>`:

```rust
window
    .command("about_info", |_: Value| info())
    .with("network_open", &events, open)
    .command_async("disks_list", list)
```

`with` also passes a shared context such as `Events` or the app's state. `command_async` and `with_async` take async functions, awaited on Sabine's runtime, and anything that waits on D-Bus belongs there. `spawn` runs background work on the same runtime, and `block_on` waits on it from a thread of the app's own.

Sandboxed apps only see the files they're given. `Activation::paths_within_reach` and the file chooser in `luft_app::portal` hand back paths the app can open, through the document portal, for the files it was opened with or the person picked.


### Glass

The sidebar is glass, and Kestrel draws it as the material people chose for app windows: Luca, a blur of what is behind, or Maris, the surface colour with a hint of the wallpaper. `Backdrop::WINDOW` follows that choice. An app whose layout needs one material asks for it with `BackdropPreference::Maris` or `BackdropPreference::Luca`, and a window that is a popover or a palette rather than an app's main window sets `BackdropRole::Transient`, so it follows the choice for panels and menus:

```rust
use luft_app::Backdrop;
use sabine::{BackdropPreference, BackdropRole};

const PALETTE: Backdrop = Backdrop {
    role: BackdropRole::Transient,
    preference: BackdropPreference::User,
};
```

`GlassShell` leaves out the sidebar's own tint over Maris, whose surface colour is already the whole surface, and keeps it over Luca, where it keeps text readable. How the materials are drawn is in [The compositor](/developers/desktop/compositor/#glass).

## The page

Add `"@luft/ui": "workspace:*"` to the app's `devDependencies`, and import its styles right after Tailwind, which also makes Tailwind scan the package:

```css
@import 'tailwindcss';
@import '@luft/ui/styles.css';
```

```ts
import { luftFonts, luftLocales, sabineTarget } from '@luft/ui/vite';

export default defineConfig({
	plugins: [luftFonts(), luftLocales(), sabineTarget(), tailwindcss(), svelte()]
});
```

- `luftLocales` bundles the app's `locales` folder and the kit's own messages, one chunk per language, loaded only when that language is in use.
- `luftFonts` serves Open Runde and Maple Mono at `/fonts/`, copies them into the build, and scales every `px` or `rem` font size and line height by the desktop's text size.
- `sabineTarget` builds for the Chromium Sabine ships.

Extend `@luft/ui/tsconfig.base.json` in `tsconfig.json`, and preload `/fonts/OpenRunde-Regular.woff2` in `index.html`.

```svelte
<GlassShell>
	<aside class="glass-sidebar drag-region px-3 py-4">…</aside>
	<main class="glass-content">
		<header class="drag-region flex h-[60px] items-center justify-end pr-4">
			<WindowControls />
		</header>
	</main>
</GlassShell>
```

Keep 16px of padding to the right of `WindowControls`. Inside `GlassShell`, right-clicking a text field or selected text offers cut, copy, paste and select all unless the app opens its own menu.

## Startup state

Flatten `luft_app::Appearance` into the app's startup state, and start `@luft/ui`'s `appearance` store from it:

```rust
#[derive(Serialize)]
struct AppState {
    #[serde(flatten)]
    appearance: Appearance,
}

AppState { appearance: Appearance::current().await }
```

```ts
import { appearance } from '@luft/ui';

appearance.start(await invoke('app_state'));
await i18n.ready;
```

The store gets the palette, fonts, motion preference, corners and the session's languages, and follows their changes. `appearance.start` also loads the app's translation, so wait for `i18n.ready` before showing the window and it never shows untranslated labels. [Translating Luft](/developers/translating/) covers writing strings that can be translated.

The palette is dark unless the app sets `data-scheme="light"`. To follow the desktop:

```ts
$effect(() => {
	document.documentElement.dataset.scheme = appearance.scheme;
});
```

`appearance.posture` is `tablet` while the computer is folded into a tablet and `laptop` otherwise, also on the page as `data-posture`, so apps can give fingers and the pen more room. `appearance.keyboard` says whether there's a keyboard to type on. Fields marked `inputmode="none"` never bring up the on-screen keyboard, so leave them for text only a real keyboard types. [Colours and motion](/developers/desktop/colours-and-motion/) covers the palette's roles and the shared motion.

## Bringing windows back

After a restart to install an update, Kestrel opens the apps that were open and puts their windows back ([Kestrel](/developers/desktop/kestrel/#bringing-apps-back)). Sabine apps also bring back what each window showed:

- Every window carries a key of its own as its Wayland toplevel tag, which Kestrel's record keeps.
- Kestrel starts the app with the keys of its windows in `SABINE_RESTORE_WINDOWS` and places each window where the one with the same tag was.
- While a window is open, the app keeps what it shows in `~/.local/state/<app id>/windows`, readable only by the account, a moment after it changes. Closing the window or quitting the app removes it, so a window you closed never comes back.

Keep paths, page names and ids there, never passwords, tokens or anything unlocked. Something the app was asked to open, such as a file it was started with, goes before what it showed. Draft, Heft and Flatbed don't need this: they open on what you were working on every time.

## Thumbnails

The `thumbnails` feature makes thumbnails in the shared freedesktop cache and sends them to the page in batches. Each `request` replaces the one before, so asking for the files on screen keeps the queue short while scrolling.

Files that need a thumbnailer go to one of those in the `thumbnailers` folders of `~/.local/share` and `XDG_DATA_DIRS`. It runs in a bubblewrap sandbox that sees only `/usr`, its own program, the file itself and a private folder for the result, with no network and no way to open new user namespaces, so a hostile file can only break its own thumbnail.

Luft's own thumbnailer, `luft-thumbnailer` in `services/thumbnailer`, gives AppImages, Flatpak bundles and `.flatpakref` files their app's icon. It reads an AppImage's icons from its squashfs without running or unpacking it, a bundle's from its header, and a reference's from the icons Flatpak already downloaded, so it never goes online. SVG icons are drawn with only the images embedded in them, never files they point to.
