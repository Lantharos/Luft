---
title: Guards and failures
description: The rules Kestrel holds every extension to, and what happens when one breaks.
sidebar:
  order: 5.5
---

Wherever an extension [runs](/extensions/how-extensions-run/), inside Kestrel or in a sandbox, Kestrel holds each call to these rules:

- **Files stay in its folders.** Every path an extension hands the API, to read, write, play, show or copy, is resolved through every link and refused unless it ends in the extension's folder, its data folder or something the person chose. A link planted in the data folder leads nowhere.
- **`open` only opens what's safe.** `https:` links, `mailto:` addresses, `schelf:` pages, and files in those same folders, never a program, a script or a launcher.
- **Typing needs the person.** `typing.type`, and choosing or saving files, only work within 10 seconds of the person using the extension: its shortcut, pop-ups, taskbar item, quick settings tile, notifications or search results. The privacy indicator shows a keyboard for a few seconds after an extension typed and names it.
- **File actions go to Rover alone.** An action runs on the paths it's handed, so any app that could call `Activate` could make Post send any file to a phone. Kestrel serves `com.lantharos.Kestrel.FileActions` only to Rover's own program and refuses every other caller.
- **The network is the one named.** `network.fetch` speaks HTTPS to the hosts under `[network]`, plain HTTP only to `localhost` and `127.0.0.1`. Every redirect is held to the same rule, so a named host can't pass an extension on to another, and an `Authorization` header never follows a redirect to a different host.
- **Artwork stays on the internet.** Any app can be a media player, so Kestrel only fetches a player's art from hosts on the internet: an address on the computer or the local network is refused, also after a redirect.

## Sounds for keys and clicks

`input-sounds` lets an extension sound like a keyboard without learning anything about typing. The extension hands over sound files and levels, and Kestrel does the rest in the compositor: an event filter ahead of Mutter's own sorts each press as `key`, `space`, `enter`, `backspace` or `click`, and plays one of the extension's files for it. No JavaScript runs for a press, and there's no signal, callback or value an extension could read one from.

Nothing plays while the desktop isn't active or locking, while a Kestrel prompt with a password character has the keyboard, or while an app's field says its text is hidden, through `text-input-v3`'s password purpose or its sensitive and hidden hints. That last one depends on the app: a terminal asking for a password and X11 apps don't say, so keys sound there, and Keystrokes says so on its page. The extension still learns nothing.

Since a sound plays from the file the extension picked, an extension that could also hear the computer's output could count presses. The manifest refuses `input-sounds` together with `audio-levels`.

## When something goes wrong

Every call into an extension's code is guarded. One that throws while it turns on, or from anything Kestrel calls in it later, is turned off, everything it made is taken away, and a notification says so. Kestrel records which extensions run, and when `kestrel-wrapper` restarts it after a crash, each of them gets a crash counted. A second crash within two minutes of that restart, with the extension still running, keeps it off; a crash later than that counts as the first again, so one crash and the restart after it never turn anything off. When the desktop that said an extension was turned off goes down again within those two minutes, the next one says it again. A start that isn't after a crash forgets the counts.

Screen effects can hang the GPU, so they get more:

- An effect whose shader doesn't compile never goes on screen. Kestrel compiles it on a real pipeline first, calls the extension's `onProblem` and names the effect in a notification.
- While effects are on, Kestrel times the GPU right after a paint, every two seconds. Three frames in a row of 250 ms or more, or one of 1.5 seconds, turn off the most expensive effect.
- <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>Esc</kbd> is Kestrel's own shortcut, so it works whatever an extension does. It detaches every effect without running extension code, and the choice lasts across restarts, so an unreadable filter doesn't come back at the next sign-in.
- Kestrel notes that effects are about to go on and removes the note once the GPU finished a frame with them. A note left at the next start means the computer or the desktop went down first, which a crash count wouldn't see after the computer restarted, so Kestrel starts with effects off and says so.

Filters stay off on the lock screen, so it can always be read.
