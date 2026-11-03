use std::fs;
use std::path::PathBuf;

use chrono::{DateTime, TimeDelta, Utc};
use serde::{Deserialize, Serialize};
use specta::Type;

use super::device;
use super::signed::{self, Age};

const DOCUMENT: &str = "trust/v1/revocations.json";
const OUT_OF_DATE: TimeDelta = TimeDelta::days(7);

#[derive(Deserialize, Serialize, Clone, Copy, PartialEq, Eq, Debug, Type)]
#[serde(rename_all = "lowercase")]
pub enum Severity {
    Block,
    Warn,
}

#[derive(Deserialize, Serialize, Clone)]
#[serde(untagged)]
enum Versions {
    All(AllVersions),
    Some(Vec<String>),
}

#[derive(Deserialize, Serialize, Clone)]
enum AllVersions {
    #[serde(rename = "*")]
    All,
}

#[derive(Deserialize, Serialize, Clone)]
struct Entry {
    app: String,
    versions: Versions,
    action: Severity,
    reason: String,
    note: Option<String>,
}

/// Why an app or one of its versions was pulled or flagged.
#[derive(Serialize, Clone, Type)]
pub struct Block {
    pub action: Severity,
    pub reason: String,
    pub note: Option<String>,
}

#[derive(Deserialize, Serialize)]
pub struct Revocations {
    serial: u64,
    issued: DateTime<Utc>,
    blocked: Vec<Entry>,
}

impl Revocations {
    /// The block on `app`, or on `version` of it when one is given.
    pub fn block(&self, app: &str, version: Option<&str>) -> Option<Block> {
        self.blocked
            .iter()
            .filter(|entry| entry.app.eq_ignore_ascii_case(app))
            .find(|entry| match &entry.versions {
                Versions::All(_) => true,
                Versions::Some(versions) => {
                    version.is_some_and(|version| versions.iter().any(|listed| listed == version))
                }
            })
            .map(|entry| Block {
                action: entry.action,
                reason: entry.reason.clone(),
                note: entry.note.clone(),
            })
    }

    /// Whether the list is too old to rely on, which means this computer has
    /// been offline for a while.
    pub fn out_of_date(&self) -> bool {
        Utc::now() - self.issued > OUT_OF_DATE
    }
}

fn accepted() -> PathBuf {
    device::folder().join("revocations.json")
}

/// The last list Schelf accepted.
pub fn current() -> Option<Revocations> {
    serde_json::from_slice(&fs::read(accepted()).ok()?).ok()
}

/// Fetches the list, accepting it only when it's signed and no older than the
/// one before.
pub fn refresh() -> Result<Revocations, String> {
    let bytes = signed::fetch(DOCUMENT, Age::Current)?;
    let fetched: Revocations = serde_json::from_slice(&bytes).map_err(|error| error.to_string())?;
    if let Some(known) = current()
        && fetched.serial < known.serial
    {
        return Err("schelf.store sent an older list of pulled apps than the one Schelf has.".into());
    }
    luft_app::files::replace(&accepted(), &bytes).map_err(|error| error.to_string())?;
    Ok(fetched)
}

#[cfg(test)]
mod tests {
    use super::{Revocations, Severity};

    #[test]
    fn blocks_the_versions_listed() {
        let list: Revocations = serde_json::from_str(
            r#"{
                "serial": 41,
                "issued": "2026-11-02T10:00:00Z",
                "blocked": [
                    { "app": "com.example.Bad", "versions": "*", "action": "block", "reason": "malware", "note": "Sends your files away." },
                    { "app": "io.github.someone.Tool", "versions": ["2.1.0"], "action": "warn", "reason": "crashes on start" }
                ]
            }"#,
        )
        .unwrap();
        let bad = list.block("com.example.bad", Some("1.0.0")).unwrap();
        assert_eq!(bad.action, Severity::Block);
        assert!(list.block("com.example.Bad", None).is_some());
        let tool = list.block("io.github.someone.Tool", Some("2.1.0")).unwrap();
        assert_eq!(tool.action, Severity::Warn);
        assert!(list.block("io.github.someone.Tool", Some("2.1.1")).is_none());
        assert!(list.block("io.github.someone.Tool", None).is_none());
    }
}
