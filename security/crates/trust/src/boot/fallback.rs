use std::path::{Path, PathBuf};

use anyhow::{Context, Result};
use sha2::{Digest, Sha256};

use super::esp::Esp;
use super::files::{self, SHIM};
use super::partition::BootPartition;
use super::pe::PeFile;

pub const FOLDER: &str = "EFI/luft-start";
pub const LOADER: &str = "\\EFI\\luft-start\\shimx64.efi";
const ENTRIES: &str = "loader/entries";
const KERNEL: &str = "linux";
const INITRD: &str = "initrd";
const GRUB_CONFIG: &str = "grub.cfg";
const SYSTEM_NAME_BYTES: usize = 8;

struct Entry {
    sort_key: String,
    image: String,
}

fn parse(text: &str, name: &str) -> Option<Entry> {
    let value = |key: &str| {
        text.lines().find_map(|line| {
            let (found, value) = line.trim().split_once(char::is_whitespace)?;
            (found == key).then(|| value.trim().to_owned())
        })
    };
    Some(Entry {
        sort_key: value("sort-key").unwrap_or_else(|| name.to_owned()),
        image: value("uki").or_else(|| value("efi"))?,
    })
}

fn default_image(boot: &BootPartition) -> Result<PathBuf> {
    let entry = std::fs::read_dir(boot.file(ENTRIES))
        .context("The boot partition has no boot entries.")?
        .flatten()
        .filter_map(|file| {
            let name = file.file_name().to_string_lossy().into_owned();
            parse(&std::fs::read_to_string(file.path()).ok()?, &name)
        })
        .min_by(|a, b| a.sort_key.cmp(&b.sort_key))
        .context("No boot entry starts a startup image.")?;
    Ok(boot.file(entry.image.trim_start_matches('/')))
}

fn grub_config(boot_uuid: &str, system: &str, command_line: &str) -> String {
    format!(
        "set timeout=0\nsearch --no-floppy --fs-uuid --set=root {boot_uuid}\nlinux /{system}/{KERNEL} {command_line}\ninitrd /{system}/{INITRD}\nboot\n"
    )
}

fn system_folder(kernel: &[u8], initrd: &[u8]) -> String {
    let digest = Sha256::new()
        .chain_update(kernel)
        .chain_update(initrd)
        .finalize();
    let name: String = digest[..SYSTEM_NAME_BYTES]
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect();
    format!("{FOLDER}/{name}")
}

fn remove_other_systems(boot: &BootPartition, system: &Path) {
    for entry in std::fs::read_dir(boot.file(FOLDER))
        .into_iter()
        .flatten()
        .flatten()
    {
        let path = entry.path();
        if path != system && path.is_dir() {
            let _ = std::fs::remove_dir_all(path);
        }
    }
}

pub fn place(esp: &Esp, boot: &BootPartition) -> Result<bool> {
    let mut image = PeFile::open(&default_image(boot)?)?;
    let command_line = String::from_utf8_lossy(&image.section(".cmdline")?)
        .trim_matches(char::from(0))
        .trim()
        .to_owned();
    let kernel = image.section(".linux")?;
    let initrd = image.section(".initrd")?;
    let system = system_folder(&kernel, &initrd);
    let loaders = esp.file(FOLDER);
    let mut changed =
        files::write_folder_once(&boot.file(&system), &[(KERNEL, &kernel), (INITRD, &initrd)])?;
    changed |= files::place_shim_after(&files::grub()?, &loaders, SHIM)?;
    changed |= files::write_if_changed(
        &loaders.join(GRUB_CONFIG),
        grub_config(&boot.uuid, &system, &command_line).as_bytes(),
    )?;
    remove_other_systems(boot, &boot.file(&system));
    Ok(changed)
}

pub fn remove(esp: &Esp, boot: &BootPartition) {
    let _ = std::fs::remove_dir_all(esp.file(FOLDER));
    let _ = std::fs::remove_dir_all(boot.file(FOLDER));
}
