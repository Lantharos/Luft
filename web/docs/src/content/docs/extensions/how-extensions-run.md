---
title: How extensions run
description: Where Luft runs an extension, what holds it there, and the guards every extension gets.
sidebar:
  order: 5
---

An extension is a JavaScript module written against the versioned API object Kestrel hands it, never against Kestrel's own code. Where it runs decides what holds it. An extension inside Kestrel shares the compositor's process and JavaScript realm, so it can draw in the same scene as the desktop, and nothing walls it off. An extension in a sandbox reaches only what the API serves it across a process boundary. Luft runs an extension inside Kestrel only when someone vouched for it.

There are three ways an extension runs:

- **Inside Kestrel, from schelf.store**, when the store approved that exact release to run there.
- **In a sandbox**, which is how every other extension runs: a release from schelf.store that isn't approved to run inside Kestrel, and anything in the account's own folder.
- **Inside Kestrel without a review**, when the person approved an extension from their own folder while [Developer tools](/system/security/#developer-tools) is on.

What Luft does for everyone, such as the emoji picker, clipboard history and dictation, stays built into Kestrel. Extensions are for what's optional.

## Where an extension runs

Kestrel decides by the folder an extension is in, never by anything the extension says about itself. Each folder inside these is one extension, named after the manifest's `id`:

| Folder | Holds | Runs |
| --- | --- | --- |
| `/var/lib/luft/extensions/<uid>` | Releases schelf.store approved to run inside Kestrel, for that account | Inside Kestrel |
| `/var/lib/luft/sandboxed-extensions/<uid>` | Other releases from schelf.store, for that account | In a sandbox |
| `/var/lib/luft/unreviewed-extensions/<uid>` | Copies the person approved, and the record of folders they approved | Inside Kestrel while Developer tools is on, otherwise in a sandbox |
| `~/.local/share/luft/extensions` | Anything else, such as an extension someone unpacked or is writing | In a sandbox |

The first three count only when the folder and every folder above it belong to root and nobody else can write to them. Otherwise Kestrel treats what's there like an extension from the account's own folder. Only the system packages service, `com.lantharos.Packages1`, writes there. Before it unpacks a store release, it checks that schelf.store's root key vouches for the key that signed the listing, that the listing hasn't expired, and that the archive is a release the listing names. Only a release the listing marks approved to run inside Luft, from a publisher it marks verified, goes into the first folder; any other goes into the second, which Kestrel never runs inside itself. Either way it unpacks with no links leading out and nothing anyone else can write, so nothing the person runs can change what the sandbox runs, and the release keeps getting the store's updates.

An extension is in only one of the store's folders. An update the store approved to run inside Kestrel moves it from the second folder into the first. Schelf never makes that move by itself: the update waits under Updates until the person agrees to the extension running inside Luft, and until then it keeps its sandboxed release. Once it runs inside Kestrel, later approved updates are routine again. A release that isn't approved never replaces one that is: the service refuses it, and Schelf doesn't offer it as an update, so an extension running inside Kestrel keeps its approved release until a newer one is approved too.

A copy in the account's own folder of an extension a store folder already has is ignored. Settings, stored values and data are keyed by id, so the copy that runs keeps them. `List` on the [D-Bus interface](/extensions/distributing/#the-d-bus-interface) gives each extension's `origin`, `store`, `store-sandboxed`, `copy`, `folder` or `own`, and the copies it ignored.

## Extensions nobody reviewed

With [Developer tools](/system/security/#developer-tools) on, a person can run an extension from their own folder inside Kestrel: one they trust that isn't on schelf.store, or one they are writing that needs a part of the API a [sandbox leaves out](/extensions/manifest/#in-a-sandbox). Settings offers two ways on the extension's page, each after a modal that says what it means and an administrator's password, every time:

- **Install a copy** hands the system packages service the extension's folder as an open file descriptor. The service reads beneath that descriptor alone, refusing links, other mounts, anything that isn't a file or a folder and anything that doesn't belong to the caller, and puts a copy owned by root in the account's folder of unreviewed copies. What runs can't change afterwards. Updating means installing a copy again.
- **Run from its folder** records the exact folder in a file owned by root, and Kestrel runs the extension from there, so an edit runs on reload. Anything that can write that folder can then run code in the compositor, which the modal says.

The service refuses both while Developer tools is off and to every program but Settings from the system image. It reads the switch from `com.lantharos.Greeter1` itself, and so does Kestrel, never from the home folder, settings or its environment. Turning the switch off puts every unreviewed extension back in its sandbox at once, whatever was approved. Taking an approval away needs no password. Settings marks these extensions **Not reviewed** wherever it lists them.

## What permissions are

The permission list in the manifest decides what the API object has. An extension that didn't ask for `taskbar` gets no `taskbar`, `network.fetch` refuses hosts the manifest doesn't name, and so on. The list is also what Schelf and Settings show people, and what schelf.store reads from the release and sends to review when it grows.

Inside Kestrel, the list describes the API and isn't a wall. Code in Kestrel's realm could `import` from `gi://` like Kestrel's own modules do, and an extension's helper runs as the person, outside any sandbox, with their files and network. That is why only vouched-for code gets there: schelf.store's review and approval of each release, the signed index Schelf and the packages service check before installing, the consent people give before installing and again when an update asks for more or moves an extension out of its sandbox, and Schelf turning a pulled release off on every computer that has it. For an unreviewed extension, the person's own approval takes the store's place.

In a sandbox, the list is the wall: the process can reach nothing but the parts of the API it was handed. The [manifest reference](/extensions/manifest/#in-a-sandbox) lists the parts a sandbox leaves out, and Kestrel serves the same list as `SandboxLeavesOut`, which Schelf reads. A sandboxed extension that asks for one of them isn't started, and `List` gives its state as `store-only`. Schelf doesn't install a store release like that until the store approves it to run inside Kestrel.

## The sandbox

Kestrel starts one host per sandboxed extension that's on, once the desktop has prepared its surfaces after signing in, from the same low-priority queue. The host is `gjs` running `kestrel-extension-host.js`, which loads the extension's module and hands it the version 1 API object, built as a proxy to Kestrel. An extension that's off has no host.

The host runs under bubblewrap with every namespace of its own and no further user namespaces, so it has no network but its own loopback, sees no other process and reaches no socket outside. It sees `/usr` read-only, its own folder read-only and its data folder writable, a fresh `/tmp`, and nothing of the home folder, `/run` or `/etc`: no session bus, display, sound server or keyring. Its environment is cleared. Every process in it runs under a system call filter that refuses other processes' memory, mounts and namespaces, the kernel's keyrings, modules and logs, BPF, `io_uring`, `userfaultfd`, `perf_event_open` and faking terminal input. Memory is capped at 512 MB, and under the systemd user manager the host also gets a scope in `app.slice` with 768 MB, no swap, 64 tasks and a low CPU weight. The extension's code only runs once that scope exists. A helper the manifest names runs in the same sandbox.

Kestrel and the host talk over the host's standard input and output, one JSON message a line, never over the session bus. Kestrel treats every message as hostile. Lines are capped at 2 MB. A host gets a burst of 400 messages and 8 MB, then 200 messages and 2 MB a second. Every argument is rebuilt from the shape its call takes, with lengths, numbers and nesting held to ranges, and only the calls Kestrel serves exist. A host holds at most 512 lasting things, such as tiles and pop-ups. Nothing in Kestrel ever waits on a host: callbacks run while Kestrel goes on, and an answer later than 10 seconds, a host that sends more than it may, a message Kestrel can't read or a host that exits turns the extension off, with the reason on its page in Settings. What the API reads without asking, such as the appearance, settings and stored values, is mirrored in the host, so reading it costs nothing.

Whatever the folder, every extension is also held to the [guards](/extensions/guards/) Kestrel puts on each call.
