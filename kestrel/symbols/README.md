# Symbols

Mochi, Luft's own icons: the symbolic icon theme the desktop and GTK apps ask for by name, such as `audio-volume-high-symbolic`, and the icons Luft's apps import. Each one is drawn here on a 16-pixel grid in `drawings`, in ink, a lighter shade for secondary parts and inactive levels, and cuts that knock gaps out of what's drawn before them. `drawings/app` holds the ones only the apps use. Mochi has no app icons; anything the theme doesn't draw comes from Adwaita.

`aliases` gives theme icons their other names, and `components` names the icons apps import, as in `import Check from '@luft/symbols/icons/check'`; they take a `size` and any SVG attribute, and draw in the current text colour.

`bun run build` writes the theme to `theme`, mirrored where right-to-left languages need it, and the app icons to `icons`. `bun run check` fails when either is out of date, and `bun run preview PAGE.html` writes a page of every drawing in light and dark.
