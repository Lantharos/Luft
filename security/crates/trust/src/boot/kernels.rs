use std::cmp::Ordering;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use crate::system::command::Tool;

const MODULES: &str = "/usr/lib/modules";
const GRAPHICS: &str = "kernel/drivers/gpu";
const NVIDIA: [&str; 5] = [
    "nvidia",
    "nvidia_drm",
    "nvidia_modeset",
    "nvidia_uvm",
    "nvidia_peermem",
];

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

    fn graphics_drivers(&self) -> Vec<String> {
        let mut drivers: Vec<String> = NVIDIA.iter().map(|name| (*name).to_owned()).collect();
        module_names(
            &Path::new(MODULES).join(&self.version).join(GRAPHICS),
            &mut drivers,
        );
        drivers
    }

    pub fn build_signed_initrd(&self, output: &Path, splash_is_sushi: bool) -> Result<()> {
        let mut dracut = Tool::new("dracut")
            .args(["--force", "--quiet", "--kver", &self.version])
            .arg("--omit-drivers")
            .arg(self.graphics_drivers().join(" "));
        if splash_is_sushi {
            dracut = dracut.args(["--omit", "plymouth"]);
        }
        dracut.arg(output).status().with_context(|| {
            format!(
                "The startup files for Linux {} couldn't be built.",
                self.version
            )
        })
    }
}

fn module_names(folder: &Path, names: &mut Vec<String>) {
    for entry in std::fs::read_dir(folder).into_iter().flatten().flatten() {
        let path = entry.path();
        if path.is_dir() {
            module_names(&path, names);
        } else if let Some((name, _)) = entry.file_name().to_string_lossy().split_once(".ko") {
            names.push(name.replace('-', "_"));
        }
    }
}

fn parts(version: &str) -> Vec<&str> {
    let bytes = version.as_bytes();
    let mut parts = Vec::new();
    let mut start = 0;
    for index in 1..=bytes.len() {
        if index == bytes.len() || bytes[index].is_ascii_digit() != bytes[start].is_ascii_digit() {
            parts.push(&version[start..index]);
            start = index;
        }
    }
    parts
}

pub fn newest_first(a: &str, b: &str) -> Ordering {
    for (left, right) in parts(a).into_iter().zip(parts(b)) {
        let order = match (left.parse::<u64>(), right.parse::<u64>()) {
            (Ok(left), Ok(right)) => left.cmp(&right),
            _ => left.cmp(right),
        };
        if order.is_ne() {
            return order.reverse();
        }
    }
    b.len().cmp(&a.len())
}

pub fn installed() -> Vec<Kernel> {
    let mut kernels: Vec<Kernel> = std::fs::read_dir(MODULES)
        .into_iter()
        .flatten()
        .flatten()
        .map(|entry| Kernel::named(&entry.file_name().to_string_lossy()))
        .filter(|kernel| kernel.image.exists())
        .collect();
    kernels.sort_by(|a, b| newest_first(&a.version, &b.version));
    kernels
}

pub fn rebuild_all_initrds() -> Result<()> {
    installed().iter().try_for_each(Kernel::rebuild_initrd)
}

#[cfg(test)]
mod tests {
    use super::newest_first;

    #[test]
    fn orders_kernel_versions_by_number() {
        let mut versions = vec![
            "7.2.9-300.fc45.x86_64",
            "7.2.10-300.fc45.x86_64",
            "7.2.10-301.fc45.x86_64",
            "6.19.1-200.fc45.x86_64",
        ];
        versions.sort_by(|a, b| newest_first(a, b));
        assert_eq!(
            versions,
            [
                "7.2.10-301.fc45.x86_64",
                "7.2.10-300.fc45.x86_64",
                "7.2.9-300.fc45.x86_64",
                "6.19.1-200.fc45.x86_64",
            ]
        );
    }
}
