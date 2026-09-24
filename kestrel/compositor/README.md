# Kestrel compositor

Kestrel carries an ordered Git patch series on Mutter. `upstream.json` pins the official repository, release, and exact base commit; `series` lists the patches in application order. The stack contains window rounding, framebuffer blur shader reuse, and `xdg-toplevel-icon-v1` support.

## Build

From the repository root:

```sh
kestrel/compositor/build.sh
kestrel/tools/session.sh nested
```

Install Mutter's build dependencies first, including GdkPixbuf. The builder prepares a Git checkout in `kestrel/run/mutter-source`, builds in `kestrel/run/compositor-build`, and installs into `kestrel/run/mutter-install`. The launcher loads that build's Mutter, Clutter, Cogl, and Mtk together. Distribution libraries and the running host session remain untouched.

## Edit the patches

```sh
python3 kestrel/compositor/patches.py prepare
# Edit and commit changes in kestrel/run/mutter-source.
python3 kestrel/compositor/patches.py export
python3 kestrel/compositor/patches.py check
kestrel/compositor/build.sh
```

Use ordinary Git commits, fixups, and interactive rebase to keep each patch focused. Export serializes the complete committed stack into Git-format patches, including added files. Check applies the exported series in a temporary worktree and compares its resulting tree with the prepared checkout. Uncommitted edits and unexported commits prevent prepare from replacing the checkout. When switching series, its previous head is retained at `refs/kestrel/previous`.

## Update Mutter

Keep the base and patch stack in Git while resolving conflicts:

```sh
source_dir=kestrel/run/mutter-source
old_base=$(python3 -c 'import json; print(json.load(open("kestrel/compositor/upstream.json"))["revision"])')
new_tag=51.1 # Choose the intended upstream release.
git -C "$source_dir" fetch origin "refs/tags/$new_tag:refs/tags/$new_tag"
git -C "$source_dir" rebase --onto "$new_tag" "$old_base" kestrel
# Resolve conflicts, git add, then git rebase --continue as needed.
python3 kestrel/compositor/patches.py export --base "$new_tag" --version "$new_tag"
python3 kestrel/compositor/patches.py check
kestrel/compositor/build.sh
```

`git rebase --abort` restores the original stack if the update is abandoned. Export changes the pinned base only when both `--base` and `--version` are supplied. Review the exported diff and qualify a local session before committing the lock and patches to Luft. Major Mutter ABI changes also require updating the shell build and session library paths.

## Window rendering

The 12px radius is measured in logical window coordinates. Each Wayland subsurface receives the same frame bounds transformed into its own coordinates. Xwayland uses the same shaped-texture path. Existing alpha masks and client shadow pixels outside the window frame remain intact.

Only the blended pipeline receives the antialiased distance mask. Four small corner squares are removed from the opaque region so underlying pixels are drawn correctly; the remaining interior still uses unblended rendering. Native Xwayland shadows use the rounded shape without changing whether the client content qualifies for a shadow. Input cutouts are cached and refreshed when window geometry or the client input region changes. App-requested background blur uses the same mask on its existing output pass. Its effect shader is shared between frames. This adds no per-window offscreen framebuffer or continuous repaint source.

Maximized and fullscreen surfaces bypass rounding, preserving edge-to-edge presentation and direct scanout eligibility. Native display scanout must be qualified on hardware; a nested session cannot demonstrate it.

## Window icons

The compositor advertises `xdg-toplevel-icon-v1`, accepting theme names and square shared-memory images. Assignment and clearing take effect on the next surface commit. Icons are copied when first assigned, survive destruction of their protocol objects, and remain until explicitly replaced or cleared. Invalid buffers and mutation of assigned icons produce the protocol's errors.

Images take precedence when both a name and buffers are supplied. The compositor selects the buffer closest to a logical 128px, preferring greater density for ties, and bounds the stored image to 512px. Common 8-bit formats use a direct CPU copy; other supported shared-memory formats use Mutter's existing texture importer for conversion once per icon. Icon changes do not create redraw timers.

Kestrel uses these icons for window-backed panel entries, window previews, and the window switcher. Installed application groups retain their desktop-entry icons. The application or its toolkit must send the protocol; this does not change app-ID matching or merge incorrectly grouped windows.

## Qualification

Isolated GPU-backed captures cover square Wayland and Xwayland clients, client decorations, maximized and fullscreen states, subsurfaces, app-requested blur, pointer corners, and a 150% display scale. Moving-window damage captures are compared with full repaints, and the shell workload checks idle paints and actor reuse.

Icon qualification covers commit timing, theme names, premultiplied ARGB and RGB565 conversion, buffer replacement and lifetime, live shell bindings, clearing, remapping, and protocol errors for invalid sizes, invalid scale, immutable icons, and early buffer destruction.

Changing fractional scale while a GTK Xwayland window is running can produce incorrectly scaled client content in the underlying compositor/client stack. This reproduces with window rounding disabled; it remains separate from the corner mask. Physical display scanout and mixed-scale monitor hotplug still need hardware qualification.

The patches are licensed under GPL-2.0-or-later, matching Mutter.
