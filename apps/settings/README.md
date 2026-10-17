# Settings

Settings is Luft's system settings app, from network and displays to security, accounts and updates. It reads and writes the same settings as the desktop, so changes made elsewhere show up right away. Every page is described in [the docs](https://docs.luft.lanth.me/apps/settings/).

## Build and run

Install dependencies once from the repository root with `bun install`, then from this folder:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # Sabine bundle
sabine install --bundle .
```

Installing registers the `kestrel-settings:` link scheme. If Settings is already open, a link switches the window to that page.

## Links

| Link | Opens |
|------|-------|
| `kestrel-settings:<page>` | A page: `network`, `bluetooth`, `display`, `sound`, `power`, `appearance`, `notifications`, `keyboard`, `mouse`, `accessibility`, `apps`, `privacy`, `security`, `datetime`, `users`, `accounts`, `login`, `updates`, `about` |
| `kestrel-settings:appearance/fonts` | All fonts |
| `kestrel-settings:appearance/cursors` | Cursor themes |
| `kestrel-settings:appearance/taskbar` | Taskbar |
| `kestrel-settings:accounts/add` | Adding an account |

A link to a page for missing hardware, such as Bluetooth without an adapter, explains that instead.

## Automatic updates

`data/com.lantharos.settings.updates.timer`, a systemd user timer enabled for every account, checks daily from the first start. Settings writes its own copy when the schedule changes, and masks it when automatic checks are off. The timer runs Settings with `--check-updates`, which looks for updates, downloads them without a window and sends a notification when they are ready. On a regular Fedora install that means PackageKit's offline updates; on an image-based install it means the next image, staged for the next restart.

## NVIDIA graphics

On an image-based install, Updates offers NVIDIA's driver when the computer has NVIDIA graphics but runs the standard image, and the smaller standard image when it runs the NVIDIA image without NVIDIA graphics. Switching keeps the channel and version the system follows, downloads the other image, stages it for the next restart and keeps the current one to go back to.

`data/luft-graphics-notice.service`, a user service started with the graphical session, runs Settings with `--check-graphics`. When an NVIDIA card is new to the computer and the standard image is running, it sends one notification that opens Updates.
