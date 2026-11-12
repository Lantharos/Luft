---
title: Confirming it's you
description: When Luft asks the person at the screen instead of trusting the program that asked, and what those prompts can and can't stop.
sidebar:
  order: 3.5
---

Some actions are sensitive whichever of your programs asks, because they would show your secrets, reach into a sandboxed app's data, or weaken a protection. Since every program outside a sandbox is [you](/security/identity/), Luft can't trust the caller for these. It asks the person at the screen: Kestrel shows a prompt, and `kestrel-authenticate` checks the fingerprint or password against the computer's sign-in rules.

These prompts can't stop malware that already runs as you, which could act on the screen as you do. They stop programs from doing these things quietly, and stop someone at your unlocked computer from opening your passwords.

## How a prompt behaves

Every system prompt, from the firewall's question and polkit's password to the portal's requests, stays until one of its buttons is picked. Clicking elsewhere, Escape and typing don't close it. For 0.75 seconds after it appears it ignores keys, clicks and taps, so a key held down for something else can't answer it.

No prompt shows over the lock screen. Every dialog goes through one gate in Kestrel: while the screen is locked a prompt waits off screen, where it can't take the keyboard, and shows after the unlock. Keyring prompts and the confirmation to restart or log out, are refused instead and asked again later. The one prompt the lock screen lets through is the confirmation for its own power menu.

A Kestrel that starts again after a crash holds all input until it knows whether the screen was locked and has put the lock screen back, so nothing typed in between reaches the desktop behind it.

Prompts name an app only by what can be checked: a sandboxed app by its sandbox's app ID, a program outside a sandbox by the program it runs or the app whose launcher starts it. A name or window class the app chose never shows. When nothing can be checked, the prompt says "An app" with the window's title in quotes.

## Signing in and unlocking

At the login screen, greetd's PAM rules start with `pam_kestrel_sign_in.so`, which asks the login screen how this person signs in. For a fingerprint it runs the system's `fingerprint-auth` rules in `kestrel-authenticate --fingerprint`, and typing a password stops the reader at once. Otherwise, or once the reader gives up, `password-auth` asks for the password. Exactly one of the two decides, followed by the usual account, keyring and session rules. On the lock screen too, results from fprintd only change what the prompt shows; only the PAM rules let anyone in.

## What asks

- Managing Luft Keyring in Settings: the access history, apps' own secrets, removing SSH keys, changing the PIN. Once confirmed, Settings can keep managing for five minutes.
- A sandboxed app using an item another app saved. Until it's allowed, listing and searching leave out everything the app wasn't given, so it can't learn what else is saved or probe for values. The only way to an item it doesn't have is to name it with exactly the attributes it was saved with; it then shows as locked, and unlocking it asks you. That's how an app finds what it saved before it was sandboxed.
- A sandboxed app signing with one of your SSH keys, every key included, not only those added with `ssh-add -c`.
- A program of yours touching a window you opened through Peek, Luft's tool for seeing and using windows. Sandboxed apps can't reach Peek at all. The answer lasts for one request or until the program quits.
- An app taking over the keyboard shortcuts, except Luft's own apps, recognized by a Wayland window from a program under `/usr/lib/sabine/com.lantharos.*`. X11 windows all arrive through Xwayland's one connection and can name themselves anything, so they're asked every time.
- Sharing the screen, controlling the computer and capturing input, through the desktop portal, each time unless **Remember my choice** was ticked. For control and input nothing is ticked in advance and Enter picks Cancel. Kestrel keeps one list of who sees the screen or sends input now and who may again; the token the portal hands back works only while its entry is there. [D-Bus interfaces](/developers/desktop/dbus/#kestrel) has the interface that lists and ends them.

Peek's and the shortcuts prompt keep apps from acting unnoticed; they aren't a wall between your programs, which are all you.

What isn't sensitive never asks: using what you saved, adding keys, locking the keyring, or making anything stricter. `ssh-add -d` doesn't ask because it doesn't delete a stored key, only puts it away until the next sign-in; deleting is Settings' job.

## Notifications, recording and the lock screen

- A notification shows as coming from the process that sent it. Only the relay that owns `org.freedesktop.Notifications` can speak for another process. Programs without an app share at most 30 notification groups.
- The privacy indicator shows every program that records, once sound really reaches it, whatever it calls itself. Two are left out, both recognized by the process the sound server saw connect: dictation Kestrel started itself, and Settings' input level meter. Programs that use the PulseAudio protocol all arrive through `pipewire-pulse`, so nothing vouches for them: the indicator shows them under the name they gave, marked as not verified, and offers to mute them.
- Locking empties the clipboard and its history. The lock screen shows which apps have notifications, not what they say, unless that was turned on.

Two services act without asking because nothing could be gained from a prompt. trustd records that a version of Luft started once the login screen or desktop has been on screen a moment, which at worst keeps a broken update from rolling back by itself while the previous version stays in the boot menu. `kestrel-watchdog` restarts the computer only when the kernel shows the GPU failed or Kestrel's threads are stuck in the driver, and anyone at the screen could restart it anyway.

## Changes from the command line

`luft` changes what Settings can change, for you or for an agent you run; [the terminal](/system/terminal/) shows how to use it. It adds no power of its own. Settings your programs may change anyway, such as the style or the taskbar, it changes directly. Settings that belong to the whole computer and need an administrator in Settings change only after a review on the screen:

1. luft checks every value against what the setting takes, drops ones already set, and sends the whole set to Kestrel's review.
2. Kestrel answers only `/usr/bin/luft` from the image, judged through its pidfd like any prompt. It refuses while the screen is locked, while another review is open, and after five in a minute.
3. Kestrel reads the current values itself, system ones through `com.lantharos.Changes1.Read`, and lists every change from what it is to what it becomes, with the warning Settings shows and the program that ran luft. **Don't change** is what Enter picks. If luft goes away, the window closes.
4. On **Change**, Kestrel makes exactly what it showed. System settings go to `luft-changes`, which answers only Kestrel in `kestrel.service`, asks polkit for an administrator's password once for the set, every time, and makes each change through the service that owns it.

A program that traces luft or feeds it arguments can only change what the window lists, and a person still has to approve it. `luft-changes` runs as root with only `CAP_SYS_PTRACE`, which it needs to read its caller's program through the pidfd, and stops after half a minute without calls.

What needs the warnings and steps of Settings stays there: online accounts, remote login, automatic login, encryption, Luft Keyring, the firewall and running an unreviewed extension inside the desktop. luft names the Settings page instead.

Every set luft makes is kept in `~/.local/state/luft/history.json`, the newest hundred, with how to put each setting back. `luft undo` puts back the newest set, and a set with system settings goes through a new review. `luft mcp` serves the same commands over the Model Context Protocol; its `propose_changes` tool takes the whole set as one object, since the person reviews it as one.

With Developer tools on, programs you run can use the mouse and keyboard, which reaches the review as it reaches every other prompt.
