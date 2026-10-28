use alloc::format;
use alloc::string::{String, ToString};
use alloc::vec::Vec;

use super::counter::{self, Counted};
use super::images::Image;
use super::{Action, BootEntry, Origin};
use crate::files::{self, Volume};

const ENTRIES: &str = "\\loader\\entries";

struct Entry {
    title: String,
    sort_key: Option<String>,
    version: Option<String>,
    action: Action,
}

#[derive(Default)]
pub struct Found {
    pub images: Vec<Image>,
    pub others: Vec<BootEntry>,
}

pub fn scan(volume: &mut Volume, origin: &Origin, secure_boot: bool) -> Found {
    let mut others: Vec<(String, BootEntry)> = Vec::new();
    let mut found = Found::default();
    for listed in volume.list(ENTRIES) {
        if listed.directory || !listed.name.ends_with(".conf") {
            continue;
        }
        let Some(entry) = volume
            .read(&format!("{ENTRIES}\\{}", listed.name))
            .and_then(|text| parse(core::str::from_utf8(&text).ok()?))
        else {
            continue;
        };
        let (name, tries) = counter::split(&listed.name);
        let sort_key = entry.sort_key.unwrap_or_else(|| name.clone());
        let counted = tries.map(|(stem, tries)| Counted {
            volume: origin.handle,
            directory: ENTRIES,
            stem,
            file: listed.name.clone(),
            tries,
        });
        if let Action::Efi { path, .. } = &entry.action
            && let Some(image) = Image::open(
                volume,
                origin,
                files::efi_path(path),
                name.clone(),
                Some(sort_key.clone()),
                entry.version.clone(),
                counted,
            )
        {
            found.images.push(image);
            continue;
        }
        let action = match entry.action {
            Action::Linux { .. } if secure_boot => continue,
            Action::Efi { path, .. } if secure_boot => Action::Efi {
                path,
                options: String::new(),
            },
            action => action,
        };
        others.push((
            sort_key,
            BootEntry {
                id: origin.id(&name),
                title: origin.title(&entry.title),
                volume: origin.handle,
                action,
                release: None,
                counted: None,
            },
        ));
    }
    others.sort_by(|a, b| a.0.cmp(&b.0));
    found.others = others.into_iter().map(|(_, entry)| entry).collect();
    found
}

fn parse(text: &str) -> Option<Entry> {
    let mut title = String::from("Linux");
    let mut sort_key = None;
    let mut version = None;
    let mut linux = None;
    let mut efi = None;
    let mut initrd = None;
    let mut options = String::new();
    for line in text.lines().map(str::trim) {
        if line.starts_with('#') {
            continue;
        }
        let Some((key, value)) = line.split_once(char::is_whitespace) else {
            continue;
        };
        let value = value.trim().to_string();
        match key {
            "title" => title = value,
            "sort-key" => sort_key = Some(value),
            "version" => version = Some(value),
            "linux" => linux = Some(value),
            "efi" | "uki" => efi = Some(value),
            "initrd" => initrd = Some(value),
            "options" if options.is_empty() => options = value,
            "options" => options = format!("{options} {value}"),
            _ => {}
        }
    }
    let action = match (linux, efi) {
        (Some(linux), _) => Action::Linux {
            linux,
            initrd,
            options,
        },
        (None, Some(path)) => Action::Efi { path, options },
        (None, None) => return None,
    };
    Some(Entry {
        title,
        sort_key,
        version,
        action,
    })
}
