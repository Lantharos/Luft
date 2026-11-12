---
title: Keyring
description: Where your passwords, tokens and SSH keys are kept, and which apps can use them.
sidebar:
  order: 2
---

Luft Keyring keeps your passwords, sign-in tokens and keys. Apps use it the standard way, so browsers, mail apps and tools that save passwords on Linux work without changes. It is also your SSH agent and GnuPG's passphrase prompt.

## Unlocking

Signing in unlocks the keyring, with your password or a fingerprint. With a TPM, the keyring's key is also sealed to the chip, so a fingerprint can unlock it too, and an optional PIN can be asked after the fingerprint. Automatic login never unlocks it.

Settings, under Security, **Passwords and keys**, can lock it with the screen and lock or unlock it by hand.

## Which apps get what

Every request is tied to the app that made it.

- An app can always use what it saved itself.
- Anything else asks first, naming the app and the item, such as *Allow Firefox to use "github.com"?*. You can remember the answer for that app.
- Settings shows which app read, saved or deleted what, and when, and takes back remembered choices.

## SSH keys

- Keys you add with `ssh-add` are kept in the keyring. `ssh-add -c` asks before each use, and a fingerprint can answer.
- Settings creates new keys. With a TPM, a key can live in the chip, where it can't be copied.
- **Copy the public key** puts it on the clipboard for a server or Git host.

## GnuPG

GnuPG asks for passphrases and smart card PINs through Luft's own prompt, and can save a passphrase in the keyring.

## Passkeys

Luft has no passkey store of its own: passkeys from a password manager, your phone or a security key work in the browser as they do anywhere else.

## What it protects against

The keyring is one encrypted file. It protects your secrets when someone has your disk or the computer while it's off, when the startup was changed in a way Secure Boot sees, and from other accounts and from apps you didn't allow. It can't protect you from someone using the computer while you're signed in, or from malware already running as you. [Luft Keyring](/security/keyring/) explains how.
