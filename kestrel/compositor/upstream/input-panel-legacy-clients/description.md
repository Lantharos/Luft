# wayland/text-input: Show the input panel when legacy clients get tapped

Based on GNOME/mutter!5367 (aca37fa92), which makes `show_input_panel` and `hide_input_panel` take effect right away. This builds on it for clients that can't send those requests, so it should be opened after !5367 lands, or offered there.

## Description

Clients that bind `zwp_text_input_v3` below version 2, like Chromium and every Electron app, can't ask for the input panel. Mutter shows it for them only when they enable a text input that is already focused, which is how GTK 3 asks for it. Chromium enables its text input once, after the tap that focuses a field, and not again while the field keeps focus, so tapping a field in Chromium never brings up the on-screen keyboard.

For these clients this also shows the panel when they enable a text input right after a button press or touch on the focused surface, and when such a press lands on the surface while their text input is already enabled. Clients on version 2 are left to ask for the panel themselves.

To test: in a touch session with the screen keyboard enabled, tap a text field in Chromium or an Electron app.
