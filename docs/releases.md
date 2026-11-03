# Images and downloads

What CI publishes from [os](../os/README.md): the system images, the USB sticks made from them, and when each comes out.

## Images

| Image | For |
| --- | --- |
| `ghcr.io/lantharos/luft:1` | Any computer |
| `ghcr.io/lantharos/luft:1-nvidia` | NVIDIA graphics, with the driver built for the image's kernel and signed with Luft's key |

Nightlies are `:1-nightly` and `:1-nightly-nvidia`, each also tagged with its version. A stable release is a nightly that was tested: promoting it gives `:1` and `:1-nvidia` exactly that nightly's layers, so a computer moving from the nightly to the release downloads nothing but the new version's name. Every image is signed with Luft's key.

## Versions

| Version | Shown as | Is |
| --- | --- | --- |
| `1.1` | Luft 1.1 | A stable release: the major version and how many releases came before it, so 1.0 is the first |
| `1.2-nightly.21` | Luft 1.2 Nightly 21 | The 21st nightly on the way to 1.2 |

The major version follows Fedora: Luft 1 is Fedora 45, and Luft 2 moves to Fedora 46 after its release around April, starting again at 2.0. Nightlies count toward the next release: the count starts at 1 after each release and goes up with every nightly published, so a run that's tried again keeps its number. Versions sort the way they're released, with each nightly before the release it leads to.

The release count comes from the `v1.N` tags, and the nightly count from the version of the newest nightly. Nothing else keeps them.

The version is only in the image's labels, the `org.opencontainers.image.version` label of its configuration and annotation of its manifest, which is what `bootc status` shows; the system inside has none, and `/etc/os-release` says `VERSION="1"` and Fedora's `VERSION_ID`. That's what lets a promotion rename a nightly without touching its layers. Settings › About and Updates, and the restart dialog, read the version from `bootc status` through the updater, and About shows the day the image was built next to it. bootc writes it into each version's boot entry too, which is where SushiBoot's menu gets it from. Moving from a nightly to the release made from it keeps the running version and renames its boot entry, so the menu shows the release's version straight away.

## Schedule

| What | When (UTC) |
| --- | --- |
| Nightly images | Every day at 02:00, when something changed |
| Nightly stick | After every nightly, from that nightly |
| Stable images and stick | Only when promoted by hand |

A nightly is built when `main` has new commits, Fedora published a new base image, a package the image adds to Fedora's has an update, which happens most days, or schelf.store approved a new release of an app the image ships from it. The build compares the commit, base image, CEF build and store releases recorded in the last nightly's labels and runs `os/image/build.sh updates` on it, which is `dnf check-upgrade` for the packages Luft adds. When all of them match, the night is skipped.

Before `:1-nightly` moves, the new image is installed in a VM on the runner the way Install Luft does, started with Secure Boot, signed in to with a password made up for that run, and checked until the desktop and Settings work ([Testing](testing.md#ci)). When that fails, the nightly isn't published, `:1-nightly` stays on the last one that passed, and the run keeps the screenshots and logs.

Helium's newest release is picked up at 01:00, so it lands in that night's build. Sabine has its own releases; a new Sabine version reaches the nightlies first and stable with the next promotion. The image build fails when its Sabine would not run one of the image's own apps. On a running system, Sabine holds back an update that would stop an installed app, until a Luft update brings newer apps or, for an app the person installed, they update or remove it; Settings → Updates names those apps.

A new major version lands on the nightlies first.

## Apps on schelf.store

Draft, Magpie, Mailman, Rover, Tern and Meet Luft, and the Rain extension, are published on [schelf.store](https://schelf.store) too, so they install and update anywhere Sabine runs. The Publish to Schelf workflow (`.github/workflows/store.yml`) publishes them, one app per run: it builds the app with Sabine's release workflow for Linux x86_64 and ARM64 (and Windows for Meet Luft), or packs the extension with its helper on both architectures with `extensions/pack.sh`, and sends it to the store, whose review approves it. No tags or GitHub releases are made for them; the store records the commit each release was built from.

- **To release an app,** bump the version in its `Sabine.toml` (or an extension's `extension.toml`) and push to `main`. The workflow publishes every app whose version changed to stable, with the message of the commit that changed it as the release notes.
- **To publish by hand,** open *Publish to Schelf* in the Actions tab, press **Run workflow**, and pick the app and the channel (`gh workflow run store.yml -f app=draft -f channel=beta` does the same).
- **Nightly,** every app that changed since its last nightly goes to the nightly channel from `main`, with a version such as `0.2.0-nightly.202611030217.g1a2b3c4`.

Each app's `schelf.toml` says what it is, and the `[sandbox]` table in its `Sabine.toml` what it needs; apps that update from the store say `provider = "schelf"` under `[updates]`. A new app or extension also needs its folder name added to the workflow's list of choices.

Draft, Magpie, Mailman and Rain don't need anything only the image can give them, so the image ships them from the store, listed in `os/image/parts/store/apps.toml`. Each build takes the newest approved release of each and leaves the app's own part out; `schelf --preinstall` installs it for every account at sign-in, offline, and Schelf keeps it updated from then on, so it can be removed like any app ([Schelf](components/schelf.md#preinstalled-apps-and-background-updates)). Until an app has an approved release, the image keeps building it in; Rain is never built in. The image records the releases it took in its `com.lantharos.store` label, and a newly approved release makes the next nightly even when nothing else changed. Rover and Tern stay in the image, since other parts of Luft open them and they handle folders and terminals for the whole system.

## Promoting a nightly

Run the Image workflow with **promote** set to the nightly's version, such as `1.1-nightly.21`, which becomes the release it leads to, `1.1`. Only the next release can be promoted. The workflow tags the nightly's commit `v1.1`, checks the nightly's signature, gives a copy of it the new version and the release's changelog in its labels with crane, keeping every layer, signs that, and moves `:1` and `:1-nvidia` to it, also tagged `:1.1`. Then it publishes the release's changelog, builds the stable stick from the promoted images, and creates the GitHub release. If any step fails there is no GitHub release, and running it again picks up where it stopped.

Before promoting, check that:

- [ ] every check is green on the nightly's commit
- [ ] it updates from the release before in a VM ([os/vm](../os/vm))
- [ ] it has been out for at least two days with no reported regressions
- [ ] it has run on the maintainer's own laptop

Security and data-loss fixes are promoted the same day when the maintainer asks for it, without waiting.

## Changelogs

Every version has its own changelog with only its changes, grouped into Desktop, each app by name, System, and Installing (Install Luft, Meet Luft and the stick). Where a commit goes depends on which files it changes. Commits that only touch CI, tests, checks, docs or development tools are left out. A nightly's changelog covers the commits since the nightly before it, and a stable release's merges the changelogs of every nightly since the one the previous release came from.

Settings shows the same changelog under What's new, merging every version between the installed one and the offered one. There is no changelog file in the repository.

## GitHub releases

Each stable release gets a GitHub release named after its version, such as *Luft 1.1* on the tag `v1.1`, with the changelog, links to its stick and to Meet Luft on get.luft.computer, and the digests of `:1` and `:1-nvidia` with the `cosign verify` command that checks them. The changelog is attached as `CHANGES.md`, and the stick's checksum and signature are attached too. The stick itself is too big for GitHub. Nightlies don't get GitHub releases.

## USB sticks

The stick starts through Fedora's signed shim and GRUB, carries its images so installing needs no network, and runs the regular desktop when you choose to just try Luft. It also starts as a DVD and from [Ventoy](https://www.ventoy.net).

| Published at get.luft.computer | Holds |
| --- | --- |
| `nightly/luft-VERSION.iso` | The three newest nightly sticks, such as `luft-1.1-nightly.21.iso` |
| `1/luft-VERSION.iso` | Stable releases, from the first one on |
| `…/latest.json` | The newest stick in that folder: its `name`, `version`, `size` and `sha256` |
| `nightly/notes/VERSION.json` | That nightly's changelog |
| `1/notes/VERSION.json` | That stable release's changelog |
| `meet/` | Meet Luft for Windows and Linux |

Each notes file holds the `version`, the `previous` one in its folder and the changelog in `notes`, and a release's also the `nightly` it came from, as a list of sections with an `area` (`desktop`, `apps`, `system` or `installing`), a `title` and their `changes`. The image also carries its changelog in the `com.lantharos.release-notes` label, for when Settings can't reach get.luft.computer.

Every stick and Meet Luft download has a `.sha256` next to it, and each stick's checksum is signed with minisign in a `.sha256.minisig`, with the stick's file name as the trusted comment. The public key is `RWRz9rCK/H8Drrze/f851hxNNOH/D42kpyTMpXV7DT7QoUdCZySZwRWA`.
