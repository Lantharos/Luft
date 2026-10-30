use std::path::PathBuf;

use luft_identity::permissions::{
    self, BUS, DEVICES, DOWNLOADS, FOLDERS, FULL_ACCESS, NETWORK, NO, READ_ONLY_FOLDERS,
};
use luft_software::apps::appimage;
use zbus::Connection;

use crate::escalate::Asking;

pub struct App {
    pub id: String,
    pub name: String,
    pub image: PathBuf,
    pub chromium: bool,
}

impl App {
    pub fn asking(&self) -> Asking {
        Asking {
            id: self.id.clone(),
            name: self.name.clone(),
        }
    }

    pub fn find(id: &str) -> Result<Self, String> {
        let found = appimage::find(id)?;
        Ok(Self {
            id: found.id,
            name: found.name,
            image: found.path,
            chromium: found.chromium,
        })
    }
}

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Device {
    Usb,
    Serial,
    All,
}

impl Device {
    fn parse(name: &str) -> Option<Self> {
        match name {
            "usb" => Some(Self::Usb),
            "serial" => Some(Self::Serial),
            "all" => Some(Self::All),
            _ => None,
        }
    }
}

/// What you gave the app beyond the sandbox every AppImage gets.
pub struct Grants {
    pub full_access: bool,
    pub folders: Vec<PathBuf>,
    pub read_only_folders: Vec<PathBuf>,
    pub devices: Vec<Device>,
    pub network: bool,
    pub downloads: bool,
    pub bus: Vec<String>,
}

fn existing_folders(paths: Vec<String>) -> Vec<PathBuf> {
    paths
        .into_iter()
        .map(PathBuf::from)
        .filter(|folder| folder.is_absolute() && folder.is_dir())
        .collect()
}

impl Grants {
    pub async fn of(connection: &Connection, id: &str) -> Self {
        let (full_access, folders, read_only_folders, devices, network, downloads, bus) = tokio::join!(
            permissions::allowed(connection, &FULL_ACCESS, id),
            permissions::values(connection, &FOLDERS, id),
            permissions::values(connection, &READ_ONLY_FOLDERS, id),
            permissions::values(connection, &DEVICES, id),
            permissions::values(connection, &NETWORK, id),
            permissions::values(connection, &DOWNLOADS, id),
            permissions::values(connection, &BUS, id),
        );
        Self {
            full_access,
            folders: existing_folders(folders),
            read_only_folders: existing_folders(read_only_folders),
            devices: devices
                .iter()
                .filter_map(|name| Device::parse(name))
                .collect(),
            network: network.first().map(String::as_str) != Some(NO),
            downloads: downloads.first().map(String::as_str) != Some(NO),
            bus,
        }
    }

    pub fn has(&self, device: Device) -> bool {
        self.devices.contains(&device) || self.devices.contains(&Device::All)
    }
}
