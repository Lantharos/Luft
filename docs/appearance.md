# Wallpaper colors

Kestrel takes an accent from the wallpaper's most vivid dominant hue (white when the wallpaper has hardly any color, or when White is chosen in Settings) and builds a full palette from it for light and dark. Apps can read it to match the desktop.

## Palette

Every role sits at a fixed tone (perceived lightness, 0 is black and 100 is white), so contrast is the same whatever the wallpaper.

| Role | Light | Dark | Use |
| --- | --- | --- | --- |
| `primary`, `secondary`, `tertiary`, `error` | 40 | 80 | Filled controls, links, highlights. Secondary is a quieter accent, tertiary turns its hue by 60°, error is a fixed red |
| `onPrimary`, `onSecondary`, `onTertiary`, `onError` | 100 | 20 | Text and icons on those colors |
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

- Text roles and accent colors reach 4.5:1 against every surface of their scheme, `on…` roles reach 4.5:1 against their color, and `outline` reaches 3:1.
- A white accent makes the palette black and white: `primary`, `onPrimary`, `primaryContainer`, `onPrimaryContainer` and `inversePrimary` become 10, 100, 25, 100, 100 in light and 100, 10, 85, 0, 10 in dark.
- With Pure black, dark `surface`, `surfaceDim` and `surfaceContainerLowest` are `#000000`, then 4, 8, 12, 17 for the other containers and 18 for `surfaceBright`.

Terminal colors are the usual sixteen, nudged up to 15° toward the accent, readable against the background at 4.5:1. The cursor uses `primary` and selections use `primaryContainer`. Keys: `foreground`, `background`, `cursor`, `cursorText`, `selectionBackground`, `selectionForeground`, `color0` to `color15`.

## Reading the palette

`com.lantharos.Kestrel` exports `com.lantharos.Kestrel.Appearance` at `/com/lantharos/Kestrel/Appearance` on the session bus. Properties are read-only and emit `PropertiesChanged`. Colors are `#rrggbb`.

| Property | Type | Value |
| --- | --- | --- |
| `AccentColor` | `s` | The accent |
| `WallpaperAccentColor` | `s` | The wallpaper's accent, also while White is chosen |
| `Dark`, `PureBlack` | `b` | Current style |
| `Colors`, `TerminalColors` | `a{ss}` | Roles and terminal colors for the current style |
| `LightColors`, `DarkColors`, `LightTerminalColors`, `DarkTerminalColors` | `a{ss}` | The same for each style |
| `AppIcons` | `a{ss}` | App icon style, the glyph folder, and the plate, ink, shade and rim colors (`#rrggbbaa`) |

The same data as files, rewritten shortly after each change:

| File | Contents |
| --- | --- |
| `~/.config/kestrel/appearance.json` | `accentColor`, `accentName`, `dark`, `pureBlack`, `colors`, `terminal`, and `schemes.light` / `schemes.dark` |
| `~/.config/kestrel/appearance.css` | `--kestrel-accent` and every role as a custom property (`--kestrel-on-surface-variant`), dark values in `@media (prefers-color-scheme: dark)` |
| `~/.cache/kestrel/app-glyphs` | Two-tone glyph per installed app, named by desktop ID, for drawing tinted and clear icons |

## Matching other apps

With Match other apps to the wallpaper on (`theme-apps` in `com.lantharos.kestrel`), Kestrel writes colors for apps it doesn't draw. It only touches blocks marked with a `Kestrel wallpaper colors` comment, or files named Kestrel, and removes them when turned off.

| App | Where |
| --- | --- |
| GTK 4 and libadwaita | Block at the top of `~/.config/gtk-4.0/gtk.css`, both styles |
| GTK 3 | Block at the top of `~/.config/gtk-3.0/gtk.css`, for themes such as adw-gtk3 |
| Qt | `~/.config/qt6ct/colors/Kestrel.conf` (with `QT_QPA_PLATFORMTHEME=qt6ct`) and `~/.local/share/color-schemes/Kestrel.colors` for KDE |
| Ghostty 1.2+ | `Kestrel Light` and `Kestrel Dark` in `~/.config/ghostty/themes`, selected at the top of the config |
