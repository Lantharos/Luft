use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use crate::boot::entry;
use crate::boot::options::{self, LoadOption};
use crate::boot::other_systems;
use crate::paths;
use crate::system::host::blocks;
use crate::system::host::command::Tool;

const ENTRIES: &str = "loader/entries";
const IMAGES: &str = "EFI/Linux";
const LOADER_CONF: &str = "loader/loader.conf";
const LUFT: &str = "EFI/luft";
const WITHOUT_KEY: &str = "EFI/luft-start";
const BOOTC_IMAGES: &str = "EFI/Linux/bootc";
const BOOTC_ENTRY: &str = "bootc";
const REMOVABLE: &str = "EFI/BOOT";
const REMOVABLE_LOADER: &str = "EFI/BOOT/BOOTX64.EFI";
const WINDOWS_LOADER: &str = "EFI/Microsoft/Boot/bootmgfw.efi";
const SHIM: &str = "shimx64.efi";

pub struct Mounted {
    pub path: PathBuf,
}

impl Mounted {
    pub fn partuuid(partuuid: &str, name: &str) -> Result<Self> {
        let device = Path::new("/dev/disk/by-partuuid").join(partuuid);
        let path = Path::new(paths::RUNTIME).join("moving").join(name);
        paths::ensure_private(&path)?;
        blocks::mount_boot_partition(&device, &path, false)
            .with_context(|| format!("{} couldn't be opened", device.display()))?;
        Ok(Self { path })
    }

    pub fn file(&self, relative: &str) -> PathBuf {
        self.path.join(relative)
    }

    pub fn holds_entries(&self) -> bool {
        self.file(ENTRIES).is_dir()
    }
}

impl Drop for Mounted {
    fn drop(&mut self) {
        let _ = Tool::new("umount").arg(&self.path).status();
    }
}

fn copy_folder(from: &Path, to: &Path) -> Result<()> {
    if !from.is_dir() {
        return Ok(());
    }
    std::fs::create_dir_all(to)?;
    Tool::new("cp")
        .args(["--recursive", "--preserve=timestamps", "--"])
        .arg(from.join("."))
        .arg(to)
        .status()
        .with_context(|| format!("{} couldn't be copied", from.display()))
}

pub fn copy(
    old_esp: &Mounted,
    old_boot: &Mounted,
    new_esp: &Mounted,
    new_boot: &Mounted,
) -> Result<()> {
    copy_folder(&old_boot.file(ENTRIES), &new_boot.file(ENTRIES))?;
    copy_folder(&old_boot.file(IMAGES), &new_boot.file(IMAGES))?;
    if old_esp.file(LOADER_CONF).is_file() {
        std::fs::create_dir_all(new_esp.file("loader"))?;
        std::fs::copy(old_esp.file(LOADER_CONF), new_esp.file(LOADER_CONF))?;
    }
    copy_folder(&old_esp.file(LUFT), &new_esp.file(LUFT))?;
    rustix::fs::sync();
    Ok(())
}

fn remove_bootc_entries(boot: &Mounted) {
    for entry in std::fs::read_dir(boot.file(ENTRIES))
        .into_iter()
        .flatten()
        .flatten()
    {
        if entry.file_name().to_string_lossy().starts_with(BOOTC_ENTRY) {
            let _ = std::fs::remove_file(entry.path());
        }
    }
    let _ = std::fs::remove_dir_all(boot.file(BOOTC_IMAGES));
}

fn give_back_removable(esp: &Mounted) {
    let windows = esp.file(WINDOWS_LOADER);
    if windows.is_file() {
        let _ = std::fs::copy(&windows, esp.file(REMOVABLE_LOADER));
        for leftover in ["grubx64.efi", "mmx64.efi"] {
            let _ = std::fs::remove_file(esp.file(REMOVABLE).join(leftover));
        }
    } else {
        let _ = std::fs::remove_dir_all(esp.file(REMOVABLE));
    }
}

fn removable_is_luft(esp: &Mounted) -> bool {
    std::fs::read(esp.file(REMOVABLE_LOADER))
        .ok()
        .zip(std::fs::read(esp.file(LUFT).join(SHIM)).ok())
        .is_some_and(|(removable, shim)| removable == shim)
}

pub fn clear(esp: &Mounted, boot: Option<&Mounted>) {
    if removable_is_luft(esp) {
        give_back_removable(esp);
    }
    let _ = std::fs::remove_dir_all(esp.file(LUFT));
    let _ = std::fs::remove_dir_all(esp.file(WITHOUT_KEY));
    remove_bootc_entries(boot.unwrap_or(esp));
    rustix::fs::sync();
}

pub fn only_luft(esp: &Mounted) -> bool {
    std::fs::read_dir(esp.file("EFI"))
        .into_iter()
        .flatten()
        .flatten()
        .all(|entry| other_systems::is_luft_folder(&entry.file_name().to_string_lossy()))
}

pub fn trial_label(name: &str) -> String {
    format!("Luft on {name}")
}

pub fn add_trial_entry(esp: &Path, name: &str) -> Result<()> {
    let partition = blocks::kernel_name(esp).context("The new EFI system partition is gone")?;
    let disk =
        blocks::disk_of(&partition).context("The new EFI system partition isn't on a disk")?;
    let number = blocks::partition_number(&partition)
        .context("The new EFI system partition isn't a partition")?;
    let label = trial_label(name);
    entry::remove(&label)?;
    Tool::new("efibootmgr")
        .args(["--quiet", "--create-only", "--disk"])
        .arg(blocks::device(&disk))
        .arg("--part")
        .arg(number.to_string())
        .args([
            "--label",
            &label,
            "--loader",
            &format!("\\EFI\\luft\\{SHIM}"),
        ])
        .status()
        .context("The firmware didn't take a start entry for the new drive")?;
    entry::start_next(&label)
}

fn starts_luft(option: &LoadOption, esp: &str) -> bool {
    option.starts_from(esp, LUFT) || option.starts_from(esp, WITHOUT_KEY)
}

fn forget_entries(doomed: impl Fn(&LoadOption) -> bool) -> Result<()> {
    options::all()
        .iter()
        .filter(|option| doomed(option))
        .try_for_each(|option| entry::delete(&format!("{:04X}", option.number)))
}

pub fn forget_entries_on(esp: &str) -> Result<()> {
    forget_entries(|option| starts_luft(option, esp))
}

pub fn forget_entries_elsewhere(esp: &str) -> Result<()> {
    forget_entries(|option| {
        option
            .partition
            .as_deref()
            .is_some_and(|partition| partition != esp && starts_luft(option, partition))
    })
}
