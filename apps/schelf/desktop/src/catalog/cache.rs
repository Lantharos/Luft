use std::fs;
use std::path::PathBuf;
use std::time::{Duration, SystemTime};

pub fn folder() -> PathBuf {
    dirs::cache_dir()
        .unwrap_or_default()
        .join("com.lantharos.schelf")
}

pub struct Entry(PathBuf);

impl Entry {
    pub fn new(kind: &str, key: &str) -> Self {
        let name: String = key
            .chars()
            .map(|character| {
                if character.is_ascii_alphanumeric() || matches!(character, '.' | '-') {
                    character
                } else {
                    '_'
                }
            })
            .collect();
        Self(folder().join(kind).join(format!("{name}.json")))
    }

    pub fn fresh(&self, age: Duration) -> Option<String> {
        let modified = self
            .0
            .metadata()
            .and_then(|metadata| metadata.modified())
            .ok()?;
        let elapsed = SystemTime::now()
            .duration_since(modified)
            .unwrap_or_default();
        (elapsed < age).then(|| self.stale()).flatten()
    }

    pub fn stale(&self) -> Option<String> {
        fs::read_to_string(&self.0).ok()
    }

    pub fn store(&self, text: &str) {
        let Some(parent) = self.0.parent() else {
            return;
        };
        let staging = self.0.with_extension("part");
        if fs::create_dir_all(parent).is_ok() && fs::write(&staging, text).is_ok() {
            let _ = fs::rename(staging, &self.0);
        }
    }
}
