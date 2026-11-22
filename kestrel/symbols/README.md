# Symbols

Mochi, Luft's symbolic icon theme: the small one-colour icons the desktop and apps ask for by name, such as `audio-volume-high-symbolic`. Each one is drawn here on a 16-pixel grid in `drawings`, in ink, a lighter shade for secondary parts and inactive levels, and cuts that knock gaps out of what's drawn before them. `aliases` gives drawings their other names. Mochi has no app icons; anything it doesn't draw comes from Adwaita.

`bun run build` turns the drawings into the theme in `theme`, mirrored where right-to-left languages need it, and `bun run check` fails when `theme` is out of date. `bun run preview PAGE.html` writes a page of every icon in light and dark.
