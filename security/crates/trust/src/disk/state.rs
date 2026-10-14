use std::path::PathBuf;

use anyhow::Result;
use serde::{Deserialize, Serialize};

use crate::paths;

const FILE: &str = "encryption.json";
pub const MAPPING: &str = "root";

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "lowercase")]
pub enum Mode {
    Tpm,
    Passphrase,
}

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "lowercase")]
pub enum Change {
    Encrypt,
    Decrypt,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Plan {
    pub change: Change,
    pub uuid: String,
    pub partuuid: String,
    pub mode: Mode,
    pub header: Option<String>,
}

impl Plan {
    pub fn load() -> Option<Self> {
        let text = std::fs::read_to_string(paths::state(FILE)).ok()?;
        serde_json::from_str(&text).ok()
    }

    pub fn save(&self) -> Result<()> {
        paths::ensure_private(paths::STATE)?;
        paths::write_private(&paths::state(FILE), serde_json::to_string(self)?.as_bytes())?;
        Ok(())
    }

    pub fn finish() {
        let _ = std::fs::remove_file(paths::state(FILE));
    }

    pub fn header_file(&self) -> Option<PathBuf> {
        let name = self.header.as_ref()?;
        super::stage::folder().ok().map(|folder| folder.join(name))
    }

    pub fn partition(&self) -> PathBuf {
        PathBuf::from(format!("/dev/disk/by-partuuid/{}", self.partuuid))
    }
}
