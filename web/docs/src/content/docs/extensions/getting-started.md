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

The folder's name is the extension's id, in reverse DNS. Put it in `~/.local/share/luft/extensions/` while you work on it.

## The manifest

```toml
id = "com.example.Hello"
name = "Hello"
description = "Says hello from quick settings."
version = "1.0.0"
api = 1
permissions = ["quick-settings", "notifications"]

[[settings]]
key = "loud"
type = "switch"
label = "loud"
default = false
```

`api` is the version of the extension API it's written for. `permissions` lists what it uses beyond the basics; the API object only has the parts it asked for. Every setting appears in Settings → Extensions with Luft's own controls. The [manifest reference](/extensions/manifest/) has every field.

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

## Next

- [The manifest](/extensions/manifest/), every field and setting type
- [The API](/extensions/api/), everything the API object offers
- [Sharing it](/extensions/distributing/), packaging it for Schelf and how Luft installs it
