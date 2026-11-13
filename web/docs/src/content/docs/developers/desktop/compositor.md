---
title: The compositor
description: Kestrel's patch series on Mutter, how to edit it and move it to a new Mutter release, and how Luft keeps what it carries on its way upstream.
sidebar:
  order: 7.5
---

Kestrel runs on its own build of Mutter 51 in `kestrel/compositor`: the upstream release at the commit in `upstream.json`, plus an ordered Git patch series. It builds next to the system's Mutter and never replaces it.

## What the patches add

- **Windows.** Rounded corners that stay square where a maximized or tiled window meets the screen edge or another window, and on fullscreen windows so they keep direct scanout. A thin outline on every floating window, and a shadow around those that don't draw their own. Floating windows are told they're tiled while corners are square, so GTK, libadwaita, Chromium and Electron apps draw square corners and leave the shadow to the compositor. Title bars in Kestrel's style for X11 apps and for Wayland apps that ask through `xdg-decoration`.
- **The shell.** Shared background blur and redraw clips that reach as far as it does, desktop windows for live wallpapers, the transformed window groups behind the board, shortcuts the shell adds winning over built-in ones, drops from Wayland apps onto the shell's own actors, a signal before a monitor turns, and fragment shader chains over a whole display or a single actor for screen effects. Shell text with fractional glyph advances and grayscale antialiasing, drawn at a fractional scale's own resolution so it stays sharp at 125% and 150%. Text and icons drawn one texel to a device pixel land on the same whole pixel a background with that edge starts on, so an icon centred on its button stays centred at any scale.
- **Sandboxed apps.** `wp_security_context_v1`, which Flatpak and Luft's AppImage sandbox use to tag their apps' connections. Mutter's screen recording, remote control and display services refuse sandboxed callers, and so does every Mutter D-Bus interface not listed as open. [App sandbox](/security/app-sandbox/) explains what each permission opens.
- **Protocols.** `xdg-toplevel-icon-v1`, `wp_content_type_v1`, `ext-idle-notify-v1` with idle times of at least ten seconds for sandboxed apps, so no app can follow someone's typing, and `ext-data-control-v1` for password managers that clear what they copied.
- **Input.** Touchpad scrolling at the touchpad's `scroll-speed`, and at the fingers' pace in Chromium-based apps, which would scroll twelve times too far. Palm rejection for pens on a touchscreen, every pen sample with its pressure for the shell's own strokes, pen settings shared by every pen, and button actions that reach the shell as `pen-action`. Modifiers the shell can treat as used up while a shortcut made of them is held. Virtual devices that act as pens or flip the tablet mode switch, for checks.
- **Display and focus.** Variable refresh only for games, default display scales aimed at 110 DPI, settings from `kestrel-settings` in place of gnome-settings-daemon, recovery from GPU resets (GNOME/mutter!5247, by Toluwaleke Ogundipe), and windows that appear after you moved on opening behind and asking for attention.
- **Crashes.** A Wayland socket inherited from `kestrel-wrapper`, so apps can reconnect after Kestrel crashes ([Kestrel](/developers/desktop/kestrel/#crash-recovery)).

## Editing the patches

```sh
python3 kestrel/compositor/patches.py prepare   # check out upstream and apply the series
# commit changes in kestrel/run/mutter-source
python3 kestrel/compositor/patches.py export    # write the committed stack back to patches/
python3 kestrel/compositor/patches.py check     # replay the series and compare trees
kestrel/compositor/build.sh
```

Keep each patch focused, with ordinary commits, fixups and rebases. `prepare` refuses to replace a checkout with uncommitted or unexported work, and keeps the previous head at `refs/kestrel/previous`; `status` shows the state of the checkout.

`patches.py identity` builds the series' process identification against `packages/identity/sandbox-cases.ini`, the cases Luft's own services are tested against too, so Mutter and the services judge every process alike. After a patch changes API the shell uses, regenerate [Kestrel's types](/developers/building/#kestrel).

## Moving to a new Mutter

`patches.py trial latest` shows beforehand which patches the new release already carries and which will conflict. Drop the patches whose change is in the release, then rebase the rest:

```sh
source_dir=kestrel/run/mutter-source
old_base=$(python3 -c 'import json; print(json.load(open("kestrel/compositor/upstream.json"))["revision"])')
new_tag=51.1
git -C "$source_dir" fetch origin "refs/tags/$new_tag:refs/tags/$new_tag"
git -C "$source_dir" rebase --onto "$new_tag" "$old_base" kestrel
# resolve conflicts, then git rebase --continue
python3 kestrel/compositor/patches.py export --base "$new_tag" --version "$new_tag"
python3 kestrel/compositor/patches.py check
kestrel/compositor/build.sh
```

The pinned base only changes when both `--base` and `--version` are given, and `git rebase --abort` restores the old stack. A Mutter ABI change also needs the engine build and the session's library paths updated.

## Upstream

Every carried change costs work on each upstream release, and Fedora moves to new GNOME releases on its own schedule, so each change should either be on its way upstream or have a clear reason to stay.

Every Mutter patch has an `Upstream-Status` trailer in its commit message, so the status travels with it through rebases and exports:

| Status | Meaning |
| --- | --- |
| `upstream URL` | The merge request or commit upstream that carries it, merged or still open, with an optional note |
| `forwardable` | Nothing in it is specific to Luft, with an optional note on what to drop first |
| `luft-only REASON` | Stays with Luft, with a short reason, such as an API only Kestrel's shell uses |

```sh
git commit --trailer "Upstream-Status: forwardable"
python3 kestrel/compositor/patches.py list            # every patch's status and the totals
python3 kestrel/compositor/patches.py trial main latest
```

`prepare`, `check` and `export` refuse a patch without a valid status. `trial` applies the series to the given branches or tags, skips what doesn't apply, and says which patches apply, need a 3-way merge, are already there or conflict. `kestrel/compositor/upstream` holds forwardable patches prepared as merge requests, one folder each, with the patches rebased onto Mutter's main branch and a `description.md`. Once one is open, its patch's status becomes `upstream` with the link, and the folder goes when it merges.

The engine in `kestrel/engine` started as GNOME Shell's C code at the commit in `kestrel/engine/upstream.json`, and most files under `src` keep their GNOME Shell paths, so fixes to them can come over:

```sh
python3 kestrel/engine/upstream.py changes        # GNOME Shell main, or a tag such as 52.0
python3 kestrel/engine/upstream.py show COMMIT | git apply -3 --directory=kestrel/engine
```

Add a commit to `picked` in `upstream.json` once it's brought over or decided against, so it drops off the list. The patched packages in `os/image/patches` each have a README with the reason for every patch, and `os/image/patches/trial.sh` tries them on upstream's main branch.

The Upstream patches workflow runs every Monday: it tries the Mutter series on Mutter main and its newest release, lists GNOME Shell changes for the engine, and tries the image's patches on their main branches. It reports on the run's summary page and never fails a build.

## Palm rejection

libinput ignores a pen's touchscreen while the pen is near it, but the pens of most 2-in-1s only count as near while almost touching the glass. They leave whenever they lift between strokes, and the hand landing a moment later would tap whatever is under it. So the input thread keeps a short pen session for touches on the pen's own screen:

| Since the pen left | A touch that starts... | Is |
| --- | --- | --- |
| Under 1.5 s, or the pen is near | where the side of the hand rests | Dropped |
| Under 1.5 s | within 20 mm of that area | Held up to 150 ms, then let through as a tap, a drag or a still press, or dropped while it creeps |
| 1.5 s to 4.5 s | where the side of the hand rests | Held 450 ms, then let through unless the pen came back |
| Any time in the session | within 50 mm of another touch the filter is holding or dropped | Dropped, along with any held touch near it |
| After 4.5 s, on another screen, or anywhere else | | Let through at once |

The area runs from 50 mm behind the tip to 140 mm ahead of it, and from 45 mm above it to 95 mm below, ahead meaning towards the writing hand's side, which `hand` in `com.lantharos.kestrel.pen` sets. The numbers come from recordings in `kestrel/tools/fixtures/pen`, which the `tablet:palm` check replays for either hand. A new recording, made with `sudo libinput debug-events` while writing, becomes a fixture with `bun kestrel/tools/pen/convert.ts RECORDING NAME TOUCHES`. `MUTTER_DEBUG=input` logs every touch the filter judges.

## Diagnostics

Two switches in `com.lantharos.kestrel.diagnostics` log to the journal (`journalctl --user -u kestrel.service`): `log-direct-scanout`, when a display starts or stops showing a window's buffer directly, and `log-variable-refresh`, whether a display's refresh rate follows the window covering it, and why.

```sh
gsettings set com.lantharos.kestrel.diagnostics log-direct-scanout true
gsettings reset com.lantharos.kestrel.diagnostics log-direct-scanout
```
