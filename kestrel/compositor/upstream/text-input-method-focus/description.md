# clutter/text: Focus the input method out when disposing a focused text

Based on main at 1551013ca.

## Description

When a ClutterText is destroyed while it has key focus, the input method stays focused on it. The text only lets go of the input method when it gets key-focus-out, and actors don't emit that while they are being destroyed. The input method keeps its ClutterInputFocus alive, but that object doesn't keep the text alive, so the next surrounding text request reads freed memory and the compositor crashes.

In GNOME Shell this can happen when an entry that has key focus is destroyed along with the dialog or menu holding it, and an IBus engine then asks for the surrounding text through require-surrounding-text.

The text now focuses the input method out from dispose if it still has it focused.

The second commit adds a conformance test with a test input method. It fails without the fix, and calling clutter_input_method_request_surrounding() at the same point segfaults.
