use alloc::format;
use alloc::string::String;
use alloc::vec::Vec;

use super::pe::{self, Uki};
use super::tries::{self, Tries};
use super::{Action, BootEntry, Catalog, Origin, Row, newest_first};
use crate::files::Volume;

const IMAGES: &str = "\\EFI\\Linux";

pub struct Image {
    origin: Origin,
    file: String,
    name: String,
    tries: Option<Tries>,
    uki: Uki,
}

impl Image {
    fn version(&self) -> &str {
        self.uki
            .version
            .as_deref()
            .unwrap_or(self.name.trim_end_matches(".efi"))
    }

    fn exhausted(&self) -> bool {
        self.tries.is_some_and(Tries::exhausted)
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
                path: format!("{IMAGES}\\{}", self.file),
                options,
            },
            tries: self.tries.filter(|_| profile == 0),
        }
    }
}

pub fn scan(volume: &mut Volume, origin: &Origin) -> Vec<Image> {
    volume
        .list(IMAGES)
        .into_iter()
        .filter(|listed| !listed.directory && listed.name.to_ascii_lowercase().ends_with(".efi"))
        .filter_map(|listed| {
            let mut file = volume.file(&format!("{IMAGES}\\{}", listed.name))?;
            let (name, tries) = tries::split(&listed.name);
            Some(Image {
                origin: origin.clone(),
                uki: pe::uki(&mut file)?,
                file: listed.name,
                name,
                tries,
            })
        })
        .collect()
}

pub fn add(catalog: &mut Catalog, mut images: Vec<Image>) {
    images.sort_by(|a, b| {
        a.exhausted()
            .cmp(&b.exhausted())
            .then_with(|| newest_first(a.version(), b.version()))
    });
    let mut systems: Vec<&str> = images.iter().map(|image| image.uki.os.as_str()).collect();
    systems.sort_unstable();
    systems.dedup();
    let several = systems.len() > 1;
    let mut listed: Vec<&str> = Vec::new();
    for image in &images {
        let newest = !listed.contains(&image.uki.os.as_str());
        let name = image.uki.name.as_deref();
        let title = if newest {
            name.map_or_else(|| format!("Linux {}", image.version()), String::from)
        } else if several && let Some(name) = name {
            format!("{name}, Linux {}", image.version())
        } else {
            format!("Linux {}", image.version())
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
