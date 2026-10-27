# clutter/text: Focus the input method out when disposing a focused text

Based on main at b48811767.

## Description

A ClutterText that is destroyed while it has key focus never gets key-focus-out, so the input method kept pointing at it. The next surrounding text request, for example after switching input sources, read the destroyed text.

This focuses the input method out from dispose when the text still has it focused.
