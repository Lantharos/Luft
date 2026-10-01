use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use crate::system::blocks;

const MOUNTS: [&str; 3] = ["/boot/efi", "/efi", "/boot"];

pub struct Esp {
    pub path: PathBuf,
    pub disk: String,
    pub partition: u32,
}

pub fn find() -> Result<Esp> {
    let (path, mount) = MOUNTS
        .iter()
        .find_map(|path| {
            blocks::mount_at(path)
                .filter(|mount| mount.fstype == "vfat")
                .map(|mount| (PathBuf::from(path), mount))
        })
        .context("The EFI system partition isn't mounted.")?;
    let name =
        blocks::kernel_name(&mount.source).context("The EFI system partition has no device.")?;
    Ok(Esp {
        path,
        disk: blocks::disk_of(&name).context("The EFI system partition isn't on a disk.")?,
        partition: blocks::partition_number(&name)
            .context("The EFI system partition isn't a partition.")?,
    })
}

impl Esp {
    pub fn file(&self, relative: &str) -> PathBuf {
        self.path.join(relative)
    }

    pub fn shim(&self) -> Option<String> {
        let vendors = std::fs::read_dir(self.path.join("EFI")).ok()?;
        vendors.flatten().find_map(|vendor| {
            let name = vendor.file_name().to_string_lossy().into_owned();
            let shim = vendor.path().join("shimx64.efi");
            (!name.eq_ignore_ascii_case("BOOT") && shim.exists())
                .then(|| format!("\\EFI\\{name}\\shimx64.efi"))
        })
    }
}

pub fn write(path: &Path, contents: &[u8]) -> Result<()> {
    if let Some(folder) = path.parent() {
        std::fs::create_dir_all(folder)?;
    }
    let partial = path.with_extension("partial");
    std::fs::write(&partial, contents)?;
    std::fs::rename(&partial, path)?;
    Ok(())
}
