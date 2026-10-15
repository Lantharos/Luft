use std::path::PathBuf;

use anyhow::{Context, Result};

use super::esp::Esp;
use super::files::{self, MOK_MANAGER, SECOND_STAGE, SHIM};
use super::partition::BootPartition;
use super::pe::PeFile;

pub const FOLDER: &str = "EFI/luft-start";
pub const LOADER: &str = "\\EFI\\luft-start\\shimx64.efi";
const ENTRIES: &str = "loader/entries";
const KERNEL: &str = "linux";
const INITRD: &str = "initrd";
const GRUB_CONFIG: &str = "grub.cfg";

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

fn grub_config(boot_uuid: &str, command_line: &str) -> String {
    format!(
        "set timeout=0\nsearch --no-floppy --fs-uuid --set=root {boot_uuid}\nlinux /{FOLDER}/{KERNEL} {command_line}\ninitrd /{FOLDER}/{INITRD}\nboot\n"
    )
}

pub fn place(esp: &Esp, boot: &BootPartition) -> Result<bool> {
    let mut image = PeFile::open(&default_image(boot)?)?;
    let command_line = String::from_utf8_lossy(&image.section(".cmdline")?)
        .trim_matches(char::from(0))
        .trim()
        .to_owned();
    let loaders = esp.file(FOLDER);
    let system = boot.file(FOLDER);
    let shim = files::shim_folder()?;
    let mut changed = false;
    changed |= files::copy_if_changed(&shim.join(SHIM), &loaders.join(SHIM))?;
    changed |= files::copy_if_changed(&shim.join(MOK_MANAGER), &loaders.join(MOK_MANAGER))?;
    changed |= files::copy_if_changed(&files::grub()?, &loaders.join(SECOND_STAGE))?;
    changed |= files::write_if_changed(&system.join(KERNEL), &image.section(".linux")?)?;
    changed |= files::write_if_changed(&system.join(INITRD), &image.section(".initrd")?)?;
    changed |= files::write_if_changed(
        &loaders.join(GRUB_CONFIG),
        grub_config(&boot.uuid, &command_line).as_bytes(),
    )?;
    Ok(changed)
}

pub fn remove(esp: &Esp, boot: &BootPartition) {
    let _ = std::fs::remove_dir_all(esp.file(FOLDER));
    let _ = std::fs::remove_dir_all(boot.file(FOLDER));
}
