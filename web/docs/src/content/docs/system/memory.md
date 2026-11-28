---
title: When memory runs low
description: How Luft keeps the app you're using smooth when memory runs short, and when it closes an app.
sidebar:
  order: 7.5
asks:
  - out of memory
  - app was closed to free memory
  - game closed by itself
  - swap
  - page file
  - { ask: keeps using more memory, to: an-app-that-keeps-growing }
---

Luft keeps the app you're using fast, even when the apps you've opened need more memory than the computer has.

## Swap

Memory that hasn't been touched for a while is compressed, and what stays cold after that moves to swap files on your drive. Luft starts with 4 GB of swap and adds more before it runs out, up to as much as the computer has memory, while always leaving a tenth of the drive free. Swap it added goes away again once nothing needs it.

Swap is only ever written to an encrypted drive. If Luft isn't [encrypted](/security/encrypting/), it doesn't swap to the drive at all.

## The app in front comes first

The app you're using, or the game filling the screen, keeps its memory. When memory gets short, apps in the background give theirs up first, so switching back to them can take a moment while the one in front stays smooth. The desktop keeps memory of its own, so the taskbar, Gust and Quick Settings keep responding too.

## When an app is closed

Luft only closes an app when the desktop itself is stuck waiting for memory. Heavy swapping or a game loading a level isn't enough.

It closes apps in the background first, the biggest one, then the next if the desktop is still stuck. The app in front is closed only when nothing else is left, and only after a notice warned about it, which shows even over a fullscreen game. Each time, a notice says which app was closed, naming the game rather than the launcher it was started from.

Anything unsaved in a closed app is lost, so save your work when the warning appears, or choose **Force quit** on it to close that app yourself.

## An app that keeps growing

Sometimes one app keeps taking more and more memory without stopping. When memory runs short and one app has grown steadily for a minute, it's the one Luft blames, whether it's in front or not. It gets a notice saying it keeps using more memory, and if the desktop gets stuck, it's closed instead of the apps around it. The app in front keeps its place as long as it stays within its share, so a big game that has finished loading is never mistaken for one.
