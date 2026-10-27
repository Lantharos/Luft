# ext-idle-notify-v1: question before a merge request

Not a merge request yet. #4117 and its duplicates (#4187, #4536) were closed with the answer that a portal is the way to go, and Sebastian Wick said in #4187 that there is no interest in supporting the Wayland protocol. #4117 is closed but not locked, so this is meant as a comment there. The branch is the patch next to this file, based on main at b48811767.

## Comment

Would you take a native ext-idle-notify-v1 implementation after all, or is the portal still the only way you'd accept?

The portal hasn't been proposed yet, and until then sandboxed apps have nothing: break timers, and password managers that lock themselves after a while without input, can't reach org.gnome.Mutter.IdleMonitor from inside Flatpak, while the protocol works for them on other compositors.

I have an implementation of version 2 on top of the core idle monitor, about 180 lines, and can push the branch if you'd like to look at it. get_idle_notification follows idle inhibitors like the session's own idle handling, get_input_idle_notification uses the uninhibitable watches from !4422, and every watch counts from its creation, as the protocol asks. So it can't be used to time keystrokes, timeouts under a second are raised to a second.

If it's still the portal, I'd rather help with that instead: propose the portal interface, and add what Mutter needs for it, a way to pass the uninhibitable and start-now flags through AddIdleWatch.
