use std::path::PathBuf;

use anyhow::Result;
use serde::{Deserialize, Serialize};

use crate::paths;

const FILE: &str = "encryption.json";

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
    pub header: Option<PathBuf>,
    pub boot_uuid: Option<String>,
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

    pub fn mapping(&self) -> String {
        format!("luks-{}", self.uuid)
    }

    pub fn partition(&self) -> PathBuf {
        PathBuf::from(format!("/dev/disk/by-partuuid/{}", self.partuuid))
    }
}

const CRYPTTAB: &str = "/etc/crypttab";

pub fn set_crypttab(name: &str, entry: Option<String>) -> Result<()> {
    let existing = std::fs::read_to_string(CRYPTTAB).unwrap_or_default();
    let mut lines: Vec<String> = existing
        .lines()
        .filter(|line| line.split_whitespace().next() != Some(name))
        .map(str::to_owned)
        .collect();
    lines.extend(entry);
    let text = if lines.is_empty() {
        String::new()
    } else {
        lines.join("\n") + "\n"
    };
    paths::write_private(std::path::Path::new(CRYPTTAB), text.as_bytes())?;
    std::fs::set_permissions(
        CRYPTTAB,
        std::os::unix::fs::PermissionsExt::from_mode(0o600),
    )?;
    Ok(())
}
