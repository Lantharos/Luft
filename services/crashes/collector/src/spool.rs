//! What the collector keeps between runs, in its state folder: where it
//! stopped reading the journal, the processes that panicked lately, and the
//! finished reports waiting for each person and for the system.

use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use anyhow::Context;
use luft_crash_report::Crash;

use crate::accounts::Owner;

const STATE: &str = "STATE_DIRECTORY";
const CURSOR: &str = "cursor";
const PANICKED: &str = "panicked";
const REPORTS: &str = "reports";
const KEEP_PANICKED_SECONDS: u64 = 3600;

fn now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |since| since.as_secs())
}

fn write(path: &Path, contents: &str) -> anyhow::Result<()> {
    let written = path.with_extension("new");
    std::fs::write(&written, contents)?;
    std::fs::rename(&written, path)?;
    Ok(())
}

/// Processes that panicked, so the core dump an aborting panic leaves
/// isn't reported a second time.
#[derive(Default)]
pub struct Panicked(Vec<(String, u64, u64)>);

impl Panicked {
    pub fn contains(&self, boot: &str, pid: u64) -> bool {
        self.0
            .iter()
            .any(|(panicked_boot, panicked_pid, _)| panicked_boot == boot && *panicked_pid == pid)
    }

    pub fn add(&mut self, boot: &str, pid: u64, at: u64) {
        self.0.push((boot.to_owned(), pid, at));
    }
}

pub struct Spool {
    folder: PathBuf,
}

impl Spool {
    pub fn open() -> anyhow::Result<Self> {
        let folder =
            PathBuf::from(std::env::var_os(STATE).context("the collector has no state folder")?);
        std::fs::create_dir_all(folder.join(REPORTS))?;
        Ok(Self { folder })
    }

    pub fn cursor(&self) -> Option<String> {
        std::fs::read_to_string(self.folder.join(CURSOR))
            .ok()
            .map(|cursor| cursor.trim().to_owned())
    }

    pub fn set_cursor(&self, cursor: &str) -> anyhow::Result<()> {
        write(&self.folder.join(CURSOR), cursor)
    }

    pub fn panicked(&self) -> Panicked {
        let kept = std::fs::read_to_string(self.folder.join(PANICKED)).unwrap_or_default();
        let oldest = now().saturating_sub(KEEP_PANICKED_SECONDS);
        Panicked(
            kept.lines()
                .filter_map(|line| {
                    let mut words = line.split_whitespace();
                    Some((
                        words.next()?.to_owned(),
                        words.next()?.parse().ok()?,
                        words.next()?.parse().ok()?,
                    ))
                })
                .filter(|(_, _, at)| *at >= oldest)
                .collect(),
        )
    }

    pub fn set_panicked(&self, panicked: &Panicked) -> anyhow::Result<()> {
        let lines: String = panicked
            .0
            .iter()
            .map(|(boot, pid, at)| format!("{boot} {pid} {at}\n"))
            .collect();
        write(&self.folder.join(PANICKED), &lines)
    }

    /// Keeps a report until its owner takes it. A crash that keeps repeating
    /// is kept once.
    pub fn keep(&self, owner: Owner, crash: &Crash) -> anyhow::Result<()> {
        let folder = self.folder.join(REPORTS).join(owner.folder());
        std::fs::create_dir_all(&folder)?;
        let path = folder.join(format!("{}.json", crash.report.signature));
        if path.exists() {
            return Ok(());
        }
        write(&path, &serde_json::to_string(crash)?)
    }

    /// Hands over and forgets the reports of the person with `uid`, and the
    /// system's, which go to whoever asks first.
    pub fn take(&self, uid: u32) -> Vec<String> {
        [Owner::Person(uid), Owner::System]
            .into_iter()
            .flat_map(|owner| {
                std::fs::read_dir(self.folder.join(REPORTS).join(owner.folder()))
                    .into_iter()
                    .flatten()
            })
            .flatten()
            .map(|file| file.path())
            .filter(|path| {
                path.extension()
                    .is_some_and(|extension| extension == "json")
            })
            .filter_map(|path| {
                let report = std::fs::read_to_string(&path).ok();
                std::fs::remove_file(&path).ok()?;
                report
            })
            .collect()
    }
}
