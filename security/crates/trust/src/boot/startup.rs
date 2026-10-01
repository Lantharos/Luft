use std::path::{Path, PathBuf};

use anyhow::{Result, bail};

use crate::keys::{self, Unsealed, mok};
use crate::system::command::Tool;

use super::esp::{self, Esp};
use super::kernels::{self, Kernel};
use super::uki;

const BOOT_MENU: &str = "/usr/lib/sushi/efi/SushiBoot.efi";
const SIGNED_MENU: &str = "EFI/sushi/SushiBoot.efi";
const MENU_LOADER_PATH: &str = "\\EFI\\sushi\\SushiBoot.efi ";
const IMAGES: &str = "EFI/Linux";
const LABEL: &str = "Luft";
const LOADER_CONF: &str = "loader/loader.conf";
const IMAGE_ROOM: u64 = 96 << 20;

fn image_name(version: &str) -> String {
    format!("luft-{version}.efi")
}

fn image(esp: &Esp, version: &str) -> PathBuf {
    esp.file(IMAGES).join(image_name(version))
}

fn boot_entry() -> Option<String> {
    let entries = Tool::new("efibootmgr").output().ok()?;
    entries.lines().find_map(|line| {
        let (number, rest) = line.strip_prefix("Boot")?.split_once(' ')?;
        let label = rest.trim_start_matches('*').trim_start();
        let number = number.trim_end_matches('*');
        (label.split('\t').next()? == LABEL && number.len() == 4).then(|| number.to_owned())
    })
}

pub fn installed() -> bool {
    esp::find().is_ok_and(|esp| esp.file(SIGNED_MENU).exists()) && boot_entry().is_some()
}

fn room_for_images(esp: &Esp) -> bool {
    let needed = IMAGE_ROOM * kernels::installed().len().max(1) as u64;
    let present: u64 = std::fs::read_dir(esp.file(IMAGES))
        .into_iter()
        .flatten()
        .flatten()
        .filter(|entry| entry.file_name().to_string_lossy().starts_with("luft-"))
        .filter_map(|entry| entry.metadata().ok())
        .map(|metadata| metadata.len())
        .sum();
    rustix::fs::statvfs(&esp.path)
        .is_ok_and(|space| space.f_bavail * space.f_frsize + present >= needed)
}

pub fn unavailable_reason() -> Option<&'static str> {
    if !Path::new(BOOT_MENU).exists() {
        return Some("Luft's boot menu isn't installed.");
    }
    let Ok(esp) = esp::find() else {
        return Some("This computer doesn't start from an EFI system partition.");
    };
    if !room_for_images(&esp) {
        return Some("The EFI system partition is too full for the signed startup files.");
    }
    match mok::enrollment() {
        mok::Enrollment::Enrolled => None,
        _ => Some("Add Luft's Secure Boot key first."),
    }
}

fn initrd_for(kernel: &Kernel, built: Option<&Path>) -> Result<PathBuf> {
    if let Some(built) = built.filter(|path| path.exists()) {
        return Ok(built.to_owned());
    }
    if !kernel.initrd().exists() {
        kernel.rebuild_initrd()?;
    }
    Ok(kernel.initrd())
}

pub fn add(kernel: &Kernel, built_initrd: Option<&Path>) -> Result<()> {
    if !installed() {
        return Ok(());
    }
    let esp = esp::find()?;
    let keys = keys::unseal()?;
    uki::build(
        kernel,
        &initrd_for(kernel, built_initrd)?,
        &image(&esp, &kernel.version),
        &keys,
    )?;
    rustix::fs::sync();
    Ok(())
}

pub fn remove(version: &str) -> Result<()> {
    if let Ok(esp) = esp::find() {
        let _ = std::fs::remove_file(image(&esp, version));
    }
    Ok(())
}

pub fn rebuild_images(rebuild_initrds: bool) -> Result<()> {
    let esp = esp::find()?;
    let keys = keys::unseal()?;
    rebuild_with(&esp, &keys, rebuild_initrds)
}

fn rebuild_with(esp: &Esp, keys: &Unsealed, rebuild_initrds: bool) -> Result<()> {
    let kernels = kernels::installed();
    for kernel in &kernels {
        if rebuild_initrds {
            kernel.rebuild_initrd()?;
        }
        uki::build(
            kernel,
            &initrd_for(kernel, None)?,
            &image(esp, &kernel.version),
            keys,
        )?;
    }
    let current: Vec<String> = kernels
        .iter()
        .map(|kernel| image_name(&kernel.version))
        .collect();
    for stale in std::fs::read_dir(esp.file(IMAGES))
        .into_iter()
        .flatten()
        .flatten()
    {
        let name = stale.file_name().to_string_lossy().into_owned();
        if name.starts_with("luft-") && name.ends_with(".efi") && !current.contains(&name) {
            let _ = std::fs::remove_file(stale.path());
        }
    }
    Ok(())
}

pub fn install() -> Result<()> {
    if let Some(reason) = unavailable_reason() {
        bail!(reason);
    }
    let esp = esp::find()?;
    let Some(shim) = esp.shim() else {
        bail!("Fedora's shim isn't on the EFI system partition.");
    };
    mok::forget_code();
    let keys = keys::unseal()?;
    rebuild_with(&esp, &keys, true)?;
    super::sign::efi_binary(Path::new(BOOT_MENU), &esp.file(SIGNED_MENU), &keys)?;
    esp::write(&esp.file(LOADER_CONF), loader_conf(&esp).as_bytes())?;
    remove_boot_entry()?;
    rustix::fs::sync();
    Tool::new("efibootmgr")
        .arg("--create")
        .arg("--disk")
        .arg(format!("/dev/{}", esp.disk))
        .arg("--part")
        .arg(esp.partition.to_string())
        .args([
            "--label",
            LABEL,
            "--loader",
            &shim,
            "--unicode",
            MENU_LOADER_PATH,
        ])
        .status()
}

fn remove_boot_entry() -> Result<()> {
    if let Some(number) = boot_entry() {
        Tool::new("efibootmgr")
            .args(["--bootnum", &number, "--delete-bootnum"])
            .status()?;
    }
    Ok(())
}

fn loader_conf(esp: &Esp) -> String {
    let existing = std::fs::read_to_string(esp.file(LOADER_CONF)).unwrap_or_default();
    let mut lines: Vec<String> = existing
        .lines()
        .filter(|line| !line.trim_start().starts_with("default"))
        .map(str::to_owned)
        .collect();
    if !lines
        .iter()
        .any(|line| line.trim_start().starts_with("timeout"))
    {
        lines.push("timeout 0".to_owned());
    }
    lines.push("default luft-*".to_owned());
    lines.join("\n") + "\n"
}

pub fn uninstall() -> Result<()> {
    remove_boot_entry()?;
    let esp = esp::find()?;
    let _ = std::fs::remove_file(esp.file(SIGNED_MENU));
    remove_images(&esp);
    Ok(())
}

fn remove_images(esp: &Esp) {
    for image in std::fs::read_dir(esp.file(IMAGES))
        .into_iter()
        .flatten()
        .flatten()
    {
        if image.file_name().to_string_lossy().starts_with("luft-") {
            let _ = std::fs::remove_file(image.path());
        }
    }
}
