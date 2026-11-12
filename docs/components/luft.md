# The luft command

`luft` (`services/cli`, installed as `/usr/bin/luft`) is a thin front on what Luft already has: its D-Bus services, the GSettings schemas Settings reads and writes, and bootc through the updater. It adds no power of its own. How people use it is on [docs.luft.computer](https://docs.luft.computer/system/terminal/); this page is how it works.

## Parts

| Part | Where | Does |
| --- | --- | --- |
| `luft` | `services/cli` | Commands, the settings catalogue, change sets, history and undo, the extension loop, the MCP server |
| The catalogue | `packages/web/settings-catalogue/catalogue.json` | Every setting luft offers, by the page and Fluent title Settings shows it under, and how it is kept |
| The review | `kestrel/ui/src/system/changes` | `com.lantharos.Kestrel.Changes1` at `/com/lantharos/Kestrel/Changes` on Kestrel's session bus name: shows a set of changes and makes them once approved |
| `luft-changes` | `services/changes` | `com.lantharos.Changes1` on the system bus: reads the system settings and makes them for Kestrel after one administrator's password |

Commands that don't need the bus, such as `--help`, `completions` and the extension checks, start no runtime and open no connection.

## The catalogue

Each entry names a page of Settings (`@luft/settings-pages`) and the Fluent id of the title Settings shows there, so `luft` and the review use Settings' own names, and is kept one of four ways:

| Kept as | Example | Changed by |
| --- | --- | --- |
| `key`: one GSettings key | `taskbar.size`, `com.lantharos.kestrel taskbar-size` | luft directly |
| `options` with `when` and `set`: a choice that stands for several keys | `appearance.style`, from `color-scheme` and `dark-schedule` | luft directly |
| `service`: a session service | `privacy.crash-reports`, through `com.lantharos.CrashReports1` | luft directly |
| `system`: a system setting | `security.developer-tools`, through `com.lantharos.Greeter1` | Kestrel's review, then `luft-changes` |

Entries marked `developer` are switches only Luft's own developers need; `luft developer` offers them while Developer tools is on. `settingsOnly` lists what stays in Settings, so luft can say where it is.

`bun run check` in the catalogue package fails when an entry's title, choice labels, warnings or keys no longer appear on its page in Settings' sources, when a title has no English string, or when a key of Kestrel's isn't in its schemas. luft's build takes the English names from Settings' strings (`services/cli/build.rs`), and Kestrel's locale build adds those messages, in every language, to its own (`kestrel/ui/locales.ts`).

## A set of changes

`luft set`, `luft apply`, `luft channel`, `luft developer on`, `luft undo` and the MCP tool `propose_changes` all make a change set:

1. Every setting is looked up by id or by its name in Settings, and every value is checked against what the setting takes: the key's type and range, the choices Settings offers, or the system setting's values. One wrong change refuses the whole set (exit 3).
2. Settings that already have the asked-for value are left out.
3. When nothing left is a system setting, luft makes the changes itself and records them.
4. Otherwise luft sends the whole set, as setting ids and values, to Kestrel's `Review`, and waits.

### The review

`Review(a(sv) changes) → (b approved, aa{sv} restore, s requester, s error)`.

- Kestrel answers only `/usr/bin/luft` from the system image (or, in a development build started from its build folder, the `luft` in `KESTREL_LUFT_APPS`), judged through the caller's pidfd the way every prompt judges programs (`callerRuns`). A copy of luft, or anything else on the session bus, gets `NotLuft` and no window.
- Not while the screen is locked (`Locked`), one at a time (`Busy`), and at most five a minute (`TooMany`).
- Kestrel reads the catalogue itself and checks every value again: keys against their schema with `range_check`, choices against the catalogue. It reads every current value itself, system ones through `com.lantharos.Changes1.Read`, so nothing luft says about them is shown.
- The window lists each change by its page and name the way Settings' search shows them, such as Taskbar and Start · Size, from what it is to what it becomes, with the warning Settings shows before that change inside that change's row. The list scrolls when it's long, and the buttons always stay in view. It names the program that ran luft (its first ancestor that isn't a shell, the way prompts name programs), and says when an administrator's password follows. It is a system prompt: it ignores input for its first 0.75 seconds, stays until a button is picked, and **Don't change** is what Enter picks. If luft goes away, the window closes and nothing changes.
- On **Change**, Kestrel makes exactly what it showed: the system settings first, in one `com.lantharos.Changes1.Apply` call, then the rest with GSettings itself. luft can't change the set after it was shown, and a program that controls luft, by tracing it or feeding it arguments, only changes what the window shows.

### luft-changes

`Apply(a(sv) changes) → (a(sv) previous, s error)` answers only Kestrel: `/usr/bin/kestrel` from the system image in `kestrel.service` of the caller's own systemd (`caller::session_unit` and `caller::luft_program`). It checks every change, asks polkit once for `com.lantharos.changes.apply`, which needs an administrator's password every time and names every change in its prompt, then reads each setting and makes it through the service that owns it, as root, stopping at the first that fails. It returns what each setting was before, which is what undo puts back. `Read(as settings)` answers anyone.

It runs on demand, as root with only `CAP_SYS_PTRACE` (to read its caller's program and control group through the pidfd), no network and a read-only system, and stops after half a minute without calls.

| System setting | Service | Settings asks for |
| --- | --- | --- |
| `developer-tools` | `com.lantharos.Greeter1.SetDeveloperTools` | an administrator, every time |
| `usb-protection` | `com.lantharos.UsbProtection1.SetEnabled` | an administrator |
| `update-channel` | `com.lantharos.Updater1.SwitchChannel`, stable only once the registry could say whether one is out | an administrator |
| `update-schedule`, `download-updates` | `com.lantharos.Updater1.SetSchedule` | an administrator |
| `time-zone`, `automatic-time` | `org.freedesktop.timedate1` | an administrator |

### Guarded actions

Calls that only one of Luft's own programs may make name that program's path, and `/usr/bin/luft` is on none of their lists, so luft is never taken for Settings, Kestrel or Post:

| Guarded action | Only from | What luft does |
| --- | --- | --- |
| Online accounts (`com.lantharos.Accounts1`) | Settings | Leaves it to Settings and names the page (exit 6) |
| Cloud drives (`com.lantharos.Accounts1.Files`) | Settings and Rover | Nothing |
| `UsbProtection1.SetLocked` | Kestrel | Nothing: it is the lock screen's own signal |
| Turning USB protection off or on | an administrator | Review, then `luft-changes` |
| `Firewall1.SetExtensionPorts`, `SetPostOpen` | Kestrel, Post | Nothing |
| The firewall's networks, apps and ports | the person at the screen, or an administrator | Leaves it to Settings |
| Running an extension from its folder inside the desktop (`Packages1.InstallUnreviewedExtension`, `AllowExtensionFolder`) | Settings, with Developer tools on | `luft extension run-in-luft` opens the extension's page in Settings |
| Developer tools | an administrator, every time | Review, then `luft-changes` |
| Release channel, update schedule | an administrator | Review, then `luft-changes` |
| Downloading updates, going back to the previous version | polkit, as for Settings | Calls the updater directly, so polkit asks as it asks Settings |
| Restarting to install an update | Kestrel's restart confirmation | Asks the session manager to restart, which shows it |
| Remote login, automatic login, encryption, the recovery key, Luft Keyring | Settings, with its warnings | Leaves it to Settings |

## History and undo

Each change set luft makes is kept in `~/.local/state/luft/history.json`, the newest hundred: when, which program asked, whether it was reviewed, every setting from and to, and how to put each back. For keys that is the exact value the key held, or that it kept its default; for system and service settings, their value before. `luft undo` puts back the newest set not put back yet: keys and services directly, and a set with system settings through a new review. The undo is kept too.

## Extensions

`luft extension check` reads `extension.toml` with the rules and words of `kestrel/ui/src/extensions/runtime/manifest.ts`, ported to Rust in `services/cli/src/extension/manifest`; its tests hold the same cases. `pack` makes what `extensions/pack.sh` makes, `reload` calls `com.lantharos.Kestrel.Extensions.Reload`, `logs` reads Kestrel's lines about the extension and those of its sandbox's scope, and `run-in-luft` opens `kestrel-settings:extensions/<id>`, where Settings asks to run it inside the desktop.

## MCP

`luft mcp` serves the Model Context Protocol on standard input and output with the official Rust SDK (`rmcp`). Its tools call the same functions as the commands: `status`, `describe_settings`, `get_settings`, `propose_changes`, `undo_last_change`, `change_history`, `check_for_updates`, `read_logs`, `make_report` and the extension tools. Tools that only read are marked read-only. `propose_changes` takes the whole set as one object, and its description tells agents to send everything the person asked for in one call, since the person reviews it as one.

## Testing

`cargo test -p luft-cli -p luft-changes` covers change sets, the catalogue's kinds of value, history, the manifest rules, packing and what luft-changes accepts. `kestrel/tools/session.sh capture --only system:changes` runs luft in a headless session against a stand-in `com.lantharos.Changes1`, see [Testing](../testing.md#kestrel-sessions). The administrator's password after **Change** comes from polkit, which the fixture bus stands in for without prompts, so it needs a real session.
