use std::path::{Path, PathBuf};

use anyhow::Result;
use serde::{Deserialize, Serialize};

use crate::paths;

const FOLDER: &str = "/var/lib/trustd/drives";
const CHANGING: &str = "/var/lib/trustd/changing";
const DECRYPTING: &str = "/etc/trustd/decrypting";

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "lowercase")]
pub enum Change {
    Encrypt,
    Decrypt,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Record {
    pub uuid: String,
    pub partuuid: Option<String>,
    pub removable: bool,
    pub change: Option<Change>,
    #[serde(default)]
    pub paused: bool,
    #[serde(default)]
    pub auto_unlock: bool,
    pub header: Option<PathBuf>,
}

fn file(uuid: &str) -> PathBuf {
    Path::new(FOLDER).join(format!("{uuid}.json"))
}

impl Record {
    pub fn new(uuid: String, partuuid: Option<String>, removable: bool) -> Self {
        Self {
            uuid,
            partuuid,
            removable,
            change: None,
            paused: false,
            auto_unlock: false,
            header: None,
        }
    }

    pub fn load(uuid: &str) -> Option<Self> {
        serde_json::from_str(&std::fs::read_to_string(file(uuid)).ok()?).ok()
    }

    pub fn all() -> Vec<Self> {
        std::fs::read_dir(FOLDER)
            .into_iter()
            .flatten()
            .flatten()
            .filter_map(|entry| {
                let name = entry.file_name().to_string_lossy().into_owned();
                Self::load(name.strip_suffix(".json")?)
            })
            .collect()
    }

    pub fn save(&self) -> Result<()> {
        paths::ensure_private(FOLDER)?;
        paths::write_private(&file(&self.uuid), serde_json::to_string(self)?.as_bytes())?;
        let marker = Path::new(CHANGING).join(&self.uuid);
        if self.change.is_some() {
            paths::ensure_private(CHANGING)?;
            paths::write_private(&marker, b"")?;
        } else {
            unmark(&marker);
        }
        Ok(())
    }

    pub fn forget(&self) {
        let _ = std::fs::remove_file(file(&self.uuid));
        unmark(&Path::new(CHANGING).join(&self.uuid));
    }

    pub fn mapping(&self) -> String {
        format!("luks-{}", self.uuid)
    }

    pub fn device(&self) -> PathBuf {
        match &self.partuuid {
            Some(partuuid) => Path::new("/dev/disk/by-partuuid").join(partuuid),
            None => Path::new("/dev/disk/by-uuid").join(&self.uuid),
        }
    }

    pub fn present(&self) -> bool {
        self.device().exists()
    }

    pub fn header_file(&self) -> PathBuf {
        Path::new(FOLDER).join(format!("{}.luks", self.uuid))
    }

    pub fn mask(&self) -> Result<()> {
        let Some(partuuid) = &self.partuuid else {
            return Ok(());
        };
        std::fs::create_dir_all(DECRYPTING)?;
        paths::write_private(&Path::new(DECRYPTING).join(partuuid), self.uuid.as_bytes())?;
        Ok(())
    }

    pub fn unmask(&self) {
        if let Some(partuuid) = &self.partuuid {
            let _ = std::fs::remove_file(Path::new(DECRYPTING).join(partuuid));
            let _ = std::fs::remove_dir(DECRYPTING);
        }
    }

    pub fn passphrase_file(&self) -> PathBuf {
        Path::new(FOLDER).join(format!("{}.passphrase", self.uuid))
    }

    pub fn escrow_file(&self) -> PathBuf {
        Path::new(FOLDER).join(format!("{}.recovery-key.cred", self.uuid))
    }
}

fn unmark(marker: &Path) {
    let _ = std::fs::remove_file(marker);
    let _ = std::fs::remove_dir(CHANGING);
}
