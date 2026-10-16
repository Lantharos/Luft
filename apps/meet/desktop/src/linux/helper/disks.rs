use std::path::{Path, PathBuf};
use std::process::Command;

use serde::Deserialize;

pub const ESP_TYPE: &str = "c12a7328-f81f-11d2-ba4b-00a0c93ec93b";

#[derive(Deserialize, Clone, Debug)]
pub struct Block {
    pub name: String,
    pub path: String,
    #[serde(rename = "type")]
    pub kind: String,
    pub partuuid: Option<String>,
    pub parttype: Option<String>,
    pub pttype: Option<String>,
    #[serde(default)]
    pub mountpoints: Vec<Option<String>>,
    #[serde(default)]
    pub children: Vec<Block>,
}

#[derive(Deserialize)]
struct Listing {
    blockdevices: Vec<Block>,
}

#[derive(Deserialize, Clone, Debug)]
pub struct Mount {
    pub target: PathBuf,
    pub source: String,
    pub fstype: String,
    pub fsroot: String,
    pub uuid: Option<String>,
}

#[derive(Deserialize)]
struct Mounts {
    filesystems: Vec<Mount>,
}

fn output(command: &mut Command) -> Result<Vec<u8>, String> {
    let output = command
        .env("LC_ALL", "C.UTF-8")
        .output()
        .map_err(|error| error.to_string())?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).trim().to_owned());
    }
    Ok(output.stdout)
}

pub fn blocks() -> Result<Vec<Block>, String> {
    let listing = output(Command::new("lsblk").args([
        "--json",
        "--bytes",
        "--output",
        "NAME,PATH,TYPE,PARTUUID,PARTTYPE,PTTYPE,MOUNTPOINTS",
    ]))?;
    serde_json::from_slice::<Listing>(&listing)
        .map(|listing| listing.blockdevices)
        .map_err(|error| format!("The drives couldn't be listed: {error}"))
}

pub fn mount_of(path: &Path) -> Result<Mount, String> {
    let listing = output(
        Command::new("findmnt")
            .args([
                "--json",
                "--nofsroot",
                "--output",
                "TARGET,SOURCE,FSTYPE,FSROOT,UUID",
                "--target",
            ])
            .arg(path),
    )?;
    serde_json::from_slice::<Mounts>(&listing)
        .ok()
        .and_then(|mounts| mounts.filesystems.into_iter().next())
        .ok_or_else(|| format!("Couldn't tell which drive holds {}", path.display()))
}

pub fn lineage<'a>(blocks: &'a [Block], path: &str) -> Option<Vec<&'a Block>> {
    for block in blocks {
        if block.path == path {
            return Some(vec![block]);
        }
        if let Some(mut found) = lineage(&block.children, path) {
            found.insert(0, block);
            return Some(found);
        }
    }
    None
}

pub fn all(blocks: &[Block]) -> Vec<&Block> {
    blocks
        .iter()
        .flat_map(|block| std::iter::once(block).chain(all(&block.children)))
        .collect()
}

pub fn free_space(path: &Path) -> Option<u64> {
    let path = std::ffi::CString::new(path.as_os_str().as_encoded_bytes()).ok()?;
    let mut stat = std::mem::MaybeUninit::<libc::statvfs>::uninit();
    if unsafe { libc::statvfs(path.as_ptr(), stat.as_mut_ptr()) } != 0 {
        return None;
    }
    let stat = unsafe { stat.assume_init() };
    Some(stat.f_bavail * stat.f_frsize)
}

pub fn used_by(path: &Path) -> u64 {
    let Ok(metadata) = std::fs::symlink_metadata(path) else {
        return 0;
    };
    if !metadata.is_dir() {
        return metadata.len();
    }
    std::fs::read_dir(path)
        .map(|entries| entries.flatten().map(|entry| used_by(&entry.path())).sum())
        .unwrap_or(0)
}
