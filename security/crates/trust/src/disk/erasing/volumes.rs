use std::path::{Path, PathBuf};

use anyhow::{Context, Result};

use crate::disk::unclaimed::temporary;
use crate::disk::unlock::luks;
use crate::paths;
use crate::system::host::command::Tool;
use crate::system::secrets::secret::Secret;

pub const ROOT: &str = "root";
const SECTOR: u64 = 512;

pub fn mapped(name: &str) -> PathBuf {
    Path::new("/dev/mapper").join(name)
}

pub fn span(name: &str, partition: &Path, offset: u64, size: u64) -> Result<PathBuf> {
    let device = mapped(name);
    if !device.exists() {
        Tool::new("dmsetup")
            .args(["create", name, "--table"])
            .arg(format!(
                "0 {} linear {} {}",
                size / SECTOR,
                partition.display(),
                offset / SECTOR
            ))
            .status()?;
    }
    Ok(device)
}

pub fn remove_span(name: &str) -> Result<()> {
    Tool::new("dmsetup").args(["remove", name]).status()
}

pub fn close(name: &str) -> Result<()> {
    if mapped(name).exists() {
        Tool::new("cryptsetup").args(["close", name]).status()?;
    }
    Ok(())
}

pub fn open(device: &Path, name: &str, key: &Secret) -> Result<PathBuf> {
    if !mapped(name).exists() {
        Tool::new("cryptsetup")
            .args(["open", "--allow-discards", "--key-file", "-"])
            .arg(device)
            .arg(name)
            .input(key)
            .status()?;
    }
    Ok(mapped(name))
}

pub fn temporary_key(device: &Path) -> Result<Option<Secret>> {
    Ok(luks::read(device, None, 0)?
        .as_ref()
        .and_then(temporary::carried))
}

pub fn zero(device: &Path, length: u64) -> Result<()> {
    Tool::new("blkdiscard")
        .args(["--force", "--zeroout", "--offset", "0", "--length"])
        .arg(length.to_string())
        .arg(device)
        .unhurried()
        .status()
}

pub fn holds_luft(device: &Path) -> bool {
    Tool::new("blkid")
        .args(["--probe", "--output", "value", "--match-tag", "TYPE"])
        .arg(device)
        .output()
        .is_ok_and(|kind| kind.trim() == "btrfs")
}

pub struct Mounted {
    path: PathBuf,
}

impl Mounted {
    pub fn from(members: &[&Path]) -> Result<Self> {
        let member = members
            .iter()
            .find(|member| holds_luft(member))
            .context("Luft's files aren't on this drive anymore")?;
        for member in members.iter().filter(|member| holds_luft(member)) {
            Tool::new("btrfs")
                .args(["device", "scan"])
                .arg(member)
                .status()?;
        }
        let path = Path::new(paths::RUNTIME).join("erasing");
        paths::ensure_private(&path)?;
        Tool::new("mount")
            .args(["-t", "btrfs", "-o", "subvolid=5"])
            .arg(member)
            .arg(&path)
            .status()?;
        Ok(Self { path })
    }

    pub fn path(&self) -> &Path {
        &self.path
    }

    fn usage(&self, device: &Path) -> Option<(u64, u64)> {
        let listed = Tool::new("btrfs")
            .args(["device", "usage", "--raw"])
            .arg(&self.path)
            .output()
            .ok()?;
        let mut lines = listed
            .lines()
            .skip_while(|line| !line.starts_with(&format!("{},", device.display())));
        let id = lines.next()?.rsplit(' ').next()?.parse().ok()?;
        let number = |line: &str| line.split_whitespace().last()?.parse::<u64>().ok();
        let about: Vec<&str> = lines.take_while(|line| !line.trim().is_empty()).collect();
        let size = about.iter().find(|line| line.contains("Device size:"))?;
        let free = about.iter().find(|line| line.contains("Unallocated:"))?;
        Some((id, number(size)?.saturating_sub(number(free)?)))
    }

    pub fn allocated(&self, device: &Path) -> u64 {
        self.usage(device).map_or(0, |(_, allocated)| allocated)
    }

    pub fn add(&self, device: &Path) -> Result<()> {
        Tool::new("btrfs")
            .args(["device", "add", "--force"])
            .arg(device)
            .arg(&self.path)
            .unhurried()
            .status()
    }

    pub fn remove(&self, device: &Path) -> Result<()> {
        Tool::new("btrfs")
            .args(["device", "remove"])
            .arg(device)
            .arg(&self.path)
            .unhurried()
            .status()
    }

    pub fn smallest(&self) -> Result<u64> {
        Tool::new("btrfs")
            .args(["inspect-internal", "min-dev-size"])
            .arg(&self.path)
            .output()?
            .split_whitespace()
            .next()
            .and_then(|bytes| bytes.parse().ok())
            .context("Luft's files couldn't be measured")
    }

    pub fn resize(&self, device: &Path, size: &str) -> Result<()> {
        let (id, _) = self
            .usage(device)
            .context("Luft's files aren't on this drive anymore")?;
        Tool::new("btrfs")
            .args(["filesystem", "resize"])
            .arg(format!("{id}:{size}"))
            .arg(&self.path)
            .unhurried()
            .status()
    }
}

impl Drop for Mounted {
    fn drop(&mut self) {
        let _ = Tool::new("umount").arg(&self.path).status();
    }
}
