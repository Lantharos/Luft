# Kestrel theme

The stylesheets Kestrel's engine and UI load, compiled into resources under `resource:///com/lantharos/kestrel/theme`.

| File | Use |
| --- | --- |
| `base-dark.scss`, `base-high-contrast.scss` | Base widget styles, built to CSS with `sassc` during the Meson build. The high contrast one is used while the high contrast setting is on |
| `sass/` | Sources for the base styles: colors in `_colors.scss` and `_palette.scss`, mixins in `_drawing.scss`, shared selectors in `_common.scss`, and one file per widget in `widgets/` |
| `kestrel.css` | Kestrel's own styles, loaded on top of the base |
| `kestrel-portal.css`, `kestrel-passkeys.css` | Portal and passkey dialogs |

Edit the `.scss` sources, not the generated CSS. The three `kestrel*.css` files are plain CSS and are edited directly.

Set `KESTREL_CSS_PATH` to the local `kestrel.css` when launching the shell to reload the `kestrel*.css` files on every save.
