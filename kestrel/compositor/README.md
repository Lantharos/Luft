# Kestrel compositor

Kestrel runs on its own build of Mutter 51: the upstream release plus an ordered Git patch series. It builds next to the system's Mutter and never replaces it.

| File | Purpose |
| --- | --- |
| `upstream.json` | Upstream repository, release and exact base commit |
| `series` | Patches in the order they apply |
| `patches/` | The patches, in Git format |
| `patches.py` | Prepares, exports and checks the series |
| `build.sh` | Builds and installs the patched Mutter for development |

## What the patches add

- Rounded window corners that stay square on maximized, tiled and fullscreen windows, so those keep direct scanout
- Shared background blur, `xdg-toplevel-icon-v1` icons, and `kestrel_window_v1` for windows kept out of window lists
- Snapping and maximizing that animate at once, and windows the shell tiles counting as tiled
- Shell text with fractional glyph advances and grayscale antialiasing
- Shell text, icons and labels drawn at a fractional scale's own resolution and on whole pixels, so they stay sharp at 125% and 150%
- Desktop windows for live wallpapers, and the transformed window groups behind the board
- Variable refresh only for games, and `wp_content_type_v1`
- Settings from `kestrel-settings` in place of gnome-settings-daemon, and default display scales aimed at 110 DPI
- Recovery from GPU resets, from GNOME/mutter!5247 by Toluwaleke Ogundipe
- Windows that appear after you moved on open behind and ask for attention instead of taking focus
- Touchpad scrolling at the speed set by the touchpad's `scroll-speed` setting
- Title bars for X11 apps in Kestrel's style, colored from `~/.config/kestrel/appearance.css`
- Smaller fixes, each described in its patch

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

## Edit the patches

```sh
python3 kestrel/compositor/patches.py prepare   # check out upstream and apply the series
# commit changes in kestrel/run/mutter-source
python3 kestrel/compositor/patches.py export    # write the committed stack back to patches/
python3 kestrel/compositor/patches.py check     # replay the series and compare trees
kestrel/compositor/build.sh
```

- Keep each patch focused with ordinary commits, fixups and rebases.
- `prepare` refuses to replace a checkout with uncommitted or unexported work. The previous head is kept at `refs/kestrel/previous`.
- `python3 kestrel/compositor/patches.py status` shows the state of the checkout.

## Update Mutter

```sh
source_dir=kestrel/run/mutter-source
old_base=$(python3 -c 'import json; print(json.load(open("kestrel/compositor/upstream.json"))["revision"])')
new_tag=51.1
git -C "$source_dir" fetch origin "refs/tags/$new_tag:refs/tags/$new_tag"
git -C "$source_dir" rebase --onto "$new_tag" "$old_base" kestrel
# resolve conflicts, then git rebase --continue
python3 kestrel/compositor/patches.py export --base "$new_tag" --version "$new_tag"
python3 kestrel/compositor/patches.py check
kestrel/compositor/build.sh
```

The pinned base only changes when both `--base` and `--version` are given. `git rebase --abort` restores the old stack. A Mutter ABI change also needs the engine build and session library paths updated.

## Diagnostics

Both logs go to the journal (`journalctl --user -u kestrel.service`). Turn them off with `gsettings reset`.

| Key in `com.lantharos.kestrel.diagnostics` | Logs |
| --- | --- |
| `log-direct-scanout` | When a display starts or stops showing a window's buffer directly, and how long the desktop took to come back (lines start with "Direct scanout") |
| `log-variable-refresh` | Whether a display's refresh rate follows the window covering it, and why (lines start with "Variable refresh") |

```sh
gsettings set com.lantharos.kestrel.diagnostics log-direct-scanout true
```

## Known issues

Changing fractional scale while a GTK Xwayland window is open can scale its content incorrectly, with or without the corner patch.

## License

The patches are GPL-2.0-or-later, like Mutter.
