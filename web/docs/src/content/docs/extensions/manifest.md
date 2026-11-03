---
title: The manifest
description: Every field of extension.toml, the permissions and the setting types.
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
| `[helper]` | `path` names a program in the folder that the API can start |
| `[[settings]]` | Settings people change in Settings → Extensions, see below |

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

A `[helper]` gives `helper`. It's a native program, so Schelf shows that the extension runs one and scans it like any app.

## Settings

Each `[[settings]]` table is one setting. Settings draws it with Luft's own controls; an extension never brings its own interface into Settings.

| Field | Means |
| --- | --- |
| `key` | Lowercase, with dashes, unique in the extension |
| `type` | `switch`, `choice`, `slider` or `color` |
| `label` | A message id. Its value is the title, its `.description` attribute the line under it |
| `default` | The value until someone changes it |
| `depends` | A switch declared earlier; the setting only shows while that switch is on |

| Type | Value | Extra fields | Shows as |
| --- | --- | --- | --- |
| `switch` | `true` or `false` | | A switch |
| `choice` | One option's `value` | `options`, a list of `{ value, label }` with message ids as labels | Buttons side by side for up to three options, a menu for more |
| `slider` | A number from `min` to `max` | `min`, `max`, `step`, and `unit = "percent"` to show it as a percentage | A slider |
| `color` | `#rrggbb`, or `accent` for the accent colour | `swatches`, a list of `{ value, label }` offered first | Swatches and a colour picker |

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

Values are stored per account. A value that no longer fits after an update, such as an option that was removed, falls back to the default.
