use std::cmp::Ordering;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use crate::system::command::Tool;

const MODULES: &str = "/usr/lib/modules";
const OUT_OF_TREE: [&str; 2] = ["extra", "updates"];
const NEVER_EARLY: &str = "nouveau nova_core nova_drm";

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

    /// Modules installed for this kernel outside the kernel package, such as NVIDIA's, which change without
    /// the kernel changing: each one's path, size and modification time.
    pub fn added_modules(&self) -> String {
        let mut files = Vec::new();
        for folder in OUT_OF_TREE {
            module_files(
                &Path::new(MODULES).join(&self.version).join(folder),
                &mut files,
            );
        }
        files.sort();
        files.join("\n")
    }

    pub fn build_signed_initrd(&self, output: &Path, splash_is_sushi: bool) -> Result<()> {
        let mut dracut = Tool::new("dracut")
            .args(["--force", "--quiet", "--kver", &self.version])
            .args(["--omit-drivers", NEVER_EARLY]);
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

fn module_files(folder: &Path, files: &mut Vec<String>) {
    for entry in std::fs::read_dir(folder).into_iter().flatten().flatten() {
        let path = entry.path();
        let Ok(metadata) = entry.metadata() else {
            continue;
        };
        if metadata.is_dir() {
            module_files(&path, files);
        } else if entry.file_name().to_string_lossy().contains(".ko") {
            let modified = metadata
                .modified()
                .ok()
                .and_then(|time| time.duration_since(std::time::UNIX_EPOCH).ok())
                .unwrap_or_default();
            files.push(format!(
                "{} {} {}",
                path.display(),
                metadata.len(),
                modified.as_nanos()
            ));
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
