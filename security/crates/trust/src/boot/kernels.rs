use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use crate::system::command::Tool;

const MODULES: &str = "/usr/lib/modules";

#[derive(Clone, Debug)]
pub struct Kernel {
    pub version: String,
    pub image: PathBuf,
}

impl Kernel {
    pub fn named(version: &str) -> Self {
        Self {
            version: version.to_owned(),
            image: Path::new(MODULES).join(version).join("vmlinuz"),
        }
    }

    pub fn initrd(&self) -> PathBuf {
        PathBuf::from(format!("/boot/initramfs-{}.img", self.version))
    }

    pub fn rebuild_initrd(&self) -> Result<()> {
        Tool::new("dracut")
            .args(["--force", "--quiet", "--kver", &self.version])
            .arg(self.initrd())
            .status()
            .with_context(|| {
                format!(
                    "The startup files for Linux {} couldn't be rebuilt.",
                    self.version
                )
            })
    }
}

pub fn installed() -> Vec<Kernel> {
    let mut kernels: Vec<Kernel> = std::fs::read_dir(MODULES)
        .into_iter()
        .flatten()
        .flatten()
        .map(|entry| Kernel::named(&entry.file_name().to_string_lossy()))
        .filter(|kernel| kernel.image.exists())
        .collect();
    kernels.sort_by(|a, b| a.version.cmp(&b.version));
    kernels
}

pub fn rebuild_all_initrds() -> Result<()> {
    installed().iter().try_for_each(Kernel::rebuild_initrd)
}
