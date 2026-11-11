//! Turning what the journal holds about a crash into a report, for Luft's
//! own programs only.

use std::path::Path;

use luft_crash_report::{Crash, Details, Kind, Scrubber, program_name, report};
use luft_identity::program;

use crate::accounts::Owner;
use crate::journal::{COREDUMP, Entry, TIME};
use crate::scripts;
use crate::spool::Panicked;
use crate::stack;

const SHELL: &str = "kestrel";
const MICROSECONDS: u64 = 1_000_000;

pub struct Reading<'a> {
    pub scrubber: &'a Scrubber,
    pub boot: &'a str,
    pub scope: Option<&'a str>,
    pub panicked: &'a mut Panicked,
}

impl Reading<'_> {
    /// Whether a crash is one of Luft's programs' own. An installed collector
    /// leaves out programs in containers, whose files aren't the image's; a
    /// development one counts only crashes inside the unit it runs in.
    fn counts(&self, program: &Path, cgroup: Option<&str>, in_container: bool) -> bool {
        program::is_installed_at(program)
            && match self.scope {
                None => !in_container,
                Some(scope) => cgroup.is_some_and(|cgroup| cgroup.starts_with(scope)),
            }
    }

    fn core_dump(&mut self, entry: &Entry) -> Option<(Owner, Crash)> {
        let program = Path::new(entry.get("COREDUMP_EXE")?);
        let in_container = entry.get("COREDUMP_CONTAINER_CMDLINE").is_some();
        if !self.counts(program, entry.get("COREDUMP_CGROUP"), in_container) {
            return None;
        }
        let boot = entry.get("_BOOT_ID")?;
        let pid = entry.number("COREDUMP_PID")?;
        if self.panicked.contains(boot, pid) {
            return None;
        }
        let this_start = boot == self.boot;
        let builds = entry
            .get("COREDUMP_PACKAGE_JSON")
            .map(stack::package_builds)
            .unwrap_or_default();
        let mut frames = stack::of_core_dump(entry.get("MESSAGE")?, &builds);
        if this_start {
            stack::read_missing_builds(
                &mut frames,
                entry.get("COREDUMP_PROC_MAPS").unwrap_or_default(),
            );
        }
        let crashed = entry.number("COREDUMP_TIMESTAMP")?;
        let name = program_name(program);
        let script = (name == SHELL)
            .then(|| scripts::last_before(boot, pid, crashed))
            .flatten();
        let details = Details {
            build: this_start.then(|| stack::build_id(program)).flatten(),
            kind: if script.is_some() {
                Kind::Script
            } else {
                Kind::Signal
            },
            signal: entry.get("COREDUMP_SIGNAL_NAME").map(str::to_owned),
            location: None,
            message: script.as_ref().map(|error| error.message.clone()),
            script: script.map(|error| error.frames).unwrap_or_default(),
            frames,
            program: name,
        };
        let owner = Owner::of(entry.number("COREDUMP_UID")?);
        Some((
            owner,
            Crash {
                at: crashed / MICROSECONDS,
                report: report(details, self.scrubber),
            },
        ))
    }

    /// A panic, of the program the journal saw send it, or when the program
    /// was gone before the journal looked, the one it named, as long as its
    /// build ID matches the file's.
    fn panic(&mut self, entry: &Entry) -> Option<(Owner, Crash)> {
        let program = Path::new(
            entry
                .get("_EXE")
                .or_else(|| entry.get("LUFT_PANIC_PROGRAM"))?,
        );
        if !self.counts(program, entry.get("_SYSTEMD_CGROUP"), false) {
            return None;
        }
        let boot = entry.get("_BOOT_ID")?;
        let build = entry
            .get("LUFT_PANIC_BUILD_ID")
            .filter(|build| *build != "-");
        if boot == self.boot && stack::build_id(program).as_deref() != build {
            return None;
        }
        let at = entry.number(TIME)? / MICROSECONDS;
        self.panicked.add(boot, entry.number("_PID")?, at);
        let details = Details {
            program: program_name(program),
            build: build.map(str::to_owned),
            kind: Kind::Panic,
            signal: None,
            message: entry.get("LUFT_PANIC_MESSAGE").map(str::to_owned),
            location: entry.get("LUFT_PANIC_LOCATION").map(str::to_owned),
            frames: entry
                .get("LUFT_PANIC_FRAMES")
                .map(stack::of_panic)
                .unwrap_or_default(),
            script: Vec::new(),
        };
        Some((
            Owner::of(entry.number("_UID")?),
            Crash {
                at,
                report: report(details, self.scrubber),
            },
        ))
    }

    pub fn read(&mut self, entry: &Entry) -> Option<(Owner, Crash)> {
        if entry.get("MESSAGE_ID") == Some(COREDUMP) {
            self.core_dump(entry)
        } else {
            self.panic(entry)
        }
    }
}
