---
title: Sharing an extension
description: Packaging an extension for Schelf, where Luft installs it, and the D-Bus interface that manages extensions.
sidebar:
  order: 4
---

## In Schelf

Schelf carries extensions next to apps, with `kind = "extension"` and `format = "luft-extension"` in `schelf.toml`. The artifact is a `.tar.zst` of the extension's folder, one for every computer, or one per architecture when it ships a native helper. Schelf checks that the manifest's id matches the listing, that it targets an API version Luft has shipped, and that the permissions it lists are the ones the listing shows, and offers each computer the newest release whose API version it runs.

## Where Luft keeps them

Every extension lives in `~/.local/share/luft/extensions/<id>/`. The ones Luft comes with, such as Rain, are installed there from the store when you first sign in, and update and remove like any other.

## The D-Bus interface

Settings and Schelf manage extensions through `com.lantharos.Kestrel.Extensions` at `/com/lantharos/Kestrel/Extensions` on the session bus name `com.lantharos.Kestrel`. Sandboxed apps can't use it.

| Member | Does |
| --- | --- |
| `List() → aa{sv}` | Every installed extension: `id`, `name`, `description`, `version`, `api`, `path`, `permissions`, `helper`, `enabled`, `state` (`running`, `off`, `failed`, `crashed`, `invalid`), `problem`, `cpu` and `memory` while it runs, `settings`, `shortcuts`, and `page`, whether it describes a page of its own |
| `Enable(s id)`, `Disable(s id)` | Turns it on or off |
| `Reload(s id)` | Reads its folder again. A new extension starts, an updated one restarts with its new code, a deleted one stops |
| `Remove(s id)` | Deletes it and its settings |
| `SetSetting(s id, s key, v value)` | Changes a declared setting; a value that doesn't fit is refused |
| `SetShortcut(s id, s key, as accelerators)`, `ResetShortcut(s id, s key)` | Sets a declared shortcut, or puts it back to its default |
| `Page(s id) → s` | The page the extension describes, as JSON, or nothing |
| `Act(s id, s control, v value)` | Uses a control of that page, by the id the JSON gives it |
| `PageChanged(s id)` | Signal: ask for that page again |
| `ApiVersions` | Property: the API versions this Luft runs |
| `ExtensionsChanged` | Signal: something in `List` changed |

To install, unpack the folder into `~/.local/share/luft/extensions/<id>/` and call `Reload(id)`. To update, replace the folder and call `Reload(id)` again; an update to an extension Luft turned off after a problem runs again.
