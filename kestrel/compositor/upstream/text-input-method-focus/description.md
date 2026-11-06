# clutter/text: Focus the input method out when disposing a focused text

Based on main at 1551013ca.

## Description

When a ClutterText is destroyed while it has key focus, the input method stays focused on it. The text only lets go of the input method when it gets key-focus-out, and actors don't emit that while they are being destroyed. The input method keeps its ClutterInputFocus alive, but that object doesn't keep the text alive, so the next surrounding text request reads freed memory, which can crash the compositor.

A shell hits this when it destroys a focused entry directly, without moving key focus first. An IBus engine that then asks for the surrounding text through require-surrounding-text, for example after an input source switch, makes the input method use the destroyed text.

The text now focuses the input method out from dispose if it still has it focused. This doesn't reset the input focus first, since that could commit preedit text into a text being disposed.

The second commit adds a conformance test with a test input method. It fails without the fix, and calling clutter_input_method_request_surrounding() at the same point reads the freed text.
