use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};

use crate::system::firmware::efi;
use crate::system::host::uuid;

const VARIABLE: &str = "MovingSystemDisk";

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "kebab-case")]
pub enum Stage {
    Waiting,
    Copied,
    Failed,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Target {
    pub drive: String,
    pub name: String,
    pub root: String,
    pub esp: String,
    pub startup: Option<String>,
    pub made: Vec<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Request {
    pub stage: Stage,
    pub from: String,
    pub to: Target,
    pub filesystem: String,
    pub encrypted: bool,
    #[serde(default, skip_serializing_if = "String::is_empty")]
    pub reason: String,
}

impl Request {
    fn named_plainly(&self) -> bool {
        uuid::is_partuuid(&self.from)
            && uuid::is_uuid(&self.filesystem)
            && [&self.to.root, &self.to.esp]
                .into_iter()
                .chain(&self.to.startup)
                .chain(&self.to.made)
                .all(|partuuid| uuid::is_partuuid(partuuid))
    }

    pub fn load() -> Option<Self> {
        serde_json::from_slice::<Self>(&efi::luft_variable(VARIABLE)?)
            .ok()
            .filter(Self::named_plainly)
    }

    pub fn save(&self) -> Result<()> {
        efi::set_luft_variable(VARIABLE, Some(&serde_json::to_vec(self)?))
            .context("The firmware didn't keep Luft's request to move")
    }

    pub fn advance(mut self, stage: Stage) -> Result<Self> {
        self.stage = stage;
        self.save()?;
        Ok(self)
    }

    pub fn fail(mut self, reason: String) -> Result<Self> {
        self.reason = reason;
        self.advance(Stage::Failed)
    }

    pub fn forget() -> Result<()> {
        efi::set_luft_variable(VARIABLE, None).context("Luft's request to move couldn't be cleared")
    }
}
