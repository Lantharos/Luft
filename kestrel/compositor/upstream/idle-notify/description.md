# wayland: Add ext-idle-notify-v1 support

Based on main at b48811767. Requested in #4117 and #4536.

## Description

This implements `ext_idle_notifier_v1` on top of the core idle monitor, at version 2:

- `get_idle_notification` follows idle inhibitors, like the session's own idle handling;
- `get_input_idle_notification` ignores them, using the uninhibitable idle watches from !4422.

Apps that lock themselves or remind people to take a break after a while without input, such as password managers and break timers, use this protocol on other compositors. Inside a sandbox they have no other way to learn the idle time, since the IdleMonitor D-Bus API isn't reachable there by default.

Timeouts shorter than a second are raised to a second, so the protocol can't be used to time individual key presses. A longer minimum for sandboxed clients would be worth adding once Mutter can tell them apart.
