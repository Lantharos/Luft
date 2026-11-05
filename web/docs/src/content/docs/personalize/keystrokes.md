---
title: Keystrokes
description: Soft sounds as you type and click, what the extension can and can't see, and how to make your own sounds.
sidebar:
  order: 7
---

Keystrokes is an extension from [Schelf](/apps/schelf/). It plays a soft sound on every key press and mouse click, the moment you press. Space, Enter and Backspace each sound like themselves, and every press varies a little in pitch and level, so it sounds like a keyboard rather than a machine gun.

It comes with four sets of sounds and a mouse click:

| Sounds | Like |
| --- | --- |
| Mechanical | Crisp switches on a metal plate |
| Soft membrane | A quiet office keyboard, round and muted |
| Typewriter | Metal on paper, with a bell and a carriage return on Enter |
| Thock | A deep, padded keyboard |

Settings › Extensions › Keystrokes switches typing sounds and mouse clicks on and off separately, sets a volume for each, and picks the sounds. **Listen** plays a few words' worth of what's in use. The volumes are also in Settings › Sound.

## What it can see

Nothing you type. Luft plays these sounds itself. For each press it only tells a letter or other key from Space, Enter and Backspace, and the extension doesn't get even that: it hands over its sound files and never hears of a press at all, not which key, how many or when. It can't hear the sounds either, so it can't count them.

Everything stays silent while the screen is locked and while a password field has the keyboard, for keys and clicks alike.

Luft knows a password field when an app says it is one, which most apps do. A terminal doesn't know when a command is asking for your password, and neither do older X11 apps, so you'll hear your keys there. Keystrokes still doesn't learn what you typed, but someone next to you could count how many keys you pressed. Turn **Typing sounds** off if that matters where you are.

## Make your own

A set of sounds is a folder with sound files and `pack.json`, which says what each is for. The four that come with Keystrokes are made exactly this way.

1. In Settings › Extensions › Keystrokes, press **Get the template**, and copy the folder that opens somewhere of your own. You can also get it from [GitHub](https://github.com/Lantharos/Luft/tree/main/extensions/keystrokes/template).
2. Replace the sounds in it with your own.
3. Change the name in `pack.json`.
4. Back in Settings, press **Add sounds** and pick your folder. It starts playing right away, and if something's off, Settings says what.

To change a set, remove it, fix the folder and add it again.

### Sounds

FLAC, WAV and Ogg files all work, up to a second each, at most 8 MB, and at most 32 files in a folder, `pack.json` included. Have each sound start right at the beginning of its file: any silence there is heard as lag. Keep them short, around 100 milliseconds, so they don't run together when you type fast, and keep them about as loud as each other.

Record with your phone or any microphone close to the keys, and cut each press out with [Audacity](https://www.audacityteam.org), which is free. A few takes of the same key make it sound far more alive than one. Only use sounds you recorded or may share.

### pack.json

```json
{
  "name": "Biscuit",
  "description": "My old keyboard",
  "sounds": {
    "key": ["key-1.flac", "key-2.flac", "key-3.flac"],
    "space": ["space-1.flac", "space-2.flac"],
    "enter": "enter.flac",
    "backspace": "backspace.flac",
    "click": "click.flac"
  }
}
```

`name` and `key` are required. Each sound is one file in the same folder or a list of up to eight, and a press plays one of them at random.

| Sound | Plays for | Without it |
| --- | --- | --- |
| `key` | Letters and every other key | Needed |
| `space` | The space bar | `key` plays |
| `enter` | Enter | `key` plays |
| `backspace` | Backspace | `key` plays |
| `click` | Mouse buttons | The mouse click that comes with Keystrokes plays |

### Sharing

A set of sounds is just its folder, so zip it and send it. Whoever gets it unzips it and adds the folder. It holds no code, only sound files and a list of names, so there's nothing to be careful of when adding one from someone else.
