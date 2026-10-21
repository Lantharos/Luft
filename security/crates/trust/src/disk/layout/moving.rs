use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

use anyhow::{Context, Result, bail, ensure};

use crate::disk::SystemDisk;
use crate::disk::unlock::keys;
use crate::paths;
use crate::system::firmware::efi;
use crate::system::host::command::Tool;
use crate::system::host::{blocks, uuid};
use crate::system::secrets::secret::Secret;

const MOVING: &str = "LuftMove";
const PREFIX: &str = "luft-move-";
const HEADER: &str = "/run/trustd/move-header";
const ROOT_PARTITION: &str = "/dev/luft-root-partition";
const SECTOR: u64 = 512;
const DEVICE_WAIT: Duration = Duration::from_secs(90);

fn name_of(device: &Path) -> Result<String> {
    blocks::kernel_name(device).with_context(|| format!("{} isn't there", device.display()))
}

fn partuuid(device: &Path) -> Result<String> {
    blocks::partuuid(&name_of(device)?)
        .with_context(|| format!("{} isn't a partition", device.display()))
}

fn moving() -> Vec<String> {
    efi::luft_variable(MOVING)
        .and_then(|data| serde_json::from_slice(&data).ok())
        .unwrap_or_default()
}

fn note(partitions: &[String]) -> Result<()> {
    let data = serde_json::to_vec(partitions)?;
    efi::set_luft_variable(MOVING, (!partitions.is_empty()).then_some(data.as_slice()))
        .context("The firmware didn't keep the note about moving the system disk")
}

fn mapping_on(device: &Path) -> Result<Option<String>> {
    Ok(blocks::holders(&name_of(device)?)
        .into_iter()
        .find_map(|holder| blocks::dm_name(&holder)))
}

fn mapper(name: &str) -> PathBuf {
    Path::new("/dev/mapper").join(name)
}

fn system_key(disk: &SystemDisk) -> Result<Secret> {
    let header = disk.header()?.context("The system disk isn't encrypted")?;
    ensure!(
        header.reencrypting.is_none(),
        "The system disk is still being encrypted or decrypted, so it can't move yet"
    );
    keys::unlock_key(&disk.device(), None, &Secret::default())
        .context("Without a TPM, only Luft's startup can open the system disk")
}

fn copy_header(from: &Path, to: &Path) -> Result<()> {
    paths::ensure_private(paths::RUNTIME)?;
    let _ = std::fs::remove_file(HEADER);
    Tool::new("cryptsetup")
        .args([
            "luksHeaderBackup",
            "--batch-mode",
            "--header-backup-file",
            HEADER,
        ])
        .arg(from)
        .status()?;
    let restored = Tool::new("cryptsetup")
        .args([
            "luksHeaderRestore",
            "--batch-mode",
            "--header-backup-file",
            HEADER,
        ])
        .arg(to)
        .status();
    let _ = std::fs::remove_file(HEADER);
    restored?;
    Tool::new("cryptsetup")
        .args(["luksUUID", "--batch-mode", "--uuid", &uuid::random()?])
        .arg(to)
        .status()
}

pub fn copy_to(device: &Path) -> Result<PathBuf> {
    if let Some(open) = mapping_on(device)? {
        return Ok(mapper(&open));
    }
    let disk = SystemDisk::find()?;
    ensure!(
        name_of(device)? != disk.partition,
        "The system disk can't be copied onto itself"
    );
    let key = system_key(&disk)?;
    if !keys::opens(device, None, &key) {
        copy_header(&disk.device(), device)?;
    }
    let partition = partuuid(device)?;
    let mut noted = moving();
    let halves = [blocks::partuuid(&disk.partition), Some(partition.clone())];
    let missing: Vec<String> = halves
        .into_iter()
        .flatten()
        .filter(|half| !noted.contains(half))
        .collect();
    if !missing.is_empty() {
        noted.extend(missing);
        note(&noted)?;
    }
    let name = format!("{PREFIX}{partition}");
    Tool::new("cryptsetup")
        .args(["open", "--allow-discards", "--key-file", "-"])
        .arg(device)
        .arg(&name)
        .input(&key)
        .status()
        .context("The copy of the system disk's encryption couldn't be opened")?;
    Ok(mapper(&name))
}

pub fn retire(device: &Path) -> Result<()> {
    if let Some(open) = mapping_on(device)? {
        Tool::new("cryptsetup").arg("close").arg(&open).status()?;
    }
    if Tool::new("cryptsetup").arg("isLuks").arg(device).succeeds() {
        Tool::new("cryptsetup")
            .args(["erase", "--batch-mode"])
            .arg(device)
            .status()?;
    }
    Tool::new("wipefs").arg("--all").arg(device).status()?;
    if let Err(error) = Tool::new("blkdiscard").arg("--force").arg(device).status() {
        eprintln!("{} couldn't be trimmed: {error:#}", device.display());
    }
    note(&[])
}

pub fn settle(device: &Path, luks_uuid: &str) -> Result<()> {
    ensure!(uuid::is_uuid(luks_uuid), "{luks_uuid} isn't a LUKS UUID");
    Tool::new("cryptsetup")
        .args(["luksUUID", "--batch-mode", "--uuid", luks_uuid])
        .arg(device)
        .status()
}

fn data_offset(mapping: &str) -> Result<u64> {
    let status = Tool::new("cryptsetup")
        .arg("status")
        .arg(mapping)
        .output()?;
    status
        .lines()
        .find_map(|line| {
            line.trim()
                .strip_prefix("offset:")?
                .split_whitespace()
                .next()?
                .parse::<u64>()
                .ok()
        })
        .map(|sectors| sectors * SECTOR)
        .context("The open disk didn't say where its data starts")
}

pub fn fit(device: &Path, partition_size: Option<u64>) -> Result<()> {
    let mapping =
        mapping_on(device)?.with_context(|| format!("{} isn't open", device.display()))?;
    let key = system_key(&SystemDisk::find()?)?;
    let mut resize = Tool::new("cryptsetup").args(["resize", "--key-file", "-"]);
    if let Some(size) = partition_size {
        let sectors = size.saturating_sub(data_offset(&mapping)?) / SECTOR;
        resize = resize.arg("--size").arg(sectors.to_string());
    }
    resize
        .arg(&mapping)
        .input(&key)
        .status()
        .context("The system disk's encryption couldn't change its size")
}

fn wait_for(device: &Path) -> Result<()> {
    let started = Instant::now();
    while !device.exists() {
        if started.elapsed() > DEVICE_WAIT {
            bail!("{} never appeared", device.display());
        }
        std::thread::sleep(Duration::from_millis(200));
    }
    Ok(())
}

pub fn open_in_initrd() -> Result<()> {
    let root = Path::new(ROOT_PARTITION);
    wait_for(root)?;
    let root = root.canonicalize()?;
    for partition in moving() {
        ensure!(
            uuid::is_partuuid(&partition),
            "{partition} isn't a partition UUID"
        );
        let device = Path::new("/dev/disk/by-partuuid").join(&partition);
        wait_for(&device)?;
        if device.canonicalize()? == root
            || mapping_on(&device)?.is_some()
            || !Tool::new("cryptsetup")
                .arg("isLuks")
                .arg(&device)
                .succeeds()
        {
            continue;
        }
        Tool::new("/usr/lib/systemd/systemd-cryptsetup")
            .arg("attach")
            .arg(format!("{PREFIX}{partition}"))
            .arg(&device)
            .arg("none")
            .arg("discard,tpm2-device=auto")
            .status()
            .with_context(|| format!("{} couldn't be opened", device.display()))?;
    }
    Ok(())
}
