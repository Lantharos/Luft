---
title: Sharing an extension
description: Packaging an extension for Schelf, where Luft installs it, and the D-Bus interface that manages extensions.
sidebar:
  order: 4
---

## In Schelf

Schelf carries extensions next to apps, with `kind = "extension"` and `format = "luft-extension"` in `schelf.toml`. The artifact is a `.tar.zst` of the extension's folder, one for every computer, or one per architecture when it ships a native helper. Schelf checks that the manifest's id matches the listing, that it targets an API version Luft has shipped, and that the permissions it lists are the ones the listing shows, and offers each computer the newest release whose API version it runs. Releases are checked and reviewed like apps, a native helper is scanned like any program, and a release that asks for a new permission, host or helper is reviewed again. Luft only installs releases named in the store's signed index, after checking the download against it.

That review matters more for extensions than for apps: an extension that runs inside the desktop isn't in a sandbox, so its permissions describe what it does but don't confine it. Luft only runs a release there when the store's signed index says its publisher is verified and that release was approved to run inside Luft.

Every release also names the oldest version of Luft it runs on, in `extension.toml`:

```toml
[luft]
minimum = "1.2"
```

Versions are ordered the way Luft releases them, every nightly before the release it leads to, so `1.2-nightly.21` comes after `1.1` and before `1.2`. Schelf only installs or updates to a release this Luft is new enough for, and Luft doesn't load one it isn't new enough for, wherever it came from.

## Where Luft keeps them

An extension from Schelf is installed by the system into `/var/lib/luft/extensions/<uid>/<id>/`, for that account only, where nothing but the system can change it. Luft doesn't ship extensions of its own; Seasons and the others come from Schelf too.

An extension in `~/.local/share/luft/extensions/<id>/` is one you put there yourself. Luft lists it, but doesn't run it inside the desktop, since any program of yours could have changed it. It's meant to run on its own in a separate process, held to exactly what it lists, and doesn't run until Luft can do that. A copy there of an extension installed from Schelf is ignored.

## The D-Bus interface

Settings and Schelf manage extensions through `com.lantharos.Kestrel.Extensions` at `/com/lantharos/Kestrel/Extensions` on the session bus name `com.lantharos.Kestrel`. Sandboxed apps can't use it.

| Member | Does |
| --- | --- |
| `List() → aa{sv}` | Every installed extension: `id`, `name`, `description`, `version`, `api`, `path`, `permissions`, `helper`, `network` (the hosts it connects to), `listen` (the ports its helper takes connections on, each with `tcp` or `udp`), `enabled`, `origin` (`store`, `development` or `own`), `ignored` (copies left alone), `luft` (the oldest version of Luft it runs on), `state` (`running`, `off`, `failed`, `crashed`, `invalid`, `needs-newer-luft`, `runs-separately`), `problem`, `settings`, `shortcuts`, and `page`, whether it describes a page of its own |
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

`Reload(id)` reads an extension's folder again after Schelf installed or updated it; an update to an extension Luft turned off after a problem runs again.
