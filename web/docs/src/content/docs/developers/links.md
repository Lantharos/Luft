---
title: Opening Settings and Keys
description: The kestrel-settings and kestrel-keys links that open a page in Settings or Keys from another app.
sidebar:
  order: 4
---

Apps and scripts can open Settings and Keys at a specific page with a link, through `xdg-open`, a portal or a launcher. If the app is already open, the link switches its window to that page.

## Settings

| Link | Opens |
| --- | --- |
| `kestrel-settings:<page>` | A page: `network`, `bluetooth`, `display`, `sound`, `power`, `appearance`, `notifications`, `keyboard`, `mouse`, `accessibility`, `apps`, `privacy`, `security`, `datetime`, `users`, `accounts`, `login`, `updates`, `about` |
| `kestrel-settings:appearance/fonts` | All fonts |
| `kestrel-settings:appearance/cursors` | Cursor themes |
| `kestrel-settings:appearance/taskbar` | Taskbar |
| `kestrel-settings:keyboard/dictation` | Dictation |
| `kestrel-settings:accounts/add` | Adding an account |

A link to a page for missing hardware, such as Bluetooth without an adapter, explains that instead.

## Keys

| Link | Opens |
| --- | --- |
| `kestrel-keys:` | Keys |
| `kestrel-keys:layout/new?from=de%2Bnodeadkeys` | A new layout starting from the given one |
| `kestrel-keys:layout/<name>` | One of your layouts |
| `kestrel-keys:view/<layout>` | Any layout, read-only, such as `kestrel-keys:view/us%2Bintl` |
| `kestrel-keys:method/new` | A new input method |
| `kestrel-keys:method/<name>` | One of your input methods |
