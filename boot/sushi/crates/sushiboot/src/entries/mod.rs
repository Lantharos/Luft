mod bls;
mod images;
mod loaders;
mod pe;
mod tries;
mod volume;

use alloc::format;
use alloc::string::{String, ToString};
use alloc::vec::Vec;

use uefi::Handle;

use crate::files::Volume;
use crate::start::firmware;
use tries::Tries;

pub enum Action {
    Linux {
        linux: String,
        initrd: Option<String>,
        options: String,
    },
    Efi {
        path: String,
        options: String,
    },
    FirmwareSetup,
}

pub struct BootEntry {
    pub id: String,
    pub title: String,
    pub volume: Handle,
    pub action: Action,
    pub tries: Option<Tries>,
}

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Row {
    Entry(usize),
    Previous,
}

#[derive(Default)]
pub struct Catalog {
    pub entries: Vec<BootEntry>,
    pub main: Vec<Row>,
    pub previous: Vec<usize>,
}

#[derive(Clone)]
pub struct Origin {
    pub handle: Handle,
    prefix: String,
    label: Option<String>,
}

impl Origin {
    pub fn id(&self, name: &str) -> String {
        format!("{}{name}", self.prefix)
    }

    pub fn title(&self, title: &str) -> String {
        match &self.label {
            Some(label) => format!("{title} ({label})"),
            None => title.to_string(),
        }
    }
}

impl Catalog {
    pub fn collect(boot_device: Handle, secure_boot: bool) -> Self {
        let volumes = volume::enumerate(boot_device);
        let several = volumes.len() > 1;
        let mut catalog = Self::default();
        let mut found_images = Vec::new();
        let mut others = Vec::new();
        for found in &volumes {
            let Some(mut volume) = Volume::open(found.handle) else {
                continue;
            };
            let origin = Origin {
                handle: found.handle,
                prefix: if found.is_boot {
                    String::new()
                } else {
                    format!("esp{}-", found.index)
                },
                label: several.then(|| found.label.clone()),
            };
            found_images.extend(images::scan(&mut volume, &origin));
            others.extend(bls::scan(&mut volume, &origin, secure_boot));
            others.extend(loaders::scan(&mut volume, &origin));
        }
        images::add(&mut catalog, found_images);
        for entry in others {
            let index = catalog.push(entry);
            catalog.main.push(Row::Entry(index));
        }
        if catalog.entries.is_empty() {
            return catalog;
        }
        if firmware::setup_supported() {
            let index = catalog.push(BootEntry {
                id: String::from("auto-reboot-to-firmware-setup"),
                title: String::from("Firmware settings"),
                volume: boot_device,
                action: Action::FirmwareSetup,
                tries: None,
            });
            catalog.main.push(Row::Entry(index));
        }
        catalog
    }

    fn push(&mut self, entry: BootEntry) -> usize {
        self.entries.push(entry);
        self.entries.len() - 1
    }

    pub fn first(&self) -> Option<usize> {
        self.main.iter().find_map(|row| match row {
            Row::Entry(index) => Some(*index),
            Row::Previous => self.previous.first().copied(),
        })
    }

    pub fn record_attempt(&mut self, index: usize) {
        let entry = &self.entries[index];
        let (Some(tries), Action::Efi { path, .. }) = (entry.tries, &entry.action) else {
            return;
        };
        let Some((renamed, attempted)) = tries::record_attempt(entry.volume, path, tries) else {
            return;
        };
        let (volume, previous) = (entry.volume, path.clone());
        for other in &mut self.entries {
            if let Action::Efi { path, .. } = &mut other.action
                && other.volume == volume
                && *path == previous
            {
                path.clone_from(&renamed);
            }
        }
        self.entries[index].tries = Some(attempted);
    }

    pub fn find(&self, pattern: &str) -> Option<usize> {
        let pattern = pattern.trim();
        self.entries.iter().position(|entry| {
            matches(pattern, &entry.id) || matches(pattern, &without_suffix(&entry.id))
        })
    }
}

fn without_suffix(id: &str) -> String {
    let (name, profile) = id
        .split_once('@')
        .map_or((id, None), |(name, profile)| (name, Some(profile)));
    let name = name
        .strip_suffix(".efi")
        .or_else(|| name.strip_suffix(".conf"))
        .unwrap_or(name);
    match profile {
        Some(profile) => format!("{name}@{profile}"),
        None => name.to_string(),
    }
}

fn matches(pattern: &str, text: &str) -> bool {
    match pattern.split_once('*') {
        None => pattern.eq_ignore_ascii_case(text),
        Some((prefix, rest)) => {
            text.len() >= prefix.len()
                && text.is_char_boundary(prefix.len())
                && text[..prefix.len()].eq_ignore_ascii_case(prefix)
                && (prefix.len()..=text.len())
                    .filter(|start| text.is_char_boundary(*start))
                    .any(|start| matches(rest, &text[start..]))
        }
    }
}

fn natural_parts(text: &str) -> Vec<(bool, &str)> {
    let mut parts = Vec::new();
    let mut start = 0;
    let bytes = text.as_bytes();
    for index in 1..=bytes.len() {
        if index == bytes.len() || bytes[index].is_ascii_digit() != bytes[start].is_ascii_digit() {
            parts.push((bytes[start].is_ascii_digit(), &text[start..index]));
            start = index;
        }
    }
    parts
}

pub fn newest_first(a: &str, b: &str) -> core::cmp::Ordering {
    for (left, right) in natural_parts(a).into_iter().zip(natural_parts(b)) {
        let order = match (left, right) {
            ((true, l), (true, r)) => l
                .parse::<u64>()
                .unwrap_or(0)
                .cmp(&r.parse::<u64>().unwrap_or(0)),
            ((_, l), (_, r)) => l.cmp(r),
        };
        if order.is_ne() {
            return order.reverse();
        }
    }
    b.len().cmp(&a.len())
}
