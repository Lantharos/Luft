---
title: Colours and motion
description: The palette Kestrel derives from the wallpaper and how apps read it, and the motion tokens Kestrel and the apps share.
sidebar:
  order: 5.5
---

Kestrel and Luft's apps share a palette built from the wallpaper and one set of motion tokens. [Appearance](/personalize/appearance/) shows what people choose.

## The palette

Kestrel takes an accent from the most vivid dominant hue in the lower part of the wallpaper, where the taskbar and everything that opens from it sit. The top 40% doesn't count, and the rest counts more the lower it is. The accent is white when that part has hardly any colour, or when White is chosen. From the accent Kestrel builds a palette for light and dark, and a new wallpaper restyles the shell once, with accent and colours together.

Every role sits at a fixed tone, the perceived lightness from 0 for black to 100 for white, so contrast is the same whatever the wallpaper:

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| `primary`, `secondary`, `tertiary`, `error` | 40 | 80 | Filled controls, links, highlights. Secondary is a quieter accent, tertiary turns its hue by 60°, error is a fixed red |
| `onPrimary`, `onSecondary`, `onTertiary`, `onError` | 100 | 20 | Text and icons on those colours |
| `primaryContainer` and the other `…Container` roles | 90 | 30 | Softer fills, such as selected rows |
| `onPrimaryContainer` and the other `on…Container` roles | 10 | 90 | Text on a container |
| `surface` | 98 | 6 | Window background |
| `surfaceDim`, `surfaceBright` | 87, 98 | 6, 24 | Lower and higher backgrounds |
| `surfaceContainerLowest` … `surfaceContainerHighest` | 100, 96, 94, 92, 90 | 4, 10, 12, 17, 22 | Cards, sidebars, popovers and fields |
| `onSurface` | 10 | 90 | Main text |
| `surfaceVariant`, `onSurfaceVariant` | 90, 30 | 30, 80 | Secondary surfaces and text |
| `outline` | 50 | 60 | Borders that must be seen |
| `outlineVariant` | 80 | 30 | Decorative dividers |
| `inverseSurface`, `inverseOnSurface`, `inversePrimary` | 20, 95, 80 | 90, 20, 40 | Tooltips and snackbars |

- The tones are chosen so text and `on…` roles reach 4.5:1 against what they sit on and `outline` 3:1 against `surface`, which the appearance checks hold them to.
- A white accent makes the palette black and white: `primary`, `onPrimary`, `primaryContainer`, `onPrimaryContainer` and `inversePrimary` become 10, 100, 25, 100, 100 in light and 100, 10, 85, 0, 10 in dark.
- With Pure black, dark `surface`, `surfaceDim` and `surfaceContainerLowest` are `#000000`, the other containers 4, 8, 12 and 17, and `surfaceBright` 18.

Terminal colours are the usual sixteen, nudged up to 15° toward the accent and readable against the background at 4.5:1: `foreground`, `background`, `cursor` (from `primary`), `cursorText`, `selectionBackground` (from `primaryContainer`), `selectionForeground`, and `color0` to `color15`.

## Reading the palette

Luft's apps get the palette through [their startup state](/developers/desktop/writing-apps/#startup-state), and `@luft/ui` turns it into CSS variables: every role as `--kestrel-light-…` and `--kestrel-dark-…`, with tokens such as `--accent`, `--text` and `--control` built on them. Other programs read it from D-Bus or from files.

`com.lantharos.Kestrel.Appearance` at `/com/lantharos/Kestrel/Appearance` on `com.lantharos.Kestrel` has read-only properties that emit `PropertiesChanged`, with colours as `#rrggbb`. It's the one object of Kestrel's that sandboxed apps may read.

| Property | Type | Value |
| --- | --- | --- |
| `AccentColor` | `s` | The accent |
| `WallpaperAccentColor` | `s` | The wallpaper's accent, also while White is chosen |
| `PureBlack` | `b` | Whether the dark style uses pure black |
| `LightColors`, `DarkColors`, `LightTerminalColors`, `DarkTerminalColors` | `a{ss}` | Roles and terminal colours for each style |
| `AppIcons` | `a{ss}` | The app icon style, the glyph folder, and the plate, ink, shade and rim colours (`#rrggbbaa`) of tinted and clear icons, as `tinted-ink` and so on. With the original style, Luft's own apps draw their glyph without a plate in the surrounding text colour, with the shade at half its strength |
| `Taskbar` | `s` | JSON describing each taskbar look on the current wallpaper and style |

The same data is written to files shortly after each change:

| File | Holds |
| --- | --- |
| `~/.config/kestrel/appearance.json` | `accentColor`, `accentName`, `dark`, `pureBlack`, `colors`, `terminal`, and `schemes.light` and `schemes.dark` |
| `~/.config/kestrel/appearance.css` | `--kestrel-accent` and every role as a custom property, such as `--kestrel-on-surface-variant`, with dark values under `prefers-color-scheme: dark` |
| `~/.cache/kestrel/app-glyphs` | A two-tone glyph per installed app, named by desktop ID and filling the picture: white where it takes the ink, black where it takes the shade. On a plate it fills 64% of the plate |

With `theme-apps` in `com.lantharos.kestrel` on, Kestrel also writes colours for apps it doesn't draw: a marked block at the top of `~/.config/gtk-4.0/gtk.css` and `~/.config/gtk-3.0/gtk.css`, `Kestrel.conf` in `~/.config/qt6ct/colors` and `Kestrel.colors` in `~/.local/share/color-schemes` for Qt and KDE, and `Kestrel Light` and `Kestrel Dark` themes for Ghostty. It only touches blocks marked with a `Kestrel wallpaper colors` comment or files named Kestrel, and removes them when it's turned off. Either way, a block marked `Kestrel window edges` in both GTK files takes the line GTK draws along its windows' edges off floating windows, since Kestrel already outlines every window.

## Wallpaper focus

When a wallpaper's shape differs from the display's, Fill crops it, and the focus point `(x, y)` from 0 to 1 decides which part stays: `(0.5, 0.5)` keeps the middle and `(0.5, 1)` the bottom. A picture can carry its focus in a file next to it with the same name, such as `Fog.json` beside `Fog.jpg`:

```json
{ "focus": [0.5, 0.768] }
```

Without one, Settings estimates the focus from the picture's detail, colour and skin tones. The result lives in `wallpaper-focus` and `wallpaper-focus-dark`, and a spot someone dragged to in `wallpaper-focus-chosen`.

## Motion

The motion tokens live in `packages/web/motion/tokens.json`. Kestrel reads them when it's built, and `@luft/ui` turns them into CSS; after changing them, `bun run generate` in `packages/web/motion` updates both. The rules behind them:

- Anything that moves and can be interrupted, or follows a gesture, uses a spring, so it can change direction mid-way without a jump.
- Opacity and colour use short timed fades. Short fades on small things are linear.
- Exits are shorter than entrances and start moving at once. Only things that leave the screen altogether, such as a hiding taskbar, gather speed first, on `accelerate` or `depart`.

A spring is given by its duration, how long it takes to come visually close to its target from rest, and its bounce: 0 never overshoots. With duration *d* in seconds, bounce *b* and a mass of 1, the stiffness is (2π / *d*)² and the damping (1 − *b*) · 4π / *d*. `snappy` (250 ms) is for flyouts, popovers and small things moving, `smooth` (350 ms) for moving and resizing windows, and `thrown` (400 ms, bounce 0.12) for settling after a fling. A spring ends once it's within half a device pixel of its target and moving less than a pixel per frame, so its invisible tail doesn't keep the screen repainting.

### In Kestrel

`ease()` takes the tokens directly:

```ts
import { Curve, Duration, Spring } from '../shared/motion/motion.js';

actor.ease({translation_y: 0, spring: Spring.snappy});
actor.ease({opacity: 255, duration: Duration.standard, curve: Curve.decelerate});
actor.ease({translation_x: target, spring: Spring.smooth, velocity: releaseSpeed});
```

- `spring` runs a native spring, `Shell.SpringTransition`, that computes its position at every frame's own time, with no JavaScript per frame.
- A new `ease()` on a property with a running spring starts from the current position with the current speed, so something closed half-way through opening turns around smoothly.
- `velocity` is the starting speed in the property's units per second, such as a finger's at release. A spring keeps a property inside its range, so opacity thrown toward 0 rests at 0.
- Work that follows a window opening or closing, such as refreshing the taskbar, waits for the motion to end through `afterMotion()`.

The theme's stylesheets have the durations as `$motion-tap`, `$motion-quick`, `$motion-standard` and `$motion-large`.

### In the apps

`@luft/ui` defines every token as a CSS custom property: `--motion-quick` and the other durations, `--ease-decelerate` and the other curves, and each spring from rest as a `linear()` easing in `--spring-snappy` with its time in `--spring-snappy-duration`. Tailwind's `transition` utilities default to `--motion-tap` and `--ease-decelerate`.

A CSS spring always starts from rest. For something that can be interrupted or thrown, `SpringValue` runs the spring through the Web Animations API and picks up the current position and speed whenever it's retargeted:

```ts
import { SpringValue, Spring } from '@luft/ui';

const offset = new SpringValue(element, (x) => ({ translate: `${x}px 0` }));
offset.set(fingerX);
offset.to(0, { velocity: releaseSpeed, spring: Spring.thrown });
```

The Svelte transitions `page`, `dialog`, `fade`, `toast`, `item` and `menu` make things enter and leave the same way in every app, and `reorder` slides list items to their new places as others come and go; inside a `Section`, wrap each row in a `row-slot` so the dividers stay between rows. `selectionPill()` slides one highlight to a sidebar's item marked `aria-current="page"`, and `Toasts` shows one toast at a time that pauses under the pointer and can be swiped away. A toast shown with `duration: null` stays until it's closed, and one with a `detail` opens the full text in a dialog.

```svelte
{#each devices as device (device.id)}
	<div class="row-slot" animate:reorder in:item out:item>…</div>
{/each}
```

### Reduced motion

Settings has two choices: Animations off changes everything at once, and Reduce motion keeps animation but takes out the movement. Kestrel reads them from `enable-animations` and `reduced-motion` in GNOME's interface settings, and its settings portal reports either as reduced motion to other apps. Luft's apps see `data-motion="off"` or `data-motion="reduced"` on the root element, and `motionPreference()` returns `full`, `reduced` or `off`. Under reduced motion the shared styles keep only colour and opacity transitions, the presets only fade, and `SpringValue` changes at once unless it settles a gesture.
