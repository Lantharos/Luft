use std::ops::Deref;
use std::path::Path;

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};

use crate::disk::SystemDisk;
use crate::disk::layout::TopLevel;
use crate::disk::requests::{self, MOVE, Waiting};
use crate::paths;
use crate::system::host::uuid;

const FAILED_BECAUSE: &str = "move-failed-because";

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Stage {
    Waiting,
    Copied,
    Failed,
}

impl Stage {
    fn mark(self) -> &'static str {
        match self {
            Self::Waiting => "",
            Self::Copied => "copied",
            Self::Failed => "failed",
        }
    }

    fn of(mark: &str) -> Option<Self> {
        [Self::Waiting, Self::Copied, Self::Failed]
            .into_iter()
            .find(|stage| stage.mark() == mark)
    }
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
    pub from: String,
    pub to: Target,
    pub filesystem: String,
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

    pub fn save(&self, disk: &SystemDisk) -> Result<()> {
        requests::keep(TopLevel::mount(disk)?.path(), MOVE, self)
            .context("Luft's request to move couldn't be kept")
    }
}

pub struct Asked {
    kept: Waiting<Request>,
    pub stage: Stage,
}

impl Deref for Asked {
    type Target = Request;

    fn deref(&self) -> &Request {
        &self.kept.request
    }
}

impl Asked {
    fn of(kept: Waiting<Request>) -> Option<Self> {
        let stage = Stage::of(&kept.mark)?;
        kept.request.named_plainly().then_some(Self { kept, stage })
    }

    pub fn load() -> Option<Self> {
        Self::of(requests::waiting(&SystemDisk::find().ok()?, MOVE)?)
    }

    pub fn load_in(top: &Path) -> Option<Self> {
        Self::of(requests::waiting_in(top, MOVE)?)
    }

    pub fn advance(&self, stage: Stage) -> Result<()> {
        self.kept.mark(MOVE, stage.mark())
    }

    pub fn fail(&self, reason: &str) -> Result<()> {
        paths::ensure_private(paths::RUNTIME)?;
        paths::write_private(
            &Path::new(paths::RUNTIME).join(FAILED_BECAUSE),
            reason.as_bytes(),
        )?;
        self.advance(Stage::Failed)
    }
}

pub fn failed_because() -> Option<String> {
    std::fs::read_to_string(Path::new(paths::RUNTIME).join(FAILED_BECAUSE)).ok()
}

pub fn forget() -> Result<()> {
    requests::forget(TopLevel::mount(&SystemDisk::find()?)?.path(), MOVE)
        .context("Luft's request to move couldn't be cleared")
}
