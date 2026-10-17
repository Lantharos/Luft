# Kestrel theme

The stylesheets Kestrel's engine and UI load, compiled with `sassc` during the Meson build into resources under `resource:///com/lantharos/kestrel/theme`.

| File | Use |
| --- | --- |
| `base-light.scss`, `base-dark.scss`, `base-high-contrast.scss` | Base widget styles. The high contrast one is used while the high contrast setting is on |
| `sass/` | Sources for the base styles: colors in `_colors.scss` and `_palette.scss`, the motion durations in `_motion.scss` (generated from `packages/motion`), mixins in `_drawing.scss`, shared selectors in `_common.scss`, and one file per widget in `widgets/` |
| `kestrel-light.scss`, `kestrel-dark.scss` | Kestrel's own styles, loaded on top of the base |
| `panel-ink-light.scss`, `panel-ink-dark.scss` | The taskbar's backgrounds, ink, hover fills and halos in each style. The shell reads them to pick the taskbar's ink for the wallpaper, and copies the rules it needs into the wallpaper stylesheets |
| `kestrel/` | Sources for Kestrel's styles, one file per part of the shell. Colors come from the tokens in `_tokens.scss` (`ink()`, `fill()`, `glass()`), so both styles share every rule |

The shell loads the light or dark pair to match `color-scheme`. Glass surfaces read their blur shading from `-kestrel-glass-highlight`, `-kestrel-glass-dim`, `-kestrel-glass-lift` and `-kestrel-glass-saturation` on `stage`. Wallpaper colors are generated at runtime as `accent-light.css` and `accent-dark.css`; any stylesheet named `*-light.css` or `*-dark.css` is swapped for its sibling when the style changes.

Set `KESTREL_THEME_DIR` to the build's `data/theme` folder to load the compiled stylesheets from there and reload them when they change. `kestrel/tools/session.sh` does this, so rebuilding with `meson compile -C kestrel/build` restyles a running session.
