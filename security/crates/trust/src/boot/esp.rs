use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use crate::disk::SystemDisk;
use crate::paths;
use crate::system::{blocks, efi};

const PRIVATE_MOUNT: &str = "esp";
const MOUNTS: [&str; 5] = [
    "/efi",
    "/boot",
    "/boot/efi",
    "/run/trustd/esp",
    "/run/trustd/xbootldr",
];
const ESP_TYPE: &str = "c12a7328-f81f-11d2-ba4b-00a0c93ec93b";
pub const XBOOTLDR_TYPE: &str = "bc13c2ff-59e6-4262-a352-b275fd6f7172";

pub struct Esp {
    pub path: PathBuf,
    pub name: String,
    pub disk: String,
    pub partition: u32,
}

fn describe(path: &Path, name: String) -> Result<Esp> {
    Ok(Esp {
        path: path.to_owned(),
        disk: blocks::disk_of(&name).context("The EFI system partition isn't on a disk.")?,
        partition: blocks::partition_number(&name)
            .context("The EFI system partition isn't a partition.")?,
        name,
    })
}

pub fn needed_at_startup(name: &str) -> bool {
    blocks::partition_type(name).is_some_and(|kind| kind == ESP_TYPE || kind == XBOOTLDR_TYPE)
}

pub fn on_disk(disk: &str, kind: &str) -> Option<String> {
    blocks::partitions_of(disk)
        .into_iter()
        .find(|name| blocks::partition_type(name).as_deref() == Some(kind))
}

fn started_from() -> Option<String> {
    blocks::kernel_name(&Path::new("/dev/disk/by-partuuid").join(efi::boot_partition()?))
}

fn partition() -> Result<String> {
    let disk = match started_from() {
        Some(name) if blocks::partition_type(&name).as_deref() != Some(XBOOTLDR_TYPE) => {
            return Ok(name);
        }
        Some(xbootldr) => blocks::disk_of(&xbootldr),
        None => blocks::disk_of(&SystemDisk::find()?.partition),
    }
    .context("The disk Luft starts from couldn't be identified.")?;
    on_disk(&disk, ESP_TYPE).context("The disk Luft starts from has no EFI system partition.")
}

pub fn mounted(name: &str) -> Option<PathBuf> {
    MOUNTS
        .iter()
        .map(Path::new)
        .map(Path::to_owned)
        .find(|path| {
            let _ = std::fs::read_dir(path);
            blocks::mount_at(&path.to_string_lossy())
                .and_then(|mount| blocks::kernel_name(&mount.source))
                .is_some_and(|source| source == name)
        })
}

pub fn find() -> Result<Esp> {
    let name = partition()?;
    let path = match mounted(&name) {
        Some(path) => path,
        None => {
            let path = Path::new(paths::RUNTIME).join(PRIVATE_MOUNT);
            paths::ensure_private(&path.to_string_lossy())?;
            blocks::mount_boot_partition(&blocks::device(&name), &path, false)?;
            path
        }
    };
    describe(&path, name)
}

pub fn at(path: &Path) -> Result<Esp> {
    let _ = std::fs::read_dir(path);
    let name = blocks::mount_at(&path.to_string_lossy())
        .filter(|mount| mount.fstype == "vfat")
        .and_then(|mount| blocks::kernel_name(&mount.source))
        .with_context(|| format!("{} isn't an EFI system partition.", path.display()))?;
    describe(path, name)
}

impl Esp {
    pub fn file(&self, relative: &str) -> PathBuf {
        self.path.join(relative)
    }
}
