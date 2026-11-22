# Cursors

Plume, Luft's cursor theme, in light and dark. Every cursor is drawn here as SVG on a 32-unit grid and written out as Xcursor files at 24, 32, 48 and 64 pixels, with the names X11, GTK and CSS ask for linked to them.

To try a change on your own desktop:

```sh
cargo run --release -p luft-cursors -- ~/.local/share/icons
gsettings set org.gnome.desktop.interface cursor-theme Plume
```

The image builds the same themes into `/usr/share/icons`.
