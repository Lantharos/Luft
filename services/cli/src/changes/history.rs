//! What was changed through luft, with what each setting was before, so the
//! last change can be put back.

use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};
use serde_json::Value as Json;

use crate::failure::{Failure, Outcome};
use crate::settings::catalogue::Setting;
use crate::settings::values;

const KEPT: usize = 100;
const FILE: &str = "luft/history.json";

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Changed {
    pub setting: String,
    pub name: String,
    pub from: Json,
    pub to: Json,
    pub from_words: String,
    pub to_words: String,
}

impl Changed {
    pub fn new(setting: &Setting, from: &Json, to: &Json) -> Self {
        let kind = values::kind(setting).ok();
        let words = |value: &Json| {
            kind.as_ref()
                .map_or_else(|| value.to_string(), |kind| kind.words(value))
        };
        Self {
            setting: setting.id.clone(),
            name: setting.full_name(),
            from: from.clone(),
            to: to.clone(),
            from_words: words(from),
            to_words: words(to),
        }
    }
}

/// How to put one setting back: the exact value a key had, or none when it
/// kept its default, or the setting's own value for settings other services keep.
#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(untagged)]
pub enum Restore {
    Key {
        setting: String,
        key: String,
        own: Option<String>,
    },
    Setting {
        setting: String,
        value: Json,
    },
}

impl Restore {
    pub fn setting(&self) -> &str {
        match self {
            Self::Key { setting, .. } | Self::Setting { setting, .. } => setting,
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Entry {
    pub time: u64,
    pub requester: String,
    pub reviewed: bool,
    #[serde(default)]
    pub undoes: Option<u64>,
    #[serde(default)]
    pub undone: bool,
    pub changes: Vec<Changed>,
    pub restore: Vec<Restore>,
}

impl Entry {
    pub fn new(
        requester: String,
        reviewed: bool,
        changes: Vec<Changed>,
        restore: Vec<Restore>,
    ) -> Self {
        let time = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_or(0, |since| since.as_secs());
        Self {
            time,
            requester,
            reviewed,
            undoes: None,
            undone: false,
            changes,
            restore,
        }
    }
}

fn path() -> Outcome<PathBuf> {
    dirs::state_dir()
        .map(|state| state.join(FILE))
        .ok_or_else(|| Failure::failed("There's no folder to keep luft's history in."))
}

pub fn load() -> Outcome<Vec<Entry>> {
    match std::fs::read_to_string(path()?) {
        Ok(text) => serde_json::from_str(&text)
            .map_err(|error| Failure::failed(format!("luft's history can't be read: {error}"))),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(Vec::new()),
        Err(error) => Err(error.into()),
    }
}

pub fn save(entries: &[Entry]) -> Outcome {
    let path = path()?;
    if let Some(folder) = path.parent() {
        std::fs::create_dir_all(folder)?;
    }
    let kept = &entries[entries.len().saturating_sub(KEPT)..];
    let text =
        serde_json::to_string_pretty(kept).map_err(|error| Failure::failed(error.to_string()))?;
    let partial = path.with_extension("json.partial");
    std::fs::write(&partial, text)?;
    std::fs::rename(partial, path)?;
    Ok(())
}

pub fn record(entry: Entry) -> Outcome {
    if entry.changes.is_empty() {
        return Ok(());
    }
    let mut entries = load()?;
    entries.push(entry);
    save(&entries)
}

/// The newest change that hasn't been put back yet, and isn't itself putting one back.
pub fn last_to_undo(entries: &[Entry]) -> Option<usize> {
    entries
        .iter()
        .rposition(|entry| !entry.undone && entry.undoes.is_none())
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::{Changed, Entry, Restore, last_to_undo};

    fn entry(time: u64, undoes: Option<u64>, undone: bool) -> Entry {
        let changed = Changed {
            setting: "taskbar.size".to_owned(),
            name: "Size".to_owned(),
            from: json!("normal"),
            to: json!("large"),
            from_words: "Medium".to_owned(),
            to_words: "Large".to_owned(),
        };
        let restore = Restore::Key {
            setting: "taskbar.size".to_owned(),
            key: "com.lantharos.kestrel taskbar-size".to_owned(),
            own: None,
        };
        Entry {
            time,
            requester: "bash".to_owned(),
            reviewed: false,
            undoes,
            undone,
            changes: vec![changed],
            restore: vec![restore],
        }
    }

    #[test]
    fn undo_takes_the_newest_change_not_put_back_yet() {
        assert_eq!(
            last_to_undo(&[entry(1, None, false), entry(2, None, false)]),
            Some(1)
        );
        assert_eq!(
            last_to_undo(&[
                entry(1, None, false),
                entry(2, None, true),
                entry(3, Some(2), false)
            ]),
            Some(0)
        );
        assert_eq!(
            last_to_undo(&[entry(1, None, true), entry(2, Some(1), false)]),
            None
        );
    }

    #[test]
    fn keeps_how_to_restore_a_key_that_had_its_default() {
        let restore = Restore::Key {
            setting: "taskbar.size".to_owned(),
            key: "com.lantharos.kestrel taskbar-size".to_owned(),
            own: None,
        };
        let text = serde_json::to_string(&restore).unwrap();
        assert_eq!(serde_json::from_str::<Restore>(&text).unwrap(), restore);
        let system = Restore::Setting {
            setting: "security.developer-tools".to_owned(),
            value: json!(false),
        };
        assert_eq!(
            serde_json::from_str::<Restore>(&serde_json::to_string(&system).unwrap()).unwrap(),
            system
        );
    }
}
