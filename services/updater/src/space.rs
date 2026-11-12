use std::collections::HashMap;
use std::fs;
use std::os::unix::fs::MetadataExt;
use std::path::Path;

use anyhow::Result;
use serde::Serialize;

use crate::bootc;

const REPOSITORY: &str = "/sysroot/composefs";
const OBJECTS: &str = "objects";
const DEPLOYMENTS: &str = "/sysroot/state/deploy";
const KEY_DIGITS: usize = 32;

#[derive(Clone, Copy)]
enum Holder {
    Running,
    Downloaded,
    Older,
}

/// Bytes on the drive that each version of Luft holds. What several versions share counts
/// toward the running one first, then the downloaded update, so each of the others is what
/// removing it would free. The repository's own records, such as the layers images were made
/// from, count toward the running version, and anything nothing refers to any more is left over
/// from older ones.
#[derive(Serialize, Default)]
pub struct Space {
    running: u64,
    downloaded: u64,
    older: u64,
}

impl Space {
    fn add(&mut self, holder: Holder, bytes: u64) {
        match holder {
            Holder::Running => self.running += bytes,
            Holder::Downloaded => self.downloaded += bytes,
            Holder::Older => self.older += bytes,
        }
    }
}

fn key(id: &str) -> Option<u128> {
    u128::from_str_radix(id.get(..KEY_DIGITS)?, 16).ok()
}

struct Versions {
    images: HashMap<String, Holder>,
    objects: HashMap<u128, Holder>,
}

impl Versions {
    fn of_this_system() -> Result<Self> {
        let host = bootc::host()?;
        let mut versions = Self {
            images: HashMap::new(),
            objects: HashMap::new(),
        };
        for (slot, holder) in [
            ("booted", Holder::Running),
            ("staged", Holder::Downloaded),
            ("rollback", Holder::Older),
        ] {
            let Some(verity) = bootc::verity(&host, slot) else {
                continue;
            };
            versions.images.insert(verity.to_owned(), holder);
            let listed = bootc::image_objects(verity)?;
            let ids = String::from_utf8_lossy(&listed);
            for id in std::iter::once(verity).chain(ids.lines()).filter_map(key) {
                versions.objects.entry(id).or_insert(holder);
            }
        }
        for record in entries(Path::new(REPOSITORY)).filter(|entry| name(entry) != OBJECTS) {
            versions.recorded(&record);
        }
        Ok(versions)
    }

    fn recorded(&mut self, path: &Path) {
        if let Ok(target) = fs::read_link(path) {
            let mut parts = target.iter().rev().filter_map(|part| part.to_str());
            if let (Some(rest), Some(prefix)) = (parts.next(), parts.next())
                && let Some(id) = key(&format!("{prefix}{rest}"))
            {
                self.objects.entry(id).or_insert(Holder::Running);
            }
        } else {
            for entry in entries(path) {
                self.recorded(&entry);
            }
        }
    }

    fn image(&self, name: &str) -> Holder {
        self.images.get(name).copied().unwrap_or(Holder::Older)
    }
}

fn allocated(path: &Path) -> u64 {
    let Ok(metadata) = fs::symlink_metadata(path) else {
        return 0;
    };
    let own = metadata.blocks() * 512;
    if !metadata.is_dir() {
        return own;
    }
    entries(path).map(|entry| allocated(&entry)).sum::<u64>() + own
}

fn entries(path: &Path) -> impl Iterator<Item = std::path::PathBuf> {
    fs::read_dir(path)
        .into_iter()
        .flatten()
        .flatten()
        .map(|entry| entry.path())
}

fn name(path: &Path) -> &str {
    path.file_name()
        .and_then(|name| name.to_str())
        .unwrap_or_default()
}

fn measure_objects(versions: &Versions, folder: &Path, space: &mut Space) {
    for prefix in entries(folder) {
        for object in entries(&prefix) {
            let holder = key(&format!("{}{}", name(&prefix), name(&object)))
                .and_then(|id| versions.objects.get(&id).copied())
                .unwrap_or(Holder::Older);
            space.add(holder, allocated(&object));
        }
        space.add(Holder::Running, allocated_alone(&prefix));
    }
}

fn allocated_alone(path: &Path) -> u64 {
    fs::symlink_metadata(path).map_or(0, |metadata| metadata.blocks() * 512)
}

pub fn measure() -> Result<Space> {
    let versions = Versions::of_this_system()?;
    let mut space = Space::default();
    for entry in entries(Path::new(REPOSITORY)) {
        match name(&entry) {
            OBJECTS => measure_objects(&versions, &entry, &mut space),
            _ => space.add(Holder::Running, allocated(&entry)),
        }
    }
    for deployment in entries(Path::new(DEPLOYMENTS)) {
        space.add(versions.image(name(&deployment)), allocated(&deployment));
    }
    Ok(space)
}
