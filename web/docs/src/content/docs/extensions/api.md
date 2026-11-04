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
| `dataPath` | A folder of its own for files it writes, kept across updates and deleted with the extension |
| `t(id, args?)` | A message from its translations, in the desktop's language |
| `open(uri)` | Opens a web link in the browser, or a file or folder in the app that opens it |
| `openSettings()` | Opens the extension's page in Settings |
| `pickFiles({ title, kind, multiple? })` | Lets people pick pictures (`images`), sounds (`sounds`) or a `folder` with the file chooser, right after they used the extension, such as from a button on its Settings page. Luft keeps copies in `dataPath` and returns their paths, or none when they cancel. A folder comes with the files directly inside it, up to 32 of up to 8 MB each |
| `deleteFile(path)` | Deletes a file or folder in `dataPath`, such as a picked picture no longer used |
| `readText(path)` | A text file in the extension's folder or `dataPath`, or `null` when it isn't there |
| `onDisable(cleanup)` | Runs `cleanup` when the extension is turned off, after everything it made is gone |
| `settings.get(key)` | A declared setting's value |
| `settings.set(key, value)` | Changes a declared setting; Settings shows the change at once. A value that doesn't fit throws |
| `settings.onChanged(changed)` | Runs `changed(key)` when a setting changes, here or in Settings |
| `storage.get(key)`, `storage.set(key, value)`, `storage.delete(key)`, `storage.keys()` | Values it keeps for itself, anything JSON holds, up to 1 MB in all. They're written soon after a change and when it's turned off |
| `secrets.get(key)`, `secrets.set(key, secret)`, `secrets.delete(key)` | Passwords and sign-in tokens, kept encrypted in the keyring. `get` resolves to `null` when there's none. They're deleted with the extension |
| `peers.handle(name, answer)`, `peers.request(id, name, value?)`, `peers.handles(id, name)`, `peers.onChanged(changed)` | Requests between extensions, see [peers](#peers) |
| `timers.timeout(ms, callback)`, `timers.interval(ms, callback)` | Timers that stop with the extension |
| `session.active`, `session.onChanged(changed)` | Whether someone is using the desktop: signed in and not locked |
| `desktop.wallpaperVisible`, `desktop.onChanged(changed)` | Whether the wallpaper shows anywhere: windows leave some uncovered, nothing is full screen, the screen isn't locked |
| `power.onBattery`, `power.saving`, `power.onChanged(changed)` | Whether it runs on battery, and whether power saver is on. Do less while it is |
| `appearance.accent`, `appearance.wallpaperAccent`, `appearance.dark`, `appearance.reducedMotion`, `appearance.onChanged(changed)` | The accent colour and the colour the wallpaper suggests as `#rrggbb`, whether the dark style is on, and whether people asked for less motion or turned animations off |

## wallpaper

`wallpaper.addLayer(options)` draws a GLSL shader across each display, over the wallpaper. It only draws while it's active, the wallpaper shows on a display, animations are on and the computer isn't saving power; it fades in and out, and holds nothing on screen otherwise.

| Option | Is |
| --- | --- |
| `declarations` | Uniforms, constants and functions |
| `shader` | Statements run for every pixel. They read `vec2 layer_position` (pixels from the display's top left) and `vec2 layer_size` (the display's size), and set `vec4 layer_color`, premultiplied |
| `frame(frame)` | Runs before every frame it draws |
| `active` | Whether it starts active; it does unless `false` |
| `depth` | `above-windows`, the default, also draws over windows, so drops can land on them; leave the windows' rectangles clear to keep them readable. `below-windows` draws between the wallpaper and the windows |
| `atlases` | Names of picture atlases the shader samples, filled with `setPictures`, see below |
| `area(display)` | The part of each display to cover, such as a band along the bottom, or `null` to leave a display out. `display` has `index`, `primary`, `width` and `height`. The shader only runs there, which costs far less than the whole display |

`frame` has `time` (seconds, wrapping every hour), `elapsed` (seconds since the last frame, 0 after a pause) and `displays`. Each display has `index`, `primary`, `width`, `height`, `windows` (outlines topmost first, relative to the display: each window's rectangle and the `radii` of its corners, top left, top right, bottom right and bottom left, 0 where it's square), `taskbar` (the taskbar's rectangle), `taskbarOutlines` (the taskbar's own shape: the bar, or each island when it floats in islands, with their rounded ends), `uniform(name, ...values)` for `float` to `vec4`, and `uniformArray(name, components, values)` for arrays. The layer has `active`, to start and stop it, `reshape()`, to ask for `area` again after what it depends on changed, and `setPictures(atlas, paths)`, which packs up to eight pictures from the extension's folders into one of its atlases, each scaled to fit 128 pixels, keeping up to 16 frames of animated GIF and WebP pictures, 64 in all. An atlas named `pictures` declares `sampler2D pictures`, `vec2 pictures_grid` (its columns and rows of square cells), `float pictures_count` and `vec4 pictures_pictures[8]`: each picture's first cell, frame count, frames a second, and width over height.

```js
const layer = ext.wallpaper.addLayer({
  declarations: 'uniform float glow;',
  shader: 'layer_color = vec4(glow, glow * 0.6, 0.0, glow) * (1.0 - layer_position.y / layer_size.y);',
  frame: ({ time, displays }) => displays.forEach(display => display.uniform('glow', 0.2 + 0.1 * Math.sin(time))),
});
```

### Sprites

`wallpaper.addSprites()` is for a few small things that live on the desktop, where a shader across the screen would be far too much. Sprites sit between the wallpaper and the windows, so windows cover them by themselves, and they take no shader and no frame clock: nothing runs and nothing's drawn until you move one, and then only its own few pixels.

| Member | Is |
| --- | --- |
| `loadSheet({ path, cell })` | Cuts a picture of square frames `cell` pixels wide into frames, row by row. Returns a sheet with `columns`, `rows` and `cell`, and throws when the picture can't be read or isn't a whole number of frames |
| `add(options)` | Adds a sprite: its `sheet`, about how tall it shows as `height`, and optionally `onClick()`, `onPicked()`, `onCarried(point)` and `onDropped(point)`. With `onPicked`, people can pick it up: Luft moves it with the pointer, above the windows, and `point` says the `display`, `x` and `y` of its feet |
| `dispose()` | Takes them all away |

A sprite has `place({ display, x, y, frame, flipped? })`, which shows it with its feet at that point and only touches what's changed, `describe(label)`, what screen readers call it, and `sizeOn(display)`, its size there. It shows a whole number of screen pixels per pixel of its sheet, the nearest to `height`, so pixel art stays crisp at every display scale. It takes clicks only on what shows of it; the desktop keeps every other pixel.

To know what's where, `wallpaper.surfaces` lists each display with `index`, `primary`, `width`, `height`, `scale`, `fullscreen`, `windows` and `taskbar`. Windows and taskbar pieces are outlines as in `frame.displays`, each with an `id` that lasts as long as it does. `wallpaper.onSurfacesChanged(changed)` runs before the next frame after any of them moved, appeared or went, at most once a frame, and never while nothing changes.

```js
const sprites = ext.wallpaper.addSprites();
const sheet = sprites.loadSheet({ path: 'cat.png', cell: 24 });
const cat = sprites.add({ sheet, height: 48, onClick: () => ext.notifications.send({ title: 'Meow' }) });
const [{ index, height }] = ext.wallpaper.surfaces;
cat.place({ display: index, x: 200, y: height, frame: 0 });
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

`taskbar.addElement(options)` adds an element that Kestrel draws from views, like a pop-up's. People decide where it goes: an island of its own, or inside another island, on any edge of the display. The extension never places it; it describes what it shows for wherever it is.

| Option | Is |
| --- | --- |
| `key` | Names it among the extension's elements, lowercase with dashes. Where people put it is kept by this, so keep it across versions |
| `label` | What screen readers call it, and its name where people arrange the taskbar |
| `content(layout)` | The view it shows. `layout` has `vertical` (it runs along a side of the display), `thickness` (the room across it) and `button` (a taskbar button's size) |
| `expanded(layout)` | What it grows to under the pointer, smoothly |
| `shown` | Whether it shows; a hidden element takes no room, and comes and goes smoothly |
| `onClick()`, `menu` | A click outside its controls, and a menu on a right click |
| `onExpandedChanged(expanded)` | It grew under the pointer or shrank back, for what only needs updating while it's grown |

The element has `update(changes)`, `refresh()` to ask for its views again, and `dispose()`. Pop-ups can be anchored to it. Make every `content` fit both directions and a narrow island; to let people choose where it sits on a one-bar taskbar, put a `taskbar-place` item on the extension's Settings page.

## popups

`popups.open(options)` opens a pop-up that Kestrel draws in Luft's style from a description of its content, and returns it with `open`, `update(content)` and `dispose()`, which closes it.

| Option | Is |
| --- | --- |
| `anchor` | A taskbar item it made, `'pointer'`, a place on the display under the pointer (`'top-left'`, `'top'`, `'top-right'`, `'left'`, `'center'`, `'right'`, `'bottom-left'`, `'bottom'`, `'bottom-right'`), or a point `{ x, y }` |
| `title` | What screen readers call it, and a window's title |
| `content` | What it shows, see below |
| `kind` | `panel`, the default, takes the keyboard while it's open and closes on Escape, a click elsewhere, or when something else opens. `window` floats above the windows without taking the keyboard, has a title and a close button, and can be dragged |
| `width` | 200 to 560 pixels; 340 without it. The height follows the content |
| `onClosed()` | Runs once when it closes, however it closes |

Content is a tree of Luft's own controls, so a pop-up looks and behaves like the rest of the desktop and can't break it. `update` keeps every control that stayed in its place and kind, so a slider being dragged or a field being typed in carries on.

| View | Has |
| --- | --- |
| `{ type: 'column' \| 'row', children, spacing?, align? }` | Children one under or beside the other. `align` is `start`, `center`, `end` or `fill` |
| `{ type: 'text', text, style?, maxWidth?, marquee? }` | `title`, `body`, `caption`, or `number` for digits that keep their width. Text wider than `maxWidth` ends in an ellipsis, or with `marquee` slides along once when it changes and while the pointer is over it |
| `{ type: 'icon', icon, size? }` | An icon |
| `{ type: 'image', path, width, height, radius?, progress? }` | A picture from the extension's folders, or a player's artwork, with rounded corners. `progress`, 0 to 1, draws a thin ring around a round picture, such as how far along a track is |
| `{ type: 'button', label?, icon?, iconOnly?, style?, small?, disabled?, onActivate }` | `style` is `default`, `primary` or `flat`; `small` makes it smaller, such as controls under a title in the taskbar |
| `{ type: 'switch', label, checked, onToggled(checked) }` | A switch with its label |
| `{ type: 'slider', label, value, onChanged(value) }` | A slider from 0 to 1 |
| `{ type: 'entry', label, placeholder?, text?, onChanged?(text), onSubmit?(text) }` | A text field; `onSubmit` runs on Enter |
| `{ type: 'item', title, subtitle?, icon?, checked?, onActivate? }` | A row to pick, as in a list of results |
| `{ type: 'progress', value }` | A bar from 0 to 1 |
| `{ type: 'separator' }`, `{ type: 'spacer' }` | A line, and room that pushes the rest apart |

```js
const item = ext.taskbar.addItem({
  icon: 'alarm-symbolic',
  label: 'Timer',
  onClick: () => ext.popups.open({
    anchor: item,
    title: 'Timer',
    content: { type: 'column', children: [
      { type: 'text', text: '25:00', style: 'number' },
      { type: 'button', label: 'Start', style: 'primary', onActivate: start },
    ] },
  }),
});
```

## shortcuts

An extension that declares `[[shortcuts]]` gets `shortcuts.onActivated(key, activated)`, which runs when people press that shortcut anywhere but the lock screen, and `shortcuts.label(key)`, what it's set to as people read it, such as `Super+Alt+V`, or `null` while it has none.

## typing

`typing.type(text)` types into whatever has the keyboard, as if people typed it, and returns whether it could. It only works within ten seconds of someone using the extension, through its shortcut, a pop-up, taskbar item, quick settings tile, notification or search result, and the taskbar shows that it typed. A panel of the extension that's open closes first, so the text goes where it was going.

## sounds

`sounds.play(path, options?)` plays a sound file from the extension's folder, such as Ogg, FLAC or WAV, and returns it with `playing`, `setVolume(volume, fade?)`, `stop(fade?)`, `onEnded(ended)` and `dispose()`, which stops it at once. Fades are in milliseconds.

| Option | Is |
| --- | --- |
| `volume` | 0 to 1; 1 without it |
| `loop` | Plays it again from the start without a gap until it's stopped |
| `fadeIn` | Milliseconds to fade in over |

Everything an extension plays goes through one stream with its name, which people can turn down in Sound settings, and goes quiet while the screen is locked. With `locked-sounds`, `lockedSounds.keep()` keeps it playing while the screen is locked until it's disposed, for sounds people expect to keep hearing, such as ones to fall asleep to. `sounds.volume` sets the volume of all of it. Files are decoded once and kept while they play, so keep loops to a minute or so.

## audioLevels

`audioLevels.playing` and `audioLevels.onPlayingChanged(changed)` tell whether any app plays sound. `audioLevels.listen(bands)` starts listening to everything the computer plays, split into 1 to 64 bands from low to high, and returns a listener with `read()` and `dispose()`. `read()` gives `{ level, bands }`, all 0 to 1, and is cheap enough to call in every frame of a wallpaper layer. Kestrel only listens while a listener is open and something plays, so an open listener costs nothing in silence.

```js
const listener = ext.audioLevels.listen(16);
const layer = ext.wallpaper.addLayer({
  depth: 'below-windows',
  area: ({ width, height }) => ({ x: 0, y: height - 200, width, height: 200 }),
  declarations: 'uniform float bass;',
  shader: 'float a = bass * (1.0 - (layer_size.y - layer_position.y) / 200.0); layer_color = vec4(a, a * 0.7, a * 0.4, a);',
  frame: ({ displays }) => {
    const { bands } = listener.read();
    for (const display of displays) display.uniform('bass', bands[0]);
  },
});
ext.audioLevels.onPlayingChanged(() => (layer.active = ext.audioLevels.playing));
```

## Settings page

Without anything else, an extension's page in Settings → Extensions lists the settings its manifest declares. `settingsPage.describe(build)` gives it a page of its own instead: `build` returns sections, each with an optional `title` and `description` and its `items`, and Settings draws them with its own controls. Kestrel calls `build` only while Settings shows the page, when it opens, after a declared setting changes and after `settingsPage.refresh()`. While the extension is off, Settings lists its declared settings.

| Item | Shows |
| --- | --- |
| `{ setting: key }` | A declared setting, as Settings shows it |
| `{ type: 'row', title, description?, value?, onActivate? }` | A line with a value at its end, which opens something with `onActivate` |
| `{ type: 'switch', title, description?, checked, onToggled(checked) }` | A switch for a value the extension keeps itself |
| `{ type: 'choice', title, description?, value, options, onChanged(value) }` | Options as `{ value, label, image? }`, with text labels |
| `{ type: 'slider', title, description?, value, min, max, step?, unit?, onChanged(value) }` | A slider |
| `{ type: 'button', title, description?, label, danger?, onActivate() }` | A row with a button |
| `{ type: 'entry', title, description?, value, placeholder?, onSubmit(text) }` | A text field, submitted on Enter or when it loses focus |
| `{ type: 'preview', image, description }` | A picture across the page |
| `{ type: 'list', items, empty? }` | Rows of `{ title, description?, image?, actions? }`, where actions are `{ label, danger?, onActivate() }` |
| `{ type: 'text', text }` | A paragraph |
| `{ type: 'sprite', title, description?, image, cell, columns, frames, rate, checked?, onToggled?, actions? }` | A row with a small animation at its start: `frames` of a sheet of `cell` pixel frames, `columns` wide, looping `rate` times a second, with an optional switch and buttons |
| `{ type: 'taskbar-place', element }` | Where one of its taskbar elements sits, by its key. People choose it there on a taskbar that's one bar; with separate islands it points them to editing the taskbar |

Images are files in the extension's folder or data folder. Callbacks run in the extension like any other.

```js
ext.settingsPage.describe(() => [
  { title: 'Look', items: [{ setting: 'style' }, { setting: 'color' }] },
  { title: 'Saved', items: (ext.storage.get('saved') ?? []).map(name => ({ type: 'row', title: name })) },
]);
```

## calls

`calls.active` says whether people are in a call: an app records from the microphone or films with the camera. Luft's own dictation doesn't count. `calls.microphone` and `calls.camera` say which, and `calls.onChanged(changed)` runs when a call starts or ends. A call ends a few seconds after both are let go, so it doesn't end while an app switches devices.

```js
ext.calls.onChanged(() => (ext.sounds.volume = ext.calls.active ? 0 : 1));
```

## doNotDisturb

`doNotDisturb.hold()` holds back other notifications' banners and sounds until the hold ends, the way Do Not Disturb does, such as during a work session. Urgent notifications, apps people let through Do Not Disturb and the extension's own notifications still show, and what comes in waits in the notification center. The hold has `held`, a list of `{ app, count }` with the apps that sent something and how many of those are still there, most first, and `onHeld(changed)`. The extension never sees what the notifications say.

`release()` ends the hold and returns `held`, for the extension to sum up itself. Disposing the hold, or the extension being turned off, ends it too, and then Luft sums it up with a notification of its own. `doNotDisturb.holding` and `doNotDisturb.onChanged(changed)` tell whether notifications are held back at all, by Do Not Disturb or any extension.

## network

`network.fetch(url, options?)` sends an HTTPS request to one of the hosts `[network]` names and resolves to the whole response: `status`, `ok`, `headers` with lowercase names, `text` and `json()`. Other hosts are refused. Options are `method`, `headers`, `body` as a string and `timeout` in seconds, 20 without it. Responses are read up to 4 MB, and a request that can't reach the host rejects.

```js
const response = await ext.network.fetch('https://api.example.com/v1/count', {
  headers: { authorization: `Bearer ${await ext.secrets.get('token')}` },
});
if (response.ok) ext.storage.set('count', response.json().count);
```

## peers

Extensions can ask each other to do things. `peers.handle(name, answer)` answers requests named `name` with what `answer(value, from)` returns, until disposed. `peers.request(id, name, value?)` asks the extension with that id and resolves to its answer, or rejects when it doesn't run or doesn't handle `name`. `peers.handles(id, name)` says whether it does, and `peers.onChanged(changed)` runs when an extension starts or stops answering something. Values are copies of what JSON holds.

Soundscapes answers `play`, with `{ wasPlaying }`, and `pause`:

```js
if (ext.peers.handles('com.lantharos.Soundscapes', 'play')) await ext.peers.request('com.lantharos.Soundscapes', 'play');
```

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
| `location.onChanged(changed)` | The computer moved to another city, checked about every ten minutes while someone listens |
| `weather.current()` | Resolves to `{ condition, temperature, precipitation, wind, daytime, sunrise, sunset, season, time }` for where the computer is, or `null` |
| `weather.onChanged(changed)` | A new report about every half hour |
| `media.player` | What the media keys would control, or `null` |
| `media.players` | Every player there is |
| `media.onChanged(changed)` | A player came or went, what it plays changed, it jumped within a track, or artwork arrived |
| `media.output` | The sound output: `volume` and `muted` to read and set, `devices` with `id`, `name`, `detail` and `active`, `choose(id)`, and `onChanged(changed)` |

A player has `id`, `app`, `appName`, `title`, `artist`, `album`, `artwork` (a file views can show, or `null` until it's fetched), `playing`, `length` in seconds, `canGoNext`, `canGoPrevious`, `canSeek`, `position()` resolving to seconds, `seek(seconds)`, `playPause()`, `next()`, `previous()` and `raise()`.

`condition` is `clear`, `clouds`, `fog`, `drizzle`, `rain`, `snow` or `storm`, in degrees Celsius, millimetres and kilometres an hour. `sunrise` and `sunset` are today's there, in milliseconds since 1970, and `season` is `spring`, `summer`, `autumn` or `winter` by the date and the side of the equator. Weather comes from Open-Meteo, asked with the position rounded to about a kilometre.

## Icons

Wherever an icon goes, give a symbolic icon name such as `weather-showers-symbolic`, or the path of an SVG in the extension's folder.

## Versions

This is version 1. It grows while Luft is young, without taking anything away, so extensions written for it keep running. A later, incompatible version would get a page of its own.
