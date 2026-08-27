# Shell and Compositor Behavior

## Kestrel

Kestrel accepts xdg-shell applications and wlr-layer-shell desktop surfaces. It
owns focus, workspaces, popup placement, server-side decorations, clipboard and
drag-and-drop, input routing, session locking, idle handling, output capture,
and frame presentation. Layer surfaces are composed in background, bottom,
application, top, and overlay order.

The compositor supervises `luft-shell` and `xwayland-satellite`. Their current
state, the active workspace, windows, and outputs are exposed through typed IPC.
Configuration reload rebuilds workspace policy without losing live windows and
reconfigures X11 support. Child processes are stopped with the compositor.

### Session backend

The session backend opens the active seat through libseat, selects a DRM device,
discovers connectors through udev, routes libinput devices into Smithay seats,
and creates a Smithay DRM output for every enabled desktop connector. Each
output owns its KMS compositor, damage history, redraw state, frame clock, and
presentation lifecycle.

Configured connector mode, position, scale, transform, and adaptive sync are
applied when the output is created. Unconfigured outputs use their preferred
mode and are arranged horizontally. Hotplug rebuilds the output graph; seat
pause/resume pauses both input and DRM access.

Frame callbacks and FIFO/commit-timing barriers follow successful repaint.
Presentation feedback follows the actual page-flip event. Fullscreen clients
remain eligible for direct scanout when visible shell/effect elements and KMS
plane constraints allow it. A pending screenshot or screencast is composed from
Smithay's real frame result, including scanout and hardware-plane content.

### Nested backend

The nested backend uses Smithay's winit/EGL renderer, host-window buffer age,
and output damage conversion. It is intended for development and integration
testing inside an existing Wayland session; it is not a substitute for testing
KMS, VRR, direct scanout, hotplug, or VT switching.

## Shell

The shell keeps the existing Sabine UI for the panel, Start menu, quick
settings, notification/date center, toasts, and panel app menus. Rust owns the
Wayland layer surfaces, typed actions, tray and notification services, app
launching, session commands, and configuration; the web bundle renders the
chrome.

Transient shell surfaces are created lazily and evicted after an idle period.
Set `LUFT_SHELL_PREWARM=1` during development when first-open latency matters
more than resident memory.

Kestrel renders `ext-background-effect-v1` blur regions as Smithay framebuffer
effects. Blur follows the exact region supplied by Sabine, including rounded
popover regions, and participates in Smithay's damage tracking instead of
forcing full-frame redraws.

Wayland applications keep client-side decorations unless they request
server-side decorations. Server frames support move, resize, close, minimize,
and maximize actions. The shell's app model comes from Kestrel IPC, so clicking
a running app can focus, restore, or minimize the existing window before a new
process is launched.
