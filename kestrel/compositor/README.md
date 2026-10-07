# Kestrel compositor

Kestrel carries an ordered Git patch series on Mutter. `upstream.json` pins the official repository, release, and exact base commit; `series` lists the patches in application order. The stack contains window rounding, framebuffer blur shader reuse, `xdg-toplevel-icon-v1` support, fractional glyph advances and grayscale antialiasing for shell text, desktop windows for Wayland clients the shell places behind everything else, such as live wallpapers, a fix that lets go of the input method when a focused text field is destroyed, so a later input source switch cannot read the freed field, and cursor lookup that moves on to the next cursor implementation when one declines a theme, so the shell's scalable cursors leave Xcursor themes to Mutter's loader, and cursor framebuffers that are removed rather than closed when they are released, so a compositor that exits leaves its last frame on screen without its pointer, and settings that come from Kestrel instead of gnome-settings-daemon. Desktop windows are never scanned out directly or used for variable refresh rate, since the shell draws its panels over them. When a display stops showing a fullscreen window's buffer directly, for example because the window left fullscreen, the compositor repaints the whole display right away instead of waiting for something else on screen to change.

Windows the shell marks as unconstrained can be placed anywhere, beyond the monitors and their work areas, without edge resistance or edge tiling while they are dragged; their popups and dialogs follow them without being pushed back onto a monitor. Window drags, Xwayland pointer positions and the culling of hidden window areas follow the window group's transform, so the shell can pan and zoom windows on a board by transforming that one group.

Clients can keep a toplevel out of the taskbar and window switcher, and above other windows, through `kestrel_window_v1`. Its window state object hides the window from window lists and keeps it above with the same window state as the compositor's own controls; the state survives the toplevel being unmapped and mapped again, and destroying the object undoes what it asked for. Sabine uses it for palettes and tray windows.

A display with variable refresh turned on only follows a window's frame rate while that window covers it and has its `variable-refresh` property set; every other window keeps the display at the fixed rate of its mode. Kestrel sets the property for games, so video players and browsers no longer drive the refresh rate with their irregular frame timing, which makes the brightness of many panels, VA panels in particular, flicker. Clients can describe their content through `wp_content_type_v1`, and windows report it as `content-type`, which Kestrel uses alongside its own game detection.

Mutter reads the rotation lock from `com.lantharos.kestrel.touchscreen` and the night light color temperature from `com.lantharos.Settings.NightLight`, which `kestrel-settings` provides, so it needs none of gnome-settings-daemon's settings or services. Color profiles that ask for a screen brightness no longer try to set it through gnome-settings-daemon, which stopped offering that interface. Monitor makers are named from systemd's hardware database, which carries the same registry of display vendors, so Mutter needs no part of gnome-desktop.

The stack also carries recovery from GPU resets, taken from GNOME/mutter!5247 by Toluwaleke Ogundipe. The GL context is created with reset notification; when the driver reports that it was lost, Mutter waits for the reset to finish, creates new EGL and Cogl contexts and restores what it owns, including windows, backgrounds, cursors, text and effects. Kestrel's shell recreates its own textures from the `graphics-restored` signal of the backend's graphics recovery context. Texture contents from a lost context draw nothing until they are replaced, and the backend reports how long the oldest frame handed to a physical display has been waiting to be presented, which Kestrel's watchdog uses to tell a stuck display from an idle one.

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

The 15px radius is measured in logical window coordinates. Each Wayland subsurface receives the same frame bounds transformed into its own coordinates. Xwayland uses the same shaped-texture path. Existing alpha masks and client shadow pixels outside the window frame remain intact. Inside the frame, the corners outside the curve continue the client's own shadow from the straight edges next to them, so a client that draws its shadow behind smaller corners shows no square gap around the rounded corner.

Only the blended pipeline receives the antialiased distance mask. Four small corner squares are removed from the opaque region so underlying pixels are drawn correctly; the remaining interior still uses unblended rendering. Native Xwayland shadows use the rounded shape without changing whether the client content qualifies for a shadow. Input cutouts are cached and refreshed when window geometry or the client input region changes. App-requested background blur uses the same mask on its existing output pass. Its effect shader is shared between frames. This adds no per-window offscreen framebuffer or continuous repaint source.

Maximized and fullscreen surfaces bypass rounding, preserving edge-to-edge presentation and direct scanout eligibility. Native display scanout must be qualified on hardware; a nested session cannot demonstrate it.

## Direct scanout diagnostics

To find out why a display kept showing a fullscreen window after it left fullscreen, turn on the log:

```sh
gsettings set com.lantharos.kestrel.diagnostics log-direct-scanout true
```

The compositor then writes a line to the journal whenever a display starts or stops showing a window's buffer directly, naming the app and why it stopped, and how long the desktop took to reach the screen afterwards. If the desktop isn't back after a second, it also records whether a redraw was queued and how long the oldest frame has waited for the display. At most 30 lines are written per minute. `journalctl --user -u kestrel.service | grep "Direct scanout"` shows them. Turn the log off again with `gsettings reset com.lantharos.kestrel.diagnostics log-direct-scanout`.

## Variable refresh diagnostics

To see which windows a display's refresh rate follows, turn on the log:

```sh
gsettings set com.lantharos.kestrel.diagnostics log-variable-refresh true
```

Whenever the window covering a display changes, the compositor writes whether the display's refresh rate follows it or stays fixed, and why, for example because the window shows video or isn't a game. Displays with variable refresh turned off say so at the end of the line. `journalctl --user -u kestrel.service | grep "Variable refresh"` shows them. Turn the log off again with `gsettings reset com.lantharos.kestrel.diagnostics log-variable-refresh`.

## Window icons

The compositor advertises `xdg-toplevel-icon-v1`, accepting theme names and square shared-memory images. Assignment and clearing take effect on the next surface commit. Icons are copied when first assigned, survive destruction of their protocol objects, and remain until explicitly replaced or cleared. Invalid buffers and mutation of assigned icons produce the protocol's errors.

Images take precedence when both a name and buffers are supplied. The compositor selects the buffer closest to a logical 128px, preferring greater density for ties, and bounds the stored image to 512px. Common 8-bit formats use a direct CPU copy; other supported shared-memory formats use Mutter's existing texture importer for conversion once per icon. Icon changes do not create redraw timers.

Kestrel uses these icons for window-backed panel entries, window previews, and the window switcher. Installed application groups retain their desktop-entry icons. The application or its toolkit must send the protocol; this does not change app-ID matching or merge incorrectly grouped windows.

## Qualification

Isolated GPU-backed captures cover square Wayland and Xwayland clients, client decorations, maximized and fullscreen states, subsurfaces, app-requested blur, pointer corners, and a 150% display scale. Moving-window damage captures are compared with full repaints, and the shell workload checks idle paints and actor reuse.

Icon qualification covers commit timing, theme names, premultiplied ARGB and RGB565 conversion, buffer replacement and lifetime, live shell bindings, clearing, remapping, and protocol errors for invalid sizes, invalid scale, immutable icons, and early buffer destruction.

Changing fractional scale while a GTK Xwayland window is running can produce incorrectly scaled client content in the underlying compositor/client stack. This reproduces with window rounding disabled; it remains separate from the corner mask. Physical display scanout and mixed-scale monitor hotplug still need hardware qualification.

The patches are licensed under GPL-2.0-or-later, matching Mutter.
