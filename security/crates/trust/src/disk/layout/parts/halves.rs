use std::fs::File;
use std::io::{Read, Seek, SeekFrom};
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

use anyhow::{Context, Result, bail, ensure};

use crate::disk::SystemDisk;
use crate::disk::unlock::{keys, luks};
use crate::paths;
use crate::system::host::command::Tool;
use crate::system::host::{blocks, uuid};
use crate::system::secrets::keyring;
use crate::system::secrets::secret::Secret;

const PREFIX: &str = "luft-move-";
const TOKEN: &str = "luft-move";
const HEADER: &str = "/run/trustd/move-header";
const ROOT_PARTITION: &str = "/dev/luft-root-partition";
const SECTOR: u64 = 512;
const DEVICE_WAIT: Duration = Duration::from_secs(90);
const BTRFS_FSID: u64 = (64 << 10) + 32;

fn name_of(device: &Path) -> Result<String> {
    blocks::kernel_name(device).with_context(|| format!("{} isn't there", device.display()))
}

fn mapping_on(device: &Path) -> Result<Option<String>> {
    Ok(blocks::holders(&name_of(device)?)
        .into_iter()
        .find_map(|holder| blocks::dm_name(&holder)))
}

fn mapper(name: &str) -> PathBuf {
    Path::new("/dev/mapper").join(name)
}

fn btrfs_fsid(device: &Path) -> Option<String> {
    let mut fsid = [0u8; 16];
    let mut file = File::open(device).ok()?;
    file.seek(SeekFrom::Start(BTRFS_FSID)).ok()?;
    file.read_exact(&mut fsid).ok()?;
    let hex: String = fsid.iter().map(|byte| format!("{byte:02x}")).collect();
    Some(format!(
        "{}-{}-{}-{}-{}",
        &hex[..8],
        &hex[8..12],
        &hex[12..16],
        &hex[16..20],
        &hex[20..]
    ))
}

fn read_header(device: &Path) -> Result<luks::Header> {
    luks::read(device, None, 0)?.with_context(|| format!("{} isn't encrypted", device.display()))
}

fn mark(device: &Path, filesystem: &str) -> Result<()> {
    if read_header(device)?.has(TOKEN) {
        return Ok(());
    }
    let token = Secret::from(format!(
        r#"{{"type":"{TOKEN}","keyslots":[],"filesystem":"{filesystem}"}}"#
    ));
    Tool::new("cryptsetup")
        .args(["token", "import", "--json-file", "-"])
        .arg(device)
        .input(&token)
        .status()
        .context("The system disk couldn't be marked as moving")
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

pub fn system_key(typed: &Secret) -> Result<Option<Secret>> {
    let disk = SystemDisk::find()?;
    if disk.mapping.is_none() {
        return Ok(None);
    }
    let device = disk.device();
    keys::unlock_key(&device, None, typed)
        .or_else(|error| {
            keyring::systemd_cached()
                .into_iter()
                .find(|key| typed.is_empty() && keys::opens(&device, None, key))
                .ok_or(error)
        })
        .map(Some)
}

pub fn seal(device: &Path, key: &Secret) -> Result<PathBuf> {
    if let Some(open) = mapping_on(device)? {
        return Ok(mapper(&open));
    }
    let disk = SystemDisk::find()?;
    ensure!(
        name_of(device)? != disk.partition,
        "The system disk can't be copied onto itself"
    );
    let filesystem =
        btrfs_fsid(Path::new(&disk.root.source)).context("Luft's file system has no UUID")?;
    mark(&disk.device(), &filesystem)?;
    if !keys::opens(device, None, key) {
        copy_header(&disk.device(), device)?;
    }
    let partition = blocks::partuuid(&name_of(device)?)
        .with_context(|| format!("{} isn't a partition", device.display()))?;
    let name = format!("{PREFIX}{partition}");
    Tool::new("cryptsetup")
        .args(["open", "--allow-discards", "--key-file", "-"])
        .arg(device)
        .arg(&name)
        .input(key)
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
    Ok(())
}

pub fn settle(device: &Path, luks_uuid: &str) -> Result<()> {
    ensure!(uuid::is_uuid(luks_uuid), "{luks_uuid} isn't a LUKS UUID");
    Tool::new("cryptsetup")
        .args(["luksUUID", "--batch-mode", "--uuid", luks_uuid])
        .arg(device)
        .status()?;
    keys::remove_tokens(device, &read_header(device)?, TOKEN)
}

pub fn data_offset(mapping: &str) -> Result<u64> {
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

pub fn fit(device: &Path, partition_size: Option<u64>, key: &Secret) -> Result<()> {
    let mapping =
        mapping_on(device)?.with_context(|| format!("{} isn't open", device.display()))?;
    let mut resize = Tool::new("cryptsetup").args(["resize", "--key-file", "-"]);
    if let Some(size) = partition_size {
        let sectors = size.saturating_sub(data_offset(&mapping)?) / SECTOR;
        resize = resize.arg("--size").arg(sectors.to_string());
    }
    resize
        .arg(&mapping)
        .input(key)
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

fn moving_half(name: &str) -> Option<(PathBuf, String, String)> {
    let device = blocks::device(name);
    let filesystem = luks::read(&device, None, 0)
        .ok()??
        .tokens
        .into_iter()
        .find_map(|(_, token)| (token.kind == TOKEN).then_some(token.filesystem))
        .filter(|filesystem| uuid::is_uuid(filesystem))?;
    let partition = blocks::partuuid(name).filter(|partition| uuid::is_partuuid(partition))?;
    Some((device, partition, filesystem))
}

fn open_half(device: &Path, partition: &str, filesystem: &str) -> Result<()> {
    let name = format!("{PREFIX}{partition}");
    Tool::new("/usr/lib/systemd/systemd-cryptsetup")
        .arg("attach")
        .arg(&name)
        .arg(device)
        .arg("none")
        .arg("discard,tpm2-device=auto")
        .status()
        .with_context(|| format!("{} couldn't be opened", device.display()))?;
    if btrfs_fsid(&mapper(&name)).as_deref() == Some(filesystem) {
        return Ok(());
    }
    eprintln!(
        "{} no longer belongs to Luft's file system, so it stays closed",
        device.display()
    );
    Tool::new("/usr/lib/systemd/systemd-cryptsetup")
        .arg("detach")
        .arg(&name)
        .status()
}

pub fn open_in_initrd() -> Result<()> {
    let root = Path::new(ROOT_PARTITION);
    wait_for(root)?;
    if !Tool::new("cryptsetup").arg("isLuks").arg(root).succeeds() {
        return Ok(());
    }
    let root = name_of(root)?;
    let disk = blocks::disk_of(&root).context("Luft's partition isn't on a disk")?;
    let _ = Tool::new("udevadm").arg("settle").status();
    for (device, partition, filesystem) in blocks::partitions_of(&disk)
        .iter()
        .filter(|name| **name != root)
        .filter_map(|name| moving_half(name))
    {
        if mapping_on(&device)?.is_none() {
            open_half(&device, &partition, &filesystem)?;
        }
    }
    Ok(())
}
