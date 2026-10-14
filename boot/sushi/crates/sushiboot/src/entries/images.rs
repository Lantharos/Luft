use alloc::format;
use alloc::string::String;
use alloc::vec::Vec;
use core::cmp::Ordering;

use super::pe::{self, Uki};
use super::{Action, BootEntry, Catalog, Origin, Release, Row, newest_first};
use crate::files::Volume;

const IMAGES: &str = "\\EFI\\Linux";

pub struct Image {
    origin: Origin,
    path: String,
    name: String,
    sort_key: Option<String>,
    uki: Uki,
}

impl Image {
    pub fn open(
        volume: &mut Volume,
        origin: &Origin,
        path: String,
        name: String,
        sort_key: Option<String>,
    ) -> Option<Self> {
        let uki = pe::uki(&mut volume.file(&path)?)?;
        Some(Self {
            origin: origin.clone(),
            path,
            name,
            sort_key,
            uki,
        })
    }

    fn version(&self) -> &str {
        self.uki
            .version
            .as_deref()
            .unwrap_or(self.name.trim_end_matches(".efi"))
    }

    fn release(&self) -> String {
        match (&self.uki.name, &self.uki.image_version) {
            (Some(name), Some(version)) => format!("{name} {version}"),
            _ => format!("Linux {}", self.version()),
        }
    }

    fn order(&self, other: &Self) -> Ordering {
        match (&self.sort_key, &other.sort_key) {
            (Some(ours), Some(theirs)) => ours.cmp(theirs),
            _ => newest_first(self.version(), other.version()),
        }
    }

    fn entry(&self, profile: usize, title: String) -> BootEntry {
        let id = match self.uki.profiles.get(profile) {
            Some(details) => match &details.id {
                Some(name) => format!("{}@{name}", self.name),
                None => format!("{}@{profile}", self.name),
            },
            None => self.name.clone(),
        };
        let options = match profile {
            0 => String::new(),
            profile => format!("@{profile}"),
        };
        BootEntry {
            id: self.origin.id(&id),
            title: self.origin.title(&title),
            volume: self.origin.handle,
            action: Action::Efi {
                path: self.path.clone(),
                options,
            },
            release: (profile == 0).then(|| Release {
                os: self.uki.os.clone(),
                version: self
                    .uki
                    .image_version
                    .clone()
                    .unwrap_or_else(|| self.version().into()),
            }),
        }
    }
}

pub fn scan(volume: &mut Volume, origin: &Origin) -> Vec<Image> {
    volume
        .list(IMAGES)
        .into_iter()
        .filter(|listed| !listed.directory && listed.name.to_ascii_lowercase().ends_with(".efi"))
        .filter_map(|listed| {
            let path = format!("{IMAGES}\\{}", listed.name);
            Image::open(volume, origin, path, listed.name, None)
        })
        .collect()
}

pub fn add(catalog: &mut Catalog, mut images: Vec<Image>) {
    images.sort_by(Image::order);
    let mut systems: Vec<&str> = images.iter().map(|image| image.uki.os.as_str()).collect();
    systems.sort_unstable();
    systems.dedup();
    let several = systems.len() > 1;
    let mut listed: Vec<&str> = Vec::new();
    for image in &images {
        let newest = !listed.contains(&image.uki.os.as_str());
        let name = image.uki.name.as_deref();
        let title = if newest {
            name.map_or_else(|| image.release(), String::from)
        } else if several
            && image.uki.image_version.is_none()
            && let Some(name) = name
        {
            format!("{name}, {}", image.release())
        } else {
            image.release()
        };
        let main = catalog.push(image.entry(0, title));
        if newest {
            listed.push(&image.uki.os);
            catalog.main.push(Row::Entry(main));
        } else {
            catalog.previous.push(main);
        }
        for (profile, details) in image.uki.profiles.iter().enumerate().skip(1) {
            let title = details.title.clone().unwrap_or_default();
            let index = catalog.push(image.entry(profile, title));
            if newest && details.title.is_some() {
                catalog.main.push(Row::Entry(index));
            }
        }
    }
    if !catalog.previous.is_empty() {
        catalog.main.push(Row::Previous);
    }
}
