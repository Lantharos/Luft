# wayland/text-input: Drop a pending cursor rectangle when focus moves on

Based on main at b48811767.

## Description

Since f1570318ec3e, a cursor rectangle from `set_cursor_rectangle` waits for the surface's next `pre-state-applied` before it reaches the input method, and a new handler is only connected while none is pending. If focus leaves the surface first, for example because its window closes right after the client sent a new cursor rectangle, the handler stays connected to the old surface and `cursor_update.signal_id` stays set. Once that surface is gone, no text input can update the cursor rectangle anymore, so input method popups stop following the cursor in every app until the compositor restarts.

This disconnects the pending update when focus leaves the surface.

The second commit adds a Wayland text input test: a client closes a window while its cursor rectangle update is pending, and the cursor rectangle of the next window has to reach the input method. It fails without the fix. Its test client and `wayland-text-input-tests.c` overlap with the ones !5360 adds, so whichever lands second needs a small rebase.
