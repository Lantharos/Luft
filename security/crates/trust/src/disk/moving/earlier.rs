use std::path::Path;

use anyhow::{Context, Result, bail};
use serde::{Deserialize, Serialize};

use super::boot_files::{self, Mounted};
use super::retire;
use crate::boot::options;
use crate::errors::Unsupported;
use crate::paths;

const FILE: &str = "earlier-copy.json";

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Earlier {
    pub drive: String,
    pub root: String,
    pub startup: Option<String>,
    pub esp: String,
    pub esp_only_luft: bool,
    pub size: u64,
}

fn present(partuuid: &str) -> bool {
    Path::new("/dev/disk/by-partuuid").join(partuuid).exists()
}

impl Earlier {
    pub fn load() -> Option<Self> {
        let earlier: Self =
            serde_json::from_slice(&std::fs::read(paths::state(FILE)).ok()?).ok()?;
        if earlier
            .partitions()
            .iter()
            .any(|partuuid| present(partuuid))
        {
            Some(earlier)
        } else {
            let _ = std::fs::remove_file(paths::state(FILE));
            None
        }
    }

    pub fn save(&self) -> Result<()> {
        paths::ensure_private(paths::STATE)?;
        paths::write_private(&paths::state(FILE), &serde_json::to_vec_pretty(self)?)?;
        Ok(())
    }

    pub fn partitions(&self) -> Vec<String> {
        let mut partitions = vec![self.root.clone()];
        partitions.extend(self.startup.clone());
        if self.esp_only_luft {
            partitions.push(self.esp.clone());
        }
        partitions
    }
}

fn started_from_it(esp: &str) -> bool {
    let Some(current) = options::current() else {
        return false;
    };
    options::all()
        .iter()
        .any(|option| option.number == current && option.partition.as_deref() == Some(esp))
}

pub fn remove() -> Result<()> {
    let earlier = Earlier::load().context(Unsupported(
        "Luft's earlier copy is already gone.".to_owned(),
    ))?;
    if started_from_it(&earlier.esp) {
        bail!(Unsupported(
            "This computer started from Luft's earlier copy, so it stays while Luft runs from it."
                .to_owned()
        ));
    }
    boot_files::forget_entries_on(&earlier.esp)?;
    if present(&earlier.esp) {
        let esp = Mounted::partuuid(&earlier.esp, "earlier-esp")?;
        let startup = earlier
            .startup
            .as_deref()
            .filter(|startup| present(startup))
            .map(|startup| Mounted::partuuid(startup, "earlier-startup"))
            .transpose()?;
        boot_files::clear(&esp, startup.as_ref());
    }
    if present(&earlier.root) {
        retire(&Path::new("/dev/disk/by-partuuid").join(&earlier.root));
    }
    Ok(())
}
