# Extensions

Extensions add to Kestrel: layers over the wallpaper, quick settings tiles, taskbar buttons, pop-up panels and small windows, keyboard shortcuts, search results, notifications, sounds, and pages in Settings. They can follow calls, hold notifications back for a while, connect to the hosts they name, keep secrets in the keyring and ask each other to do things. They run inside Kestrel's process but only see a versioned API object, never Kestrel's internals. What Luft does for everyone, such as the emoji picker, clipboard history and dictation, stays built into Kestrel; extensions are for what's optional. How to write one is in [the developer docs](https://docs.luft.computer/extensions/getting-started/); this page is how it works inside Luft.

| Where | What |
| --- | --- |
| `kestrel/ui/src/extensions/runtime` | Finding, loading, enabling and switching off extensions, their stored settings and crash guard |
| `kestrel/ui/src/extensions/api/v1` | API version 1. `types.ts` is the contract; everything else implements it |
| `kestrel/ui/src/extensions/service.ts` | The D-Bus interface below |
| `kestrel/engine/src/sound` | `ShellSoundMix`, which plays an extension's sounds, and `ShellAudioMonitor`, which measures what the computer plays |
| `packages/extension-api` | `@luft/extension-api`, the types for extension authors, written from `types.ts` by `bun kestrel/ui/extensionApi.ts`. `bun run check` in `kestrel/ui` fails when it's out of date |
| `extensions` | Lantharos's own extensions, such as Seasons, Strays, Keystrokes, Focus and Pult. Each has a `build.sh` that makes its folder, which `extensions/pack.sh` packs for schelf.store |
| `apps/settings/src/lib/panels/personalization/extensions` | Settings → Extensions, each extension's page, and its rows on other pages |

## On disk

```
~/.local/share/luft/extensions/<id>/       one folder per installed extension
  extension.toml                           the manifest
  extension.js                             one ES module whose default export is enable(extension)
  locales/<language>/*.ftl                 translations, English in locales/en
  ...                                      anything else it ships, such as a helper program
```

What an extension keeps for itself lives outside its folder, so updates keep it: files in `~/.local/share/luft/extension-data/<id>/` and stored values in `~/.local/state/luft/extension-storage/<id>.json`. Removing the extension deletes both.

Each folder in `luft/extensions` under `XDG_DATA_HOME` is an extension, and its name must be the manifest's `id`. There's no system-wide folder: extensions Luft comes with, such as Seasons, are store releases the image carries in `/usr/share/luft/preinstall`, which Schelf installs into each account at sign-in, once and offline ([Schelf](components/schelf.md#preinstalled-apps-and-background-updates)), and updates from schelf.store after that. Removing one deletes its folder, and it stays removed. An extension runs unless it's turned off.

## Manifest

```toml
id = "com.example.Clock"          # reverse DNS, the same as the folder
name = "Clock"                    # English; a message extension-name translates it
description = "A clock on the wallpaper."
version = "1.2.0"
api = 1                           # the extension API version it targets
permissions = ["wallpaper", "quick-settings"]

[helper]                          # optional native program, started through the API
path = "clock-helper"

[network]                         # optional hosts it connects to, over HTTPS
hosts = ["api.example.com"]

[[settings]]                      # switch, choice, choices, slider or color
key = "seconds"
type = "switch"
label = "seconds"                 # a message id; its .description attribute is the line under it
default = false
page = "appearance"               # also shown on this page of Settings, if a permission allows

[[settings]]
key = "format"
type = "choice"
label = "format"
default = "digital"
options = [{ value = "digital", label = "digital" }, { value = "dial", label = "dial" }]

[[settings]]
key = "hands"
type = "switch"
label = "hands"
default = true
depends = "format"                # shows only while another setting, declared before it, shows
when = ["dial"]                   # and has one of these values

[[shortcuts]]                     # changed in Settings → Keyboard
key = "show"
label = "shortcut-show"
default = "<Super><Alt>c"
```

The full reference, with every setting type, is [the manifest reference](https://docs.luft.computer/extensions/manifest/). Kestrel refuses a manifest that targets an API version it doesn't run, asks for a permission it doesn't know, or declares settings that don't fit together.

Permissions, with the words Settings and the store show for them:

| Permission | Shown as |
| --- | --- |
| `wallpaper` | Draw over the wallpaper |
| `quick-settings` | Add tiles to quick settings |
| `taskbar` | Add buttons to the taskbar |
| `search` | Add results to search |
| `notifications` | Send notifications |
| `weather` | See the weather where you are |
| `location` | See roughly where you are |
| `media` | See and control what's playing |
| `popups` | Show panels and small windows |
| `typing` | Type into other apps |
| `sounds` | Play sounds |
| `audio-levels` | Follow the beat of what's playing |
| `calls` | Know when you're in a call |
| `locked-sounds` | Keep playing sounds while the screen is locked |
| `input-sounds` | Play a sound when you type and click, without seeing your keys |
| `do-not-disturb` | Hold back notifications for a while |

`locked-sounds` and `input-sounds` need `sounds` too, and `input-sounds` can't go with `audio-levels`, which could hear the presses in the sound. A `[helper]` table isn't a permission, but the store shows that the extension runs a program of its own. `[network]` isn't one either, but Settings and the store show the hosts it names as "Connect to api.example.com". `[[shortcuts]]` shows in Settings → Keyboard.

A setting's `depends` hides it until another setting allows it. Without `when` that's a switch being on. With `when` it's any of a list of values, of a `switch` (`[false]` shows it while the switch is off), `choice`, `slider` or `color`, any of the options of a `choices` setting being picked, or a part of a slider's range, such as `{ min = 0.5 }`. A setting hides with the one it depends on, whatever that one's value, so they chain. Hiding changes nothing about a value: it stays stored and keeps its meaning to the extension. Kestrel refuses a `depends` on a setting not declared before it, and a `when` with values that setting can't have.

A setting's `page` puts it on another page of Settings too, under the extension's name, while the extension runs: `appearance` needs `wallpaper`, `taskbar` needs `taskbar`, `sound` needs `sounds` or `audio-levels`, and `input` needs `typing` or `input-sounds`.

## D-Bus

Kestrel serves `com.lantharos.Kestrel.Extensions` at `/com/lantharos/Kestrel/Extensions` on its session bus name `com.lantharos.Kestrel`. Sandboxed apps are refused.

| Member | Does |
| --- | --- |
| `List() → aa{sv}` | Every installed extension, see below |
| `Enable(s id)` | Turns it on, forgetting why Kestrel turned it off |
| `Disable(s id)` | Turns it off |
| `Reload(s id)` | Reads its folder again: a new or updated extension starts, a removed one stops. A new version of an extension Kestrel turned off runs again |
| `Remove(s id)` | Stops it and deletes its folder and settings |
| `SetSetting(s id, s key, v value)` | Changes one of its declared settings; a value that doesn't fit is refused |
| `SetShortcut(s id, s key, as accelerators)` | Sets one of its declared shortcuts |
| `ResetShortcut(s id, s key)` | Puts a shortcut back to its default |
| `Page(s id) → s` | The page it describes for Settings, as JSON, or an empty string. Kestrel builds it only when asked |
| `Act(s id, s control, v value)` | Runs the callback behind a control of the page Kestrel last built, by the `action` id the JSON gives it |
| `ApiVersions` (property, `au`) | The extension API versions this Kestrel runs |
| `ExtensionsChanged` (signal) | Something in `List` changed |
| `PageChanged(s id)` (signal) | The extension's page should be built again: it asked, or a setting changed |

Each entry of `List` has `id`, `name` and `description` (translated), `version`, `api`, `path`, `permissions`, `helper`, `network` (the hosts it connects to), `enabled`, `state` (`running`, `off`, `failed`, `crashed` or `invalid`) and `problem` (why it isn't running), `settings`: for each setting its `key`, `type`, translated `label` and `description`, `value`, `default`, `depends`, `when` (`av`, the values it shows for) or `when-min` and `when-max` (the part of a slider it shows for), `page`, and `options` or `swatches` as `a(ss)` of value and label, with `min` the fewest options a `choices` setting keeps, `images` with the full path of each option's picture, or `min`, `max`, `step` and `unit`; `shortcuts`: for each its `key`, translated `label`, the `accelerators` it's bound to, its `default` and whether it `changed`; and `page`, whether it describes a page of its own.

## Settings pages

An extension's page in Settings lists its declared settings. One that calls `settingsPage.describe` gets a page of its own instead: Kestrel calls its builder when Settings asks with `Page`, turns the sections into JSON, checks every image against the extension's folders, and replaces each callback with an `action` id. A `sprite` row plays frames of a sprite sheet in a loop beside its title, with Settings doing the animating, which stops with reduced motion. Settings draws the page with its own controls and sends `Act` with that id and the new value. A declared setting follows its `depends` there as everywhere else, in the extension's rows on other pages and in quick settings menus too, and a section whose settings all hide goes with them. Nothing an extension describes runs in Settings, so it can't break Settings or reach into it. While the extension is off, the page lists its declared settings.

## Shortcuts

While an extension runs, Kestrel grabs its shortcuts from the compositor: what the person chose in `extension-shortcuts`, or else the manifest's default. A default is left unset when it's taken by Luft's own shortcuts, an app's, or one the person chose for another extension, or when it's something people type by accident; one the compositor refuses at grab time, because something else holds it, is reported unbound in `List`. Settings → Keyboard lists them under Extensions and catches conflicts when the person records one.

## Pop-ups

Pop-ups are drawn by Kestrel from a tree of its own controls, not by the extension, so they look and move like the rest of Luft and can't reach Kestrel's internals. A panel takes the keyboard and closes when it loses it; a window floats above windows and leaves the keyboard alone until clicked. Updates keep each control that stayed in place, so drags and typing carry on, and a panel keeps the keyboard when the control that had it is replaced, such as a Start button that becomes Pause and End.

## Taskbar elements

An extension's `taskbar.addElement` puts an element in `taskbarElements` (`kestrel/ui/src/desktop/panel/elements/extensionElements.ts`), the contract between extensions and the taskbar's islands. The arrangement in `com.lantharos.kestrel taskbar-arrangement` decides where every element goes, by its `id` (`extension-id/key`, kept across versions): an island of its own, or inside another island next to Start, the dock, the tray, the status or the clock, on any edge. The extension never places itself. The first time an element appears it goes in front of the tray, and its place is kept while the extension is off.

| Member | Is |
| --- | --- |
| `id`, `label` | What the arrangement is kept by, and the element's name where people arrange the taskbar |
| `create(layout)` | Makes an actor for it on one display's taskbar. `layout` has `vertical`, `thickness` (the room across the island it sits in) and `button` (a taskbar button's size) |
| `watch(changed)` | Its label changed |

The actor's `relayout(layout)` follows its island to another edge or size, and `destroy()` takes it away. The actor sizes itself: its natural size along the taskbar animates as it grows under the pointer, shrinks, and shows or hides, so the islands just allocate natural sizes, and a hidden element takes no room.

Where an element sits is the person's choice, never the extension's. They drag it while editing the taskbar, and on a taskbar that's one bar (edge to edge, or floating) the extension's Settings page also offers a place through a `taskbar-place` page item: before or after the apps, next to the tray, or at the start or end of the bar. Settings writes that choice into the arrangement with `placeElement` from `@luft/ui/taskbar`.

`ExtensionHost.taskbarIslands(monitor)` is the one place that says where the taskbar is on a display: the bar, or each separate island, with its edge and corner radius in stage coordinates, following islands as they move and hide. `taskbar(monitor)` is the box around the parts along the dock's edge, which layers get as `display.taskbar`. Pop-ups opened from a taskbar item open beside the island that holds it.

## Typing

`typing.type` commits text through the input method into the focused field, or pastes it where nothing takes typed text, after any held modifiers are released. It only works within ten seconds of the person using the extension; Kestrel counts its shortcut, its pop-ups, taskbar items, quick settings tiles, notifications and search results. The privacy indicator shows a keyboard for a few seconds after an extension typed, and its menu names it.

## Wallpaper layers

A layer draws one actor for each rectangle of its `area`, so what it leaves out costs nothing: the Visualizer has a band for each edge that's on. `below-windows` layers and sprites sit in a background group of their own right above the wallpaper, since Mutter lowers windows past any other actor in the window group whenever it restacks them. Each frame, a layer gets the windows on each display, topmost first, and the taskbar as outlines: their rectangles with the radius of every rounded corner, which Mutter reports through `meta_window_get_rounded_corners()` and the taskbar takes from its own shape, so a taskbar in islands is one outline for each island, with the edge it sits on. A layer can name picture atlases; `setPictures` packs up to eight pictures, and the frames of animated GIF and WebP pictures, into one texture of 128-pixel cells, which the shader samples. Pictures people pick come through the file chooser portal with `pickFiles`, which only works right after the person used the extension and keeps copies in its data folder. Picking a `folder` copies the files directly inside it, up to 32 of up to 8 MB each, into a new folder there, and `readText` reads text files back.

## Sprites

A shader layer suits what fills the screen. `wallpaper.addSprites` is for a few small things instead, such as Strays' creatures: each sprite is one small actor between the wallpaper and the windows, so windows cover it by themselves, rounded corners and all, and moving it damages only its own few pixels. There's no shader, no frame clock and no timeline; a sprite that isn't told to change costs nothing, and `place` only touches what differs from the last call.

`loadSheet` cuts a picture into frames, each kept twice as a texture, as drawn and mirrored, with what shows of it. A sprite shows a whole number of screen pixels for each pixel of its sheet, the nearest to the `height` asked for, and snaps to screen pixels, so pixel art stays crisp at any display scale. Actors are filtered with nearest neighbour.

A sprite takes clicks only on what shows of its current frame, through a `vfunc_pick` around those pixels, so the desktop keeps every other pixel. A press takes the stage's grab; past a few pixels of movement the sprite is picked up, moves above the windows and follows the pointer, and it goes back below them when it's let go. A press that doesn't move is a click. Sprites hide while the wallpaper doesn't show, such as in the task view and on the lock screen.

`wallpaper.surfaces` reads windows and the taskbar on demand, each with an id that lasts as long as it does, the display's scale and whether something runs full screen. `onSurfacesChanged` connects to each window, workspace switches, displays and the taskbar's layout, only while an extension listens, and calls listeners once before the next frame, so nothing runs while nothing moves.

## Sound

Each extension that plays sounds gets one `ShellSoundMix`: a PipeWire playback stream named after it, made when it first plays, with sounds decoded once into memory, mixed with per-sound volume and fades and gapless loops, and silenced while the session isn't active. One with `locked-sounds` can keep its stream going while the screen is locked by holding `lockedSounds.keep()`, which Soundscapes does while its sleep timer runs; letting go, or the extension being turned off, silences it again. `ShellAudioMonitor` listens to the default output's monitor with a passive capture stream, but only while some extension holds a listener and `ShellMixer:playing` says an app plays; reading it runs an FFT of the latest samples on demand. Kestrel's own capture doesn't count as recording for the privacy indicator.

## Sounds for keys and clicks

`input-sounds` is what lets an extension sound like a keyboard without learning anything about typing. `typing` isn't involved: that one types into apps, and has nothing to do with reading the keyboard.

The extension only ever hands over files and levels. `ShellKeySounds` (`kestrel/engine/src/sound/shell-key-sounds.c`) decodes them ahead into memory and then does everything else in the compositor: while a level is above 0 it has a Clutter event filter, ahead of Mutter's own, that sorts a press and plays a sound for it. No JavaScript runs for a press, nothing reaches the extension, and there's no signal, callback or value it could read one from. `sounds.onEnded` and the like don't apply, because these sounds never pass through `sounds.play`.

Exactly what's looked at for each press:

| Press | Sorted as |
| --- | --- |
| Space | `space` |
| Enter, on either side | `enter` |
| Backspace | `backspace` |
| The volume keys and the power key | Nothing, and it doesn't sound |
| Any other key up to `KEY_COMPOSE`, by its Linux key code | `key`, the same for all of them |
| Any mouse button | `click` |

That sorting stays inside Kestrel too: the extension doesn't see the kind, only which of its files get played. Held keys don't repeat, and events the input method sends again, synthetic ones and pointer events made from touch don't count.

Nothing plays at all:

- while the desktop isn't active: the screen is locked or locking, or the session is on another seat. `active-changed` of the screen shield sets this as the lock starts, not when it finishes.
- while the keyboard is in a `ClutterText` with a password character, checked at each press, so it covers every Kestrel prompt, whatever its input purpose.
- while an app's field says it's hidden. `InputMethod.hidesTyping` is on from the moment a field with the password purpose, or the `SENSITIVE_DATA` or `HIDDEN_TEXT` hints, has input method focus, until it loses it. This goes for Wayland apps through `text-input-v3`.

That last one depends on what apps say. A field that never says it's a password can't be told from any other: a terminal asking for a password, and X11 apps, which don't use `text-input-v3`. People hear keys there, so Keystrokes says so on its page and in the store, and the extension still learns nothing.

Because a sound is played from the file the extension picked, an extension that could also hear the computer's output could count presses, so the manifest refuses `input-sounds` with `audio-levels`.

Playback goes through a lane of the extension's `ShellSoundMix`, `shell-sound-strikes.c`, made for following a press at once. It has its own stream with `PW_STREAM_FLAG_RT_PROCESS` and a 128-frame quantum, about 2.7 ms at 48 kHz. A press goes from the compositor's main thread into a lock-free ring, without a syscall, and the stream's realtime thread takes it at the start of its next cycle, so neither thread ever waits for the other and the compositor can't stall on audio. Each press picks a file at random, never the same one twice in a row, with a little over ±1 dB of level and ±3% of pitch, which the mixer applies by interpolating at a fixed-point rate.

Nothing allocates while it plays: voices come from a fixed set of eight. At most six sound at once, and the oldest of them fades out over 2 ms for the next, so fast typing can't pile up. A soft knee above 0.75 keeps the sum below full scale. A press older than 250 ms when the stream gets to it is dropped rather than played late, such as while the output wakes up.

The stream stays running for 2 to 4 seconds after the last press, so the first key of the next word isn't late, and then stops, along with its timer; a pack that was replaced is let go then, once no voice can be playing it. At rest it has no wakeups at all. `desktop:keystrokes` measures how long a press takes, along with what typing costs. On a USB sound card, the output adds 4 ms, so a press while typing is heard about 7 ms later. Waking the stopped stream adds 2 to 3 ms. After 5 seconds or more of silence the sound server has suspended the card as well, and waking it takes 10 to 16 ms, so that first key lands at around 15 to 20 ms, a little past the target, and Bluetooth outputs are slower still.

`get_latest_latency` on `ShellKeySounds` is how checks measure it: microseconds from the press to the sound leaving the computer, as far as PipeWire can tell. It's not part of the extension API.

## Media

`media` builds on Kestrel's MPRIS client: every player, its album, length, position and seeking, and artwork as a local file. Art a player gives as a web address is downloaded once into `~/.cache/kestrel/media-art`, which keeps the last 64 pictures, and views may show files from there. `media.output` sets the output's volume and device through `ShellMixer`.

To install an extension, unpack it into `~/.local/share/luft/extensions/<id>/` and call `Reload(id)`; to update, replace the folder and call `Reload(id)` again.

## Settings

Kestrel keeps what the person decided in `com.lantharos.kestrel`: `disabled-extensions`, `extension-settings` (values by id and key, only those changed from the default), `extension-shortcuts` (shortcuts the person set, by id and key) and `extension-problems`. Settings changes them only through the D-Bus interface, so every value is checked against the manifest.

## Safety

- Every call into an extension's code is timed and guarded. An extension that throws while it turns on, or from anything Kestrel calls in it later, is turned off, everything it made is taken away, and a notification says so.
- Kestrel writes which extensions run to `~/.local/state/kestrel/extensions-running.json`. When `kestrel-wrapper` starts it again after a crash, each extension that was running gets a crash counted; at two in a row it stays off, with a notification. A start that isn't after a crash forgets the counts.
- Permissions are what the API object has: an extension that didn't ask for `taskbar` has no `taskbar`.
- A turned off extension costs nothing: its module is never loaded. A wallpaper layer has no actors while it's inactive and stops its frame clock while nothing shows, and its shader only runs over the area it asks for.
- Modules load once per path in GJS, so Kestrel copies `extension.js` to a temporary file for each load. That's what lets `Reload` run new code without restarting Kestrel.

## Calls

`calls` follows what the privacy indicator follows: `ShellMixer:recording` for apps recording from the microphone, and the camera monitor for apps filming. Kestrel's own dictation and level meters don't count. A call starts as soon as either is taken and ends three seconds after both are let go, so it doesn't end while an app switches devices. Soundscapes waits during calls, and Seasons quiets its rain.

## Holding notifications back

`doNotDisturb.hold()` holds back other apps' banners and sounds the way Do Not Disturb does: urgent notifications, apps people let through Do Not Disturb and the extension's own notifications still show, and everything held stays in the notification center. `surfaces/notifications/tray/holds.ts` keeps the holds, and the message tray asks them before it shows a banner or plays a sound. A hold counts what it held by app, while those notifications are still there, and never shows the extension what they say. `release()` ends it and hands those counts to the extension to sum up itself, as Focus does at the end of a session; when a hold ends any other way, including the extension being turned off, Kestrel sums it up with a notification of its own.

## Network

`network.fetch` talks HTTPS to the hosts the manifest names under `[network]`, through one Soup session, and refuses every other host; plain HTTP is only allowed to `localhost` and `127.0.0.1`. A response is read whole, up to 4 MB, and a request is cancelled after its timeout or when the extension is turned off.

## Secrets

`secrets` keeps values such as sign-in tokens in the keyring through libsecret, under the schema `com.lantharos.Kestrel.ExtensionSecret` with the extension's id and the value's key as attributes. Removing the extension deletes them.

## Requests between extensions

`peers.handle(name, answer)` answers requests from other extensions, and `peers.request(id, name, value)` asks one, with values copied as JSON. Both run in each extension's own guard, so an extension that fails while answering is turned off like any other. Soundscapes answers `play`, saying whether it was already playing, and `pause`; Focus uses them to play the mix during a session and stop it after, only if it started it.

## Wanted

What extensions need that the API doesn't offer yet:

- **Whether other apps play sound.** `audioLevels.playing` counts the extension's own sounds too, so an extension that plays sounds can't tell when another app starts. Soundscapes pauses for media players instead, which misses apps without one, such as games.

## Adding an API version

Version 1 grows in place while there are no extensions outside Luft's own: add to it, never take away or change what's there. When a change can't keep old extensions working, copy `api/v1` to `api/v2`, change the copy, add it to `API_VERSIONS` in `api/versions.ts` and to `extensionApi.ts`, and keep `v1` working. Extensions keep targeting the version they were written for.
