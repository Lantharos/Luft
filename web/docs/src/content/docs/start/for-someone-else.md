---
title: Setting up a computer for someone else
description: Install Luft on a computer that's for someone else, so it greets its owner the first time they start it.
sidebar:
  order: 6.5
asks:
  - install for someone else
  - { ask: prepare a computer as a gift, to: installing-it }
  - { ask: install luft for a customer, to: installing-it }
  - { ask: preinstall luft, to: installing-it }
  - { ask: first start of a new computer, to: when-its-owner-starts-it }
  - { ask: copy one install onto many computers, to: the-same-install-on-many-computers }
---

A computer for a friend, a customer or a colleague doesn't need your account on it. Install Luft says who the computer is for, and when it's for someone else, it installs Luft without an account and leaves language, account and password to whoever starts it first.

## Installing it

Start from [the USB stick](/start/usb-stick/) as usual. After the note that Luft isn't finished yet, Install Luft asks **Who's this computer for?** Choose **Someone else**.

1. **Where Luft goes.** A whole drive, next to Windows, or free space. Replacing another Linux isn't offered, since that keeps someone's files and account.
2. **Wi-Fi**, if you like. The network isn't kept: the owner joins their own.
3. **Restart.** With Secure Boot on, Install Luft shows the code for [the blue screen](/start/first-start/#the-blue-screen) that comes after the restart. Type it there, so the owner never sees that screen.
4. **Ready for its owner.** Luft starts once more and says the computer is ready. Choose **Shut down**.

There's nothing to choose about encryption: the drive is always encrypted. Until its owner takes over, it opens with a temporary key, which a computer with a TPM and Secure Boot keeps sealed in its TPM, so the drive can't be read or changed outside that computer. Without them, the key stays on the drive, where it protects nothing yet, and there's nothing personal on the drive yet either.

## When its owner starts it

The first start welcomes the owner and asks what Install Luft would have asked you:

1. Language, keyboard and time zone.
2. Wi-Fi, if they like.
3. Their name, a user name and a password.
4. **Protect your files** shows the recovery key to keep somewhere other than this computer. Without a TPM and Secure Boot, they also choose a passphrase the computer asks for at every start.
5. A fingerprint, when the computer has a reader.

From then on the temporary key no longer opens the drive. Whoever installed Luft could have copied what the drive was encrypted with, so Luft also encrypts the whole drive again with a new key nobody else has had. That happens in the background while the computer is used, survives restarts and power cuts, and Settings shows how far it is under **Security › Encryption**.

## The same install on many computers

A drive installed for someone else can be copied onto identical computers. Each one makes its own machine ID and SSH host keys the first time its owner starts it, and gets its own keys once the owner has set it up. Copy the drive before its first restart: after that, on a computer with a TPM and Secure Boot, the temporary key is sealed in that computer's TPM and the drive opens nowhere else. Each computer asks for Secure Boot's code on its own blue screen.

Before selling a computer or giving it away, [erase it](/system/erase/) and it starts like this again.
