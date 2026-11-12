---
title: Writing an extension
description: A first Luft extension, from an empty folder to a tile in quick settings.
sidebar:
  order: 1
---

An extension is a folder with a manifest, one JavaScript module and its translations. Kestrel, Luft's desktop, runs it in its own process and hands it an API object: everything the extension does, it does through that object, and everything it made goes away when it's turned off.

## The folder

```
com.example.Hello/
  extension.toml
  extension.js
  locales/
    en/hello.ftl
    de/hello.ftl
```

The folder's name is the extension's id, in reverse DNS. Put it in `~/.local/share/luft/extensions/` and it runs: Luft starts it in a sandbox of its own and lists it in **Settings → Extensions**, where you can turn it off and on again after a change. In your folder it gets the API object with every part but the few that draw inside the desktop itself, listed in the [manifest reference](/extensions/manifest/#in-a-sandbox). What it prints goes to the desktop's log, `journalctl --user -u kestrel -f`.

## The manifest

```toml
id = "com.example.Hello"
name = "Hello"
description = "Says hello from quick settings."
version = "1.0.0"
api = 1
permissions = ["quick-settings", "notifications"]

[luft]
minimum = "1.2"

[[settings]]
key = "loud"
type = "switch"
label = "loud"
default = false
```

`api` is the version of the extension API it's written for, and `[luft] minimum` the oldest version of Luft it runs on. `permissions` lists what it uses beyond the basics; the API object only has the parts it asked for, and people see the list before they install it. From your own folder that list is all it can do; inside the desktop it's a declaration, as the [manifest reference](/extensions/manifest/#permissions) explains. Every setting appears in Settings → Extensions with Luft's own controls. The [manifest reference](/extensions/manifest/) has every field.

## The code

`extension.js` is an ES module. Its default export runs each time the extension is turned on:

```js
export default function enable(hello) {
  hello.quickSettings.addToggle({
    title: hello.t('title'),
    icon: 'face-smile-symbolic',
    onToggled: on => {
      if (on) hello.notifications.send({ title: hello.t(hello.settings.get('loud') ? 'shout' : 'greeting') });
    },
  });
}
```

There's no `disable`: when the extension is turned off, Kestrel removes the toggle, stops its timers and helper, withdraws its notifications, and calls anything given to `hello.onDisable()`.

With TypeScript, add the types and name the permissions you asked for:

```ts
import type { Enable } from '@luft/extension-api';

const enable: Enable<'quick-settings' | 'notifications'> = hello => {
  hello.quickSettings.addToggle({ title: hello.t('title'), icon: 'face-smile-symbolic' });
};

export default enable;
```

Bundle it into the single `extension.js`, for example with `bun build src/extension.ts --outfile extension.js --target browser --format esm --external 'gi:*'`.

## Translations

Messages are [Fluent](https://projectfluent.org), like the rest of Luft, in `locales/<language>/*.ftl`. Kestrel picks the language the desktop uses and fills gaps with English:

```ftl
extension-name = Hello
title = Hello
greeting = Hello there
shout = HELLO THERE
loud = Shout
    .description = Says it louder
```

`extension-name` and `extension-description` translate the manifest's name and description. A setting's `label` names a message: its value is the title in Settings, its `.description` attribute the line under it. When the language changes, Kestrel turns the extension off and on again, so plain `t()` calls are all it needs.

## Trying it

After changing anything, ask Kestrel to load it again, from a terminal:

```sh
gdbus call --session --dest com.lantharos.Kestrel --object-path /com/lantharos/Kestrel/Extensions \
  --method com.lantharos.Kestrel.Extensions.Reload com.example.Hello
```

It shows up in Settings → Extensions. If it throws while it turns on, or later from something Kestrel calls, Kestrel turns it off, says so in a notification, and Settings shows the error.

## Trying it inside the desktop

From your folder, an extension runs in a sandbox, without the parts that draw inside the desktop itself, such as `wallpaper`, `screen-effects` and `typing`. To try those before you share it, turn on [Developer tools](/system/security/#developer-tools), open the extension in Settings → Extensions and choose **Run from its folder**. After an administrator's password, Luft runs it inside the desktop straight from `~/.local/share/luft/extensions/com.example.Hello`, and **Run your latest changes** on the same page, or the `Reload` call above, starts it again with your edits. **Stop running inside Luft** puts it back in its sandbox, and so does turning Developer tools off.

Anything that can write to that folder can then run code inside the desktop, so keep this to extensions you're writing. Someone who wants to use yours before it's in Schelf can choose **Install a copy** instead: Luft keeps a copy no program can change, and they update it by installing a copy again.

## Next

- [The manifest](/extensions/manifest/), every field and setting type
- [The API](/extensions/api/), everything the API object offers
- [Sharing it](/extensions/distributing/), packaging it for Schelf and how Luft installs it
