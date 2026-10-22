# Rover

Rover is Luft's file manager, and the file dialog every app uses: tabs, list, grid and column views, Quick Look, search by name or contents, network locations, cloud drives and Git status. Using it is described in [the docs](https://docs.luft.computer/apps/rover/).

Network locations need GVfs with `gvfs-fuse` and the backend for each protocol, such as `gvfs-smb`.

## Build and run

Install dependencies once from the repository root with `bun install`, then from this folder:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # Sabine bundle
sabine install --bundle .
```

Thumbnails only load from the packaged app, so they show in builds and bundles, not against the Vite dev server.

The desktop entry opens folders, archives, which it extracts next to themselves, and `sftp://`, `smb://`, `dav://`, `davs://` and `nfs://` links. If Rover is running, a path opens in a new tab.

## File dialogs and "Show in folder"

Kestrel already prefers Rover for file dialogs. Elsewhere, register it for your account:

```sh
../../target/debug/rover --install-file-chooser-portal   # the xdg-desktop-portal FileChooser backend
systemctl --user restart xdg-desktop-portal.service
../../target/debug/rover --install-file-manager-bus      # org.freedesktop.FileManager1
```

The install flags point at the executable that ran them, so they work from a bundle or a local build. On other desktops, also add `org.freedesktop.impl.portal.FileChooser=rover;*` under `[preferred]` in `~/.config/xdg-desktop-portal/portals.conf`.

## License

MIT. Open Runde and Maple Mono are under the SIL Open Font License, in [`packages/web/ui/fonts`](../../packages/web/ui/fonts).
