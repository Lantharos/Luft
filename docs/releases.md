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

## Early builds

While `EARLY=1` is in `os/versions.env`, every image says Luft is still early, and Install Luft shows a note saying so right after its first screen, before anything is written to a drive, with where to report problems. This is the maintainer's own call, not tied to a version number or to the first stable release: stable images carry it too, because a promotion keeps the nightly's layers. Remove the line once Luft is ready for most people, and the nightly built after that, and the release promoted from it, no longer show the note.

The build writes it to `/usr/share/luft/release` as `early=true`, next to `stable-released`, which says whether a stable version was out when the image was built. The nightly sets that once a `v1.N` tag exists (`LUFT_STABLE_RELEASED=1` for `os/image/build.sh`), and only then does the note on a nightly build mention switching to the stable version. A stable image promoted from a nightly built before its own release says `false`, which only matters on nightlies. Install Luft tells a nightly from a release by the version the stick's build writes into its installer settings ([Installing](install.md#building-the-sticks-installer)).

## Schedule

| What | When (UTC) |
| --- | --- |
| Nightly images | Every day at 02:00, when something changed |
| Nightly stick | After every nightly, from that nightly |
| Stable images and stick | Only when promoted by hand |

A nightly is built when `main` has new commits, Fedora published a new base image, a package the image adds to Fedora's has an update, which happens most days, or an app the image ships from schelf.store has a newer release out. The build compares the commit, base image, CEF build and store releases recorded in the last nightly's labels and runs `os/image/build.sh updates` on it, which is `dnf check-upgrade` for the packages Luft adds. When all of them match, the night is skipped.

Before `:1-nightly` moves, each of the two new images is installed in its own VM on the runner the way Install Luft does, started with Secure Boot, signed in to with a password made up for that run, and checked until the desktop and Settings work ([Testing](testing.md#ci)). When that fails, the nightly isn't published, `:1-nightly` stays on the last one that passed, and the run keeps the screenshots and logs.

Helium's newest release is picked up at 01:00, so it lands in that night's build. Sabine has its own releases; a new Sabine version reaches the nightlies first and stable with the next promotion. The image build fails when its Sabine would not run one of the image's own apps. On a running system, Sabine holds back an update that would stop an installed app, until a Luft update brings newer apps or, for an app the person installed, they update or remove it; Settings → Updates names those apps.

A new major version lands on the nightlies first.

## What the build trusts

- **Fedora.** Each run resolves `quay.io/fedora/fedora-bootc` to a digest once, builds every part and the image on exactly that, and records it in the image's `org.opencontainers.image.base.name` label. Fedora doesn't sign the image, so the digest isn't committed: a commit that followed the tag by itself would prove nothing more. Packages come from Fedora's and RPM Fusion's repositories with their signatures checked. The two source packages Luft patches and rebuilds (bootc and xdg-desktop-portal), and the kernel headers when the repositories no longer carry the image's kernel, come from Koji's signed copies and are checked against Fedora's key before they're unpacked.
- **Tools.** `os/versions.env` pins Bun (version and checksum, the same one for the build and for CI), and the Bun and chunkah images the build runs, by digest. It also holds the Fedora release and Luft's major version, which nothing else repeats.
- **Downloads.** CEF is pinned in `os/image/parts/cef.lock` by version and SHA-256; the CEF workflow moves it to the newest build Sabine would install at 00:30, in a commit. Helium is checked against its publisher's signature, the cursors against a committed checksum, Zypak is fetched at a commit, and Sabine at a tag.
- **Parts.** A part pushed to `ghcr.io/lantharos/luft-parts` is signed without a key by the workflow that built it, and recorded in sigstore's public log. The build only reuses a part that carries that signature, and pulls it by the digest it checked; anything else under the same tag counts as missing and is built again.
- **Keys.** The Secure Boot key is only ever mounted into build steps that have no network: one signs SushiBoot, one the startup image, and one NVIDIA's kernel modules. The modules are built first, without any key, in a stage that downloads and runs NVIDIA's code; a second, clean stage with only Fedora's kernel headers signs the files it produced. Jobs that sign run in the `signing` environment, which only `main` may use.

## Apps on schelf.store

Every app and extension with a `schelf.toml`, such as Draft, Flatbed, Magpie, Mailman, Convertible, Meet Luft, Soundboard, Seasons, Strays, Playthings, Keystrokes, Visualizer, Now Playing, Soundscapes, Focus, Reminders and Pult, is published on [schelf.store](https://schelf.store) too, so it installs and updates anywhere Sabine runs. The nightly image run publishes them; nothing else does, and no tags or GitHub releases are made for them.

- **Nightly.** Before building the image, the run works out each app's source key the way it does for the image's parts, from its folder, the files next to it, every workspace package and crate it reaches and the lockfiles, and compares it with the key at the commit of the app's newest release. Each app that changed is built with Sabine's release workflow for Linux x86_64 and ARM64 (and Windows for Meet Luft), or packed with `extensions/pack.sh`, once for all machines or, with a native helper, per architecture, and published to the nightly channel, with the subjects of the commits that touched its folder as release notes. The image waits for those releases to pass the store's checks and ships them.
- **Versions.** The version in `Sabine.toml` or `extension.toml` is the lowest an app's next release can have. Each release takes that version or the next patch after the newest release on any channel, whichever is higher, so nobody bumps a version for a fix. To start a new minor or major version, raise it in the manifest.
- **Stable.** Promoting a nightly image promotes exactly the app releases it was built with to the stable channel, without building or uploading anything, with the commits that touched each app's folder since its last stable release as notes. They go through the store's review there; an app whose release is already on stable is left alone. Meet Luft's downloads on the website and in the docs are schelf.store's stable links, so they follow its stable release by themselves.

A new app goes in `apps/store` and a new extension in `extensions`, each with a `schelf.toml` with `listing = "store/"` and a `store/listing.toml` with its `summary`, `description`, `categories` (the first is its primary one), `homepage`, `support` and `brand_color`, and the `screenshots` in `store/`, in the order the store shows them. Extensions add their search `keywords` there too. Each nightly sends the file with the release, and the store applies everything but the screenshots, unless that field was changed in the dashboard. Apps that update from the store say `provider = "schelf"` under `[updates]` in `Sabine.toml`, and the `[sandbox]` table there says what they need.

Draft, Flatbed, Magpie and Mailman don't need anything only the image can give them, so the image ships them from the store, listed in `os/image/parts/store/apps.toml`. Each build takes the newest release of each that's out, on any channel, which on a nightly is the one published in the same run unless the store sent it to review, and leaves the app's own part out. `schelf --preinstall` installs the apps for every account at sign-in, offline, and Schelf keeps them updated from then on, so they can be removed like any app ([Schelf](components/schelf.md#preinstalled-apps-and-background-updates)). A stable image keeps the builds of the nightly it came from, the same ones its promotion sends to review, so it never waits on the store. Until an app has a release, the image keeps building it in. The image records the releases it preinstalls in its `com.lantharos.store` label and the release of every store app it goes with in `com.lantharos.store-releases`, which is what a promotion reads. Rover and Tern stay in the image, since other parts of Luft open them and they handle folders and terminals for the whole system.

## Switching channels

Settings › System › Release channel moves a computer between `:1` and `:1-nightly`, keeping its variant, through the updater's `SwitchChannel`, which asks for an administrator. Switching never installs an older version: versions sort with every nightly before the release it leads to. Releases are one track, with some nightlies promoted to stable along the way, so a computer moving from nightly to stable keeps taking nightlies and moves at the first stable version at least as new as the one it runs. The updater keeps the chosen channel in `/var/lib/luft-updater/schedule.json` until then. When that stable version is the very nightly the computer runs, promoted, the move downloads nothing: bootc points the running version at `:1` and renames its boot entry (`follow-same-root.patch`), even with automatic downloads off. A newer stable version is staged like any update and starts at the next restart. When the newest stable version is older than the running nightly, the computer simply keeps taking nightlies until the next release. A nightly that's already downloaded and the same as the stable version waits for the restart, after which the move is a rename. Going from stable to nightly moves right away when the nightly is at least as new, and otherwise keeps the stable version until a newer nightly is out. Settings shows the channel the computer is on, with one button to switch to the other; while a move waits, the same button cancels it. Switching to stable is unavailable while the updater couldn't reach the registry to see whether one is out. The image's `stable-released` fact is only for Install Luft, which has no network.

## Promoting a nightly

Run the Image workflow with **promote** set to the nightly's version, such as `1.1-nightly.21`, which becomes the release it leads to, `1.1`. Only the next release can be promoted. The workflow tags the nightly's commit `v1.1`, checks the nightly's signature, gives a copy of it the new version and the release's changelog in its labels with crane, keeping every layer, signs that with the key and in the public log, and moves `:1` and `:1-nvidia` to it, also tagged `:1.1`. Then it publishes the release's changelog, sends the nightly's app releases to stable on schelf.store, builds the stable stick from the promoted images, and creates the GitHub release. If any step fails there is no GitHub release, and running it again picks up where it stopped.

Before promoting, check that:

- [ ] every check is green on the nightly's commit
- [ ] it updates from the release before in a VM ([os/vm](../os/vm))
- [ ] it has been out for at least two days with no reported regressions
- [ ] it has run on the maintainer's own laptop

Security and data-loss fixes are promoted the same day when the maintainer asks for it, without waiting.

## Changelogs

Every version has its own changelog with only its changes, grouped into Desktop, each app by name, System, and Installing (Install Luft, Meet Luft and the stick). Where a commit goes depends on which files it changes. Commits that only touch CI, tests, checks, docs or development tools are left out. A nightly's changelog covers the commits since the nightly before it, and a stable release's merges the changelogs of every nightly since the one the previous release came from.

Settings shows the same changelog under What's new, merging every version between the installed one and the offered one. After the update, What's new for the running version still covers everything since the version it updated from. There is no changelog file in the repository.

## GitHub releases

Each stable release gets a GitHub release named after its version, such as *Luft 1.1* on the tag `v1.1`, with the changelog, links to its stick on get.luft.computer and to Meet Luft on schelf.store, and the digests of `:1` and `:1-nvidia` with the `cosign verify` command that checks them. The changelog is attached as `CHANGES.md`, and the stick's checksum and signature are attached too. The stick itself is too big for GitHub. Nightlies don't get GitHub releases.

## USB sticks

The stick starts through Fedora's signed shim and GRUB, carries its images so installing needs no network, and runs the regular desktop when you choose to just try Luft. It also starts as a DVD and from [Ventoy](https://www.ventoy.net).

| Published at get.luft.computer | Holds |
| --- | --- |
| `nightly/luft-VERSION.iso` | The three newest nightly sticks, such as `luft-1.1-nightly.21.iso` |
| `1/luft-VERSION.iso` | Stable releases, from the first one on |
| `…/latest.json` | The newest stick in that folder: its `name`, `version`, `size` and `sha256` |
| `…/latest.json.minisig` | Its signature, which Meet Luft checks before it trusts the description |
| `nightly/notes/VERSION.json` | That nightly's changelog |
| `1/notes/VERSION.json` | That stable release's changelog |

Each notes file holds the `version`, the `previous` one in its folder and the changelog in `notes`, and a release's also the `nightly` it came from, as a list of sections with an `area` (`desktop`, `apps`, `system` or `installing`), a `title` and their `changes`. The image also carries its changelog in the `com.lantharos.release-notes` label, for when Settings can't reach get.luft.computer.

Every stick has a `.sha256` next to it, and each stick's checksum is signed with minisign in a `.sha256.minisig`, with the stick's file name as the trusted comment. The public key is `RWRz9rCK/H8Drrze/f851hxNNOH/D42kpyTMpXV7DT7QoUdCZySZwRWA`. Meet Luft's checksums are schelf.store's, in its `SHA256SUMS`.
