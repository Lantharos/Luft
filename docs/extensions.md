# Extensions

Extensions add to Kestrel: a layer over the wallpaper, quick settings tiles, taskbar buttons, search results, notifications. They run inside Kestrel's process but only see a versioned API object, never Kestrel's internals. How to write one is in [the developer docs](https://docs.luft.computer/extensions/getting-started/); this page is how it works inside Luft.

| Where | What |
| --- | --- |
| `kestrel/ui/src/extensions/runtime` | Finding, loading, enabling and switching off extensions, their stored settings and crash guard |
| `kestrel/ui/src/extensions/api/v1` | API version 1. `types.ts` is the contract; everything else implements it |
| `kestrel/ui/src/extensions/service.ts` | The D-Bus interface below |
| `packages/extension-api` | `@luft/extension-api`, the types for extension authors, written from `types.ts` by `bun kestrel/ui/extensionApi.ts`. `bun run check` in `kestrel/ui` fails when it's out of date |
| `kestrel/extensions` | Extensions Luft ships, such as Rain, built by `kestrel/engine/extensions` |
| `apps/settings/src/lib/panels/personalization/extensions` | Settings → Extensions |

## On disk

```
/usr/share/luft/extensions/<id>/           extensions Luft ships, one folder per extension
~/.local/share/luft/extensions/<id>/       extensions the person installed
  extension.toml                           the manifest
  extension.js                             one ES module whose default export is enable(extension)
  locales/<language>/*.ftl                 translations, English in locales/en
  ...                                      anything else it ships, such as a helper program
```

Every folder in `luft/extensions` under `XDG_DATA_HOME` and each of `XDG_DATA_DIRS` counts, and its name must be the manifest's `id`. A user copy replaces a system copy with the same id: that's how the store updates an extension Luft ships. An extension runs unless it's turned off.

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

A `[helper]` table isn't a permission, but the store shows that the extension runs a program of its own.

## D-Bus

Kestrel serves `com.lantharos.Kestrel.Extensions` at `/com/lantharos/Kestrel/Extensions` on its session bus name `com.lantharos.Kestrel`. Sandboxed apps are refused.

| Member | Does |
| --- | --- |
| `List() → aa{sv}` | Every installed extension, see below |
| `Enable(s id)` | Turns it on, forgetting why Kestrel turned it off |
| `Disable(s id)` | Turns it off |
| `Reload(s id)` | Reads its folder again: a new or updated extension starts, a removed one stops. A new version of an extension Kestrel turned off runs again |
| `Remove(s id)` | Stops it, deletes the user copy and its settings, and hides the system copy for this account |
| `SetSetting(s id, s key, v value)` | Changes one of its declared settings; a value that doesn't fit is refused |
| `ApiVersions` (property, `au`) | The extension API versions this Kestrel runs |
| `ExtensionsChanged` (signal) | Something in `List` changed |

Each entry of `List` has `id`, `name` and `description` (translated), `version`, `api`, `path`, `origin` (`system` or `user`), `overrides` (a user copy replacing a system one), `permissions`, `helper`, `enabled`, `state` (`running`, `off`, `failed`, `crashed` or `invalid`) and `problem` (why it isn't running), `cpu` (share of one processor since it started, counting its helper) and `memory` (its helper's resident memory) while it runs, and `settings`: for each setting its `key`, `type`, translated `label` and `description`, `value`, `default`, `depends`, and `options` or `swatches` as `a(ss)` of value and label, or `min`, `max`, `step` and `unit`.

To install an extension, unpack it into `~/.local/share/luft/extensions/<id>/` and call `Reload(id)`; to update, replace the folder and call `Reload(id)` again.

## Settings

Kestrel keeps what the person decided in `com.lantharos.kestrel`: `disabled-extensions`, `removed-extensions`, `extension-settings` (values by id and key, only those changed from the default) and `extension-problems`. Settings changes them only through the D-Bus interface, so every value is checked against the manifest.

## Safety

- Every call into an extension's code is timed and guarded. An extension that throws while it turns on, or from anything Kestrel calls in it later, is turned off, everything it made is taken away, and a notification says so.
- Kestrel writes which extensions run to `~/.local/state/kestrel/extensions-running.json`. When `kestrel-wrapper` starts it again after a crash, each extension that was running gets a crash counted; at two in a row it stays off, with a notification. A start that isn't after a crash forgets the counts.
- Permissions are what the API object has: an extension that didn't ask for `taskbar` has no `taskbar`.
- A turned off extension costs nothing: its module is never loaded. A wallpaper layer has no actors while it's inactive and stops its frame clock while nothing shows.
- Modules load once per path in GJS, so Kestrel copies `extension.js` to a temporary file for each load. That's what lets `Reload` run new code without restarting Kestrel.

## Adding an API version

Copy `api/v1` to `api/v2`, change the copy, add it to `API_VERSIONS` in `api/versions.ts` and to `extensionApi.ts`, and keep `v1` working. Extensions keep targeting the version they were written for.
