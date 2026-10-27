# wayland: Add ext-data-control-v1 support

Based on main at b48811767. Draft: the way sandboxed clients are kept out is the part most worth discussing first.

## Description

This implements `ext_data_control_manager_v1` for the clipboard and the primary selection:

- data devices get the current selections when created and every change after;
- offers can be read from any selection owner;
- sources set through the protocol own the selection until they are replaced or destroyed, and setting no source clears it.

Clipboard managers use this protocol on other compositors, and password managers use it to clear a copied password after a while without being focused, which isn't possible on Mutter today.

Clients in a Flatpak or Snap sandbox don't see the global, so a sandboxed app can't read or replace the clipboard in the background. They're recognised from the connecting process the same way `MetaWindow` finds a sandboxed app ID: a `.flatpak-info` in its root, or a `snap.` AppArmor label, and a process whose root can't be checked counts as sandboxed. Clients outside a sandbox can already read and set the clipboard through Xwayland.

If an allow list or a portal-backed permission is preferred over the sandbox check, the filter is a single function and easy to swap.
