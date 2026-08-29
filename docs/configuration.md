# Configuration

Luft loads `~/.config/luft/config.toml` when present and uses built-in defaults when the file is absent. Invalid config stops startup so mistakes are visible immediately.

## Wallpaper

```toml
[compositor]
background_image = "/home/kristof/Pictures/bg.jpg"
```

Luft uses its packaged wallpaper when `background_image` is omitted or `null`. Set an absolute path to use a JPEG or PNG of your own. Reload the compositor configuration to apply the change.

## Display

Display scale can be configured globally or per connector:

```toml
[display]
default_scale = 1.0

[display."eDP-1"]
scale = 1.25
```

Luft picks the largest available mode at the highest refresh rate by default. Pin a mode when needed:

```toml
[display."DP-1"]
width = 3440
height = 1440
refresh_millihertz = 165000
x = 0
y = 0
transform = "normal"
adaptive_sync = true
```

`transform` accepts `normal`, `rotate90`, `rotate180`, `rotate270`, `flipped`,
`flipped90`, `flipped180`, or `flipped270`. Kestrel applies configured
enablement, mode, position, scale, transform, and adaptive sync while creating
the DRM output. The nested backend uses its host window's output settings.

## Input

The numeric keypad starts in numeric mode by default, and session keyboards keep
their Num Lock LEDs synchronized with the compositor. Disable that default when
navigation-mode keypad keys are preferred:

```toml
[input]
num_lock = false
```

## Startup Apps

Luft launches user desktop entries from `~/.config/autostart` once when the shell starts. Add explicit commands when you want startup apps that are not represented by desktop files:

```toml
[session]
startup_apps = ["rover", "ghostty"]
```

## Panel Pins

Pinned panel apps are stored in config:

```toml
[[panel.pinned]]
label = "Terminal"
command = "ghostty"
icon = "com.mitchellh.ghostty"
```

Set `panel.customized = true` with no `panel.pinned` entries to keep the panel app list empty.
