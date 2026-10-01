use anyhow::Result;
use serde::{Deserialize, Serialize};

use crate::paths;

const FILE: &str = "enrollment.json";
const BOOT_ID: &str = "/proc/sys/kernel/random/boot_id";

#[derive(Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Request {
    pub code: Option<String>,
    pub missed: u32,
    missed_during: String,
}

fn this_boot() -> String {
    std::fs::read_to_string(BOOT_ID)
        .map(|id| id.trim().to_owned())
        .unwrap_or_default()
}

impl Request {
    pub fn load() -> Option<Self> {
        serde_json::from_slice(&std::fs::read(paths::state(FILE)).ok()?).ok()
    }

    pub fn save(&self) -> Result<()> {
        paths::write_private(&paths::state(FILE), &serde_json::to_vec(self)?)?;
        Ok(())
    }

    pub fn forget() {
        let _ = std::fs::remove_file(paths::state(FILE));
    }

    pub fn count_miss(&mut self) {
        self.missed += 1;
        self.missed_during = this_boot();
    }

    pub fn missed_this_boot(&self) -> bool {
        self.missed > 0 && self.missed_during == this_boot()
    }
}
