# Kestrel engine

The native half of Kestrel, forked from GNOME Shell 51.0: the St toolkit, the shell's C library, and the JavaScript that runs on Kestrel's Mutter build for window management, authentication, the lock screen, screenshots, screencasts, notifications and the D-Bus services apps and portals talk to. The panel, Start, quick settings and the rest of the visible shell are TypeScript in [`kestrel/ui`](../ui), built into the engine's resources under `resource:///com/lantharos/kestrel`.

See [Kestrel's README](../README.md) for building and how the parts fit together.

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
| `~/.local/state/kestrel` | What the shell remembers between sessions, such as brightness and notifications |
| `~/.cache/kestrel/backgrounds` | Decoded wallpapers, reused between sessions |
| `$XDG_RUNTIME_DIR/kestrel` | Runtime state for the current session |

Logs use the `Kestrel` domain. Sound goes through libpulse, so it works with PipeWire and PulseAudio alike.

## License

GNU GPL version 2 or later, inherited from GNOME Shell, in `COPYING`.
