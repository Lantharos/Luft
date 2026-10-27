# Kestrel engine

The native half of Kestrel, forked from GNOME Shell 51.0: the St toolkit and the shell's C library on Kestrel's Mutter build. Everything that runs on them, from window management, the lock screen, screenshots and notifications to the panel, Start and quick settings, is TypeScript in [`kestrel/ui`](../ui), bundled into one module that the engine embeds as `resource:///com/lantharos/kestrel/kestrel.js`. The screencast and notification services are bundled from the same tree into their own programs.

See [Kestrel's README](../README.md) for building and how the parts fit together. `upstream.json` records the GNOME Shell commit it forked from, and `upstream.py` lists GNOME Shell changes since then to the files it still carries, see [Upstream patches](../../docs/upstream.md).

## D-Bus names

| Name | Use |
| --- | --- |
| `com.lantharos.Kestrel.Introspect` | Whether animations are on, and the screen size |
| `com.lantharos.Kestrel.Brightness` | Screen dimming and automatic brightness |
| `com.lantharos.Kestrel.Screencast` | Screen recording service |
| `com.lantharos.Kestrel.Notifications` | Notification service |
| `com.lantharos.Kestrel.HotplugSniffer` | Content type detection for inserted media |
| `org.gnome.Shell` | Shell mode and version, kept for software that checks it |
| `org.gnome.Shell.Screenshot` | Screenshots and color picking |
| `org.gnome.ScreenSaver` | Lock screen state |
| `org.freedesktop.Notifications`, `org.gtk.Notifications` | Notifications from apps |
| `org.gtk.MountOperationHandler` | Password and question dialogs for mounting |

The end session dialog is served for gnome-session at `/org/gnome/SessionManager/EndSessionDialog`. The X11 window manager name stays GNOME Shell, which Java apps check to place and focus their windows.

## Files

| Path | Contents |
| --- | --- |
| `~/.local/state/kestrel` | What the shell remembers between sessions, such as brightness, notifications and the apps whose windows float while tiling |
| `~/.cache/kestrel/backgrounds` | Decoded wallpapers, reused between sessions |
| `$XDG_RUNTIME_DIR/kestrel` | Runtime state for the current session |

Logs use the `Kestrel` domain. The volume controls go through libpulse, so they work with PipeWire and PulseAudio alike. System sounds play straight through PipeWire.

## License

GNU GPL version 2 or later, inherited from GNOME Shell, in `COPYING`.
