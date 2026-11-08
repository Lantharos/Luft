---
title: The manifest
description: Every field of extension.toml, the permissions, the setting types and keyboard shortcuts.
sidebar:
  order: 2
---

`extension.toml` sits at the top of the extension's folder. Kestrel refuses an extension whose manifest doesn't parse, targets an API version it doesn't run, or declares something that doesn't fit; Settings shows why.

## Fields

| Field | Means |
| --- | --- |
| `id` | Reverse DNS, such as `com.example.Clock`. The folder has the same name, and Schelf requires a namespace you've proven |
| `name` | The name in English. A message `extension-name` in the translations replaces it in other languages |
| `description` | One sentence in English. `extension-description` translates it |
| `version` | The extension's version, such as `1.2.0` |
| `api` | The extension API version it targets. Luft keeps every version it shipped working, and refuses versions it doesn't know |
| `permissions` | What it uses beyond the basics, see below |
| `[helper]` | `path` names a program in the folder that the API can start. `turned-off` is an optional list of arguments it runs with once when people turn the extension off or remove it, so it can undo what it changed outside its folder |
| `[network]` | `hosts` names the hosts it connects to, such as `["api.example.com"]`. `listen` names the ports its helper takes connections on from other devices, such as `[{ port = 53317, protocol = "tcp" }, { port = 53317, protocol = "udp" }]` |
| `[[settings]]` | Settings people change in Settings → Extensions, see below |
| `[[shortcuts]]` | Keyboard shortcuts people can change in Settings → Keyboard, see below |

## Permissions

The API object only has the parts an extension asked for. Settings and Schelf show each permission in plain words.

| Permission | Shown as | Gives |
| --- | --- | --- |
| `wallpaper` | Draw over the wallpaper | `wallpaper` |
| `quick-settings` | Add tiles to quick settings | `quickSettings` |
| `taskbar` | Add buttons to the taskbar | `taskbar` |
| `search` | Add results to search | `search` |
| `notifications` | Send notifications | `notifications` |
| `weather` | See the weather where you are | `weather` |
| `location` | See roughly where you are | `location` |
| `media` | See and control what's playing | `media` |
| `popups` | Show panels and small windows | `popups` |
| `typing` | Type into other apps | `typing` |
| `sounds` | Play sounds | `sounds` |
| `audio-levels` | Follow the beat of what's playing | `audioLevels` |
| `calls` | Know when you're in a call | `calls` |
| `locked-sounds` | Keep playing sounds while the screen is locked | `lockedSounds` |
| `input-sounds` | Play a sound when you type and click, without seeing your keys | `inputSounds` |
| `do-not-disturb` | Hold back notifications for a while | `doNotDisturb` |
| `screen-effects` | Draw over and change how your windows and the whole screen look | `screenEffects` |
| `clipboard` | Copy to your clipboard | `clipboard` |
| `file-actions` | Add to the menu of files and folders in Rover | `fileActions` |

`locked-sounds` and `input-sounds` need `sounds` too, and `input-sounds` can't go with `audio-levels`. A `[helper]` gives `helper`. It's a native program, so Schelf shows that the extension runs one and scans it like any app. `[network]` with `hosts` gives `network`, and Settings and Schelf show its hosts as "Connect to api.example.com"; a release that adds a host asks again, like one that adds a permission. Ports under `listen` show in Settings as "Take connections from devices on your network". Luft's firewall lets devices on networks people marked as home reach those ports on the extension's helper, without asking again, and keeps them closed on public networks. `[[shortcuts]]` gives `shortcuts`.

`typing` is the one to ask for least: an extension can only type within ten seconds of someone using it, and the taskbar shows that it did.

## Settings

Each `[[settings]]` table is one setting. Settings draws it with Luft's own controls; an extension never brings its own interface into Settings.

| Field | Means |
| --- | --- |
| `key` | Lowercase, with dashes, unique in the extension |
| `type` | `switch`, `choice`, `choices`, `slider` or `color` |
| `label` | A message id. Its value is the title, its `.description` attribute the line under it |
| `default` | The value until someone changes it |
| `depends` | A setting declared earlier; this one only shows while that one shows, and while it's on if it's a switch |
| `when` | What `depends` has to be for the setting to show, instead of on: a list of values, or part of a slider's range |
| `hidden` | `true` never shows the setting. The extension sets it with `settings.set`, and others can `depends` on it, such as a `choices` setting of what it found on the computer |
| `page` | Another page of Settings the setting also shows on, under the extension's name: `appearance` (needs `wallpaper`), `taskbar` (needs `taskbar`), `sound` (needs `sounds` or `audio-levels`) or `input` (needs `typing` or `input-sounds`) |

| Type | Value | Extra fields | Shows as |
| --- | --- | --- | --- |
| `switch` | `true` or `false` | | A switch |
| `choice` | One option's `value` | `options`, a list of `{ value, label, image? }` with message ids as labels | Buttons side by side for up to three options, a menu for more, or pictures when every option has an `image` |
| `choices` | A list of options' `value`s, any number of them at once | `options`, as for `choice`, and `min`, the fewest that stay picked: `min = 1` keeps the last one from being turned off | Buttons side by side that turn on and off one by one |
| `slider` | A number from `min` to `max` | `min`, `max`, `step`, and `unit = "percent"` to show it as a percentage | A slider |
| `color` | `#rrggbb`, `accent` for the accent colour, or `wallpaper` for the colour the wallpaper suggests | `swatches`, a list of `{ value, label }` offered first | Swatches and a colour picker |

```toml
[[settings]]
key = "style"
type = "choice"
label = "style"
default = "digital"
options = [
  { value = "digital", label = "style-digital" },
  { value = "hands", label = "style-hands" },
]

[[settings]]
key = "tint"
type = "color"
label = "tint"
default = "accent"
swatches = [{ value = "accent", label = "tint-accent" }, { value = "#f2efe8", label = "tint-paper" }]
```

### Showing a setting only when it applies

A setting can wait for another one, so people only see options they can use. It names that setting in `depends`, which has to be declared before it, and says in `when` which values it shows for:

```toml
[[settings]]
key = "second-hand"
type = "switch"
label = "second-hand"
default = true
depends = "style"
when = ["hands"]
```

| `depends` names a | `when` is | Shows |
| --- | --- | --- |
| `switch` | left out | While the switch is on |
| `switch` | `[false]` | While the switch is off |
| `choice` | `["digital", "hands"]` | While one of these is chosen |
| `choices` | `["top", "bottom"]` | While at least one of these is picked |
| `slider` | `{ min = 0.5 }`, `{ max = 0.5 }` or `{ min = 0.25, max = 0.75 }` | While the slider is in that range, ends included |
| `slider` | `[0, 1]` | At exactly these values |
| `color` | `["accent"]` | While one of these is chosen |

Conditions chain: when a setting hides, everything that depends on it hides too, whatever its own `when` says. So a setting that depends on `style` above only shows while `second-hand` shows. This works everywhere a setting appears: the extension's page, a page of its own, its rows on other pages of Settings and quick settings menus. In a [quick settings menu](/extensions/api/#quicksettings) of a toggle with its own `setting`, that switch counts as on, since people turn it on from there.

A hidden setting keeps its value, and `settings.get` still returns it, so the extension decides what it means while it's hidden. A manifest is refused when `depends` names a setting declared later or not at all, when `when` has no values or a value the other setting can't have, when a range isn't on a slider or misses it entirely, when `when` comes without `depends`, or when `depends` names anything but a switch without a `when`.

Values are stored per account. A value that no longer fits after an update, such as an option that was removed, falls back to the default.

An option's `image` is a PNG, JPEG, WebP or SVG in the extension's folder, best at 3:2, showing what the option looks like.

The page Settings shows for an extension lists these settings. An extension that needs more, such as lists of its own or values only it knows, describes a whole page with [`settingsPage`](/extensions/api/#settings-page); the settings declared here keep working inside it, `depends` included, and a section whose settings all hide disappears.

## Shortcuts

Each `[[shortcuts]]` table is a keyboard shortcut that works anywhere but the lock screen while the extension runs. People see and change it in Settings → Keyboard → Shortcuts, under Extensions.

| Field | Means |
| --- | --- |
| `key` | Lowercase, with dashes, unique among its shortcuts |
| `label` | A message id saying what it does |
| `default` | What it's set to at first, such as `<Super><Alt>v` |

A default that Luft, an app or another extension already uses, or that people could type by accident, such as a single letter, stays unset until someone picks a shortcut for it.

```toml
[[shortcuts]]
key = "show"
label = "shortcut-show"
default = "<Super><Alt>v"
```
