# Kestrel compositor

This directory maintains Kestrel’s window-corner policy on Mutter 51.0. `build.sh` downloads the official source archive, verifies its SHA-256 checksum, applies `rounding.patch`, and builds into `../run/mutter-install`. The patch connects the corner implementation in `meta-window-corners.c` to Mutter’s shaped textures, input regions, and occlusion culling.

Run from the repository root:

```sh
kestrel/compositor/build.sh
kestrel/tools/session.sh nested
```

The launcher loads this build’s Mutter, Clutter, Cogl, and Mtk libraries together. Distribution libraries and the running host session remain untouched. Re-running the build reuses the downloaded archive and rebuilds when the patch changes. Mutter build dependencies must already be installed.

## Rendering

The 12px radius is measured in logical window coordinates. Each Wayland subsurface receives the same frame bounds transformed into its own coordinates. Xwayland uses the same shaped-texture path. Existing alpha masks and client shadow pixels outside the window frame remain intact.

Only the blended pipeline receives the antialiased distance mask. Four small corner squares are removed from the opaque region so underlying pixels are drawn correctly; the remaining interior still uses unblended rendering. Native Xwayland shadows use the rounded shape without changing whether the client content qualifies for a shadow. Input cutouts are cached and refreshed when window geometry or the client input region changes. App-requested background blur uses the same mask on its existing output pass. Its effect shader is shared between frames. This adds no per-window offscreen framebuffer or continuous repaint source.

Fullscreen surfaces bypass rounding, preserving edge-to-edge presentation and direct scanout eligibility. Native display scanout must be qualified on hardware; a nested session cannot demonstrate it.

The patch and corner implementation are licensed under GPL-2.0-or-later, matching Mutter.

## Qualification

Isolated GPU-backed captures cover square Wayland and Xwayland clients, client decorations, maximized and fullscreen states, subsurfaces, app-requested blur, pointer corners, and a 150% display scale. Moving-window damage captures are compared with full repaints, and the existing shell workload checks idle paints and actor reuse.

Changing fractional scale while a GTK Xwayland window is running can produce incorrectly scaled client content in the underlying compositor/client stack. This reproduces with window rounding disabled; it remains separate from the corner mask. Physical display scanout and mixed-scale monitor hotplug still need hardware qualification.
