# Kestrel

Kestrel is Luft's desktop shell. It builds against the host Mutter 51 library and owns its panel, launcher, quick settings, notification center, and power menu in TypeScript. The imported engine retains GNOME Shell's C/St integration and the session services required for window management, authentication, screenshots, screencasts, and portals.

## Current checkpoint

- The engine and TypeScript UI compile against Fedora's GNOME 51 stack.
- The development launcher supports a visible nested session and isolated captures at 1280×800 and 1440×900.
- The square, transparent 48px panel reserves the bottom edge. Its launcher and favorite/running apps stay centered against the monitor while live network, volume, and stacked date/time indicators sit on the right.
- Start lists installed applications, filters them by name, and launches the selected app.
- Quick settings expose Wi-Fi and volume/brightness sliders where the respective service or hardware is available.
- The notification center displays the existing message tray sources and can clear them.
- The power menu opens above the Start footer, keeps Start visible, and delegates lock, suspend, log out, restart, and power off to the existing session action backend.
- Backdrop capture updates only freshly painted regions in a separate cache for each display view. Partial damage schedules a repaint of the affected surface, and offscreen capture is clipped to valid pixels. Settled surfaces do not continuously redraw.
- Shell blur includes a rounded mask in its final shader pass, keeping menu corners clean without an extra offscreen pass. Panel and menu blur share the same brightness without a tint overlay. The panel has square corners.
- Start uses six equal app columns, keyboard search, and a compact account and power footer with the AccountsService avatar when available. Panel hover highlights are inset and rounded, with separate dots for running apps.
- Menus slide from below the monitor and return fully offscreen on close. Interrupted transitions reverse from their current position.
- Set `KESTREL_CSS_PATH` to a local stylesheet when launching the shell to reload styles after each saved change.

## Work before a Luft session

1. Make Kestrel the actual shell entry point, remove unused GNOME UI modules and services, and rename the build/session identifiers that still say GNOME Shell. The current TypeScript UI is loaded by a reduced upstream `main.js` path and the upstream overview object is still constructed, though disabled in the user session.
2. Complete keyboard and window switching behavior, focus handling, multi-monitor placement, animations, and notification interaction. Validate each with actual windows in a nested or disposable session.
3. Supply Luft session and portal configuration, including screenshot, screencast, file chooser, settings, and secret handling, then exercise the portal calls from client apps.
4. Verify polkit, keyring, network credentials, lock and unlock, OSD, accessibility, and GDM handoff under a real login session.
5. Package Kestrel with a pinned Mutter ABI for Luft, review runtime dependencies, and test on a disposable machine before making it a selectable default session.

The virtual session checks the build, JS startup, and captured rendering. It does not validate a physical display, login manager, suspend, or portal permission dialogs.
