pub mod encoding;
pub mod index;
pub mod listing;
pub mod watch;
pub mod write;

use std::fs::Metadata;
use std::path::Path;
use std::time::UNIX_EPOCH;

use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct Target {
    pub path: String,
}

#[derive(Serialize)]
pub struct Stat {
    size: u64,
    modified: f64,
}

impl Stat {
    pub fn of(metadata: &Metadata) -> Self {
        let modified = metadata
            .modified()
            .ok()
            .and_then(|time| time.duration_since(UNIX_EPOCH).ok())
            .map_or(0.0, |duration| duration.as_secs_f64() * 1000.0);
        Self {
            size: metadata.len(),
            modified,
        }
    }
}

pub fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

pub fn stat(Target { path }: Target) -> Result<Option<Stat>, String> {
    Ok(std::fs::metadata(Path::new(&path))
        .ok()
        .filter(Metadata::is_file)
        .map(|metadata| Stat::of(&metadata)))
}
