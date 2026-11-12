use std::sync::Mutex;

use luft_identity::program;

use crate::crashes::Reading;
use crate::journal::{self, CURSOR};
use crate::spool::Spool;

const BOOT_ID: &str = "/proc/sys/kernel/random/boot_id";
const OWN_CGROUP: &str = "/proc/self/cgroup";
const SCOPE: &str = ".scope";

pub struct Collector {
    spool: Mutex<Spool>,
    scope: Option<String>,
}

/// The unit a development build runs in, such as a test session's scope:
/// the cgroup path up to its first scope.
fn own_scope() -> Option<String> {
    let cgroup = std::fs::read_to_string(OWN_CGROUP).ok()?;
    let path = cgroup.lines().find_map(|line| line.strip_prefix("0::"))?;
    let end = path.find(SCOPE)? + SCOPE.len();
    Some(path[..end].to_owned())
}

impl Collector {
    pub fn open() -> anyhow::Result<Self> {
        Ok(Self {
            spool: Mutex::new(Spool::open()?),
            scope: program::is_development_build().then(own_scope).flatten(),
        })
    }

    /// Reads what the journal got since last time, keeps a report of each
    /// new crash, and says whether there was any.
    pub fn collect(&self) -> anyhow::Result<bool> {
        let spool = self.spool.lock().expect("the spool is never left poisoned");
        let cursor = spool.cursor();
        let entries = journal::crashes(cursor.as_deref())?;
        let Some(last) = entries.last().and_then(|entry| entry.get(CURSOR)) else {
            if cursor.is_none()
                && let Some(end) = journal::end()?
            {
                spool.set_cursor(&end)?;
            }
            return Ok(false);
        };
        let boot = std::fs::read_to_string(BOOT_ID)
            .unwrap_or_default()
            .trim()
            .replace('-', "");
        let scrubber = luft_crash_report::Scrubber::for_this_computer();
        let mut panicked = spool.panicked();
        let mut reading = Reading {
            scrubber: &scrubber,
            boot: &boot,
            scope: self.scope.as_deref(),
            panicked: &mut panicked,
        };
        let found: Vec<_> = entries
            .iter()
            .filter_map(|entry| reading.read(entry))
            .collect();
        for (owner, crash) in &found {
            spool.keep(*owner, crash)?;
        }
        spool.set_panicked(&panicked)?;
        spool.set_cursor(last)?;
        Ok(!found.is_empty())
    }

    pub fn take(&self, uid: u32) -> Vec<String> {
        self.spool
            .lock()
            .expect("the spool is never left poisoned")
            .take(uid)
    }
}
