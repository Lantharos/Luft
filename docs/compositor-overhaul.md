# Kestrel Architecture

Kestrel is a Smithay compositor with two presentation backends. The nested
backend uses Smithay's winit/EGL integration for development inside an existing
Wayland session. The session backend uses libseat, udev, libinput, GBM, KMS,
Smithay's DRM output manager, multi-GPU renderer, damage tracker, and frame
submission lifecycle.

The compositor deliberately has no protocol-only or headless backend. Runtime
validation always exercises a real renderer and presentation target.

## Rendering

- `Space`, layer maps, popup management, render elements, output damage, buffer
  age, frame callbacks, presentation feedback, direct scanout, and DRM planes
  use Smithay's abstractions.
- Outputs have independent redraw and presentation state. DRM page flips finish
  presentation feedback; successful repaints release frame callbacks, FIFO
  barriers, and commit-timing barriers.
- Output capture uses `ext-image-copy-capture-v1`. DRM capture composes the
  actual Smithay frame result only when a capture is pending, so capture does
  not disable direct scanout during ordinary frames.
- Background blur is a Smithay framebuffer-effect render element. The damage
  tracker invalidates the complete effect when its backdrop changes, while
  unchanged frames retain buffer-age and damage reuse.
- Floating application windows use a compositor-owned glass titlebar and a
  GLES texture shader for anti-aliased corner clipping. Fullscreen surfaces use
  the unmodified Smithay surface element so the effect does not prevent direct
  scanout.
- Shell popover motion uses Smithay render-element relocation. Layer-shell
  geometry is committed only at hidden and shown endpoints; Kestrel holds
  intermediate resize/configure states at the last stable position and moves
  the surface and its blur together through the damage-tracked scene.
- Session locking renders an opaque black fallback until every output has
  presented its lock surface. Normal shell and application surfaces are not
  rendered or focused while locked.

## Desktop Integration

Kestrel provides xdg-shell, layer-shell, decorations, activation, fractional
scale, presentation time, selection and data control, pointer constraints and
gestures, tablet input, text input and input methods, virtual keyboards,
session lock, idle notify/inhibit, cursor shape, alpha modifier, background
effects, security contexts, FIFO, commit timing, and output image capture.

X11 applications run through `xwayland-satellite`. The satellite is a normal
Wayland client, so Kestrel does not carry a second embedded XWM/window-management
path. If the executable is unavailable, the Wayland session remains usable and
IPC reports XWayland as unavailable.

The Luft shell is supervised independently from the compositor. Shell and
satellite crashes use bounded restart delays and are stopped when the session
ends. Typed Unix-socket IPC owns workspace/window policy and configuration
reloads; slow or incomplete IPC clients cannot block the compositor loop.

## Validation Boundary

Workspace checks, both renderer backends, tests, and a live nested protocol run
are required before publishing. A nested run establishes Wayland protocol,
shell process, Xwayland-satellite, EGL rendering, and IPC integration. It does
not establish physical KMS page flips, direct scanout, VRR, hotplug,
suspend/resume, VT switching, mixed-refresh behavior, or GPU-driver-specific
correctness. Those require logging into a real Luft session on the target
hardware.
