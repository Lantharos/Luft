# Kestrel compositor

Kestrel runs on its own build of Mutter 51: the upstream release plus an ordered Git patch series. It builds next to the system's Mutter and never replaces it.

| File | Purpose |
| --- | --- |
| `upstream.json` | Upstream repository, release and exact base commit |
| `series` | Patches in the order they apply |
| `patches/` | The patches, in Git format |
| `patches.py` | Prepares, exports and checks the series |
| `build.sh` | Builds and installs the patched Mutter for development |

## Build

Install Mutter's build dependencies (`sudo dnf builddep mutter`), then from the repository root:

```sh
kestrel/compositor/build.sh
```

| Path | Contents |
| --- | --- |
| `kestrel/run/mutter-source` | Git checkout with the series applied |
| `kestrel/run/compositor-build` | Build directory |
| `kestrel/run/mutter-install` | Installed libraries that development sessions load |

What the patches add, editing them, moving to a new Mutter release and the diagnostics logs are in [the compositor reference](../../docs/components/compositor.md).

## License

The patches are GPL-2.0-or-later, like Mutter.
