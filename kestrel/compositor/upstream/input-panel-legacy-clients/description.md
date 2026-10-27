# wayland/text-input: Show the input panel when legacy clients get tapped

Based on GNOME/mutter!5367 (aca37fa92), which makes `show_input_panel` and `hide_input_panel` take effect right away. This builds on it, so it can only be opened after !5367 lands.

## Description

Clients that bind `zwp_text_input_v3` below version 2 can't ask for the input panel. Mutter shows it for them only when they enable a text input that is already focused, which is how GTK 3 asks for it. Chromium, and with it every Electron app, binds version 1 and enables its text input once, when a field gets focus, and not again while it keeps focus, so tapping a field in Chromium never brings up the on-screen keyboard.

For clients below version 2, this also shows the panel when they enable a text input right after a button press or touch on the focused surface, and when such a press lands on the surface while their text input is enabled. Clients on version 2 are left to ask for the panel themselves.

To test: in a touch session with the screen keyboard enabled, tap a text field in Chromium or an Electron app.
