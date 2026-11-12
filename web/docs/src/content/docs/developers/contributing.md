---
title: Contributing
description: How to propose changes to Luft, and the conventions every change follows.
sidebar:
  order: 4
---

Luft lives at [github.com/Lantharos/Luft](https://github.com/Lantharos/Luft). Report problems and suggest ideas in [its issues](https://github.com/Lantharos/Luft/issues), and send changes as pull requests.

## Before you start

Read [How Luft fits together](/developers/architecture/) to find where a change belongs, [Building Luft](/developers/building/) to build it, and [Testing](/developers/testing/) to try it.

## Making a change

- **Keep the style of the code around you.** Each language has its formatter: `cargo fmt` and `cargo clippy` for Rust, and `bun run check` for the apps and Kestrel's interface.
- **Test it the way the repository does.** Kestrel changes go through `kestrel/tools/session.sh capture`, apps through their own checks, and anything touching disks, startup or installing goes through the VMs in `os/vm`, never through loop devices or mounts on your own machine.
- **Keep people's data safe.** Anything that erases asks first, and anything that can fail halfway can be finished or undone.
- **Write state where every version sees it.** Services keep what they write in `/var/lib`, never `/etc` ([Where state lives](/developers/architecture/#where-state-lives)).
- **Write commits as sentences**, in the imperative, saying what the change does: *Show newly installed apps within a quarter second*. Sign them.
- **Update these docs in the same change** when it changes behaviour they describe. READMEs stay short and point here.

## Changelogs

Every version has a changelog with only its own changes, grouped into Desktop, one group per app, System, and Installing (Install Luft, Meet Luft and the stick). A commit lands in a group by the files it changes. Commits that only touch CI, tests, checks, docs or development tools are left out. A nightly's changelog covers the commits since the nightly before it, and a stable release's merges every nightly since the previous release. There is no changelog file in the repository: the image carries its own, and Settings shows it under What's new.

## D-Bus interfaces

Put `#[introspect]` from `luft-dbus-macros` right above every zbus `#[interface]` and `#[proxy]`. `cargo test` then checks that `packages/dbus/introspection` holds what the interface exports or the proxy calls; after changing one, run `LUFT_DBUS_UPDATE=1 cargo test -p CRATE introspection` and commit the result. Name errors the way [D-Bus interfaces](/developers/desktop/dbus/#errors) describes.

## Mutter patches

Every patch in `kestrel/compositor` carries an `Upstream-Status` trailer saying whether it's upstream, forwardable or Luft's own ([The compositor](/developers/desktop/compositor/#upstream)).

## New apps and extensions

A new app goes in `apps/store` and a new extension in `extensions`, each with a `schelf.toml` that has `listing = "store/"`. `store/listing.toml` holds its `summary`, `description`, `categories` (the first is its primary one), `homepage`, `support` and `brand_color`, with the `screenshots` in `store/` in the order the store shows them; extensions add search `keywords` too. Each nightly publishes it to [schelf.store](https://schelf.store) with the listing. Apps that update from the store say `provider = "schelf"` under `[updates]` in `Sabine.toml`, and its `[sandbox]` table says what they need.

The version in `Sabine.toml` or `extension.toml` is the lowest the next release can have. Each release takes that or the next patch after the newest release, so nobody bumps a version for a fix; raise it in the manifest to start a new minor or major version.

## The extension API

Version 1 grows in place: add to it, never take away or change what's there. When a change can't keep old extensions working, copy `kestrel/ui/src/extensions/api/v1` to `v2`, change the copy, add it to `API_VERSIONS` in `api/versions.ts` and its types beside `v1.d.ts` in `packages/extension-api`, and keep `v1` working, so extensions keep targeting the version they were written for.

## Licences

Luft is licensed under the GNU General Public License, version 3 or later. Kestrel's engine and the Mutter patches stay GPL-2.0-or-later, as in GNOME Shell and Mutter. Open Runde and Maple Mono are under the SIL Open Font License. Contributions are accepted under the same licences.

## This site

These pages are Luft's documentation, written in Markdown in `web/docs`. User pages say what something does and how to use it; pages for developers say how it works and why. Every page has an edit link at the bottom.

```sh
cd web/docs
bun run dev        # http://localhost:4321
bun run build      # checks every link
```
