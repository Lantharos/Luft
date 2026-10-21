# UI kit

`@luft/ui` ([packages/ui](../../packages/ui)) is the shared look of Luft's Svelte apps: design tokens, base styles, the Open Runde and Maple Mono fonts, window chrome, controls and code highlighting. Components ship as Svelte source and compile with the app.

## Setup

Add the package to an app in this workspace:

```json
"devDependencies": {
	"@luft/ui": "workspace:*"
}
```

Import the styles right after Tailwind. They also make Tailwind scan this package:

```css
@import 'tailwindcss';
@import '@luft/ui/styles.css';
```

Register the plugins in `vite.config.ts`:

```ts
import { luftFonts, luftLocales, sabineTarget } from '@luft/ui/vite';

export default defineConfig({
	plugins: [luftFonts(), luftLocales(), sabineTarget(), tailwindcss(), svelte()]
});
```

- `luftLocales` bundles the app's `locales` folder and the kit's own messages, one chunk per language that loads only when that language is in use. See [Translations](../translations.md).
- `luftFonts` serves the fonts at `/fonts/`, copies them into the build, and scales every `px` or `rem` font size and line height by the desktop's text size (`--text-scale`).
- `sabineTarget` builds for the Chromium that Sabine ships.

Extend the shared TypeScript settings in `tsconfig.json`:

```json
{
	"extends": "@luft/ui/tsconfig.base.json",
	"include": ["src", "vite.config.ts"]
}
```

Preload the regular weight in `index.html`, and `MapleMono-NF-Regular.woff2` too in apps that show code from the start:

```html
<link rel="preload" href="/fonts/OpenRunde-Regular.woff2" as="font" type="font/woff2" crossorigin />
```

## Window shell

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

- The sidebar is `--sidebar-width` wide, 280px by default, and must match `sidebar_width` on the native side.
- Keep 16px of padding to the right of `WindowControls`. Pass `onclose` to run something before closing.
- Inside `GlassShell`, right-clicking a text field or selected text offers cut, copy, paste and select all, unless the app opens its own menu.

Start the `appearance` store from the startup state that `luft_app::Appearance` builds:

```ts
import { appearance } from '@luft/ui';

appearance.start(await invoke('app_state'));
await i18n.ready;
```

`appearance.start` also loads the app's translation for the session's language; wait for `i18n.ready` from `@luft/i18n` before showing the window, so it never shows untranslated labels.

| Field | Value |
| --- | --- |
| `translucent` | Whether the window is see-through |
| `scheme` | The desktop's `light` or `dark` style |
| `accent`, `wallpaperAccent` | Kestrel's accent, and the accent the wallpaper gives on its own |
| `colors` | Kestrel's palette for both styles, keyed by role such as `primary` or `surfaceContainerHigh` (see [Kestrel](../../kestrel/README.md)) |
| `terminal` | Kestrel's sixteen terminal colors for both styles |
| `pureBlack` | Whether Pure black is on; sets `data-black` on the root element |
| `appIcons` | The app icon style, its colors and the glyph folder, used by `AppIcon` |
| `taskbar` | How the taskbar draws each look on the current wallpaper and style: its surface, ink, Start mark colors, running dots and halos |
| `typography` | The desktop's system and monospace families and text size |
| `fontSans`, `fontMono` | Font lists for text drawn outside CSS, such as a canvas |

Every palette role also becomes a `--kestrel-light-…` and `--kestrel-dark-…` variable on the root element. The palette is dark unless the app sets `data-scheme="light"`; to follow the desktop:

```ts
$effect(() => {
	document.documentElement.dataset.scheme = appearance.scheme;
});
```

## Components

| Component | Use |
| --- | --- |
| `GlassShell`, `WindowControls` | Window body and title bar buttons; `maximizable={false}` hides maximize, `closable={false}` disables close and `onclose` replaces closing the window |
| `Switch`, `Checkbox`, `Slider`, `Select`, `Segmented` | Form controls with a `label` and `onchange`; `Segmented` takes an `item` snippet for icons |
| `SearchField` | Search input; `variant="sidebar"`, `large`, and `focus()` |
| `TextField`, `PasswordField` | Text inputs with `error`, `live`, `invalid` and bindable `touched`; `PasswordField` adds show and hide with `onreveal` |
| `ProgressBar` | Thin bar for a `fraction` from 0 to 1, sliding back and forth while it's `null`; set its height and track color with classes and the fill with `--progress-color` |
| `Dialog` | Modal with a title, description, body and `actions` snippet; `wide` for longer forms |
| `IconButton` | Round button with a Lucide icon |
| `Section`, `Row`, `ActionRow`, `ItemRow` | Grouped settings lists; `Row` takes `truncate` and `expanded` |
| `AppIcon`, `Avatar` | App icon that follows the desktop's icon style when given the app's `id`, and a round user picture with initials |
| `Popover` | Panel anchored to a trigger that stays inside the window |
| `ContextMenu`, `MenuItem`, `MenuSeparator` | Menu opened at the pointer |
| `MenuButton` | Button with a `trigger` snippet that opens a menu; `children` receives `close` |
| `VirtualScroller` | List or grid that renders only what is in view; `layout`, `header`, `stagger`, `animateOrder`, `stableOrder`, and `scrollToIndex`, `indicesIn` and `metrics` for keyboard and rubber-band selection |
| `MediaControls` | Play, position, time and volume bar for a media element; bind `paused`, `currentTime`, `muted` and `volume` |
| `SeekBar`, `VolumeControl` | The position and volume parts on their own; `onseek` and `onscrub` |
| `NativeVideoSurface` | Plays `src` through Sabine's native video for formats Chromium can't decode; bind `player`, handle `onfail` |
| `RecoveryKey` | Recovery key in groups of eight with copy, `onsave` and `onprint` |
| `Choice` | Large option button with an icon, title, description and optional `note` |
| `SplitBar` | Draggable bar that splits a drive's space between two parts, with `free` showing the part of the second that's free already |
| `FingerprintDial` | Progress ring and prompt for a `FingerprintEnrollment` |
| `CommandPalette` | Search box with a list of items over the window, showing the `PaletteState` it's given; `onclose` runs after it closes |

## Helpers

| Export | Use |
| --- | --- |
| `tooltip(text)` | Attachment that shows a label under an element on hover |
| `topLayer` | Attachment that puts an element in the browser's top layer |
| `fileDrop(open)` | `ondragover` and `ondrop` handlers for `<svelte:window>` that pass dropped file paths to `open` |
| `droppedPaths(dataTransfer)` | The paths of the files in a drop |
| `dragFiles(dataTransfer, paths)` | Puts files in a drag, so other apps receive them as files |
| `fileDragStart(path)` | A `dragstart` handler that drags the file at `path` |
| `pathsFromUriList`, `fileUrlPath` | Paths from `text/uri-list` contents and `file://` URLs |
| `fileUri(path)` | A `file://` URL for a path |
| `basename`, `isInside` | A path's last part, and whether a path is inside a folder |
| `bytes`, `memoryBytes` | Sizes in decimal and binary units |
| `plural(count, singular, pluralForm?)` | `3 files` |
| `ago(unixSeconds)` | Relative time such as `5 minutes ago` |
| `watts(value)` | Power such as `4.2 W` |
| `formatClock(seconds)` | `1:05` or `1:02:05` |
| `PaletteState` | What the `CommandPalette` shows: `show(source, query?)` opens it with a `PaletteSource`, whose `items(query)` returns the `PaletteItem`s for what's typed |
| `matchItems(items, query)`, `fuzzyMatch(query, text)`, `topMatches(items, limit, score)` | Fuzzy matching that favors word starts and runs of letters, with the matched positions for highlighting |
| `renderMarkdown(source, path)` | Markdown to HTML, with relative images resolved against `path` |
| `canPlayNatively()`, `decodeFailed(media)` | Whether native video is available, and whether a `<video>` failed to decode |
| `MediaState` | A native player's state as reactive fields with setters, for `MediaControls` |
| `MARK_LAYERS`, `MARK_SCALE`, `PAINTED_MARK_SCALE` | The Start mark's two layers, which color each takes and which one carries the taskbar's halo, shared with Kestrel's Start button |
| `FingerprintEnrollment`, `fingerprints()`, `fingerprintReader()`, `deleteFingerprint(finger)` | Enrolling and managing fingerprints through `luft-fingerprint`; `FINGERS` and `fingerLabel` name the fingers |

Types: `Appearance`, `AppIconStyle`, `Palette`, `PaletteItem`, `PaletteSource`, `FuzzyMatch`, `Scheme`, `SchemeColors`, `MarkLayer`, `MarkFills`, `TaskbarLook`, `TaskbarLooks`, `TaskbarLookPaint`, `Shadow`, `VirtualRect`, `VirtualHandle`, `VirtualLayout`.

## Classes

| Class | Use |
| --- | --- |
| `button` | Button; with `primary`, `danger` or `large` |
| `plain-button` | Borderless button; with `large` |
| `icon-button` | Round icon button; with `large` |
| `text-field` | Text input |
| `window-control` | Title bar button |
| `row-group` | Grouped rows background |
| `glass-surface` | Gives the controls inside see-through fills, for windows whose content sits straight on the glass |
| `drag-region` | Drags the window |
| `soft-scroll`, `hidden-scroll` | Thin or hidden scrollbars |
| `scroll-fade` | Fades a scroller's edges while there is more to scroll |

## Code highlighting

```ts
import { highlight } from '@luft/ui/code';

const html = await highlight(source, 'src/main.rs');
```

```svelte
<pre class="font-mono"><code>{@html html}</code></pre>
```

The second argument is a language name or alias, or a file name or path. The result is escaped HTML with `hl-*` classes colored by the `--syntax-*` tokens. Grammars load on first use. Highlighting runs on the calling thread, so cap very large inputs.

| Export | Use |
| --- | --- |
| `highlight(code, nameOrPath)` | Highlighted HTML |
| `findLanguage(nameOrPath)` | The matching language description, or `null` |
| `loadLanguage(nameOrPath)` | Language support for editors, or `null` |
| `languages` | Every known language, sorted by name |
| `codeHighlighter` | The tag to class mapping, for CodeMirror's `syntaxHighlighting` |

## Tokens

Colors, radii and easing are CSS variables in `src/styles/tokens.css`, with syntax colors in `src/styles/code.css`. All colors come from Kestrel's palette and fall back to neutral greys without it.

| Token | Value |
| --- | --- |
| `--font-sans`, `--font-mono` | The desktop's fonts, falling back to Open Runde and Maple Mono NF |
| `--accent`, `--accent-text` | `primary` and `onPrimary` |
| `--accent-soft`, `--accent-line` | Faint accent fill and outline |
| `--text`, `--text-soft`, `--text-muted` | `onSurface`, `onSurfaceVariant` and `outline` |
| `--group` | Background behind grouped rows |
| `--control`, `--control-hover` | Fill of buttons, text fields, checkboxes and switches |
| `--control-edge`, `--control-focus`, `--control-outline` | Text field outline and focus ring, and the outline of an unchecked checkbox |
| `--danger` | `error` |
| `--secondary`, `--tertiary` | Secondary colors such as file kinds |
| `--ink` | `onSurface`, for hover fills, hairlines and scrollbars |
