# Schelf

Schelf is where you get apps on Luft. It finds, installs, updates and removes apps from Flathub and AppImages, and command-line tools from Fedora in a Toolbox container. System updates live in Settings, so Schelf only shows apps. Using it is described in [the docs](https://docs.luft.computer/apps/schelf/), and the code it shares with Settings is in [packages/system/software](../../packages/system/software/README.md).

| Source | Installed for |
|--------|---------------|
| Flathub | Your account; Flathub is added on first use |
| AppImage | Your account, in `~/Applications`, with a menu entry, icon and automatic updates, running in a sandbox |
| Fedora packages as command-line tools | Your account, in the default Toolbox container, with launchers in `~/.local/bin` |
| System packages (`--system`) | Everyone, merged over Luft's image as a system extension and rebuilt with each update ([how](../../docs/system-packages.md)), from Fedora, added software sources such as a vendor's RPM repository or a COPR, and desktop-app `.rpm` files |
| System software sources | Everyone, through PackageKit, on regular Fedora installs only |

Everything for regular Fedora installs lives in `desktop/src/fedora` and `src/lib/fedora`, and is switched off on Luft's image, where command-line tools take its place.

## Build and run

Install dependencies once from the repository root with `bun install`, then from this folder:

```sh
bun run desktop:dev      # Vite dev server and the native window
bun run check            # svelte-check
bun run desktop:build    # production web build and release binary
bun run desktop:bundle   # Sabine bundle
sabine install --bundle .
```

Installing makes Schelf the app for `.flatpakref`, `.flatpakrepo`, `.rpm` and `.AppImage` files and for `schelf:` links (`schelf:updates`, `schelf:installed`, `schelf:search?<query>`).

## Command line

The same binary is the `schelf` command, with `sch` linked to it in Luft's image: `install`, `remove`, `search`, `update`, `list`, `info`, `trust`, `untrust` and `repo`, described in [the docs](https://docs.luft.computer/system/software/#in-the-terminal). Its code is in `desktop/src/cli`, with each place software comes from in `cli/sources`.

While the app runs, it owns `com.lantharos.Schelf` on the session bus. The `com.lantharos.Schelf1` interface at `/com/lantharos/Schelf` takes an operation as JSON with `Start` (a key, title and job, as Schelf's own pages send them) and stops it with `Cancel`; `Changed` and `Finished` signals report on it. Apps in a Flatpak sandbox can't call it unless they have full access. The command hands its work to the app this way, so both share one queue. Without the app, it runs the work itself. Either way every job holds the account's software lock from `packages/system/software` while it changes anything.

How Schelf adds the preinstalled apps and keeps apps updated in the background is in [the Schelf reference](../../docs/components/schelf.md).
