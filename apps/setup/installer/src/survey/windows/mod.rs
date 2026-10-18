mod hints;
#[cfg(test)]
mod tests;

use std::io::{Read, Seek};

use anyhow::Result;
use luft_meet::regional::Hints;
use luft_windows::bluetooth::{self, Pairing};
use luft_windows::{Installation, Volume, settled};

pub struct Windows {
    pub version: Option<String>,
    pub hibernated: bool,
    pub fast_startup: bool,
    pub universal_clock: bool,
    pub dirty: bool,
    pub used: u64,
    pub bluetooth: Vec<Pairing>,
    pub hints: Hints,
}

pub fn inspect<R: Read + Seek>(volume: R) -> Result<Option<Windows>> {
    let mut volume = Volume::open(volume)?;
    let Some(installation) = Installation::read(&mut volume)? else {
        return Ok(None);
    };
    let system = installation.system()?;
    let bluetooth = if settled(&installation.system_hive) && !installation.hibernated {
        bluetooth::pairings(&system)?
    } else {
        Vec::new()
    };
    Ok(Some(Windows {
        fast_startup: system.fast_startup()?,
        universal_clock: system.universal_clock()?,
        hints: hints::gather(&mut volume, &system)?,
        bluetooth,
        version: installation.version,
        hibernated: installation.hibernated,
        dirty: installation.dirty,
        used: installation.used,
    }))
}
