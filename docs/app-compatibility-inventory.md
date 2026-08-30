# App Compatibility Inventory

This list tracks protocol and service work needed for ordinary apps to behave like they do on mature Wayland desktops. Items here are intentionally not advertised by Kestrel until they are wired into the compositor path they require.

## Portals

- Screenshot and screencast: `luft-portal` captures Kestrel outputs through
  `ext-image-copy-capture-v1`, writes PNG screenshots, and publishes monitor
  streams as PipeWire video nodes. Screencasts support hidden and embedded
  cursor modes without changing the visible compositor cursor.
- Remaining portal work: remote desktop, file chooser, wallpaper, and
  background app policy should grow in `luft-portal` as Luft-owned
  implementations.
- Settings: `luft-portal` provides `org.freedesktop.impl.portal.Settings` so toolkits and Electron apps can read appearance preferences without GNOME/KDE backends.
- Secret service: add a Luft-owned provider later; do not depend on KWallet or GNOME Keyring.
- Permission store: rely on the portal broker for now; replace only when Luft owns a complete portal backend.

## Frame Pacing

- FIFO (`wp_fifo_v1`): advertised; barriers are released from the real
  per-output presentation path, including estimated presentation for no-damage
  frames.
- Commit timing (`wp_commit_timing_v1`): advertised; target-time barriers use
  the per-output frame clock and presentation deadline.
- Tearing control: not advertised. Kestrel enables DRM VRR only after the
  connector reports support, but does not claim asynchronous presentation
  until it has a real async page-flip policy.

## Input And Devices

- Pointer constraints: advertised; confinement, pointer locking, relative
  motion, activation regions, and cursor-position hints are enforced in the
  input path.
- Idle notify and inhibit: advertised; input activity resets idle timers,
  mapped inhibitors suppress idle transitions, and configured lock and suspend
  deadlines are delivered to the supervised shell without polling.
- Tablet protocol: advertised in the session backend; libinput tablet tool
  proximity, axis, tip, and button events are mapped into Smithay's tablet seat.

## Window And App Integration

- XDG popup/transient handling: keep aligning coordinates, grabs, stacking, and constraints with the toplevel-rooted model used by KWin and Mutter.
- Foreign toplevel list: not advertised. Luft's own shell gets window state
  through typed compositor IPC; a public protocol should only be added for a
  concrete external consumer.
- Data control and clipboard: advertised through Smithay selection state.
- StatusNotifier tray: keep improving icon lookup and menu activation; generic window icons should not be treated as tray items.
