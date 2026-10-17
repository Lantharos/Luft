mod references;

use std::path::Path;

use anyhow::{Result, bail};

use super::esp::{self, Esp};
use super::options::{self, LoadOption};
use super::{entry, startup};
use crate::errors::Unsupported;
use crate::system::blocks;
use references::Partitions;

const LUFT_FOLDERS: [&str; 5] = ["luft", "luft-start", "boot", "linux", "systemd"];
const WINDOWS_LOADER: &str = "Boot/bootmgfw.efi";
const GRUB_LOADERS: [&str; 3] = ["grub.cfg", "grubx64.efi", "shimx64.efi"];
const SHIM_FALLBACK: &str = "EFI/BOOT/fbx64.efi";
const SHIM_FALLBACK_LIST: &str = "BOOTX64.CSV";

#[derive(Clone, Copy, PartialEq, Eq)]
pub enum Kind {
    Windows,
    Grub,
}

impl Kind {
    pub fn name(self) -> &'static str {
        match self {
            Self::Windows => "windows",
            Self::Grub => "grub",
        }
    }

    fn of_folder(folder: &Path) -> Option<Self> {
        if folder.join(WINDOWS_LOADER).is_file() {
            Some(Self::Windows)
        } else if GRUB_LOADERS.iter().any(|file| folder.join(file).is_file()) {
            Some(Self::Grub)
        } else {
            None
        }
    }

    fn of_loader(path: &str) -> Option<Self> {
        let file = path.rsplit('\\').next()?.to_lowercase();
        if file == "bootmgfw.efi" {
            Some(Self::Windows)
        } else if GRUB_LOADERS.contains(&file.as_str()) {
            Some(Self::Grub)
        } else {
            None
        }
    }
}

pub struct OtherStartup {
    pub esp: String,
    pub folder: String,
    pub kind: Kind,
    pub entries: Vec<(u16, String)>,
    pub partitions: Vec<String>,
}

fn is_luft_folder(name: &str) -> bool {
    LUFT_FOLDERS.contains(&name.to_lowercase().as_str())
}

fn folder_of(path: &str) -> Option<String> {
    let mut parts = path.trim_start_matches('\\').split('\\');
    let (top, name) = (parts.next()?, parts.next()?);
    (top.eq_ignore_ascii_case("efi") && parts.next().is_some()).then(|| format!("EFI/{name}"))
}

fn entries_from(options: &[LoadOption], esp: &str, folder: &str) -> Vec<(u16, String)> {
    options
        .iter()
        .filter(|option| option.starts_from(esp, folder))
        .map(|option| (option.number, option.label.clone()))
        .collect()
}

fn on_mounted(esp: &Esp, partuuid: &str, options: &[LoadOption]) -> Vec<OtherStartup> {
    let partitions = Partitions::read();
    std::fs::read_dir(esp.file("EFI"))
        .into_iter()
        .flatten()
        .flatten()
        .filter(|entry| entry.path().is_dir())
        .filter_map(|entry| {
            let name = entry.file_name().to_string_lossy().into_owned();
            if is_luft_folder(&name) {
                return None;
            }
            let path = entry.path();
            let kind = Kind::of_folder(&path)?;
            let folder = format!("EFI/{name}");
            Some(OtherStartup {
                entries: entries_from(options, partuuid, &folder),
                partitions: match kind {
                    Kind::Windows => references::of_windows(&path, &partitions),
                    Kind::Grub => references::of_grub(&path, &partitions),
                },
                esp: partuuid.to_owned(),
                folder,
                kind,
            })
        })
        .collect()
}

fn elsewhere(mounted: &str, options: &[LoadOption]) -> Vec<OtherStartup> {
    let mut found: Vec<OtherStartup> = Vec::new();
    for option in options {
        let Some(esp) = option.partition.as_deref().filter(|esp| *esp != mounted) else {
            continue;
        };
        let (Some(folder), Some(kind)) = (folder_of(&option.path), Kind::of_loader(&option.path))
        else {
            continue;
        };
        let name = folder.trim_start_matches("EFI/");
        if is_luft_folder(name)
            || found
                .iter()
                .any(|known| known.esp == esp && known.folder.eq_ignore_ascii_case(&folder))
        {
            continue;
        }
        found.push(OtherStartup {
            entries: entries_from(options, esp, &folder),
            esp: esp.to_owned(),
            partitions: Vec::new(),
            folder,
            kind,
        });
    }
    found
}

fn mounted_partuuid(esp: &Esp) -> Result<String> {
    blocks::partuuid(&esp.name).ok_or_else(|| {
        Unsupported("The EFI system partition has no partition GUID.".to_owned()).into()
    })
}

pub fn list() -> Result<Vec<OtherStartup>> {
    if !startup::installed() {
        return Ok(Vec::new());
    }
    let esp = esp::find()?;
    let partuuid = mounted_partuuid(&esp)?;
    let options = options::all();
    let mut startups = on_mounted(&esp, &partuuid, &options);
    startups.extend(elsewhere(&partuuid, &options));
    Ok(startups)
}

fn checked_folder(folder: &str) -> Result<&str> {
    let name = folder
        .strip_prefix("EFI/")
        .filter(|name| !name.is_empty() && !name.contains(['/', '\\']) && *name != "..")
        .ok_or_else(|| Unsupported(format!("“{folder}” isn't a boot loader's folder.")))?;
    if is_luft_folder(name) {
        bail!(Unsupported(format!(
            "“{folder}” is how Luft starts, so it stays."
        )));
    }
    Ok(name)
}

fn shim_fallback_needed(esp: &Esp) -> bool {
    std::fs::read_dir(esp.file("EFI"))
        .into_iter()
        .flatten()
        .flatten()
        .any(|entry| {
            !is_luft_folder(&entry.file_name().to_string_lossy())
                && entry.path().join(SHIM_FALLBACK_LIST).is_file()
        })
}

pub fn remove(folders: &[(String, String)], partitions: &[String]) -> Result<()> {
    if !startup::installed() {
        bail!(Unsupported(
            "Luft's own startup isn't set up on this computer, so other systems' startups stay as they are.".to_owned()
        ));
    }
    for (_, folder) in folders {
        checked_folder(folder)?;
    }
    let esp = esp::find()?;
    let partuuid = mounted_partuuid(&esp)?;
    startup::place(&esp)?;

    let options = options::all();
    let doomed: Vec<&LoadOption> = options
        .iter()
        .filter(|option| {
            option
                .partition
                .as_ref()
                .is_some_and(|partition| partitions.contains(partition))
                || folders
                    .iter()
                    .any(|(esp, folder)| option.starts_from(esp, folder))
        })
        .collect();
    if let Some(current) = options::current()
        && let Some(running) = doomed.iter().find(|option| option.number == current)
    {
        bail!(Unsupported(format!(
            "This computer started from “{}”, so it stays while Luft runs.",
            running.label
        )));
    }
    for option in doomed {
        entry::delete(&format!("{:04X}", option.number))?;
    }

    let mut removed_shim_list = false;
    for (_, folder) in folders.iter().filter(|(esp, _)| *esp == partuuid) {
        let path = esp.file(folder);
        if path.is_dir() {
            removed_shim_list |= path.join(SHIM_FALLBACK_LIST).is_file();
            std::fs::remove_dir_all(&path)?;
        }
    }
    if removed_shim_list && !shim_fallback_needed(&esp) {
        let _ = std::fs::remove_file(esp.file(SHIM_FALLBACK));
    }
    rustix::fs::sync();
    Ok(())
}
