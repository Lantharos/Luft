# Upstream patches

Luft carries changes to software it doesn't own: a Mutter patch series for Kestrel's compositor, an engine forked from GNOME Shell, and patched rebuilds of bootc, libsecret and xdg-desktop-portal in the image. Every carried change costs work on each upstream release, and Fedora moves to new GNOME releases on its own schedule, so each change should either be on its way upstream or have a clear reason to stay.

## Mutter

Every patch in [kestrel/compositor](../kestrel/compositor) has an `Upstream-Status` trailer in its commit message, so the status travels with the commit through rebases and `patches.py export`:

| Status | Meaning |
| --- | --- |
| `upstream URL` | The merge request or commit upstream that carries it, merged or still open, and an optional note |
| `forwardable` | Nothing in it is specific to Luft, so it could go upstream, with an optional note on what to drop first |
| `luft-only REASON` | Stays with Luft, with a short reason, such as an API only Kestrel's shell uses |

```sh
git commit --trailer "Upstream-Status: forwardable"
python3 kestrel/compositor/patches.py list
```

`prepare`, `check` and `export` refuse a patch without a valid status. `list` prints every patch's status and the totals.

To see how the series fares on a newer Mutter, `trial` applies the patches in order to the given branches or tags, with `latest` for the newest release or prerelease, skips those that don't apply, and prints which apply, need a 3-way merge, are already there or conflict:

```sh
python3 kestrel/compositor/patches.py trial main latest
```

A patch that is already there or conflicts while its status says upstream can usually be dropped when moving to that release, see [Update Mutter](components/compositor.md#update-mutter).

### Drafts

[kestrel/compositor/upstream](../kestrel/compositor/upstream) holds forwardable patches prepared for GNOME's GitLab, one folder per merge request: the patches, rebased onto Mutter's main branch and written the way Mutter's commits are, and `description.md` with the title, the base it was made against and the merge request's text. They are submitted by hand. Once one is open, change the patch's status to `upstream` with its link, and remove the folder when it merges.

## The engine

[kestrel/engine](../kestrel/engine) started as GNOME Shell's C code, St and the shell library, at the commit in `kestrel/engine/upstream.json`. Most files under `kestrel/engine/src` still have the path they had in GNOME Shell, and fixes to them, such as in the polkit and network agents or screenshots, should come over:

```sh
python3 kestrel/engine/upstream.py changes        # GNOME Shell main
python3 kestrel/engine/upstream.py changes 52.0   # or a tag
python3 kestrel/engine/upstream.py show 8c100ef8fba0 | git apply -3 --directory=kestrel/engine
```

`changes` lists the commits since the base that touch those files and which files each touches. `show` prints one of them limited to those files. Add a commit to `picked` in `upstream.json` once it's brought over, or decided against, so it drops off the list. When the engine moves to a newer GNOME Shell, set `version` and `revision` to it and empty `picked`.

## Image packages

The patches in [os/image/patches](../os/image/patches) each have a README with the reason for every patch and an Upstream section, and `UPSTREAM.md` where a merge request is drafted. To check them against upstream's main branch:

```sh
os/image/patches/trial.sh libsecret https://gitlab.gnome.org/GNOME/libsecret.git
```

## Weekly report

The [Upstream patches](../.github/workflows/upstream.yml) workflow runs every Monday and on demand. It applies the Mutter series to Mutter main and its newest release, lists GNOME Shell changes for the engine, and applies the bootc, libsecret and xdg-desktop-portal patches to their main branches. The results are on the run's summary page and attached as artifacts. It never fails because a patch doesn't apply and isn't part of the checks on pushes and pull requests.
