# Settings

Settings is Luft's system settings app, from network and displays to security, accounts and updates. It reads and writes the same settings as the desktop, so changes made elsewhere show up right away. Every page is described in [the docs](https://docs.luft.computer/apps/settings/).

## Build and run

Install dependencies once from the repository root with `bun install`, then from this folder:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # Sabine bundle
sabine install --bundle .
```

Installing registers the `kestrel-settings:` link scheme, which [opens a page](https://docs.luft.computer/developers/links/) from another app.

## Automatic updates

`data/com.lantharos.settings.updates.timer`, a systemd user timer enabled for every account, checks daily from the first start. Settings writes its own copy when the schedule changes, and masks it when automatic checks are off. The timer runs Settings with `--check-updates`, which looks for updates, downloads them without a window and sends a notification when they are ready. That means the next image, staged for the next restart.

## NVIDIA graphics

On an image-based install, System offers NVIDIA's driver when the computer has NVIDIA graphics but runs the standard image, and the smaller standard image when it runs the NVIDIA image without NVIDIA graphics. Switching keeps the channel and version the system follows, downloads the other image, stages it for the next restart and keeps the current one to go back to.

`data/luft-graphics-notice.service`, a user service started with the desktop (not during first-run setup), runs Settings with `--check-graphics`. When an NVIDIA card is new to the computer and the standard image is running, it sends one notification that opens System.
