use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use crate::paths;
use crate::system::command::Tool;
use crate::system::{blocks, efi};

const MOUNTS: [&str; 3] = ["/efi", "/boot", "/boot/efi"];
const PRIVATE_MOUNT: &str = "esp";

pub struct Esp {
    pub path: PathBuf,
    pub disk: String,
    pub partition: u32,
}

fn vfat_at(path: &Path) -> Option<blocks::Mount> {
    let _ = std::fs::read_dir(path);
    blocks::mount_at(&path.to_string_lossy()).filter(|mount| mount.fstype == "vfat")
}

fn describe(path: &Path, device: &Path) -> Result<Esp> {
    let name = blocks::kernel_name(device).context("The EFI system partition has no device.")?;
    Ok(Esp {
        path: path.to_owned(),
        disk: blocks::disk_of(&name).context("The EFI system partition isn't on a disk.")?,
        partition: blocks::partition_number(&name)
            .context("The EFI system partition isn't a partition.")?,
    })
}

fn mount_the_one_started_from() -> Result<Esp> {
    let partuuid = efi::boot_partition().context("The EFI system partition isn't mounted.")?;
    let device = Path::new("/dev/disk/by-partuuid").join(partuuid);
    let path = Path::new(paths::RUNTIME).join(PRIVATE_MOUNT);
    paths::ensure_private(&path.to_string_lossy())?;
    if vfat_at(&path).is_none() {
        Tool::new("mount").arg(&device).arg(&path).status()?;
    }
    describe(&path, &device)
}

pub fn find() -> Result<Esp> {
    match MOUNTS
        .iter()
        .map(Path::new)
        .find_map(|path| Some((path, vfat_at(path)?)))
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
