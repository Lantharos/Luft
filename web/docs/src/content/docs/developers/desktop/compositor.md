---
title: The compositor
description: Kestrel's patch series on Mutter, how glass is drawn, how to edit the series and move it to a new Mutter release, and how Luft keeps what it carries on its way upstream.
sidebar:
  order: 7.5
---

Kestrel runs on its own build of Mutter 51 in `kestrel/compositor`: the upstream release at the commit in `upstream.json`, plus an ordered Git patch series. It builds next to the system's Mutter and never replaces it.

## What the patches add

- **Windows.** Rounded corners that stay square where a maximized or tiled window meets the screen edge or another window, and on fullscreen windows so they keep direct scanout. A thin outline on every floating window, and a shadow around those that don't draw their own. Floating windows are told they're tiled while corners are square, so GTK, libadwaita, Chromium and Electron apps draw square corners and leave the shadow to the compositor. Title bars in Kestrel's style for X11 apps and for Wayland apps that ask through `xdg-decoration`.
- **Glass.** A dual Kawase blur with targets kept across frames, app glass that keeps its blur until what is behind it changes, the frosted wallpapers glass shows instead of blurring, the Maris and Niko materials, blue-noise grain, and `kestrel_glass_v1` for apps to hear and ask for a material, all described under [Glass](#glass).
- **The shell.** Redraw clips that the shell can grow, desktop windows for live wallpapers, the transformed window groups behind the board, shortcuts the shell adds winning over built-in ones, drops from Wayland apps onto the shell's own actors, a signal before a monitor turns, and fragment shader chains over a whole display or a single actor for screen effects. Shell text with fractional glyph advances and grayscale antialiasing, drawn at a fractional scale's own resolution so it stays sharp at 125% and 150%. Text and icons drawn one texel to a device pixel land on the same whole pixel a background with that edge starts on, so an icon centred on its button stays centred at any scale. The shell lays every icon out at a whole number of device pixels, so at 175% a 28 point icon is 47 pixels drawn as they are, not stretched over 46⅔.
- **Sandboxed apps.** `wp_security_context_v1`, which Flatpak and Luft's AppImage sandbox use to tag their apps' connections. Mutter's screen recording, remote control and display services refuse sandboxed callers, and so does every Mutter D-Bus interface not listed as open. [App sandbox](/security/app-sandbox/) explains what each permission opens.
- **Protocols.** `ext-foreign-toplevel-list-v1`, `ext-image-copy-capture-v1` and the overlay layer of `wlr-layer-shell` for apps that may record windows ([Recording windows](/developers/desktop/kestrel/#recording-windows)), `xdg-toplevel-icon-v1`, `wp_content_type_v1`, `ext-idle-notify-v1` with idle times of at least ten seconds for sandboxed apps, so no app can follow someone's typing, and `ext-data-control-v1` for password managers that clear what they copied.
- **Input.** Touchpad scrolling at the touchpad's `scroll-speed`, and at the fingers' pace in Chromium-based apps, which would scroll twelve times too far. Palm rejection for pens on a touchscreen, every pen sample with its pressure for the shell's own strokes, pen settings shared by every pen, and button actions that reach the shell as `pen-action`. Modifiers the shell can treat as used up while a shortcut made of them is held. A `pointer-shaken` signal on the cursor tracker, and a pointer the shell can draw larger, described under [Shake to find the pointer](#shake-to-find-the-pointer). Virtual devices that act as pens or flip the tablet mode switch, for checks.
- **Display and focus.** Variable refresh only for games, default display scales aimed at 110 DPI, settings from `kestrel-settings` in place of gnome-settings-daemon, recovery from GPU resets (GNOME/mutter!5247, by Toluwaleke Ogundipe), and windows that appear after you moved on opening behind and asking for attention.
- **Crashes.** A Wayland socket inherited from `kestrel-wrapper`, so apps can reconnect after Kestrel crashes ([Kestrel](/developers/desktop/kestrel/#crash-recovery)).

## Glass

Glass comes in three materials, chosen per kind of surface in `com.lantharos.kestrel.glass`: `taskbar`, `surfaces` for Gust, panels, menus and dialogs and for apps' transient surfaces, `windows` for app windows, and `see-through` for the glass behind [see-through windows](/windows/see-through/). All four are Niko unless people choose otherwise. `blurs` says whether Luca and Niko blur everything behind them or only the wallpaper, which they do unless people choose otherwise, and `wallpaper-on-power-saver` makes them blur only the wallpaper while the power saver is on. `kestrel/ui/src/appearance/glass` follows the settings and the power profile, sets each shell blur's style and tells Mutter with `meta_compositor_set_glass`.

**Luca** blurs what is behind the glass with a dual Kawase pyramid in `ClutterBlur`. The area is halved two to six times, five taps a step, and brought back up to half its size, eight taps a step, so every pixel weighs in once and moving content doesn't shimmer. The depth and the tap offset are matched to a Gaussian of the requested radius, so a radius of 30 looks as wide as it did as a Gaussian. Blur targets are pooled by depth and by size rounded up to 64 pixels, with the copy of the screen going straight into the first level, so resizing and the overview reuse them. A result costs about 45 µs of GPU time on a taskbar and 60 to 100 µs on a window sidebar.

- **Shell glass** is `ShellBlurEffect`. It keeps a copy of what is behind it, refreshed only where the stage repainted and something below changed, and its blurred result at half size, which it draws again as one quad until something behind it changes.
- **App glass** is the `ext-background-effect-v1` blur in `src/compositor/meta-background-*.c`. Before each frame, a redraw clip filter looks at the actors below each glass window, as the shell does. Only when something there repainted under the glass, the stacking changed or the window moved does it add the glass to the redraw clip and blur again. Otherwise the window draws the blur it kept for that view. The blur reads only the glass and, for glass around an opaque sheet, the strip of the sheet within the blur's reach of it, drawing each step of the pyramid only there. So the redraw clip never grows past that, other glass isn't set off and what is under the rest of the window stays culled. Clones, such as the overview's, draw their window's kept blur, and windows that aren't painted aren't blurred.

**Luca that blurs only the wallpaper** shows the frosted wallpaper instead. `FrostedWallpaper` blurs each monitor's wallpaper once, at a quarter of its size, and stores it on disk. Shell glass draws the piece of wallpaper under it with the same dimming, lift, saturation and corners as a live blur, and app glass with the same saturation and grain. Neither copies the screen, blurs or grows the redraw clip, so this glass costs one textured quad, however busy the screen behind it is.

**Maris** is drawn like Windows' Mica: the desktop's surface colour, from the wallpaper's palette, over a much wider blur of the wallpaper, so only its colours are left and they shift as a window moves. It comes from a second frosted wallpaper, blurred with a radius of 300 and stored at a thirty-second of the monitor's size. Each pixel of it first takes the luminosity of the surface colour and keeps its own hue and saturation, the luminosity blend of CSS and PDF, so the wallpaper tints the glass without ever making it lighter or darker. The surface colour then covers 80% of that in the dark style and 50% in the light style. Maris leaves out Luca's dimming, lift and saturation. On shell glass the surface's own background counts towards the share the surface colour covers.

The shell renders each frosted wallpaper only while something uses it: the blurred one while Luca or Niko blurs only the wallpaper, the wide one while any kind of surface is Maris or an app asks for it. It hands the pieces to Mutter with `meta_compositor_add_frosted_wallpaper`, and the surface colour with `meta_compositor_set_glass_surface`, whose alpha is the share the colour covers and whose `luminosity` says how far the wallpaper takes the colour's luminosity first. Shell glass and app glass both read them from there.

**Niko** is drawn like Windows' Acrylic. It blurs what is behind the glass on Luca's path with a radius of 60, twice Luca's, and blurs only the wallpaper whenever `blurs` says so, from the same frosted wallpaper. Each pixel then takes the luminosity of the Niko tint, 96% of the way in the dark style and 85% in the light style, and the tint's hue and saturation, the colour blend, 15% of the way in the dark style and not at all in the light style. A vivid wallpaper would still colour the glass through the luminosity blend, so Kestrel measures how colourful the wallpaper is, the mean chroma of its samples averaged three by three, and above 0.035 eases that through a soft knee toward 0.04. The colour blend then goes further by the same ratio, so the share of the wallpaper's colour that is left shrinks with it; muted wallpapers stay below the knee and keep the shares above. The dark tint is the surface colour raised to the lightness of #2C2C2C, a little lighter than Luft's surfaces, so the wallpaper's colours show through it warmly while text keeps a contrast above 11:1; the light tint is the surface colour itself. A speckle of 2% noise from the grain tile replaces the grain. Since the tint already is the whole surface, shell glass cancels its surface's own background, so the background drawn over it lands on the Niko colour. Niko costs what Luca costs, and as little as Luca that blurs only the wallpaper in the power saver.

The shell hands the tint over with `meta_compositor_set_niko_tint`, whose alpha is the share of the tint's hue and whose `luminosity` is how far the blur takes its luminosity.

The final pass of every glass, shell or app, adds grain to hide banding: ±0.5%, half of that on black, from two lookups of a 64 pixel tile of blue noise (`clutter_blur_node_get_grain`) at each screen pixel, so it spreads like triangular dither and reads as a matte surface.

The lock screen's backdrop is a frosted wallpaper of its own, made by `LockBackdrop` with `FrostedWallpaper` and stored on disk like the others: blurred with a radius of 90 at a quarter of the monitor's size, dimmed in the dark style and washed with white in the light one. With `lock-screen-fluted` in `com.lantharos.kestrel` it is blurred with a radius of 8 at full size instead, and the blur's final pass, a `ShellBlurEffect` made with `fluted`, draws it through upright ribs 27 logical pixels wide. Each rib samples the wallpaper across about three ribs' width and mirrors it like a cylindrical lens, splitting red and blue a little toward its edges. The result keeps 85% of the wallpaper's saturation and maps its lightness into 0.12 to 0.42 in the dark style and 0.72 to 0.94 in the light one, with a thin highlight left of each rib's middle and shading toward its edges. That shading follows how different the wallpaper is across the rib, so flat areas such as a foggy sky keep only faint seams and don't read as corrugated metal. All of it happens once, while the backdrop is made, so the lock screen costs one textured quad either way.

### Glass in apps

`kestrel_glass_v1` gives a surface with glass a glass object. Through it, an app says whether the glass is the base of a window or a transient surface such as a popover, a menu or a palette, which follows the choice for panels and menus, and can ask for a material instead of the person's choice:

| Preference | Gets |
| --- | --- |
| `user` | The material people chose for the role, the default |
| `maris` | Maris, always |
| `luca` | Luca, which blurs only the wallpaper whenever people's glass does |
| `niko` | Niko, which blurs only the wallpaper whenever people's glass does |

The app hears which material its glass has through the `material` event, sent when the object is created and whenever it changes. Over Maris and Niko it draws no tint of its own, since they already are the whole surface. Apps that speak only `ext_background_effect_v1` get the person's choice for app windows. Sabine speaks the protocol for its windows; Luft's apps set it through `GlassWindow`'s `backdrop`, see [Writing apps](/developers/desktop/writing-apps/#glass).

## Shake to find the pointer

While something listens to `pointer-shaken`, the cursor tracker follows the pointer's relative motion, or its position for devices without it. A stroke counts when it covers at least 40 logical pixels at 500 pixels a second or more and its ends lie at least 80% of the path apart, so arcs and circles don't count. A turn is a reversal of more than 120° after at least 6 pixels, and once three counted strokes have turned within 600 ms, every further turn emits the signal. A pause of 100 ms, a sideways turn or a stroke that doesn't count starts over. Motion is ignored while a button is held, the shell holds a grab, a window is moved, an app locks or confines the pointer, or the pointer is hidden.

`meta_cursor_tracker_set_magnification()` multiplies the pointer's size and hotspot. Theme cursors load at the next whole multiple of the display scale times the magnification, so they are only scaled down, and each size is loaded once. The hardware cursor carries the larger pointer while it fits the cursor plane; beyond that, and for app cursors in GPU buffers, the cursor overlay draws it, redrawing only where the pointer was and is. The shell eases the magnification up to 4×, at most 128 logical pixels and at least 1.5×, holds it while the signal keeps coming and eases back 600 ms after the last. Pressing Ctrl, when people turned that on, plays the same enlargement once.

`patches.py shake` replays generated traces through the detector: mouse, touchpad and elliptic shakes have to count, swipes, circles, slow drawing, an overshoot, a tremor and scanning back and forth across the screen must not.

## Editing the patches

```sh
python3 kestrel/compositor/patches.py prepare   # check out upstream and apply the series
# commit changes in kestrel/run/mutter-source
python3 kestrel/compositor/patches.py export    # write the committed stack back to patches/
python3 kestrel/compositor/patches.py check     # replay the series and compare trees
kestrel/compositor/build.sh
```

Keep each patch focused, with ordinary commits, fixups and rebases. `prepare` refuses to replace a checkout with uncommitted or unexported work, and keeps the previous head at `refs/kestrel/previous`; `status` shows the state of the checkout.

`patches.py identity` builds the series' process identification against `packages/identity/sandbox-cases.ini`, the cases Luft's own services are tested against too, so Mutter and the services judge every process alike. After a patch changes API the shell uses, regenerate [Kestrel's types](/developers/building/#kestrel).

## Moving to a new Mutter

`patches.py trial latest` shows beforehand which patches the new release already carries and which will conflict. Drop the patches whose change is in the release, then rebase the rest:

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

The pinned base only changes when both `--base` and `--version` are given, and `git rebase --abort` restores the old stack. A Mutter ABI change also needs the engine build and the session's library paths updated.

## Upstream

Every carried change costs work on each upstream release, and Fedora moves to new GNOME releases on its own schedule, so each change should either be on its way upstream or have a clear reason to stay.

Every Mutter patch has an `Upstream-Status` trailer in its commit message, so the status travels with it through rebases and exports:

| Status | Meaning |
| --- | --- |
| `upstream URL` | The merge request or commit upstream that carries it, merged or still open, with an optional note |
| `forwardable` | Nothing in it is specific to Luft, with an optional note on what to drop first |
| `luft-only REASON` | Stays with Luft, with a short reason, such as an API only Kestrel's shell uses |

```sh
git commit --trailer "Upstream-Status: forwardable"
python3 kestrel/compositor/patches.py list            # every patch's status and the totals
python3 kestrel/compositor/patches.py trial main latest
```

`prepare`, `check` and `export` refuse a patch without a valid status. `trial` applies the series to the given branches or tags, skips what doesn't apply, and says which patches apply, need a 3-way merge, are already there or conflict. `kestrel/compositor/upstream` holds forwardable patches prepared as merge requests, one folder each, with the patches rebased onto Mutter's main branch and a `description.md`. Once one is open, its patch's status becomes `upstream` with the link, and the folder goes when it merges.

The engine in `kestrel/engine` started as GNOME Shell's C code at the commit in `kestrel/engine/upstream.json`, and most files under `src` keep their GNOME Shell paths, so fixes to them can come over:

```sh
python3 kestrel/engine/upstream.py changes        # GNOME Shell main, or a tag such as 52.0
python3 kestrel/engine/upstream.py show COMMIT | git apply -3 --directory=kestrel/engine
```

Add a commit to `picked` in `upstream.json` once it's brought over or decided against, so it drops off the list. The patched packages in `os/image/patches` each have a README with the reason for every patch, and `os/image/patches/trial.sh` tries them on upstream's main branch.

The Upstream patches workflow runs every Monday: it tries the Mutter series on Mutter main and its newest release, lists GNOME Shell changes for the engine, and tries the image's patches on their main branches. It reports on the run's summary page and never fails a build.

## Palm rejection

libinput ignores a pen's touchscreen while the pen is near it, but the pens of most 2-in-1s only count as near while almost touching the glass. They leave whenever they lift between strokes, and the hand landing a moment later would tap whatever is under it. So the input thread keeps a short pen session for touches on the pen's own screen:

| Since the pen left | A touch that starts... | Is |
| --- | --- | --- |
| Under 1.5 s, or the pen is near | where the side of the hand rests | Dropped |
| Under 1.5 s | within 20 mm of that area | Held up to 150 ms, then let through as a tap, a drag or a still press, or dropped while it creeps |
| 1.5 s to 4.5 s | where the side of the hand rests | Held 450 ms, then let through unless the pen came back |
| Any time in the session | within 50 mm of another touch the filter is holding or dropped | Dropped, along with any held touch near it |
| After 4.5 s, on another screen, or anywhere else | | Let through at once |

The area runs from 50 mm behind the tip to 140 mm ahead of it, and from 45 mm above it to 95 mm below, ahead meaning towards the writing hand's side, which `hand` in `com.lantharos.kestrel.pen` sets. The numbers come from recordings in `kestrel/tools/fixtures/pen`, which the `tablet:palm` check replays for either hand. A new recording, made with `sudo libinput debug-events` while writing, becomes a fixture with `bun kestrel/tools/pen/convert.ts RECORDING NAME TOUCHES`. `MUTTER_DEBUG=input` logs every touch the filter judges.

## Diagnostics

Two switches in `com.lantharos.kestrel.diagnostics` log to the journal (`journalctl --user -u kestrel.service`): `log-direct-scanout`, when a display starts or stops showing a window's buffer directly, and `log-variable-refresh`, whether a display's refresh rate follows the window covering it, and why.

```sh
gsettings set com.lantharos.kestrel.diagnostics log-direct-scanout true
gsettings reset com.lantharos.kestrel.diagnostics log-direct-scanout
```
