# Kestrel compositor

Kestrel runs on its own build of Mutter 51 ([kestrel/compositor](../../kestrel/compositor)): the upstream release plus an ordered Git patch series. It builds next to the system's Mutter and never replaces it.

## What the patches add

- Rounded window corners that stay square on maximized, tiled and fullscreen windows, so those keep direct scanout
- Shared background blur, redraw clip filters the shell uses to repaint glass as far as its blur reaches, `xdg-toplevel-icon-v1` icons, and `kestrel_window_v1` for windows kept out of window lists, which sandboxed apps don't get
- `wp_security_context_v1`, which Flatpak uses to tag the connections of its apps with their app ID. A connection made any other way counts as unsandboxed only while the process that made it is still running and shares the compositor's mounts; anything that can't be checked is treated as sandboxed. Flatpak apps given full access count as unsandboxed, see [Full access](#full-access)
- Snapping and maximizing that animate at once, and windows the shell tiles counting as tiled
- Shell text with fractional glyph advances and grayscale antialiasing
- Shell text, icons and labels drawn at a fractional scale's own resolution and on whole pixels, so they stay sharp at 125% and 150%
- Desktop windows for live wallpapers, and the transformed window groups behind the board
- Variable refresh only for games, and `wp_content_type_v1`
- Settings from `kestrel-settings` in place of gnome-settings-daemon, and default display scales aimed at 110 DPI
- Recovery from GPU resets, from GNOME/mutter!5247 by Toluwaleke Ogundipe
- Windows that appear after you moved on open behind and ask for attention instead of taking focus
- Touchpad scrolling at the speed set by the touchpad's `scroll-speed` setting, and at the fingers' pace in apps built on Chromium, which would scroll twelve times too far: every one older than 154, and Electron apps on later releases unless they start with Chromium's unscaled touchpad scrolling turned on
- Title bars for X11 apps in Kestrel's style, colored from `~/.config/kestrel/appearance.css`
- `xdg-decoration` for Wayland apps that ask for server-side title bars, which the shell draws in the same style
- A signal before a monitor turns, so the shell can animate rotation from a picture of the old orientation
- `ext-idle-notify-v1`, so apps such as password managers can lock themselves after a while without use, sandboxed or not. Idle times are at least a second, and at least ten seconds for sandboxed apps, so no app can follow someone's typing
- `ext-data-control-v1`, so password managers can copy a password and clear it again while in the background: apps outside a sandbox and Flatpak apps with [full access](#full-access) always get it, other Flatpak apps only when they are 1Password, KeePassXC or Bitwarden
- Screen recording, remote control and input capture sessions that only the desktop portal and Kestrel's screencast service can start, and display changes such as rearranging monitors or turning them off that sandboxed apps can't make
- Virtual input devices that flip the tablet mode switch, for driving tablet mode in checks
- Modifiers the shell can treat as used up while a shortcut made of them is held, such as the one held to dictate, so apps scroll, click and type as if they weren't held, and shortcuts that react to being let go that still notice it when a modifier comes up first
- Smaller fixes, each described in its patch

## Full access

Flatpak apps given full access in Schelf are listed in `/etc/kestrel/trusted-apps`, one app ID per line. The file belongs to root, so no app can add itself, not even one allowed to change settings; Schelf changes it through the updater service, which asks for an administrator's password. Kestrel watches the file and treats a listed app like one installed on the system: in the Wayland protocols kept from sandboxes, in Mutter's screen recording and display services, and in the shell's own D-Bus services through `meta_context_is_app_trusted()`. Connections an app already made keep how they were sorted, so a change applies the next time the app starts.

Headless sessions read the list from the file `KESTREL_TRUSTED_APPS` names instead, which the checks use to give a stand-in app full access and take it away again.

## Edit the patches

```sh
python3 kestrel/compositor/patches.py prepare   # check out upstream and apply the series
# commit changes in kestrel/run/mutter-source
python3 kestrel/compositor/patches.py export    # write the committed stack back to patches/
python3 kestrel/compositor/patches.py check     # replay the series and compare trees
kestrel/compositor/build.sh
```

- Keep each patch focused with ordinary commits, fixups and rebases.
- `prepare` refuses to replace a checkout with uncommitted or unexported work. The previous head is kept at `refs/kestrel/previous`.
- `python3 kestrel/compositor/patches.py status` shows the state of the checkout.

## Update Mutter

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

The pinned base only changes when both `--base` and `--version` are given. `git rebase --abort` restores the old stack. A Mutter ABI change also needs the engine build and session library paths updated.

## Diagnostics

Both logs go to the journal (`journalctl --user -u kestrel.service`). Turn them off with `gsettings reset`.

| Key in `com.lantharos.kestrel.diagnostics` | Logs |
| --- | --- |
| `log-direct-scanout` | When a display starts or stops showing a window's buffer directly, and how long the desktop took to come back (lines start with "Direct scanout") |
| `log-variable-refresh` | Whether a display's refresh rate follows the window covering it, and why (lines start with "Variable refresh") |

```sh
gsettings set com.lantharos.kestrel.diagnostics log-direct-scanout true
```

## Known issues

Changing fractional scale while a GTK Xwayland window is open can scale its content incorrectly, with or without the corner patch.
