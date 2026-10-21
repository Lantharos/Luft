use std::path::{Path, PathBuf};

use anyhow::{Result, ensure};
use serde::{Deserialize, Serialize};

use crate::paths;
use crate::system::uuid;

const FILE: &str = "encryption.json";
const WAITING: &str = "encryption-waiting.json";
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
#[serde(deny_unknown_fields)]
pub struct Plan {
    pub change: Change,
    pub uuid: String,
    pub partuuid: String,
    pub mode: Mode,
}

impl Plan {
    pub fn check(&self) -> Result<()> {
        ensure!(
            uuid::is_uuid(&self.uuid) && uuid::is_uuid(&self.partuuid),
            "The encryption plan names its disk in a way Luft never writes"
        );
        Ok(())
    }

    pub fn parse(text: &[u8]) -> Result<Self> {
        let plan: Self = serde_json::from_slice(text)?;
        plan.check()?;
        Ok(plan)
    }

    fn load_from(file: &str) -> Option<Self> {
        Self::parse(&std::fs::read(paths::state(file)).ok()?).ok()
    }

    fn save_to(&self, file: &str) -> Result<()> {
        paths::ensure_private(paths::STATE)?;
        paths::write_private(&paths::state(file), &serde_json::to_vec(self)?)?;
        Ok(())
    }

    pub fn load() -> Option<Self> {
        Self::load_from(FILE)
    }

    pub fn save(&self) -> Result<()> {
        self.save_to(FILE)
    }

    pub fn finish() {
        let _ = std::fs::remove_file(paths::state(FILE));
    }

    pub fn waiting() -> Option<Self> {
        Self::load_from(WAITING)
    }

    pub fn wait(&self) -> Result<()> {
        self.save_to(WAITING)
    }

    pub fn stop_waiting() {
        let _ = std::fs::remove_file(paths::state(WAITING));
    }

    pub fn header_name(&self) -> Option<String> {
        (self.change == Change::Decrypt).then(|| format!("{}.luks", self.uuid))
    }

    pub fn header_in(&self, folder: &Path) -> Option<PathBuf> {
        self.header_name().map(|name| folder.join(name))
    }

    pub fn header_file(&self) -> Option<PathBuf> {
        self.header_in(&super::stage::folder().ok()?)
    }

    pub fn partition(&self) -> PathBuf {
        Path::new("/dev/disk/by-partuuid").join(&self.partuuid)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn plan(uuid: &str, partuuid: &str) -> Vec<u8> {
        format!(r#"{{"change":"decrypt","uuid":"{uuid}","partuuid":"{partuuid}","mode":"tpm"}}"#)
            .into_bytes()
    }

    #[test]
    fn refuses_plans_that_reach_outside_their_folder() {
        let good = "4f68bce3-e8cd-4db1-96e7-fbcaf984b709";
        let parsed = Plan::parse(&plan(good, good)).unwrap();
        assert_eq!(
            parsed.header_in(Path::new("/esp")),
            Some(PathBuf::from(format!("/esp/{good}.luks")))
        );
        assert!(Plan::parse(&plan("../../../etc/shadow", good)).is_err());
        assert!(Plan::parse(&plan(good, "../../run/systemd/system")).is_err());
        assert!(
            Plan::parse(
                br#"{"change":"decrypt","uuid":"4f68bce3-e8cd-4db1-96e7-fbcaf984b709","partuuid":"4f68bce3-e8cd-4db1-96e7-fbcaf984b709","mode":"tpm","header":"../x"}"#
            )
            .is_err()
        );
    }
}
