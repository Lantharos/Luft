use std::fs::File;
use std::io::ErrorKind;
use std::path::Path;

use anyhow::Result;
use rustix::fs::{FlockOperation, flock};
use serde::{Deserialize, Serialize};

use super::plan::Step;
use crate::paths;

const FILE: &str = "system-disk.json";
const LOCK: &str = "system-disk.lock";

#[derive(Serialize, Deserialize)]
pub struct Journal {
    pub drive: String,
    pub steps: Vec<Step>,
    pub next: usize,
    pub attempts: u32,
}

impl Journal {
    pub fn new(drive: String, steps: Vec<Step>) -> Self {
        Self {
            drive,
            steps,
            next: 0,
            attempts: 0,
        }
    }

    pub fn load() -> Option<Self> {
        serde_json::from_slice(&std::fs::read(paths::state(FILE)).ok()?).ok()
    }

    pub fn save(&self) -> Result<()> {
        paths::ensure_private(paths::STATE)?;
        paths::write_private(&paths::state(FILE), &serde_json::to_vec_pretty(self)?)?;
        Ok(())
    }

    pub fn finish() {
        let _ = std::fs::remove_file(paths::state(FILE));
    }
}

pub struct Working {
    _held: File,
}

impl Working {
    fn take(operation: FlockOperation) -> std::io::Result<Self> {
        paths::ensure_private(paths::RUNTIME)?;
        let file = File::create(Path::new(paths::RUNTIME).join(LOCK))?;
        flock(&file, operation)?;
        Ok(Self { _held: file })
    }

    pub fn wait() -> Result<Self> {
        Ok(Self::take(FlockOperation::LockExclusive)?)
    }

    pub fn try_take() -> Result<Option<Self>> {
        match Self::take(FlockOperation::NonBlockingLockExclusive) {
            Ok(working) => Ok(Some(working)),
            Err(error) if error.kind() == ErrorKind::WouldBlock => Ok(None),
            Err(error) => Err(error.into()),
        }
    }
}
