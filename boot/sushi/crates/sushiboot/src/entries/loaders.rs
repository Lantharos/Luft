use alloc::format;
use alloc::string::String;
use alloc::vec::Vec;

use super::pe;
use super::{Action, BootEntry, Origin};
use crate::files::Volume;

const WINDOWS: &str = "\\EFI\\Microsoft\\Boot\\bootmgfw.efi";
const NOT_SYSTEMS: [&str; 3] = ["boot", "linux", "microsoft"];
const SHIM: &str = "shimx64.efi";
const SHIM_SECOND_STAGE: &str = "grubx64.efi";
const LOADERS: [&str; 2] = [SHIM_SECOND_STAGE, "systemd-bootx64.efi"];

const NAMES: [(&str, &str); 14] = [
    ("almalinux", "AlmaLinux"),
    ("arch", "Arch Linux"),
    ("centos", "CentOS"),
    ("debian", "Debian"),
    ("fedora", "Fedora Linux"),
    ("gentoo", "Gentoo"),
    ("manjaro", "Manjaro"),
    ("neon", "KDE neon"),
    ("nixos", "NixOS"),
    ("opensuse", "openSUSE"),
    ("pop", "Pop!_OS"),
    ("rocky", "Rocky Linux"),
    ("systemd", "systemd-boot"),
    ("ubuntu", "Ubuntu"),
];

fn name(folder: &str) -> String {
    NAMES
        .iter()
        .find(|(known, _)| known.eq_ignore_ascii_case(folder))
        .map_or_else(|| String::from(folder), |(_, name)| String::from(*name))
}

fn starts_another_system(volume: &mut Volume, path: &str) -> bool {
    volume
        .file(path)
        .is_some_and(|mut file| !pe::is_sushiboot(&mut file))
}

fn loader(volume: &mut Volume, folder: &str) -> Option<String> {
    let path = |file: &str| format!("\\EFI\\{folder}\\{file}");
    if volume.is_file(&path(SHIM)) {
        return starts_another_system(volume, &path(SHIM_SECOND_STAGE)).then(|| path(SHIM));
    }
    LOADERS
        .iter()
        .map(|file| path(file))
        .find(|candidate| starts_another_system(volume, candidate))
}

fn entry(origin: &Origin, id: &str, title: &str, path: String) -> BootEntry {
    BootEntry {
        id: origin.id(id),
        title: origin.title(title),
        volume: origin.handle,
        action: Action::Efi {
            path,
            options: String::new(),
        },
        tries: None,
    }
}

pub fn scan(volume: &mut Volume, origin: &Origin) -> Vec<BootEntry> {
    let mut found = Vec::new();
    if volume.is_file(WINDOWS) {
        found.push(entry(
            origin,
            "auto-windows",
            "Windows",
            String::from(WINDOWS),
        ));
    }
    let mut folders: Vec<String> = volume
        .list("\\EFI")
        .into_iter()
        .filter(|listed| listed.directory)
        .map(|listed| listed.name)
        .filter(|folder| {
            !NOT_SYSTEMS
                .iter()
                .any(|skipped| skipped.eq_ignore_ascii_case(folder))
        })
        .collect();
    folders.sort_by_key(|folder| folder.to_ascii_lowercase());
    for folder in folders {
        if let Some(path) = loader(volume, &folder) {
            let id = format!("auto-{}", folder.to_ascii_lowercase());
            found.push(entry(origin, &id, &name(&folder), path));
        }
    }
    found
}
