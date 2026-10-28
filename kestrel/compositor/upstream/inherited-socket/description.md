# wayland: Listen on an inherited socket

Based on main at b48811767.

## Description

When Mutter crashes, every Wayland client loses its connection with it. Qt can reconnect a client to a compositor that starts again on the same socket (`QT_WAYLAND_RECONNECT=1` since Qt 6.6), and KWin and wlroots based compositors already let a small wrapper keep the socket alive across restarts: kwin_wayland_wrapper and wl-restart create the socket, hand it to the compositor and start it again when it crashes.

This lets Mutter take the socket the same way, from the environment as `wl-restart --env` passes it: `WAYLAND_SOCKET_FD` is the listening descriptor and `WAYLAND_SOCKET_NAME` its name for `WAYLAND_DISPLAY`. The parent keeps the socket's lock file. Mutter unsets both variables and marks the descriptor close-on-exec, so clients it launches inherit neither.

To try it, with [wl-restart](https://github.com/ferdi265/wl-restart) running a nested Mutter:

```sh
wl-restart --env mutter --wayland --devkit
QT_WAYLAND_RECONNECT=1 WAYLAND_DISPLAY=wayland-1 some-qt-app
pkill -SEGV -x mutter
```

The Qt app's window comes back in the new Mutter instead of closing.
