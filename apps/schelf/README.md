# Schelf

Schelf is where you get apps on Luft. It finds, installs, updates and removes apps from Flathub and AppImages, and command-line tools from Fedora in a Toolbox container. System updates live in Settings, so Schelf only shows apps. Using it is described in [the docs](https://docs.luft.computer/apps/schelf/), and the code it shares with Settings is in [packages/software](../../packages/software/README.md).

| Source | Installed for |
|--------|---------------|
| Flathub | Your account; Flathub is added on first use |
| AppImage | Your account, in `~/Applications`, with a menu entry, icon and automatic updates |
| Fedora packages as command-line tools | Your account, in the default Toolbox container, with launchers in `~/.local/bin` |
| System software sources | Everyone, through PackageKit, on regular Fedora installs only |

Everything for regular Fedora installs lives in `desktop/src/fedora` and `src/lib/fedora`, and is switched off on Luft's image, where command-line tools take its place.

## Build and run

Install dependencies once from the repository root with `bun install`, then from this folder:

```sh
bun run dev              # the interface in a browser, with sample apps and Flathub's real catalog
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # Sabine bundle
sabine install --bundle .
```

In the browser, `?scheme=light` shows the light style, `?system=image` an image-based install, `?file=/path` the page for an opened file and `?page=schelf:updates` Updates.

Installing makes Schelf the app for `.flatpakref`, `.flatpakrepo`, `.rpm` and `.AppImage` files and for `schelf:` links (`schelf:updates`, `schelf:installed`, `schelf:search?<query>`).

## Command line

The same binary is the `schelf` command, with `sch` linked to it in Luft's image: `install`, `remove`, `search`, `update`, `list` and `info`, described in [the docs](https://docs.luft.computer/system/software/#in-the-terminal). Its code is in `desktop/src/cli`, with each place software comes from in `cli/sources`.

While the app runs, it owns `com.lantharos.Schelf` on the session bus. The `com.lantharos.Schelf1` interface at `/com/lantharos/Schelf` takes an operation as JSON with `Start` (a key, title and job, as Schelf's own pages send them) and stops it with `Cancel`; `Changed` and `Finished` signals report on it. The command hands its work to the app this way, so both share one queue. Without the app, it runs the work itself. Either way every job holds the account's software lock from `packages/software` while it changes anything.

## Preinstalled apps and background updates

On Luft, `schelf --preinstall` runs at sign-in and adds each AppImage in `/usr/share/luft/preinstall`, such as Helium, to the account, once, so a removed app stays removed. `schelf --update-apps` runs a few minutes after sign-in and every six hours after that, and updates every AppImage with a newer version.
