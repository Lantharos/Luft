use std::path::{Path, PathBuf};

use anyhow::{Result, bail};

use super::esp::Esp;
use super::kernels::{self, Kernel};
use super::tries::{self, Tries};

const FOLDER: &str = "EFI/Linux";
const PREFIX: &str = "luft-";
const SUFFIX: &str = ".efi";
const HEADROOM: u64 = 4 << 20;
pub const KEPT: usize = 3;

pub struct Image {
    pub version: String,
    pub path: PathBuf,
    pub tries: Option<Tries>,
}

pub fn name(version: &str) -> String {
    format!("{PREFIX}{version}{SUFFIX}")
}

pub fn version_of(name: &str) -> Option<&str> {
    name.strip_prefix(PREFIX)?.strip_suffix(SUFFIX)
}

fn file_name(version: &str, tries: Option<Tries>) -> String {
    match tries {
        Some(tries) => format!("{PREFIX}{version}{}{SUFFIX}", tries.counter()),
        None => name(version),
    }
}

pub fn untried(esp: &Esp, version: &str) -> PathBuf {
    esp.file(FOLDER)
        .join(file_name(version, Some(Tries::untried())))
}

pub fn current(esp: &Esp, version: &str) -> PathBuf {
    find(esp, version).map_or_else(|| untried(esp, version), |image| image.path)
}

pub fn present(esp: &Esp) -> Vec<Image> {
    let mut images: Vec<Image> = std::fs::read_dir(esp.file(FOLDER))
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|entry| {
            let file = entry.file_name().to_string_lossy().into_owned();
            let (version, tries) = tries::split(version_of(&file)?);
            Some(Image {
                version: version.to_owned(),
                path: entry.path(),
                tries,
            })
        })
        .collect();
    images.sort_by(|a, b| kernels::newest_first(&a.version, &b.version));
    images
}

pub fn find(esp: &Esp, version: &str) -> Option<Image> {
    present(esp)
        .into_iter()
        .find(|image| image.version == version)
}

pub fn wanted() -> Vec<Kernel> {
    kernels::installed().into_iter().take(KEPT).collect()
}

fn size(path: &Path) -> u64 {
    std::fs::metadata(path).map_or(0, |metadata| metadata.len())
}

pub fn estimate(kernel: &Kernel, initrd: &Path) -> u64 {
    size(&kernel.image) + size(initrd) + HEADROOM
}

fn free(esp: &Esp) -> u64 {
    rustix::fs::statvfs(&esp.path).map_or(0, |space| space.f_bavail * space.f_frsize)
}

pub fn room_for(esp: &Esp, needed: u64) -> bool {
    let present: u64 = present(esp).iter().map(|image| size(&image.path)).sum();
    free(esp) + present >= needed
}

fn remove_unfinished(esp: &Esp) {
    for entry in std::fs::read_dir(esp.file(FOLDER))
        .into_iter()
        .flatten()
        .flatten()
    {
        let name = entry.file_name().to_string_lossy().into_owned();
        if name.starts_with(PREFIX) && name.ends_with(".partial") {
            let _ = std::fs::remove_file(entry.path());
        }
    }
}

pub fn make_room(esp: &Esp, version: &str, needed: u64) -> Result<()> {
    remove_unfinished(esp);
    while free(esp) < needed {
        let present = present(esp);
        let newest = present.first().map(|image| image.version.as_str());
        let replaces_newest =
            newest.is_none_or(|newest| kernels::newest_first(version, newest).is_le());
        let Some(removable) = present
            .iter()
            .find(|image| image.version == version)
            .or_else(|| {
                present.iter().rev().find(|image| {
                    image.version != version
                        && (replaces_newest || Some(image.version.as_str()) != newest)
                })
            })
        else {
            bail!("The EFI system partition is too full for the signed startup files.");
        };
        std::fs::remove_file(&removable.path)?;
    }
    Ok(())
}

pub fn keep_only(esp: &Esp, kept: &[Kernel]) {
    for image in present(esp) {
        if !kept.iter().any(|kernel| kernel.version == image.version) {
            let _ = std::fs::remove_file(image.path);
        }
    }
}

pub fn remove(esp: &Esp, version: &str) {
    remove_except(esp, version, None);
}

pub fn remove_except(esp: &Esp, version: &str, kept: Option<&Path>) {
    for image in present(esp) {
        if image.version == version && Some(image.path.as_path()) != kept {
            let _ = std::fs::remove_file(image.path);
        }
    }
}

pub fn set_tries(image: &Image, tries: Option<Tries>) -> Result<()> {
    let renamed = image.path.with_file_name(file_name(&image.version, tries));
    std::fs::rename(&image.path, renamed)?;
    Ok(())
}
