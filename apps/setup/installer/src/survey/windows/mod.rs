mod hints;
mod keyboards;
mod registry;
#[cfg(test)]
mod tests;
mod volume;
mod zones;

use std::io::{Read, Seek};

use anyhow::Result;
use serde::Serialize;

use registry::Registry;
use volume::Volume;

const SYSTEM_HIVE: &str = r"Windows\System32\config\SYSTEM";
const SOFTWARE_HIVE: &str = r"Windows\System32\config\SOFTWARE";
const HIBERNATION_FILE: &str = "hiberfil.sys";
const CURRENT_VERSION: &str = r"Microsoft\Windows NT\CurrentVersion";
const FIRST_WINDOWS_11_BUILD: u32 = 22000;

pub struct Windows {
    pub version: Option<String>,
    pub hibernated: bool,
    pub fast_startup: bool,
    pub dirty: bool,
    pub used: u64,
    pub hints: Hints,
}

#[derive(Serialize, Default, Clone, Debug, PartialEq)]
pub struct Hints {
    pub timezone: Option<String>,
    pub keyboard: Option<Keyboard>,
    pub locale: Option<String>,
}

#[derive(Serialize, Clone, Debug, PartialEq)]
pub struct Keyboard {
    pub layout: String,
    pub variant: String,
}

pub fn inspect<R: Read + Seek>(volume: R) -> Result<Option<Windows>> {
    let mut volume = Volume::open(volume)?;
    let Some(system) = volume.read(SYSTEM_HIVE)? else {
        return Ok(None);
    };
    let system = Registry::new(&system)?;
    let control_set = system
        .dword("Select", "Current")?
        .map(|current| format!("ControlSet{current:03}"));

    let fast_startup = match &control_set {
        Some(control_set) => {
            let power = format!(r"{control_set}\Control\Session Manager\Power");
            system.dword(&power, "HiberbootEnabled")? == Some(1)
        }
        None => false,
    };

    Ok(Some(Windows {
        version: version(&mut volume)?,
        hibernated: hibernated(&mut volume)?,
        fast_startup,
        dirty: volume.dirty()?,
        used: volume.used()?,
        hints: hints::gather(&mut volume, &system, control_set.as_deref())?,
    }))
}

fn version<R: Read + Seek>(volume: &mut Volume<R>) -> Result<Option<String>> {
    let Some(software) = volume.read(SOFTWARE_HIVE)? else {
        return Ok(None);
    };
    let software = Registry::new(&software)?;
    let Some(product) = software.string(CURRENT_VERSION, "ProductName")? else {
        return Ok(None);
    };
    let build = software
        .string(CURRENT_VERSION, "CurrentBuildNumber")?
        .and_then(|build| build.trim().parse::<u32>().ok());
    Ok(Some(match build {
        Some(build) if build >= FIRST_WINDOWS_11_BUILD => {
            product.replacen("Windows 10", "Windows 11", 1)
        }
        _ => product,
    }))
}

fn hibernated<R: Read + Seek>(volume: &mut Volume<R>) -> Result<bool> {
    let Some(header) = volume.read_limited(HIBERNATION_FILE, 4)? else {
        return Ok(false);
    };
    Ok(match header.as_slice() {
        [0, 0, 0, 0] => false,
        signature @ [_, _, _, _] => !signature.eq_ignore_ascii_case(b"wake"),
        _ => false,
    })
}
