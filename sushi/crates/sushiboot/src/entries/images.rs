use alloc::format;
use alloc::string::String;
use alloc::vec::Vec;
use core::cmp::Ordering;

use super::counter::Counted;
use super::pe::{self, Uki};
use super::{Action, BootEntry, Catalog, Origin, Release, Row, newest_first};
use crate::files::Volume;

const IMAGES: &str = "\\EFI\\Linux";
const LOCKDOWN: &str = "lockdown";
const NIGHTLY: &str = "-nightly.";

pub struct Image {
    origin: Origin,
    path: String,
    name: String,
    sort_key: Option<String>,
    uki: Uki,
    counted: Option<Counted>,
}

impl Image {
    pub fn open(
        volume: &mut Volume,
        origin: &Origin,
        path: String,
        name: String,
        sort_key: Option<String>,
        image_version: Option<String>,
        counted: Option<Counted>,
    ) -> Option<Self> {
        let mut uki = pe::uki(&mut volume.file(&path)?)?;
        uki.image_version = uki.image_version.or(image_version);
        Some(Self {
            origin: origin.clone(),
            path,
            name,
            sort_key,
            uki,
            counted,
        })
    }

    fn bad(&self) -> bool {
        self.counted.as_ref().is_some_and(Counted::bad)
    }

    fn version(&self) -> &str {
        self.uki
            .version
            .as_deref()
            .unwrap_or(self.name.trim_end_matches(".efi"))
    }

    fn release(&self) -> String {
        match (&self.uki.name, &self.uki.image_version) {
            (Some(name), Some(version)) => format!("{name} {}", readable(version)),
            _ => format!("Linux {}", self.version()),
        }
    }

    fn order(&self, other: &Self) -> Ordering {
        match (&self.sort_key, &other.sort_key) {
            (Some(ours), Some(theirs)) => ours.cmp(theirs),
            _ => newest_first(self.version(), other.version()),
        }
    }

    fn command_line(&self, profile: usize) -> Option<&str> {
        self.uki
            .profiles
            .get(profile)
            .and_then(|details| details.command_line.as_deref())
            .or(self.uki.command_line.as_deref())
    }

    fn options(&self, profile: usize, secure_boot: bool) -> String {
        let mut options = Vec::new();
        if profile > 0 {
            options.push(format!("@{profile}"));
        }
        if !secure_boot && let Some(command_line) = self.command_line(profile) {
            options.push(without_lockdown(command_line));
        }
        options.join(" ")
    }

    fn entry(&self, profile: usize, title: String, secure_boot: bool) -> BootEntry {
        let id = match self.uki.profiles.get(profile) {
            Some(details) => match &details.id {
                Some(name) => format!("{}@{name}", self.name),
                None => format!("{}@{profile}", self.name),
            },
            None => self.name.clone(),
        };
        let options = self.options(profile, secure_boot);
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
            counted: if profile == 0 {
                self.counted.clone()
            } else {
                None
            },
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
            Image::open(volume, origin, path, listed.name, None, None, None)
        })
        .collect()
}

fn readable(version: &str) -> String {
    match version.split_once(NIGHTLY) {
        Some((release, number)) => format!("{release} Nightly {number}"),
        None => version.into(),
    }
}

fn without_lockdown(command_line: &str) -> String {
    command_line
        .split_whitespace()
        .filter(|argument| argument.split('=').next() != Some(LOCKDOWN))
        .collect::<Vec<_>>()
        .join(" ")
}

pub fn add(catalog: &mut Catalog, mut images: Vec<Image>, secure_boot: bool) {
    images.sort_by(|a, b| a.bad().cmp(&b.bad()).then_with(|| a.order(b)));
    let mut listed: Vec<&Image> = Vec::new();
    for image in &images {
        let first = listed
            .iter()
            .find(|other| other.uki.os == image.uki.os)
            .copied();
        let newest = first.is_none();
        let name = image.uki.name.as_deref();
        let title = match name {
            Some(name) if image.uki.image_version.is_none() && newest => name.into(),
            Some(name) if image.uki.image_version.is_none() => {
                format!("{name}, {}", image.release())
            }
            _ => image.release(),
        };
        let main = catalog.push(image.entry(0, title, secure_boot));
        match first {
            None => {
                listed.push(image);
                catalog.main.push(Row::Entry(main));
            }
            Some(first) => {
                catalog.previous.push(main);
                if image.bad() && image.order(first).is_lt() {
                    catalog.failed = Some(main);
                }
            }
        }
        for (profile, details) in image.uki.profiles.iter().enumerate().skip(1) {
            let title = details.title.clone().unwrap_or_default();
            let index = catalog.push(image.entry(profile, title, secure_boot));
            if newest && details.title.is_some() {
                catalog.main.push(Row::Entry(index));
            }
        }
    }
    if !catalog.previous.is_empty() {
        catalog.main.push(Row::Previous);
    }
}
