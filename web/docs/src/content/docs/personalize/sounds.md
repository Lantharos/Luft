---
title: Sounds
description: The sounds Luft plays for notifications, devices, the volume, screenshots and recording, how to quiet them and how to use your own.
sidebar:
  order: 4
---

Luft plays short, soft sounds when something happens that you might not be looking at. Everything here is in Settings, under **Sound**, in **System sounds**. For a sound on every key and click, there's [Keystrokes](/personalize/keystrokes/).

## What plays when

| Sound | When |
| --- | --- |
| Notification | A notification arrives. Low priority ones get a softer note, as do Luft asking for your password and an app asking for your permission while you're busy elsewhere, and urgent ones, such as a disk that's almost full, a two-tap warning |
| New mail | Mailman finds new mail, and a whoosh when a message is sent |
| Devices | A USB device, memory card or Bluetooth device connects or disconnects. Plugging in a hub with several devices plays one sound |
| Charging | The charger is plugged in, and the battery runs low |
| Volume | A tick on the speakers or headphones whose volume you changed, from the volume keys or a slider. A muted output stays silent |
| Screenshot | A screenshot is saved |
| Recording | Screen recording or sharing, the camera or [dictation](/desktop/dictation/) starts and stops |
| Error and warning | A password or fingerprint isn't accepted, an app rings the bell, or an app stops responding |
| Sign-in | Your desktop appears after you sign in |
| Keyboard taps | Each key on the on-screen keyboard, with their own sounds for delete and space. Off at first |

The play button next to each kind plays it once, so you can hear it before choosing.

## Turning them down or off

- **Volume** sets how loud system sounds are, apart from music and videos.
- Each kind has its own switch. **System sounds** turns them all off, errors included.
- [Do Not Disturb](/desktop/notifications/#do-not-disturb) silences notification sounds, but not the volume tick or errors, which answer something you just did. Apps allowed through Do Not Disturb still play theirs.
- Notification sounds also stay quiet while a game is fullscreen or while you share your screen.
- The lock screen only plays errors, such as a wrong password.
- When an app such as Discord plays its own sound as a notification arrives, Luft's stays quiet so you don't hear two. A call or music the app was already playing doesn't count.
- Each app's notifications can play something else: on the app's page in Schelf, under Notifications, set **Sound** to **Luft's sound**, **The app's own** or **None**.

## Using your own sounds

**Your own sounds**, at the end of **System sounds**, lists every sound Luft plays. Next to each one, **Choose** picks an audio file to play instead, the play button plays what's set now, and the arrow goes back to Luft's sound. The new sound takes over right away.

- Luft keeps its own copy of the file, so it goes on working if you move or delete the original.
- A sound can be up to 10 seconds long. Luft tells you if a file is longer than that, or if it can't play it.
- The switches for each kind still apply: a sound you've replaced stays quiet when its kind is off.
- Your **Sign-in** sound plays when your desktop appears. The login screen itself stays with Luft's sounds, because it runs before you've signed in and can't reach your files.

To replace many sounds at once, choose **Use a folder of sounds**. Luft looks in the folder, and in a `stereo` folder inside it, for audio files named after a sound, and uses each one it can play. Every sound the folder doesn't have goes back to Luft's. **Reset All** undoes it. These are the names:

| Sound | File name |
| --- | --- |
| Notification | `message-new-instant` |
| Quiet notification | `dialog-information` |
| New mail | `message-new-email` |
| Device connected | `device-added` |
| Device disconnected | `device-removed` |
| Charger plugged in | `power-plug` |
| Low battery | `battery-low` |
| Volume change | `audio-volume-change` |
| Screenshot | `screen-capture` |
| Sign-in | `desktop-login` |
| Mail sent | `message-sent-email` |
| Recording started | `recording-started` |
| Recording stopped | `recording-stopped` |
| Error | `dialog-error` |
| Warning | `dialog-warning` |
| Question | `dialog-question` |
| Key | `keyboard-tap` |
| Delete key | `keyboard-tap-delete` |
| Space bar | `keyboard-tap-space` |

## When nothing plays

1. Check that the volume in [quick settings](/desktop/quick-settings/) isn't at zero or muted.
2. In Settings, under **Sound**, look at **Device** under Output. A monitor or TV connected over HDMI or DisplayPort is a device of its own, and many monitors have no speakers.
3. Look at **Connection** just below it. A computer with several jacks lists each one: on a desktop, **Line Out** is usually the green jack at the back and **Headphones** the jack on the front. Choose the one your speakers or headphones are plugged into. A jack where nothing is sensed shows *nothing detected*, but you can still choose it, since some computers don't report every jack.
4. Move the volume slider. Luft plays a tick on the output you chose.
5. If the device says **Off**, open **Device profiles** and pick a stereo or surround profile for it.
6. If Windows is on the same computer, shut it down fully before starting Luft: with Fast Startup, sound chips can start in the state Windows left them. [Installing alongside Windows](/start/alongside-windows/) shows how to turn it off.

Still silent? Run these in [Tern](/apps/tern/) and send us what they print, along with the computer's model:

```sh
wpctl status
pactl list cards
alsa-info.sh --no-upload
```

The last one saves a full report of the sound hardware and says where it put it.

## For apps

Luft's sounds are a standard sound theme named `luft`, so apps that play theme sounds use them. Apps choose a notification's sound with the `sound-name`, `sound-file` and `suppress-sound` hints, or the `sound` option of the notification portal. An app that plays its own sound should send `suppress-sound`; otherwise Luft waits a moment before its sound and skips it when the app starts playing in the meantime. Apps outside a sandbox can play a sound from the theme by calling `Play` on `com.lantharos.Kestrel.Sounds` at `/com/lantharos/Kestrel/Sounds` on the session bus, with names such as `dialog-warning` or `message-sent-email`; the switches above still apply.
