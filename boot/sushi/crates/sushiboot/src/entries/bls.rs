use alloc::format;
use alloc::string::{String, ToString};
use alloc::vec::Vec;

use super::{Action, BootEntry, Origin};
use crate::files::Volume;

const ENTRIES: &str = "\\loader\\entries";

pub fn scan(volume: &mut Volume, origin: &Origin, secure_boot: bool) -> Vec<BootEntry> {
    let mut found: Vec<(String, BootEntry)> = volume
        .list(ENTRIES)
        .into_iter()
        .filter(|listed| !listed.directory && listed.name.ends_with(".conf"))
        .filter_map(|listed| {
            let text = volume.read(&format!("{ENTRIES}\\{}", listed.name))?;
            let (title, sort_key, action) = parse(core::str::from_utf8(&text).ok()?)?;
            let action = match action {
                Action::Linux { .. } if secure_boot => return None,
                Action::Efi { path, .. } if secure_boot => Action::Efi {
                    path,
                    options: String::new(),
                },
                action => action,
            };
            Some((
                sort_key.unwrap_or_else(|| listed.name.clone()),
                BootEntry {
                    id: origin.id(&listed.name),
                    title: origin.title(&title),
                    volume: origin.handle,
                    action,
                    tries: None,
                },
            ))
        })
        .collect();
    found.sort_by(|a, b| a.0.cmp(&b.0));
    found.into_iter().map(|(_, entry)| entry).collect()
}

fn parse(text: &str) -> Option<(String, Option<String>, Action)> {
    let mut title = String::from("Linux");
    let mut sort_key = None;
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
            "linux" => linux = Some(value),
            "efi" => efi = Some(value),
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
    Some((title, sort_key, action))
}
