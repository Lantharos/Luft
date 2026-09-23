//! Scan all ESPs for BLS entries, UKI images, and known OS bootloaders.

use alloc::format;
use alloc::string::{String, ToString};
use alloc::vec;
use alloc::vec::Vec;

use uefi::boot;
use uefi::proto::media::file::{File, FileAttribute, FileInfo, FileMode, FileType};
use uefi::proto::media::fs::SimpleFileSystem;
use uefi::{CString16, Handle};

use crate::volume::{self, EspVolume};

#[derive(Clone, Debug, PartialEq, Eq)]
pub enum BootKind {
    Linux {
        linux: String,
        initrd: Option<String>,
        options: String,
    },
    Efi {
        efi: String,
        options: String,
    },
}

#[derive(Clone, Debug)]
pub struct BootEntry {
    pub id: String,
    pub title: String,
    pub volume: Handle,
    pub kind: BootKind,
}

struct SeenKey {
    volume: Handle,
    path: String,
}

/// Scan every ESP for bootable operating systems.
pub fn collect_all(boot_device: Handle) -> (Vec<BootEntry>, usize) {
    let volumes = volume::enumerate_esp_volumes(boot_device);
    let esp_count = volumes.len();
    let multi = esp_count > 1;
    let mut out = Vec::new();
    let mut seen = Vec::new();

    for vol in &volumes {
        scan_bls_entries(vol, multi, &mut out, &mut seen);
        scan_known_efi_bootloaders(vol, multi, &mut out, &mut seen);
        scan_uki_directory(vol, multi, &mut out, &mut seen);
    }

    (out, esp_count)
}

fn scan_bls_entries(vol: &EspVolume, multi: bool, out: &mut Vec<BootEntry>, seen: &mut Vec<SeenKey>) {
    let Ok(mut fs) = boot::open_protocol_exclusive::<SimpleFileSystem>(vol.handle) else {
        return;
    };
    let Ok(mut root) = fs.open_volume() else {
        return;
    };
    for dir_path in [
        uefi::cstr16!("\\loader\\entries"),
        uefi::cstr16!("loader\\entries"),
    ] {
        read_bls_dir(&mut root, dir_path, vol, multi, out, seen);
    }
}

const KNOWN_OS_BOOTLOADERS: &[(&str, &str)] = &[
    ("\\EFI\\Microsoft\\Boot\\bootmgfw.efi", "Windows Boot Manager"),
    ("\\EFI\\Microsoft\\Boot\\memtest.efi", "Windows Memory Test"),
    ("\\EFI\\Fedora\\grubx64.efi", "Fedora (GRUB)"),
    ("\\EFI\\fedora\\shim.efi", "Fedora (shim)"),
    ("\\EFI\\ubuntu\\grubx64.efi", "Ubuntu (GRUB)"),
    ("\\EFI\\ubuntu\\shimx64.efi", "Ubuntu (shim)"),
    ("\\EFI\\debian\\grubx64.efi", "Debian (GRUB)"),
    ("\\EFI\\arch\\grubx64.efi", "Arch Linux (GRUB)"),
    ("\\EFI\\opensuse\\grubx64.efi", "openSUSE (GRUB)"),
    ("\\EFI\\systemd\\systemd-bootx64.efi", "systemd-boot"),
    ("\\EFI\\gentoo\\grubx64.efi", "Gentoo (GRUB)"),
    ("\\EFI\\Linux\\bootx64.efi", "Linux UKI"),
];

fn scan_known_efi_bootloaders(
    vol: &EspVolume,
    multi: bool,
    out: &mut Vec<BootEntry>,
    seen: &mut Vec<SeenKey>,
) {
    let Ok(mut fs) = boot::open_protocol_exclusive::<SimpleFileSystem>(vol.handle) else {
        return;
    };
    let Ok(mut root) = fs.open_volume() else {
        return;
    };

    for (path, title) in KNOWN_OS_BOOTLOADERS {
        if should_skip_efi_path(path) {
            continue;
        }
        if !efi_exists(&mut root, path) {
            continue;
        }
        if mark_seen(seen, vol.handle, path) {
            continue;
        }
        let id = entry_id(vol, &slugify(title));
        let display = display_title(title, vol, multi);
        out.push(BootEntry {
            id,
            title: display,
            volume: vol.handle,
            kind: BootKind::Efi {
                efi: path.to_string(),
                options: String::new(),
            },
        });
    }
}

fn scan_uki_directory(vol: &EspVolume, multi: bool, out: &mut Vec<BootEntry>, seen: &mut Vec<SeenKey>) {
    let Ok(mut fs) = boot::open_protocol_exclusive::<SimpleFileSystem>(vol.handle) else {
        return;
    };
    let Ok(mut root) = fs.open_volume() else {
        return;
    };
    for dir_path in [uefi::cstr16!("\\EFI\\Linux"), uefi::cstr16!("EFI\\Linux")] {
        let Ok(dir) = root.open(dir_path, FileMode::Read, FileAttribute::DIRECTORY) else {
            continue;
        };
        let Ok(FileType::Dir(mut directory)) = dir.into_type() else {
            continue;
        };
        while let Ok(Some(info)) = directory.read_entry_boxed() {
            let name = info.file_name().to_string();
            if !name.to_ascii_lowercase().ends_with(".efi") {
                continue;
            }
            let path = format!("\\EFI\\Linux\\{name}");
            if mark_seen(seen, vol.handle, &path) {
                continue;
            }
            let stem = name.trim_end_matches(".efi");
            let title = format!("Linux UKI ({stem})");
            let id = entry_id(vol, stem);
            out.push(BootEntry {
                id,
                title: display_title(&title, vol, multi),
                volume: vol.handle,
                kind: BootKind::Efi {
                    efi: path,
                    options: String::new(),
                },
            });
        }
    }
}

fn should_skip_efi_path(path: &str) -> bool {
    let norm = normalize_path_key(path);
    norm.contains("efi\\sushi\\sushiboot.efi")
}

fn read_bls_dir(
    root: &mut uefi::proto::media::file::Directory,
    dir_path: &uefi::CStr16,
    vol: &EspVolume,
    multi: bool,
    out: &mut Vec<BootEntry>,
    seen: &mut Vec<SeenKey>,
) {
    let dir = match root.open(dir_path, FileMode::Read, FileAttribute::empty()) {
        Ok(dir) => dir,
        Err(_) => return,
    };
    let Ok(FileType::Dir(mut directory)) = dir.into_type() else {
        return;
    };
    while let Ok(Some(info)) = directory.read_entry_boxed() {
        let name = info.file_name().to_string();
        if !name.ends_with(".conf") {
            continue;
        }
        let bls_id = name.trim_end_matches(".conf");
        let Ok(cname) = CString16::try_from(name.as_str()) else {
            continue;
        };
        let Some((title, kind)) = parse_bls_file(&mut directory, &cname) else {
            continue;
        };
        let path_key = bls_primary_path(&kind);
        if mark_seen(seen, vol.handle, &path_key) {
            continue;
        }
        out.push(BootEntry {
            id: entry_id(vol, bls_id),
            title: display_title(&title, vol, multi),
            volume: vol.handle,
            kind,
        });
    }
}

fn bls_primary_path(kind: &BootKind) -> String {
    match kind {
        BootKind::Linux { linux, .. } => normalize_path_key(linux),
        BootKind::Efi { efi, .. } => normalize_path_key(efi),
    }
}

fn entry_id(vol: &EspVolume, slug: &str) -> String {
    let clean: String = slug
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || c == '-' {
                c
            } else {
                '-'
            }
        })
        .collect();
    format!("v{}-{}", vol.index, clean.trim_matches('-'))
}

fn display_title(title: &str, vol: &EspVolume, multi: bool) -> String {
    if multi {
        format!("{title} ({})", vol.label)
    } else {
        title.to_string()
    }
}

fn slugify(title: &str) -> String {
    title
        .to_ascii_lowercase()
        .replace(' ', "-")
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '-')
        .collect()
}

fn mark_seen(seen: &mut Vec<SeenKey>, volume: Handle, path: &str) -> bool {
    let key = SeenKey {
        volume,
        path: normalize_path_key(path),
    };
    if seen.iter().any(|s| s.volume == key.volume && s.path == key.path) {
        return true;
    }
    seen.push(key);
    false
}

fn normalize_path_key(path: &str) -> String {
    path.trim_start_matches('\\')
        .trim_start_matches('/')
        .replace('/', "\\")
        .to_ascii_lowercase()
}

fn efi_exists(root: &mut uefi::proto::media::file::Directory, path: &str) -> bool {
    let Ok(cpath) = CString16::try_from(path) else {
        return false;
    };
    root.open(&cpath, FileMode::Read, FileAttribute::empty())
        .ok()
        .and_then(|f| f.into_type().ok())
        .map(|t| matches!(t, FileType::Regular(_)))
        .unwrap_or(false)
}

fn parse_bls_file(
    directory: &mut uefi::proto::media::file::Directory,
    name: &uefi::CStr16,
) -> Option<(String, BootKind)> {
    let file = directory.open(name, FileMode::Read, FileAttribute::empty()).ok()?;
    let FileType::Regular(mut regular) = file.into_type().ok()? else {
        return None;
    };
    let info = regular.get_boxed_info::<FileInfo>().ok()?;
    let mut data = vec![0u8; info.file_size() as usize];
    regular.read(&mut data).ok()?;
    parse_bls_text(core::str::from_utf8(&data).ok()?)
}

fn parse_bls_text(text: &str) -> Option<(String, BootKind)> {
    let mut title = String::from("Linux");
    let mut linux = String::new();
    let mut efi = String::new();
    let mut initrd = None;
    let mut options = String::new();
    for line in text.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        let Some((k, v)) = line.split_once(char::is_whitespace) else {
            continue;
        };
        let v = v.trim();
        match k {
            "title" => title = v.to_string(),
            "linux" => linux = v.to_string(),
            "efi" => efi = v.to_string(),
            "initrd" => initrd = Some(v.to_string()),
            "options" => options = push_options(&options, v),
            _ => {}
        }
    }
    if !linux.is_empty() {
        return Some((
            title,
            BootKind::Linux {
                linux,
                initrd,
                options,
            },
        ));
    }
    if !efi.is_empty() {
        return Some((title, BootKind::Efi { efi, options }));
    }
    None
}

fn push_options(existing: &str, more: &str) -> String {
    if existing.is_empty() {
        more.to_string()
    } else {
        format!("{existing} {more}")
    }
}

pub fn fallback_entry(device: Handle) -> BootEntry {
    BootEntry {
        id: String::from("sushi"),
        title: String::from("Sushi Linux"),
        volume: device,
        kind: BootKind::Linux {
            linux: String::from("vmlinuz"),
            initrd: Some(String::from("initramfs.img")),
            options: String::from("rd.sushi=1"),
        },
    }
}

pub fn find_index_by_id(entries: &[BootEntry], id: &str) -> Option<usize> {
    if let Some(idx) = entries.iter().position(|e| e.id == id) {
        return Some(idx);
    }
    let suffix = format!("-{id}");
    entries.iter().position(|e| e.id.ends_with(&suffix))
}