use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use crate::paths;
use crate::system::{blocks, efi};

const MOUNTS: [&str; 3] = ["/efi", "/boot", "/boot/efi"];
const PRIVATE_MOUNT: &str = "esp";
const ESP_TYPE: &str = "c12a7328-f81f-11d2-ba4b-00a0c93ec93b";

pub struct Esp {
    pub path: PathBuf,
    pub name: String,
    pub disk: String,
    pub partition: u32,
}

fn vfat_at(path: &Path) -> Option<blocks::Mount> {
    let _ = std::fs::read_dir(path);
    blocks::mount_at(&path.to_string_lossy()).filter(|mount| mount.fstype == "vfat")
}

fn is_esp(mount: &blocks::Mount) -> bool {
    blocks::kernel_name(&mount.source)
        .and_then(|name| blocks::partition_type(&name))
        .is_some_and(|kind| kind == ESP_TYPE)
}

fn describe(path: &Path, device: &Path) -> Result<Esp> {
    let name = blocks::kernel_name(device).context("The EFI system partition has no device.")?;
    Ok(Esp {
        path: path.to_owned(),
        disk: blocks::disk_of(&name).context("The EFI system partition isn't on a disk.")?,
        partition: blocks::partition_number(&name)
            .context("The EFI system partition isn't a partition.")?,
        name,
    })
}

fn mount_the_one_started_from() -> Result<Esp> {
    let partuuid = efi::boot_partition().context("The EFI system partition isn't mounted.")?;
    let device = Path::new("/dev/disk/by-partuuid").join(partuuid);
    let path = Path::new(paths::RUNTIME).join(PRIVATE_MOUNT);
    paths::ensure_private(&path.to_string_lossy())?;
    if vfat_at(&path).is_none() {
        blocks::mount_boot_partition(&device, &path, false)?;
    }
    describe(&path, &device)
}

pub fn find() -> Result<Esp> {
    match MOUNTS
        .iter()
        .map(Path::new)
        .find_map(|path| Some((path, vfat_at(path).filter(is_esp)?)))
    {
        Some((path, mount)) => describe(path, &mount.source),
        None => mount_the_one_started_from(),
    }
}

pub fn at(path: &Path) -> Result<Esp> {
    let mount = vfat_at(path)
        .with_context(|| format!("{} isn't an EFI system partition.", path.display()))?;
    describe(path, &mount.source)
}

impl Esp {
    pub fn file(&self, relative: &str) -> PathBuf {
        self.path.join(relative)
    }
}
