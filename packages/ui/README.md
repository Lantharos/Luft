# @luft/ui

The shared look of Luft's apps: design tokens, base styles, the Open Runde and Maple Mono fonts, window chrome and the controls Rover and Settings are built from. Components ship as Svelte source, so apps compile them together with their own code.

## Setup

Add the package to an app in this workspace:

```json
"devDependencies": {
	"@luft/ui": "workspace:*"
}
```

Import the styles right after Tailwind. They also tell Tailwind to scan this package, so utility classes used inside the components end up in the app's CSS:

```css
@import 'tailwindcss';
@import '@luft/ui/styles.css';
```

Register the font plugin in `vite.config.ts`. It serves the fonts at `/fonts/` during development and copies them, with their license, into the build:

```ts
import { luftFonts } from '@luft/ui/vite';

export default defineConfig({
	plugins: [luftFonts(), tailwindcss(), sveltekit()]
});
```

Preload the regular weight in `app.html` so text shows up without waiting for the font, and do the same for `MapleMono-NF-Regular.woff2` in apps that show code from the start:

```html
<link rel="preload" href="/fonts/OpenRunde-Regular.woff2" as="font" type="font/woff2" crossorigin />
```

## Window shell

`GlassShell` is the rounded, frameless window body. It reads the shared `appearance` store, and marks itself `data-effect="translucent"` or `"solid"`. Put a `.glass-sidebar` and a `.glass-content` inside it:

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

On translucent windows the sidebar lets the compositor's blur through with a light tint (`--sidebar-glass`). The sidebar is `--sidebar-width` wide, 280px by default; override the variable on the shell if the app's native blur region uses a different width. `WindowControls` sits where the native side expects the minimize, maximize and close hit areas, so keep 16px of padding to its right. Pass `onclose` to run something first, such as saving state, and close the window from there.

Feed the store from the app's startup state, which the native side builds with `luft_app::Appearance`:

```ts
import { appearance } from '@luft/ui';

appearance.start(await invoke('app_state'));
```

After that, `appearance.translucent` and `appearance.accent` stay current as Kestrel's accent changes, `appearance.wallpaperAccent` holds the accent the wallpaper gives on its own, and `appearance.scheme` follows the desktop's light or dark style. `appearance.colors` holds Kestrel's palette for the light and the dark style, keyed by role name such as `primary`, `onSurface` or `surfaceContainerHigh` (the roles are listed in Kestrel's README). Every role also becomes a `--kestrel-light-…` and `--kestrel-dark-…` variable on the root element, such as `--kestrel-dark-on-primary`, and `appearance.pureBlack` tells whether Pure black is on. While it is, the store sets `data-black` on the root element and the dark palette's backgrounds, sidebar and content turn black. `appearance.terminal` holds Kestrel's sixteen terminal colors for the light and the dark style; their red, green, yellow, blue, magenta and cyan also become the `--kestrel-light-…` and `--kestrel-dark-…` variables on the root element, which the syntax colors use so code matches the wallpaper. `appearance.appIcons` holds the app icon style Kestrel draws with, its colors, and the folder of app glyphs, which `AppIcon` uses.

The palette is dark unless an app opts into the light one by setting `data-scheme="light"` on the root element. Apps that follow the desktop style keep it in sync with the store:

```ts
$effect(() => {
	document.documentElement.dataset.scheme = appearance.scheme;
});
```

## Components

| Component | Use |
| --- | --- |
| `Switch`, `Checkbox`, `Slider`, `Select`, `Segmented` | Form controls; each takes a `label` for assistive technology and reports changes through `onchange`. `Checkbox` shows its children as the visible label |
| `SearchField` | Search input; `variant="sidebar"` for the sidebar, `large` for a taller field, `focus()` to focus and select |
| `TextField`, `PasswordField` | Text inputs that show an `error` below the field once it has been left, or right away with `live`; `invalid` marks the field without a message, and `touched` can be bound to show the message elsewhere. `PasswordField` adds a show and hide button and calls `onreveal` before showing the value |
| `Dialog` | Modal with a title, optional description, body and an `actions` snippet; `wide` for longer forms, and the body scrolls when it runs out of height |
| `IconButton` | Round icon-only button taking a Lucide icon |
| `Section`, `Row`, `ActionRow`, `ItemRow` | Grouped settings lists and the rows inside them |
| `AppIcon`, `Avatar` | App icon with a fallback, and a round user picture with initials. Give `AppIcon` the app's desktop `id` as well as its `icon` and it follows the desktop's app icon style; `style` shows one style regardless of the setting, for previews |
| `Popover` | Floating panel anchored to a trigger; stays inside the window, flips above when there is no room below, and scrolls when it runs out of height |
| `ContextMenu`, `MenuItem`, `MenuSeparator` | Menu opened at a pointer position; it closes when the window resizes or Escape is pressed inside it, and the app decides what an outside click does |
| `MenuButton` | Button that opens a menu below it; `trigger` renders the button's content and `children` receives a `close` function for the items |
| `VirtualScroller` | Scrolling list or grid that only renders the items in view, so it stays fast with tens of thousands of items. `layout` sets the item height and, for a grid, `minItemWidth`; `header` stays pinned above the items. Items passed while `stagger` is on fade in from top to bottom, and with `animateOrder` a reordered or filtered list moves its items to their new places. With `stableOrder`, rows that stay on screen keep their place in the document when the list is reordered and only move visually, which keeps frequently re-sorted lists cheap to update. `scrollToIndex`, `indicesIn` and `metrics` help with keyboard navigation and rubber-band selection |
| `MediaControls` | Play, position, time and volume in one bar for a video or audio element; bind `paused`, `currentTime`, `muted` and `volume`, pass `buffered` to show what has loaded, a `preview` snippet to show something above the position under the pointer, and children for extra buttons at the end |
| `SeekBar`, `VolumeControl` | The position and volume parts on their own, for players with their own layout. `SeekBar` reports every position while dragging through `onseek`, and `onscrub` says when dragging starts and stops |
| `NativeVideoSurface` | Plays `src` through Sabine's native video, for formats Chromium can't decode, and fills its own box with it. Bind `player` to control playback, pass `cutout` when opaque content lies beneath, and handle `onfail` |
| `GlassShell`, `WindowControls` | Window body and title bar buttons |

`formatClock(seconds)` turns a duration into `1:05` or `1:02:05`.

For native video, `canPlayNatively()` says whether the window can use it and `decodeFailed(media)` whether a `<video>` stopped because Chromium can't decode its source. `MediaState` turns a native player into reactive `paused`, `currentTime`, `duration`, `muted`, `volume`, `width` and `height`, with setters to bind `MediaControls` to.

`Segmented` also takes an `item` snippet to show icons instead of text; the option's `label` then becomes its accessible name.

## Classes

`button` (with `primary`, `danger` and `large`), `plain-button`, `icon-button` (with `large`), `text-field`, `window-control`, `row-group`, `drag-region`, `soft-scroll` and `hidden-scroll` are available globally for markup that doesn't need a component.

The `tooltip(text)` attachment shows a small label under an element after a short hover, and right away when moving between elements that have one:

```svelte
<button class="icon-button" aria-label="Back" {@attach tooltip('Back')}>…</button>
```

## Code highlighting

`@luft/ui/code` highlights code with the same colors everywhere, whether it's a preview or an editor. Grammars load the first time a language is used, so importing the module costs almost nothing up front:

```ts
import { highlight } from '@luft/ui/code';

const html = await highlight(source, 'src/main.rs');
```

```svelte
<pre class="font-mono"><code>{@html html}</code></pre>
```

The second argument is either a language name or alias, such as `rust`, `ts` or `Markdown`, or a file name or path, which is matched by extension and by well-known names like `Dockerfile`. The result is escaped HTML with `hl-*` classes whose colors come from the `--syntax-*` tokens, so it follows the accent, the wallpaper palette and the light and dark styles. Besides CodeMirror's own collection it knows Svelte and log files, where timestamps, levels and numbers stand out. Text in a language nobody knows comes back escaped without highlighting. Parsing happens on the calling thread, so cap very large inputs before highlighting them.

| Export | Use |
| --- | --- |
| `highlight(code, nameOrPath)` | Highlighted HTML for a string of code |
| `findLanguage(nameOrPath)` | The matching language description, or `null` |
| `loadLanguage(nameOrPath)` | Loads and returns the language support for editors, or `null` |
| `languages` | Every known language, sorted by name, for language pickers |
| `codeHighlighter` | The tag to class mapping behind `hl-*`, for CodeMirror's `syntaxHighlighting` |

## Tokens

Colors, radii and easing are CSS variables on `:root`, defined in `src/styles/tokens.css`, with the syntax colors in `src/styles/code.css`. `--font-sans` is Open Runde and `--font-mono` is Maple Mono NF, a monospace font with ligatures and Nerd Font symbols in regular, italic, bold and bold italic; Tailwind's `font-sans` and `font-mono` utilities use them. The palette is dark by default, black under `data-black` unless the light palette is on, and light under `data-scheme="light"`. `--accent` is the palette's `primary` for the style in use and `--accent-text` its `onPrimary`, for text and icons on the accent; `--accent-soft` and `--accent-line` are a faint fill and an outline in the accent. Without Kestrel the accent is white in the dark palette and black in the light one.

## Checks

```bash
bun run check
```

## License

Open Runde is licensed under the SIL Open Font License, included in `fonts/OFL.txt`. Maple Mono is licensed under the SIL Open Font License, included in `fonts/MapleMono-OFL.txt`.
