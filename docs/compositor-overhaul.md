# Compositor Overhaul

This checklist tracks the DRM correctness, performance, Smithay integration, and
desktop compatibility work needed before Kestrel's session backend is considered
stable. An item is complete only after the relevant workspace and session-backend
checks pass.

## Frame Correctness

- [x] Wait for the primary swapchain sync point when a DRM frame reports
  `needs_sync`.
- [x] Treat an empty DRM frame as no damage instead of resetting buffers and
  rendering again.
- [x] Replace dropped vblank events with per-output presentation handling.
- [x] Predict estimated vblank deadlines from each output's frame clock.
- [x] Keep frame callback and presentation-feedback lifecycles correct for
  rendered, scanned-out, occluded, and no-damage surfaces.
- [x] Handle explicit acquire points independently from release points.
- [x] Add implicit dmabuf readiness blockers and real renderer early import.

## Per-Output Rendering

- [x] Give every output independent redraw, pending-frame, timing, damage, and
  presentation state.
- [x] Render queued secondary outputs during ordinary updates.
- [x] Remove the global frame-pending gate between CRTCs.
- [x] Track scene revisions per output instead of clearing one global dirty bit
  after the primary output renders.
- [x] Make output scale, transform, geometry, and refresh rate authoritative
  throughout scene collection and frame scheduling.
- [x] Handle hotplug, suspend, resume, modesets, and renderer resets without
  leaking pending frame state.
- [x] Pause and resume both libinput and DRM through the seat lifecycle, retain
  CRTCs on activation, and survive a last-monitor disconnect until hotplug.

## Scanout, Cursor, And Effects

- [x] Build dmabuf render and scanout feedback from the actual render and scanout
  nodes without forcing linear modifiers on same-device paths.
- [x] Represent named cursors as Smithay render elements and remove direct legacy
  cursor KMS programming.
- [x] Preserve primary-plane and cursor-plane scanout with composited fallbacks.
- [x] Keep persistent per-output backdrop damage and buffer ages.
- [x] Recompute a blur target only when backdrop damage intersects its
  radius-expanded capture region.
- [x] Add low-overhead tracing for render time, damage area, plane selection,
  synchronization, queueing, and presentation.

## Smithay And Architecture

- [x] Update Smithay to a tested current revision and resolve API changes.
- [x] Use Smithay's winit buffer age and damage-coordinate conversion in the
  nested backend.
- [x] Update workspace dependencies to current compatible releases.
- [x] Replace the hand-written background-effect protocol with Smithay's module.
- [x] Adopt current `Space` stacking and relocation operations.
- [x] Migrate connector and CRTC lifecycle to Smithay's `DrmOutputManager`.
- [x] Remove the unsafe thread-local scene handle and use direct render elements.
- [x] Delete dead helpers and retain only feature-gated suppressions needed by
  the nested-only build.
- [x] Split compositor modules that exceed the project's maintainability limit.

## Desktop Compatibility

- [x] Add secure session locking with an opaque compositor fallback until every
  output has presented its lock surface.
- [x] Complete pointer constraints, cursor-position hints, and relative-pointer
  motion.
- [x] Add compositor-side output capture through ext-image-copy-capture.
- [x] Add the Luft-owned screenshot and PipeWire screencast portal interfaces.
- [x] Add writable output management with persisted mode, position, transform,
  scale, enablement, and adaptive-sync state.
- [x] Complete native drag-and-drop and route XWayland XDND through the shared
  data-device path.
- [x] Wire text input, input methods, and input-method popups through real focus
  handling.
- [x] Add idle notification and inhibition.
- [x] Release FIFO and commit-timing barriers from each output's predicted
  presentation and actual presentation paths.
- [x] Add DRM VRR validation and application.
- [x] Stop advertising tearing control until Kestrel has a real asynchronous
  page-flip path.
- [x] Advertise protocols only when their compositor behavior is complete.

## Validation

- [x] `cargo fmt --check`
- [x] `cargo check --workspace`
- [x] `cargo check -p kestrel --features session-backend`
- [x] `cargo clippy -p kestrel --all-targets -- -D warnings`
- [x] `cargo clippy -p luft-shell --all-targets -- -D warnings`
- [x] `cargo clippy -p kestrel --features session-backend --all-targets -- -D warnings`
- [x] `cargo test --workspace`
- [ ] Verify the session backend on NVIDIA at normal and high refresh rates.
- [ ] Verify mixed-refresh multi-output rendering, direct scanout, blur, cursor
  planes, suspend/resume, VT switching, and hotplug.

The hardware checks remain intentionally open. The development machine has an
RTX 3060 on the NVIDIA driver, but the audit was run from another compositor
with only one connected display. They require a real Luft session and at least
two connected outputs; compile-time validation cannot establish vblank,
page-flip, VRR, or mixed-refresh correctness.
