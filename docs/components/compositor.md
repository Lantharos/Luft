# Kestrel compositor

Kestrel runs on its own build of Mutter 51 ([kestrel/compositor](../../kestrel/compositor)): the upstream release plus an ordered Git patch series. It builds next to the system's Mutter and never replaces it.

## What the patches add

- Rounded window corners that stay square on maximized, tiled and fullscreen windows, so those keep direct scanout. Mutter follows `com.lantharos.kestrel rounded-window-corners` itself, and with it off every window is square
- A shadow and a thin neutral outline around Wayland windows that don't draw a shadow of their own, such as Luft's apps and windows with Kestrel's title bars. The shadow is never drawn under the window, so glass stays clear, and both go away on maximized, tiled and fullscreen windows, but stay when rounded corners are turned off
- Shared background blur, redraw clip filters the shell uses to repaint glass as far as its blur reaches, `xdg-toplevel-icon-v1` icons, and `kestrel_window_v1` for windows kept out of window lists, which sandboxed apps don't get
- `wp_security_context_v1`, which Flatpak and Luft's AppImage sandbox use to tag the connections of their apps with the app's ID. A connection made any other way is judged by the process that made it, as in [Who an app is](../security.md#who-an-app-is); anything that can't be checked is treated as sandboxed. Apps given full access count as unsandboxed, see [App permissions](#app-permissions)
- Snapping and maximizing that animate at once, and windows the shell tiles counting as tiled
- Shell text with fractional glyph advances and grayscale antialiasing
- Shell text, icons and labels drawn at a fractional scale's own resolution and on whole pixels, so they stay sharp at 125% and 150%
- Desktop windows for live wallpapers, and the transformed window groups behind the board
- Shortcuts the shell adds winning over built-in ones on the same keys, so window tiling can take over Super and the arrow keys while it's on
- Windows the shell clips to one monitor, such as scrolling columns peeking over a shared edge, only hiding what's underneath where they're drawn, so the rest still draws
- Variable refresh only for games, and `wp_content_type_v1`
- Settings from `kestrel-settings` in place of gnome-settings-daemon, and default display scales aimed at 110 DPI
- Recovery from GPU resets, from GNOME/mutter!5247 by Toluwaleke Ogundipe
- Windows that appear after you moved on open behind and ask for attention instead of taking focus
- Touchpad scrolling at the speed set by the touchpad's `scroll-speed` setting, and at the fingers' pace in apps built on Chromium, which would scroll twelve times too far: every one older than 154, and Electron apps on later releases unless they start with Chromium's unscaled touchpad scrolling turned on
- Title bars for X11 apps in Kestrel's style, colored from `~/.config/kestrel/appearance.css`
- `xdg-decoration` for Wayland apps that ask for server-side title bars, which the shell draws in the same style
- A signal before a monitor turns, so the shell can animate rotation from a picture of the old orientation
- `ext-idle-notify-v1`, so apps such as password managers can lock themselves after a while without use, sandboxed or not. Idle times are at least a second, and at least ten seconds for sandboxed apps, so no app can follow someone's typing
- `ext-data-control-v1`, so password managers can copy a password and clear it again while in the background: apps outside a sandbox and Flatpak apps with full access always get it, other Flatpak apps only when they may use the clipboard in the background, see [App permissions](#app-permissions)
- Screen recording, remote control and input capture sessions that only the desktop portal and Kestrel's screencast service can start, and display changes such as rearranging monitors or turning them off that sandboxed apps can't make
- Virtual input devices that flip the tablet mode switch, for driving tablet mode in checks
- The audible bell from X11 and Wayland apps handed to the shell, which plays it with the rest of its [sounds](kestrel.md#sounds)
- Modifiers the shell can treat as used up while a shortcut made of them is held, such as the one held to dictate, so apps scroll, click and type as if they weren't held, and shortcuts that react to being let go that still notice it when a modifier comes up first
- Smaller fixes, each described in its patch

## App permissions

The permissions sandboxed apps were given live in the desktop portal's permission store, which no sandbox can reach: the `full-access` and `background-clipboard` tables, each with one entry of the same name listing apps with `yes` or `no`. Schelf and Settings change them. The shell reads both before it starts and follows every change, and hands Mutter the apps each permission covers with `meta_context_set_permitted_apps()`.

- **Full access**: apps answered `yes` count as unsandboxed, like programs installed on the system: in the Wayland protocols kept from sandboxes, in Mutter's screen recording and display services, and in the shell's own D-Bus services, which ask Mutter about each caller through `meta_context_identify_sender()`. Connections an app already made keep how they were sorted, so a change applies the next time the app starts.
- **Background clipboard**: 1Password (`com.onepassword.OnePassword`), KeePassXC (`org.keepassxc.KeePassXC`) and Bitwarden (`com.bitwarden.desktop`) may use the clipboard in the background unless answered `no`; any other app only when answered `yes`.

Headless sessions run their own session bus with their own data folder, so the checks change these tables without touching yours.

## Edit the patches

```sh
python3 kestrel/compositor/patches.py prepare   # check out upstream and apply the series
# commit changes in kestrel/run/mutter-source
python3 kestrel/compositor/patches.py export    # write the committed stack back to patches/
python3 kestrel/compositor/patches.py check     # replay the series and compare trees
python3 kestrel/compositor/patches.py list      # each patch's upstream status
kestrel/compositor/build.sh
```

- Keep each patch focused with ordinary commits, fixups and rebases.
- Every commit needs an `Upstream-Status` trailer saying whether it is upstream, forwardable or Luft's own, see [Upstream patches](../upstream.md).
- `prepare` refuses to replace a checkout with uncommitted or unexported work. The previous head is kept at `refs/kestrel/previous`.
- `python3 kestrel/compositor/patches.py status` shows the state of the checkout.
- The shell's TypeScript sees what the patches add through the types generated from the build's GIR files. Run `bun run generate` in `kestrel/types` after a patch changes API the shell uses, see [Kestrel's types](kestrel.md#types).

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

`patches.py trial latest` shows beforehand which patches the new release already carries and which will conflict. Drop patches whose upstream change is in the release before rebasing.

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
