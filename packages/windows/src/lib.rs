pub mod bluetooth;
pub mod change;
mod registry;
mod system;
#[cfg(any(test, feature = "testing"))]
pub mod testing;
mod volume;

use std::io::{Read, Seek};

use anyhow::Result;

pub use registry::Registry;
pub use system::{SYSTEM_HIVE, System, settled};
pub use volume::Volume;

const SOFTWARE_HIVE: &str = r"Windows\System32\config\SOFTWARE";
const HIBERNATION_FILE: &str = "hiberfil.sys";
const CURRENT_VERSION: &str = r"Microsoft\Windows NT\CurrentVersion";
const FIRST_WINDOWS_11_BUILD: u32 = 22000;

pub struct Installation {
    pub version: Option<String>,
    pub hibernated: bool,
    pub dirty: bool,
    pub used: u64,
    pub system_hive: Vec<u8>,
}

impl Installation {
    pub fn read<R: Read + Seek>(volume: &mut Volume<R>) -> Result<Option<Self>> {
        let Some(system_hive) = volume.read(SYSTEM_HIVE)? else {
            return Ok(None);
        };
        Ok(Some(Self {
            version: version(volume)?,
            hibernated: hibernated(volume)?,
            dirty: volume.dirty()?,
            used: volume.used()?,
            system_hive,
        }))
    }

    pub fn system(&self) -> Result<System<'_>> {
        System::new(&self.system_hive)
    }
}

pub fn is_windows<R: Read + Seek>(volume: &mut Volume<R>) -> Result<bool> {
    Ok(volume.read_limited(SYSTEM_HIVE, 0)?.is_some())
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

pub fn hibernated<R: Read + Seek>(volume: &mut Volume<R>) -> Result<bool> {
    let Some(header) = volume.read_limited(HIBERNATION_FILE, 4)? else {
        return Ok(false);
    };
    Ok(match header.as_slice() {
        [0, 0, 0, 0] => false,
        signature @ [_, _, _, _] => !signature.eq_ignore_ascii_case(b"wake"),
        _ => false,
    })
}
