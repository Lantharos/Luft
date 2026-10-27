# wayland/text-input: Drop a pending cursor rectangle when focus moves on

Based on main at b48811767.

## Description

A cursor rectangle from `set_cursor_rectangle` is passed to the input method on the surface's next `pre-state-applied`, and a new handler is only connected while none is pending. When focus left the surface first, for example because its window closed right after the update, the signal never came and `cursor_update.signal_id` stayed set. From then on no text input told the input method where its cursor is, so input method popups could no longer be placed next to it.

This disconnects the pending update in `meta_wayland_text_input_set_focus()` when focus leaves the surface.
