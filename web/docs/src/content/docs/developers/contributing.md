---
title: Contributing
description: How to propose changes to Luft.
sidebar:
  order: 3
---

Luft lives at [github.com/Lantharos/Luft](https://github.com/Lantharos/Luft). Report problems and suggest ideas in [its issues](https://github.com/Lantharos/Luft/issues), and send changes as pull requests.

## Before you start

Read [How Luft fits together](/developers/architecture/) to find where a change belongs, and the README in that folder for how to build and test it.

## Making a change

- **Keep the style of the code around you.** Each language has its formatter: `cargo fmt` and `cargo clippy` for Rust, and `bun run check` for the apps and Kestrel's interface.
- **Test it the way the repository does.** Kestrel changes go through `kestrel/tools/session.sh capture`, apps through their own checks, and anything touching disks, startup or installing goes through the VMs in `os/vm`, never through loop devices or mounts on your own machine.
- **Keep people's data safe.** Anything that erases asks first, and anything that can fail halfway can be finished or undone.
- **Write commits as sentences**, in the imperative, saying what the change does: *Show newly installed apps within a quarter second*. Sign them.
- **Update the docs** when a change affects them: the folder's README for how to build and use it, and this site for what people see.

## Licences

Luft is licensed under the GNU General Public License, version 3 or later. Kestrel's engine and the Mutter patches stay GPL-2.0-or-later, as in GNOME Shell and Mutter. Open Runde and Maple Mono are under the SIL Open Font License. Contributions are accepted under the same licences.

## This site

These pages live in `web/docs`, written in Markdown. Pages under Reference come from the repository's `docs` folder, so they're edited there. Every page has an edit link at the bottom.

```sh
cd web/docs
bun run dev        # http://localhost:4321
bun run build      # checks every link
```
