use std::collections::HashMap;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result, bail};

use crate::errors::Unsupported;
use crate::system::blocks;
use crate::system::command::Tool;

const SYSTEM_MOUNTS: &[&str] = &[
    "/",
    "/boot",
    "/boot/efi",
    "/efi",
    "/home",
    "/usr",
    "/var",
    "/sysroot",
];
const STARTUP_TYPES: &[&str] = &[
    "c12a7328-f81f-11d2-ba4b-00a0c93ec93b",
    "bc13c2ff-59e6-4262-a352-b275fd6f7172",
];

pub struct Target {
    pub name: String,
    pub device: PathBuf,
    pub disk: String,
    pub number: Option<u32>,
    pub partuuid: Option<String>,
    pub removable: bool,
    pub probe: HashMap<String, String>,
}

fn class(name: &str) -> PathBuf {
    Path::new("/sys/class/block").join(name)
}

fn probe(device: &Path) -> HashMap<String, String> {
    Tool::new("blkid")
        .args(["-p", "-o", "export"])
        .arg(device)
        .output()
        .unwrap_or_default()
        .lines()
        .filter_map(|line| line.split_once('='))
        .map(|(key, value)| (key.to_owned(), value.to_owned()))
        .collect()
}

fn removable(disk: &str) -> bool {
    let flagged =
        std::fs::read_to_string(class(disk).join("removable")).is_ok_and(|flag| flag.trim() == "1");
    let usb = std::fs::canonicalize(class(disk)).is_ok_and(|path| {
        path.components()
            .any(|part| part.as_os_str().to_string_lossy().starts_with("usb"))
    });
    flagged || usb
}

fn fstab_mounts() -> Vec<(String, String)> {
    std::fs::read_to_string("/etc/fstab")
        .unwrap_or_default()
        .lines()
        .filter(|line| !line.trim_start().starts_with('#'))
        .filter_map(|line| {
            let mut fields = line.split_whitespace();
            Some((fields.next()?.to_owned(), fields.next()?.to_owned()))
        })
        .collect()
}

impl Target {
    pub fn find(device: &str) -> Result<Self> {
        let path = Path::new(device);
        if !device.starts_with("/dev/") {
            bail!(Unsupported("That isn't a drive.".to_owned()));
        }
        let name = blocks::kernel_name(path).context("The drive couldn't be found.")?;
        if !class(&name).exists() {
            bail!(Unsupported("The drive couldn't be found.".to_owned()));
        }
        if blocks::dm_uuid(&name).is_some() {
            bail!(Unsupported(
                "Choose the partition itself rather than what's inside it.".to_owned()
            ));
        }
        let number = blocks::partition_number(&name);
        let disk = if number.is_some() {
            blocks::disk_of(&name).context("The drive holding the partition couldn't be found.")?
        } else {
            name.clone()
        };
        Ok(Self {
            device: blocks::device(&name),
            partuuid: blocks::partuuid(&name),
            removable: removable(&disk),
            probe: probe(&blocks::device(&name)),
            name,
            disk,
            number,
        })
    }

    pub fn size(&self) -> u64 {
        blocks::size_bytes(&self.name)
    }

    pub fn field(&self, key: &str) -> &str {
        self.probe.get(key).map_or("", String::as_str)
    }

    pub fn filesystem(&self) -> &str {
        self.field("TYPE")
    }

    pub fn encrypted(&self) -> bool {
        self.filesystem() == "crypto_LUKS"
    }

    pub fn holders(&self) -> Vec<String> {
        std::fs::read_dir(class(&self.name).join("holders"))
            .into_iter()
            .flatten()
            .flatten()
            .map(|entry| entry.file_name().to_string_lossy().into_owned())
            .collect()
    }

    pub fn mounted(&self) -> bool {
        std::fs::read_to_string("/proc/self/mountinfo")
            .unwrap_or_default()
            .lines()
            .filter_map(|line| {
                line.split(" - ")
                    .nth(1)?
                    .split(' ')
                    .nth(1)
                    .map(str::to_owned)
            })
            .any(|source| {
                blocks::kernel_name(Path::new(&source)).as_deref() == Some(self.name.as_str())
            })
    }

    fn swap(&self) -> bool {
        std::fs::read_to_string("/proc/swaps")
            .unwrap_or_default()
            .lines()
            .skip(1)
            .filter_map(|line| line.split_whitespace().next())
            .any(|source| {
                blocks::kernel_name(Path::new(source)).as_deref() == Some(self.name.as_str())
            })
    }

    fn needed_at_startup(&self) -> bool {
        if STARTUP_TYPES.contains(&self.field("PART_ENTRY_TYPE").to_lowercase().as_str()) {
            return true;
        }
        let names = [
            format!("UUID={}", self.field("UUID")),
            format!("PARTUUID={}", self.partuuid.clone().unwrap_or_default()),
            self.device.display().to_string(),
        ];
        fstab_mounts().iter().any(|(source, point)| {
            names.contains(source) && (SYSTEM_MOUNTS.contains(&point.as_str()) || point == "none")
        })
    }

    pub fn in_use_by_system(&self) -> Option<&'static str> {
        if self.swap() {
            Some("The system uses it for swap.")
        } else if self.needed_at_startup() {
            Some("The computer needs it to start, so it can't be encrypted here.")
        } else if self.holders().iter().any(|holder| {
            !holder.starts_with("dm-")
                || blocks::dm_uuid(holder).is_none_or(|uuid| !uuid.starts_with("CRYPT-"))
        }) {
            Some("Something else is built on it, such as LVM or RAID.")
        } else {
            None
        }
    }

    pub fn require_unused(&self) -> Result<()> {
        if let Some(reason) = self.in_use_by_system() {
            bail!(Unsupported(reason.to_owned()));
        }
        if self.mounted() {
            bail!(Unsupported("Unmount it first.".to_owned()));
        }
        Ok(())
    }

    pub fn active_mapping(&self) -> Option<String> {
        self.holders()
            .into_iter()
            .find(|holder| blocks::dm_uuid(holder).is_some_and(|uuid| uuid.starts_with("CRYPT-")))
            .and_then(|holder| blocks::dm_name(&holder))
    }
}
