---
title: Sounds
description: The sounds Luft plays for notifications, devices, the volume, screenshots and recording, and how to quiet them.
sidebar:
  order: 4
---

Luft plays short, soft sounds when something happens that you might not be looking at. Everything here is in Settings, under **Sound**, in **System sounds**.

## What plays when

| Sound | When |
| --- | --- |
| Notification | A notification arrives. Low priority ones get a softer note, and urgent ones, such as a disk that's almost full, a two-tap warning |
| New mail | Mailman finds new mail, and a whoosh when a message is sent |
| Devices | A USB device, memory card or Bluetooth device connects or disconnects. Plugging in a hub with several devices plays one sound |
| Charging | The charger is plugged in, and the battery runs low |
| Volume | A tick on the speakers or headphones whose volume you changed, from the volume keys or a slider. A muted output stays silent |
| Screenshot | A screenshot is saved |
| Recording | Screen recording or sharing, the camera or [dictation](/desktop/dictation/) starts and stops |
| Error and warning | A password or fingerprint isn't accepted, an app rings the bell, an app stops responding, or an app asks for your permission while you're busy elsewhere |
| Sign-in | Your desktop appears after you sign in |
| Keyboard taps | Each key on the on-screen keyboard, with their own sounds for delete and space. Off at first |

The play button next to each kind plays it once, so you can hear it before choosing.

## Turning them down or off

- **Volume** sets how loud system sounds are, apart from music and videos.
- Each kind has its own switch. **System sounds** turns them all off, errors included.
- [Do Not Disturb](/desktop/notifications/#do-not-disturb) silences notification sounds, but not the volume tick or errors, which answer something you just did. Apps allowed through Do Not Disturb still play theirs.
- Notification sounds also stay quiet while a game is fullscreen or while you share your screen.
- The lock screen only plays errors, such as a wrong password.
- Each app's notifications can be kept silent: in Settings, under Notifications, choose the app and turn off **Play a sound**.

## For apps

Luft's sounds are a standard sound theme named `luft`, so apps that play theme sounds use them. Apps choose a notification's sound with the `sound-name`, `sound-file` and `suppress-sound` hints, or the `sound` option of the notification portal. Apps outside a sandbox can play a sound from the theme by calling `Play` on `com.lantharos.Kestrel.Sounds` at `/com/lantharos/Kestrel/Sounds` on the session bus, with names such as `dialog-warning` or `message-sent-email`; the switches above still apply.
