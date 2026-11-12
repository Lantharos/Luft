# Crash reports

When one of Luft's own programs closes unexpectedly, Luft can send a short report about it, so the problem can be found and fixed. Nothing is sent unless you agree, either each time or once for all.

## What counts

Only Luft's own programs, as the system image installs them: Kestrel, the desktop itself and its helpers, Luft's services, and the apps that come with Luft, such as Settings, Rover and Tern, along with the apps from Schelf that Luft preinstalls while they run from the system. Apps you installed yourself, Flatpaks, AppImages, games, anything in your home folder and anything running in a container are never reported, even when they crash.

## When you're asked

- **An app or a helper closes:** a window asks right away.
- **The desktop or the whole computer goes down,** such as when the desktop keeps crashing at sign-in: the window asks after you next sign in.

The window says what closed in plain words, such as "Rover closed unexpectedly" or "The firewall closed unexpectedly", and offers **Send** and **Don't send**; Enter sends, and Escape leaves this one report unsent without remembering anything. **What's in it** shows the exact report that would be sent. Ticking **Do the same next time without asking** turns Send into "always send" and Don't send into "never ask again".

You're asked about the same crash once per version of Luft, so a program that crashes over and over asks once. The window never shows on the lock screen or the login screen: it waits until you unlock.

## What a report holds

- the program, its build, and the version and channel of Luft you run
- how it failed: the signal it was stopped by, or a panic's message and where in the code it happened, or the uncaught error the desktop's scripts ran into before it crashed
- where in the program's code it was: for each frame of the stack, the file of code by name, that file's build ID, the position in it and, when the file names it, the function
- who made your graphics card (Intel, AMD, NVIDIA or another) and whether NVIDIA's driver runs it, since graphics crashes depend on it
- a random number for this computer, made when the first report is sent, so a problem is counted once per computer rather than once per crash

A report never holds the program's memory or a core dump, its environment, its command line, your files, what was on the screen, your name, your computer's name, any serial number or anything else that says who you are. Paths in home folders, email addresses and the names of the people with an account on the computer are taken out of messages before anything is kept.

## Settings

Settings → Privacy → Crash reports has the three choices: **Ask each time**, the default, **Send without asking** and **Never send**. **What's in a report** lists the above, and **Reset** forgets the random number, so the next report can't be linked to earlier ones.

Reports are sent only on a connection that reaches the internet and isn't metered; until then they wait, and a report waiting longer than a week is dropped. A version of Luft built without an inbox to send to sends nothing and asks nothing, and Settings says so.

## How it works

`systemd-coredump` handles every crash on Luft as on Fedora: it writes the crashed thread's stack, unwound with elfutils, into the journal, and keeps the core dump in `/var/lib/systemd/coredump` until systemd's own retention removes it. Crash reports never read, copy or send a core dump.

| Part | What it does |
| --- | --- |
| `luft-crash-collector` | A system service started after each core dump (through `OnSuccess=` on `systemd-coredump@.service`) and when one of Luft's programs panics, through the socket `/run/luft-crash-collector/poke`. It reads the journal entries of crashes since it last looked, asking `journalctl` only for the fields a report is made from, keeps those of Luft's own programs, scrubs them and keeps the finished reports in `/var/lib/luft-crash-collector` until their owner takes them. It runs as its own account in the `systemd-journal` group, with no network, no capabilities and a read-only view of the system, and quits after half a minute without work |
| `luft-crash-reports` | A user service in each session. It takes the person's reports, and the system's, from the collector over `com.lantharos.CrashCollector1`, asks the updater which version of Luft is running, asks through Kestrel or follows the person's choice, and sends. Its state is in `~/.local/state/luft-crash-reports` |
| Kestrel | Shows the question for each report the service waits on, through the same prompt gate as every other system prompt |

The collector counts a crash as Luft's own by the program file it ran: a file of the read-only image under `/usr`, owned by root and writable by nobody else, where the image installs Luft's programs (`/usr/lib/sabine/com.lantharos.*` for apps, and `kestrel*`, `luft`, `luft-*`, `mutter-*`, `trustd`, `trustctl`, `sushid`, `sushictl` and `peek` in `/usr/bin` and `/usr/libexec`). `luft-identity` has this rule as `program::is_installed_at`. A development build counts the programs built in its tree, as described in [Luft's own programs](security.md#lufts-own-programs), and only crashes inside the unit it runs in, so a test session never sees another one's.

Luft's Rust services and apps share one panic hook, `luft_dbus::panics::report`, which `luft_dbus::idle` and `luft_app::run` install. It writes the panic's message, where it happened, the program's build ID and its stack as module, build ID and offset into the journal under the message ID `00e5f8b8beb646d9a16444f1f70152be`, then wakes the collector. A panic that aborts also leaves a core dump; the collector remembers the processes that panicked and reports only the panic. Kestrel marks every uncaught error and unhandled promise rejection of its scripts in the journal with `KESTREL_SCRIPT_ERROR=1`; when Kestrel crashes within a minute of one, the report is of that error, with the native stack next to it.

### Grouping

Each report carries a `signature`, and Pult puts reports with the same signature together, counting how often it happened and on how many computers. The signature is the start of a SHA-256 over:

- the program and how it failed: the signal, `panic` or `script`
- for a signal, the top five frames once the ones that only report the crash are left out (a signal handler with the C library frames that run it and, for an abort, the C library, GLib and C++ frames that abort). Each frame is its module and function where the module names it, or its module, build ID and offset, which is the same address in the same build however the program was loaded
- for a panic, the file and line it happened at, without its column and without its message, which often holds values that change every time
- for an uncaught script error, the error's type and its top three frames, without their columns

Five frames are enough to tell different paths into the same crashing function apart, and few enough that the same bug reached the same way, from callers further up that differ, still groups. Offsets change with every build, so the same bug in two versions of Luft is two items, while function names, where there are any, keep it one; the image version is a field of its own and not part of the signature.

### The inbox

The reports go to the `crashes` inbox of the Luft project on [Pult](https://app.pult.sh), defined in `web/pult`, as client posts: `POST https://app.pult.sh/api/clients/<environment>/crashes` with the inbox's client key in `pult-client-key`. Both values are public and ship in the image in `/usr/share/luft/crash-reports.toml`, from `services/crashes/data/crash-reports.toml`:

```toml
environment = ""
key = ""
```

While either is empty, reporting is off. Pult's answers decide what happens next: a report it took is done; one it refuses as not matching the inbox is dropped; when it says to wait, the report stays queued until then; and when the inbox is gone, closed or has a new key, nothing is sent again until the next version of Luft.

To set the inbox up:

1. In Pult, create a project named `luft` with one environment, `prod`, and copy that environment's key.
2. From `web/pult`, run `PULT_KEY=<the environment's key> bun run deploy`. This creates the `crashes` inbox.
3. Open the inbox in the console and press the key button next to its name. The address it shows is `https://app.pult.sh/api/clients/<environment>/crashes`; copy the `<environment>` part and the client key (`pultc_…`).
4. Put both into `services/crashes/data/crash-reports.toml`. The next image sends reports.

Rotating the client key in Pult stops every computer from sending at once, so ship an image with the new key first.

## Testing

`kestrel/tools/session.sh capture --only system:crashReports` runs the whole path in a headless session against a stand-in inbox, `kestrel/tools/fixtures/services/pultInbox.ts`, which checks every post against the inbox's own schema. `luft-crash-fixture`, which counts as one of Luft's programs in a development build, crashes with a real segmentation fault and other signals and panics in a worker thread; the check asks, opens What's in it, sends and doesn't send, remembers always and never, keeps a report while the connection is metered and while Pult says to wait, asks once about the same crash, ignores a copy of the fixture outside the build, and crashes Kestrel after an uncaught error to see the script report after it comes back. The system's own `systemd-coredump` records these crashes; the check wakes the collector itself, as `OnSuccess=` would.

`services/crashes/vm/run.sh` checks the installed parts in a VM: the collector's sandbox and bus policy, a crash of a system service through `systemd-coredump` and `OnSuccess=`, a panic waking it through its socket, and a program that isn't Luft's crashing without a report.
