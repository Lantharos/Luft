# Images and downloads

What CI publishes from [os](../os/README.md): the system images, the USB sticks made from them, and when each comes out.

## Images

| Image | For |
| --- | --- |
| `ghcr.io/lantharos/luft:1` | Any computer |
| `ghcr.io/lantharos/luft:1-nvidia` | NVIDIA graphics, with the driver built for the image's kernel and signed with Luft's key |

Luft's versions start at 1, whatever Fedora release the image is built on. Nightlies are `:1-nightly` and `:1-nightly-nvidia`, each also tagged with its version such as `:1.20261020.57`. A stable release is a nightly that was tested: promoting it moves `:1` and `:1-nvidia` to exactly those images, by digest, without building them again. Every image is signed with Luft's key, and the signatures belong to the digest, so they carry over.

## Schedule

| What | When (UTC) |
| --- | --- |
| Nightly images | Every day at 02:00, when something changed |
| Nightly stick | Sundays at 06:00, from the newest nightly |
| Stable images and stick | Only when promoted by hand |

A nightly is built when `main` has new commits, Fedora published a new base image, or a package the image adds to Fedora's has an update, which happens most days. The build compares the commit and base image recorded in the last nightly's labels and runs `os/image/build.sh updates` on it, which is `dnf check-upgrade` for the packages Luft adds. When all three match, the night is skipped.

Helium's newest release is picked up at 01:00, so it lands in that night's build. Sabine has its own releases; a new Sabine version reaches the nightlies first and stable with the next promotion.

Major versions follow Fedora: Luft 1 is Fedora 45, and Luft 2 moves to Fedora 46 after its release around April. A new major lands on the nightlies first.

## Promoting a nightly

Run the Image workflow with **promote** set to the nightly's version, such as `1.20261020.57`, or push the tag `v1.20261020.57`. Either one moves `:1` and `:1-nvidia`, publishes the release's changelog, builds the stable stick from the promoted images, and then creates the GitHub release. If any step fails there is no GitHub release.

Before promoting, check that:

- [ ] every check is green on the nightly's commit
- [ ] a fresh install from it in a VM ([os/vm](../os/vm)) starts and updates
- [ ] it has been out for at least two days with no reported regressions
- [ ] it has run on the maintainer's own laptop

Security and data-loss fixes are promoted the same day when the maintainer asks for it, without waiting.

## Changelogs

Every version has its own changelog with only its changes, grouped into Desktop, each app by name, System, and Installing (Install Luft, Meet Luft and the stick). Where a commit goes depends on which files it changes. Commits that only touch CI, tests, checks, docs or development tools are left out. A nightly's changelog covers the commits since the nightly before it, and a stable release's merges the changelogs of every nightly since the previous stable.

Settings shows the same changelog under What's new, merging every version between the installed one and the offered one. There is no changelog file in the repository.

## GitHub releases

Each stable release gets a GitHub release named after its version, such as *Luft 1.20261020.57* on the tag `v1.20261020.57`, with the changelog, links to its stick and to Meet Luft on get.luft.computer, and the digests of `:1` and `:1-nvidia` with the `cosign verify` command that checks them. The changelog is attached as `CHANGES.md`, and the stick's checksum and signature are attached too. The stick itself is too big for GitHub. Nightlies don't get GitHub releases.

## USB sticks

The stick starts through Fedora's signed shim and GRUB, carries its images so installing needs no network, and runs the regular desktop when you choose to just try Luft. It also starts as a DVD and from [Ventoy](https://www.ventoy.net).

| Published at get.luft.computer | Holds |
| --- | --- |
| `nightly/luft-VERSION.iso` | The three newest weekly nightly sticks, such as `luft-1.20261020.57.iso` |
| `1/luft-VERSION.iso` | Stable releases, from the first one on |
| `…/latest.json` | The newest stick in that folder: its `name`, `version`, `size` and `sha256` |
| `nightly/notes/VERSION.json` | That nightly's changelog |
| `1/notes/VERSION.json` | That stable release's changelog |
| `meet/` | Meet Luft for Windows and Linux |

Each notes file holds the `version`, the `previous` one in its folder and the changelog in `notes`, as a list of sections with an `area` (`desktop`, `apps`, `system` or `installing`), a `title` and their `changes`. The image also carries its changelog in the `com.lantharos.release-notes` label, for when Settings can't reach get.luft.computer.

Every stick and Meet Luft download has a `.sha256` next to it, and each stick's checksum is signed with minisign in a `.sha256.minisig`, with the stick's file name as the trusted comment. The public key is `RWRz9rCK/H8Drrze/f851hxNNOH/D42kpyTMpXV7DT7QoUdCZySZwRWA`.
