use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

use luft_i18n::t;

use super::disks::{self, Block, ESP_TYPE};
use crate::L10N;
use crate::boot::load_option::{self, Partition};

pub const LOADER_FOLDER: &str = "EFI/luft-meet";
pub const LOADER: &str = r"\EFI\luft-meet\shimx64.efi";
const MOUNTED_HERE: &str = "/run/luft-meet/esp";
const SECTOR: u64 = 512;

pub struct Esp {
    device: String,
    name: String,
    pub partuuid: String,
    pub gpt: bool,
    mountpoint: Option<PathBuf>,
}

pub struct Opened {
    at: PathBuf,
    ours: bool,
}

impl Opened {
    pub fn loader(&self) -> PathBuf {
        self.at.join(LOADER_FOLDER)
    }

    pub fn root(&self) -> &Path {
        &self.at
    }
}

impl Drop for Opened {
    fn drop(&mut self) {
        if self.ours {
            let _ = Command::new("umount").arg(&self.at).status();
        }
    }
}

fn candidates(blocks: &[Block]) -> Vec<(Esp, bool)> {
    let mut found = Vec::new();
    for disk in blocks {
        for part in disks::all(&disk.children) {
            if part
                .parttype
                .as_deref()
                .is_some_and(|kind| kind.eq_ignore_ascii_case(ESP_TYPE))
            {
                let mountpoint = part.mountpoints.iter().flatten().next().map(PathBuf::from);
                found.push((
                    Esp {
                        device: part.path.clone(),
                        name: part.name.clone(),
                        partuuid: part
                            .partuuid
                            .clone()
                            .unwrap_or_default()
                            .to_ascii_lowercase(),
                        gpt: disk.pttype.as_deref() == Some("gpt"),
                        mountpoint,
                    },
                    disks::all(&disk.children)
                        .iter()
                        .any(|other| other.mountpoints.iter().flatten().any(|point| point == "/")),
                ));
            }
        }
    }
    found
}

pub fn find(blocks: &[Block], partuuid: Option<&str>) -> Option<Esp> {
    let mut candidates = candidates(blocks);
    if let Some(wanted) = partuuid {
        return candidates
            .into_iter()
            .map(|(esp, _)| esp)
            .find(|esp| esp.partuuid.eq_ignore_ascii_case(wanted));
    }
    candidates.sort_by_key(|(esp, beside_root)| (esp.mountpoint.is_none(), !beside_root));
    candidates.into_iter().next().map(|(esp, _)| esp)
}

impl Esp {
    pub fn open(&self) -> Result<Opened, String> {
        if let Some(at) = &self.mountpoint {
            return Ok(Opened {
                at: at.clone(),
                ours: false,
            });
        }
        fs::create_dir_all(MOUNTED_HERE).map_err(|error| error.to_string())?;
        let mounted = Command::new("mount")
            .arg(&self.device)
            .arg(MOUNTED_HERE)
            .status()
            .map_err(|error| error.to_string())?;
        if !mounted.success() {
            return Err(t!(L10N, "drive-esp-not-opened"));
        }
        Ok(Opened {
            at: PathBuf::from(MOUNTED_HERE),
            ours: true,
        })
    }

    pub fn partition(&self) -> Result<Partition, String> {
        let partition = Path::new("/sys/class/block").join(&self.name);
        let number = |file: &str| -> Result<u64, String> {
            fs::read_to_string(partition.join(file))
                .map_err(|error| error.to_string())?
                .trim()
                .parse()
                .map_err(|_| t!(L10N, "drive-esp-file-unreadable", file = file))
        };
        let disk = fs::canonicalize(&partition)
            .map_err(|error| error.to_string())?
            .parent()
            .map(Path::to_path_buf)
            .ok_or_else(|| t!(L10N, "drive-esp-no-drive"))?;
        let sector: u64 = fs::read_to_string(disk.join("queue/logical_block_size"))
            .ok()
            .and_then(|text| text.trim().parse().ok())
            .unwrap_or(SECTOR);
        Ok(Partition {
            number: number("partition")? as u32,
            first_lba: number("start")? * SECTOR / sector,
            sectors: number("size")? * SECTOR / sector,
            guid: load_option::guid_bytes(&self.partuuid)
                .ok_or_else(|| t!(L10N, "drive-esp-no-guid"))?,
        })
    }
}
