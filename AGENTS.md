# Agent instructions

Luft is a desktop operating system built from this repository as one signed bootc image on Fedora. [How Luft fits together](https://docs.luft.computer/developers/architecture/) is the map, and each folder's README says how to build and test it.

| Path | Holds |
| --- | --- |
| `kestrel` | The desktop: Mutter patches in `compositor`, the native shell in `engine`, the interface in `ui`, test sessions in `tools` |
| `apps` | Luft's apps, `system` in the image and `store` on schelf.store |
| `services`, `security` | The D-Bus services apps reach the system through, trustd among them |
| `packages` | Shared Rust crates and web packages, translations in `i18n` |
| `extensions` | Luft's own desktop extensions |
| `sushi` | The boot splash and SushiBoot |
| `os` | The image, the USB stick, VMs and the development layer |
| `web` | The website and the documentation site, `web/docs` |

## Before you finish

- Run what checks the code you touched: `cargo fmt`, `cargo clippy --all-targets -- -D warnings` and `cargo test` for Rust, `bun run check` for TypeScript and Svelte, and the scripts in `.github/scripts` when units, `/etc` paths or D-Bus interfaces change. [Testing](https://docs.luft.computer/developers/testing/) and [Testing apps, services and VMs](https://docs.luft.computer/developers/testing-vms/) cover the rest.
- Update the page in `web/docs` that describes behaviour you changed. User pages say how to use something, developer pages how it works and why. READMEs stay short and link there.

## Rules

- No AI or tool attribution lines, such as Co-Authored-By or "Generated with", in commits or pull requests.
- No comments that explain logic; make the code say it.
- No dead code, compatibility layers, fallbacks or migrations for old behaviour.
- New strings go into the English Fluent files only; translators add the rest.
- Test boot, disk and install changes in the VMs in `os/vm`, never on the host with loop devices or mounts.
- Point `KESTREL_SESSION_DIR` and `KESTREL_CAPTURE_DIR` at scratch folders for headless test sessions, never remove `session.sh`'s blocking service files, and never type a real password into a prompt.
- Everything is named `com.lantharos.*`, and the product is called Luft.

Maintainers keep private working notes outside the repository; an agent whose environment gives it access to them should read them first.
