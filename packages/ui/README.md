# @luft/ui

The shared look of Luft's apps: design tokens, base styles, the Open Runde font, window chrome and the controls Rover and Settings are built from. Components ship as Svelte source, so apps compile them together with their own code.

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

Preload the regular weight in `app.html` so text shows up without waiting for the font:

```html
<link rel="preload" href="/fonts/OpenRunde-Regular.woff2" as="font" type="font/woff2" crossorigin />
```

## Window shell

`GlassShell` is the rounded, frameless window body. It reads the shared `appearance` store, marks itself `data-effect="translucent"` or `"solid"`, and applies the desktop accent color. Put a `.glass-sidebar` and a `.glass-content` inside it:

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

On translucent windows the sidebar lets the compositor's blur through with a light tint (`--sidebar-glass`). The sidebar is `--sidebar-width` wide, 280px by default; override the variable on the shell if the app's native blur region uses a different width. `WindowControls` sits where the native side expects the minimize, maximize and close hit areas, so keep 16px of padding to its right.

Feed the store from the app's startup state, which the native side builds with `luft_app::Appearance`:

```ts
import { appearance } from '@luft/ui';

appearance.start(await invoke('app_state'));
```

After that, `appearance.translucent`, `appearance.accent` and `appearance.accentText` stay current as Kestrel's accent changes.

## Components

| Component | Use |
| --- | --- |
| `Switch`, `Slider`, `Select`, `Segmented` | Form controls; each takes a `label` for assistive technology and reports changes through `onchange` |
| `SearchField` | Search input; `variant="sidebar"` for the sidebar, `large` for a taller field, `focus()` to focus and select |
| `Dialog` | Modal with a title, optional description, body and an `actions` snippet |
| `IconButton` | Round icon-only button taking a Lucide icon |
| `Section`, `Row`, `ActionRow`, `ItemRow` | Grouped settings lists and the rows inside them |
| `AppIcon`, `Avatar` | App icon with a fallback, and a round user picture with initials |
| `Popover` | Floating panel anchored to a trigger; stays inside the window, flips above when there is no room below, and scrolls when it runs out of height |
| `ContextMenu`, `MenuItem`, `MenuSeparator` | Menu opened at a pointer position; it closes when the window resizes or Escape is pressed inside it, and the app decides what an outside click does |
| `GlassShell`, `WindowControls` | Window body and title bar buttons |

## Classes

`button` (with `primary`, `danger` and `large`), `plain-button`, `icon-button` (with `large`), `text-field`, `window-control`, `row-group`, `drag-region`, `soft-scroll` and `hidden-scroll` are available globally for markup that doesn't need a component.

## Tokens

Colors, radii and easing are CSS variables on `:root`, defined in `src/styles/tokens.css`. The palette is dark only. `--accent` and `--accent-text` follow the desktop accent inside `GlassShell`.

## Checks

```bash
bun run check
```

## License

Open Runde is licensed under the SIL Open Font License, included in `fonts/OFL.txt`.
