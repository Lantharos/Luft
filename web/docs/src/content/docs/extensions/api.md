---
title: The API
description: Everything the extension API object offers, version 1.
sidebar:
  order: 3
---

The default export of `extension.js` gets one object. The basics are always there; the rest only when the manifest asks for it. The types are in `@luft/extension-api`, and they say the same as this page.

Everything an extension adds returns a `Disposable` with `dispose()`, to take it away early. When the extension is turned off, Kestrel disposes whatever is left. A callback that throws turns the extension off.

## Basics

| Member | Is |
| --- | --- |
| `id`, `version` | From the manifest |
| `path` | The extension's folder |
| `t(id, args?)` | A message from its translations, in the desktop's language |
| `onDisable(cleanup)` | Runs `cleanup` when the extension is turned off, after everything it made is gone |
| `settings.get(key)` | A declared setting's value |
| `settings.set(key, value)` | Changes a declared setting; Settings shows the change at once. A value that doesn't fit throws |
| `settings.onChanged(changed)` | Runs `changed(key)` when a setting changes, here or in Settings |
| `timers.timeout(ms, callback)`, `timers.interval(ms, callback)` | Timers that stop with the extension |
| `session.active`, `session.onChanged(changed)` | Whether someone is using the desktop: signed in and not locked |
| `appearance.accent`, `appearance.dark`, `appearance.onChanged(changed)` | The accent colour as `#rrggbb`, and whether the dark style is on |

## wallpaper

`wallpaper.addLayer(options)` draws a GLSL shader across each display, above the wallpaper and the windows, so drops can land on windows; leave the windows' rectangles clear to keep them readable. It only draws while it's active, the wallpaper shows on a display and animations are on, fades in and out, and holds nothing on screen otherwise.

| Option | Is |
| --- | --- |
| `declarations` | Uniforms, constants and functions |
| `shader` | Statements run for every pixel. They read `vec2 layer_position` (pixels from the display's top left) and `vec2 layer_size`, and set `vec4 layer_color`, premultiplied |
| `frame(frame)` | Runs before every frame it draws |
| `active` | Whether it starts active; it does unless `false` |

`frame` has `time` (seconds, wrapping every hour), `elapsed` (seconds since the last frame, 0 after a pause) and `displays`. Each display has `width`, `height`, `windows` (rectangles topmost first, relative to the display), `taskbar`, `uniform(name, ...values)` for `float` to `vec4`, and `uniformArray(name, components, values)` for arrays. The layer has `active`, to start and stop it.

```js
const layer = ext.wallpaper.addLayer({
  declarations: 'uniform float glow;',
  shader: 'layer_color = vec4(glow, glow * 0.6, 0.0, glow) * (1.0 - layer_position.y / layer_size.y);',
  frame: ({ time, displays }) => displays.forEach(display => display.uniform('glow', 0.2 + 0.1 * Math.sin(time))),
});
```

## quickSettings

`quickSettings.addToggle(options)` adds a tile people can place or remove, with `title`, `icon`, `subtitle`, and either `setting` (a switch setting it reflects) or `checked` and `onToggled(checked)`. `menu` adds an arrow with entries:

| Entry | Shows |
| --- | --- |
| `{ setting: key }` | A switch as an entry with a check mark, a choice as one entry per option, a slider as a slider |
| `{ label, checked?, onActivate }` | An entry that runs something |
| `'separator'` | A line |
| `'settings'` | Opens the extension in Settings |

The toggle has `update(changes)`.

## taskbar

`taskbar.addItem({ icon, label, onClick?, menu? })` adds a button next to the clock. `menu` takes the same entries as a quick settings menu, without settings; it opens on a right click, or on any click without `onClick`. The item has `update(changes)`.

## search

`search.addProvider({ title, search(query) })` adds results to Start. `search` returns, or resolves to, results with `title`, `description?`, `icon?` and `activate()`. Start shows the first five under `title` and drops answers to queries that are no longer typed.

## notifications

`notifications.send({ title, body?, icon?, urgent?, onActivate?, actions? })` shows a notification from the extension. `actions` are `{ label, onActivate }`. Disposing it withdraws it.

## helper

`helper.start(args?)` starts the program `[helper]` names, in the extension's folder and with `LUFT_EXTENSION_DIR` set to it. The process has `running`, `write(line)` to its standard input, `onLine(received)` for lines it prints, `onExit(exited)`, `close()` to close its input so it can finish, and `dispose()` to stop it. Kestrel stops it when the extension is turned off, and Settings counts what it uses.

## location, weather, media

| Member | Is |
| --- | --- |
| `location.current()` | Resolves to `{ latitude, longitude, accuracy }` to about a city, or `null` while location services are off |
| `weather.current()` | Resolves to `{ condition, temperature, precipitation, wind, daytime, time }` for where the computer is, or `null` |
| `weather.onChanged(changed)` | A new report about every half hour |
| `media.player` | What the media keys would control: `app`, `title`, `artist`, `playing`, `playPause()`, `next()`, `previous()`, or `null` |
| `media.onChanged(changed)` | The player or what it plays changed |

`condition` is `clear`, `clouds`, `fog`, `drizzle`, `rain`, `snow` or `storm`, in degrees Celsius, millimetres and kilometres an hour. Weather comes from Open-Meteo, asked with the position rounded to about a kilometre.

## Icons

Wherever an icon goes, give a symbolic icon name such as `weather-showers-symbolic`, or the path of an SVG in the extension's folder.

## Versions

This is version 1. A later version gets a page of its own; extensions that target version 1 keep running as they are.
