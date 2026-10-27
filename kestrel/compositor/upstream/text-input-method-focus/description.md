# clutter/text: Focus the input method out when disposing a focused text

Based on main at b48811767.

## Description

When a ClutterText is destroyed while it has key focus, it never gets `key-focus-out`, because actors don't emit it while being destroyed. The input method stays focused on the text's `ClutterInputFocus`, which still points at the destroyed text, and the next surrounding text request reads freed memory.

In GNOME Shell this happens when an entry that has key focus is destroyed, for example together with the dialog or menu holding it, and IBus then asks for the surrounding text, which it does for example after switching input sources.

The text now focuses the input method out from `dispose` while it is still focused. The second commit adds a conformance test with a test input method, which fails without the fix.
