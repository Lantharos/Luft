use std::fs::{self, File, OpenOptions};
use std::io::{BufReader, Write};
use std::os::unix::fs::FileExt;
use std::path::{Path, PathBuf};

use anyhow::{Context, Result, bail, ensure};

use super::private_mount::with_mounted;
use super::{Change, edited};
use crate::{SYSTEM_HIVE, Volume, hibernated};

const PAGE: usize = 4096;
const BACKUP: &str = "SYSTEM.luft-backup";

pub fn apply(device: &Path, changes: &[Change]) -> Result<bool> {
    let original = read_safely(device)?;
    let Some(updated) = edited(&original, changes)? else {
        return Ok(false);
    };
    with_mounted(device, |root| rewrite(root, &original, &updated))?;
    Ok(true)
}

pub(super) fn rewrite(root: &Path, original: &[u8], updated: &[u8]) -> Result<()> {
    let hive = locate(root, SYSTEM_HIVE)?;
    ensure!(
        fs::read(&hive)? == original,
        "Windows' settings changed while Luft was reading them"
    );
    back_up(&hive, original)?;
    write_pages(&hive, original, updated)?;
    if fs::read(&hive)? != updated {
        write_pages(&hive, updated, original)?;
        bail!("Windows' settings didn't save correctly, so Luft put them back");
    }
    Ok(())
}

fn read_safely(device: &Path) -> Result<Vec<u8>> {
    let file = File::open(device).with_context(|| format!("Couldn't open {}", device.display()))?;
    let mut volume = Volume::open(BufReader::new(file))?;
    if hibernated(&mut volume)? {
        bail!(
            "Windows is hibernated or was shut down with Fast Startup, so its drive can't be changed now"
        );
    }
    if volume.dirty()? {
        bail!("Windows' drive needs a check. Start Windows and restart it once");
    }
    volume
        .read(SYSTEM_HIVE)?
        .context("There's no Windows on this drive")
}

fn locate(root: &Path, windows_path: &str) -> Result<PathBuf> {
    let mut path = root.to_owned();
    for component in windows_path.split('\\') {
        let name = fs::read_dir(&path)?
            .flatten()
            .map(|entry| entry.file_name())
            .find(|name| name.to_string_lossy().eq_ignore_ascii_case(component))
            .with_context(|| format!("{windows_path} is missing"))?;
        path.push(name);
    }
    Ok(path)
}

fn back_up(hive: &Path, original: &[u8]) -> Result<()> {
    let mut backup = File::create(hive.with_file_name(BACKUP))?;
    backup.write_all(original)?;
    backup.sync_all()?;
    Ok(())
}

fn write_pages(path: &Path, from: &[u8], to: &[u8]) -> Result<()> {
    let file = OpenOptions::new().write(true).open(path)?;
    for (index, page) in to.chunks(PAGE).enumerate().skip(1) {
        let start = index * PAGE;
        if from.get(start..start + page.len()) != Some(page) {
            file.write_all_at(page, start as u64)?;
        }
    }
    file.set_len(to.len() as u64)?;
    file.sync_all()?;
    file.write_all_at(&to[..PAGE.min(to.len())], 0)?;
    file.sync_all()?;
    Ok(())
}
