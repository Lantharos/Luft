# Extensions

Extensions add to Kestrel: layers over the wallpaper, quick settings tiles, taskbar buttons, pop-up panels and small windows, keyboard shortcuts, search results, notifications, sounds, and pages in Settings. They run inside Kestrel's process but only see a versioned API object, never Kestrel's internals. What Luft does for everyone, such as the emoji picker, clipboard history and dictation, stays built into Kestrel; extensions are for what's optional. How to write one is in [the developer docs](https://docs.luft.computer/extensions/getting-started/); this page is how it works inside Luft.

| Where | What |
| --- | --- |
| `kestrel/ui/src/extensions/runtime` | Finding, loading, enabling and switching off extensions, their stored settings and crash guard |
| `kestrel/ui/src/extensions/api/v1` | API version 1. `types.ts` is the contract; everything else implements it |
| `kestrel/ui/src/extensions/service.ts` | The D-Bus interface below |
| `kestrel/engine/src/sound` | `ShellSoundMix`, which plays an extension's sounds, and `ShellAudioMonitor`, which measures what the computer plays |
| `packages/extension-api` | `@luft/extension-api`, the types for extension authors, written from `types.ts` by `bun kestrel/ui/extensionApi.ts`. `bun run check` in `kestrel/ui` fails when it's out of date |
| `extensions` | Lantharos's own extensions, such as Rain. Each has a `build.sh` that makes its folder, which `extensions/pack.sh` packs for schelf.store |
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

Each folder in `luft/extensions` under `XDG_DATA_HOME` is an extension, and its name must be the manifest's `id`. There's no system-wide folder: extensions Luft comes with, such as Rain, are store releases the image carries in `/usr/share/luft/preinstall`, which Schelf installs into each account at sign-in, once and offline ([Schelf](components/schelf.md#preinstalled-apps-and-background-updates)), and updates from schelf.store after that. Removing one deletes its folder, and it stays removed. An extension runs unless it's turned off.

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

[[settings]]                      # switch, choice, slider or color
key = "seconds"
type = "switch"
label = "seconds"                 # a message id; its .description attribute is the line under it
default = false
page = "appearance"               # also shown on this page of Settings, if a permission allows

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

A `[helper]` table isn't a permission, but the store shows that the extension runs a program of its own. `[[shortcuts]]` isn't one either; the shortcuts show in Settings → Keyboard.

A setting's `page` puts it on another page of Settings too, under the extension's name, while the extension runs: `appearance` needs `wallpaper`, `taskbar` needs `taskbar`, `sound` needs `sounds` or `audio-levels`, and `input` needs `typing`.

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

Each entry of `List` has `id`, `name` and `description` (translated), `version`, `api`, `path`, `permissions`, `helper`, `enabled`, `state` (`running`, `off`, `failed`, `crashed` or `invalid`) and `problem` (why it isn't running), `cpu` (share of one processor since it started, counting its helper) and `memory` (its helper's resident memory) while it runs, `settings`: for each setting its `key`, `type`, translated `label` and `description`, `value`, `default`, `depends`, `page`, and `options` or `swatches` as `a(ss)` of value and label, `images` with the full path of each option's picture, or `min`, `max`, `step` and `unit`; `shortcuts`: for each its `key`, translated `label`, the `accelerators` it's bound to, its `default` and whether it `changed`; and `page`, whether it describes a page of its own.

## Settings pages

An extension's page in Settings lists its declared settings. One that calls `settingsPage.describe` gets a page of its own instead: Kestrel calls its builder when Settings asks with `Page`, turns the sections into JSON, checks every image against the extension's folders, and replaces each callback with an `action` id. Settings draws the page with its own controls and sends `Act` with that id and the new value. Nothing an extension describes runs in Settings, so it can't break Settings or reach into it. While the extension is off, the page lists its declared settings.

## Shortcuts

While an extension runs, Kestrel grabs its shortcuts from the compositor: what the person chose in `extension-shortcuts`, or else the manifest's default. A default is left unset when it's taken by Luft's own shortcuts, an app's, or one the person chose for another extension, or when it's something people type by accident; one the compositor refuses at grab time, because something else holds it, is reported unbound in `List`. Settings → Keyboard lists them under Extensions and catches conflicts when the person records one.

## Pop-ups

Pop-ups are drawn by Kestrel from a tree of its own controls, not by the extension, so they look and move like the rest of Luft and can't reach Kestrel's internals. A panel takes the keyboard and closes when it loses it; a window floats above windows and leaves the keyboard alone until clicked. Updates keep each control that stayed in place, so drags and typing carry on.

## Taskbar elements

An extension's `taskbar.addElement` puts an element in `taskbarElements` (`kestrel/ui/src/desktop/panel/widgets/extensionElements.ts`), the contract between extensions and the taskbar's layout. The layout decides where every element goes, by its `id` (`extension-id/key`, kept across versions): an island of its own, or inside another island next to Start, the dock, the tray, the status or the clock, on any edge. The extension never places itself.

| Member | Is |
| --- | --- |
| `id`, `label` | What the arrangement is kept by, and the element's name where people arrange the taskbar |
| `create(layout)` | Makes this taskbar's actor for it. `layout` has `vertical`, `thickness` (the room across the island it sits in) and `button` (a taskbar button's size) |
| `watch(changed)` | Its label changed |

The actor's `relayout(layout)` follows the island to another edge or size, and `destroy()` takes it away. The actor sizes itself: its natural size along the taskbar animates as it grows under the pointer, shrinks, and shows or hides, so the layout just allocates natural sizes, and a hidden element takes no room. Until the islands land, the primary taskbar shows elements next to the extensions' buttons.

Where an element sits is the person's choice, never the extension's. With separate islands they move it while editing the taskbar. On a taskbar that's one bar (edge to edge, or islands joined), the extension's Settings page offers a place through a `taskbar-place` page item, which Settings keeps in `taskbar-element-places` (`a{ss}`, element id to place):

| Place | In the arrangement |
| --- | --- |
| `before-apps` | In the island holding Start and the dock, before the first of them |
| `after-apps` | In that island, after the dock |
| `beside-tray` | Before the tray, where a new element goes; also what a missing entry means |
| `start` | First in the island at the start of the bar's edge, made if there's none |
| `end` | Last in the island at the end of the bar's edge, made if there's none |

This is meant as the arrangement's own place for the element: the islands layout reads the key, moves each element accordingly, and from then on Settings writes the arrangement directly in place of the key.

## Typing

`typing.type` commits text through the input method into the focused field, or pastes it where nothing takes typed text, after any held modifiers are released. It only works within ten seconds of the person using the extension; Kestrel counts its shortcut, its pop-ups, taskbar items, quick settings tiles, notifications and search results. The privacy indicator shows a keyboard for a few seconds after an extension typed, and its menu names it.

## Sound

Each extension that plays sounds gets one `ShellSoundMix`: a PipeWire playback stream named after it, made when it first plays, with sounds decoded once into memory, mixed with per-sound volume and fades and gapless loops, and silenced while the session isn't active. `ShellAudioMonitor` listens to the default output's monitor with a passive capture stream, but only while some extension holds a listener and `ShellMixer:playing` says an app plays; reading it runs an FFT of the latest samples on demand. Kestrel's own capture doesn't count as recording for the privacy indicator.

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

## Adding an API version

Version 1 grows in place while there are no extensions outside Luft's own: add to it, never take away or change what's there. When a change can't keep old extensions working, copy `api/v1` to `api/v2`, change the copy, add it to `API_VERSIONS` in `api/versions.ts` and to `extensionApi.ts`, and keep `v1` working. Extensions keep targeting the version they were written for.
