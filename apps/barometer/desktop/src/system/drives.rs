use std::collections::{HashMap, HashSet};
use std::ffi::CString;
use std::fs;
use std::path::{Path, PathBuf};

use serde::Serialize;

use super::hwmon::{self, Sensor};
use super::procfile::{ProcFile, read_number, read_text, udev_property};

const BLOCK: &str = "/sys/block";
const SECTOR: u64 = 512;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DriveInfo {
    pub id: String,
    name: String,
    model: Option<String>,
    kind: &'static str,
    size: u64,
    removable: bool,
    #[serde(rename = "virtual")]
    is_virtual: bool,
    read_only: bool,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DriveSample {
    id: String,
    read: f64,
    write: f64,
    busy: f32,
    read_total: u64,
    write_total: u64,
    temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    space: Option<Space>,
}

#[derive(Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
struct Space {
    used: u64,
    size: u64,
    mounts: Vec<String>,
}

#[derive(Clone, Copy, Default)]
struct Counters {
    read: u64,
    written: u64,
    busy: u64,
}

struct Drive {
    info: DriveInfo,
    device: String,
    devices: HashSet<String>,
    sensor: Option<Sensor>,
    previous: Option<Counters>,
}

pub struct Drives {
    diskstats: ProcFile,
    names: Vec<String>,
    drives: Vec<Drive>,
}

impl Drives {
    pub fn new() -> std::io::Result<Self> {
        let mut drives = Self {
            diskstats: ProcFile::open("/proc/diskstats")?,
            names: Vec::new(),
            drives: Vec::new(),
        };
        drives.refresh();
        Ok(drives)
    }

    pub fn infos(&self) -> Vec<DriveInfo> {
        self.drives.iter().map(|drive| drive.info.clone()).collect()
    }

    pub fn disks(&self) -> HashSet<String> {
        self.drives
            .iter()
            .filter(|drive| !drive.info.is_virtual)
            .map(|drive| drive.device.clone())
            .collect()
    }

    pub fn refresh(&mut self) -> bool {
        let names = block_names();
        if names == self.names {
            return false;
        }
        let mut previous: HashMap<String, Drive> = self
            .drives
            .drain(..)
            .map(|drive| (drive.info.id.clone(), drive))
            .collect();
        self.drives = names
            .iter()
            .filter_map(|name| {
                previous
                    .remove(&format!("drive:{name}"))
                    .or_else(|| Drive::open(name))
            })
            .collect();
        self.names = names;
        true
    }

    pub fn sample(&mut self, elapsed: f64, detailed: Option<&str>) -> Vec<DriveSample> {
        let counters = counters(&mut self.diskstats);
        let mounts = detailed.map(|_| mounted_filesystems());
        self.drives
            .iter_mut()
            .map(|drive| {
                let shown = detailed == Some(drive.info.id.as_str());
                let now = counters
                    .get(drive.info.name.as_str())
                    .copied()
                    .unwrap_or_default();
                let before = drive.previous.replace(now).unwrap_or(now);
                let rate = |now: u64, before: u64| {
                    now.saturating_sub(before) as f64 * SECTOR as f64 / elapsed
                };
                DriveSample {
                    id: drive.info.id.clone(),
                    read: rate(now.read, before.read),
                    write: rate(now.written, before.written),
                    busy: (now.busy.saturating_sub(before.busy) as f64 / (elapsed * 1000.0) * 100.0)
                        .min(100.0) as f32,
                    read_total: now.read * SECTOR,
                    write_total: now.written * SECTOR,
                    temperature: shown
                        .then(|| drive.sensor.as_mut().and_then(Sensor::celsius))
                        .flatten(),
                    space: mounts
                        .as_ref()
                        .filter(|_| shown)
                        .map(|mounts| drive.space(mounts)),
                }
            })
            .collect()
    }
}

fn counters(diskstats: &mut ProcFile) -> HashMap<&str, Counters> {
    let Ok(text) = diskstats.text() else {
        return HashMap::new();
    };
    text.lines()
        .filter_map(|line| {
            let fields: Vec<&str> = line.split_ascii_whitespace().collect();
            let number = |index: usize| {
                fields
                    .get(index)
                    .and_then(|value| value.parse().ok())
                    .unwrap_or(0)
            };
            Some((
                *fields.get(2)?,
                Counters {
                    read: number(5),
                    written: number(9),
                    busy: number(12),
                },
            ))
        })
        .collect()
}

impl Drive {
    fn open(name: &str) -> Option<Self> {
        let path = Path::new(BLOCK).join(name);
        let size = read_number::<u64>(path.join("size"))? * SECTOR;
        if size == 0 {
            return None;
        }
        let device = read_text(path.join("dev"))?;
        let udev = format!("b{device}");
        let removable = read_number::<u8>(path.join("removable")) == Some(1);
        let usb = udev_property(&udev, "ID_BUS").is_some_and(|bus| bus == "usb");
        let kind = kind(name, &path, removable || usb);
        let is_virtual = matches!(
            kind,
            "loop" | "zram" | "mapper" | "encrypted" | "raid" | "virtual"
        );
        let mut devices = HashSet::from([name.to_owned()]);
        for partition in partitions(&path, name) {
            devices.extend(holders(&partition));
            if let Some(partition) = partition.file_name() {
                devices.insert(partition.to_string_lossy().into_owned());
            }
        }
        devices.extend(holders(&path));
        Some(Self {
            info: DriveInfo {
                id: format!("drive:{name}"),
                name: name.to_owned(),
                model: model(name, &path, &udev),
                kind,
                size,
                removable: removable || usb,
                is_virtual,
                read_only: read_number::<u8>(path.join("ro")) == Some(1),
            },
            device,
            devices,
            sensor: hwmon::device_sensor(&path.join("device"), &["Composite"]),
            previous: None,
        })
    }

    fn space(&self, mounts: &HashMap<String, Vec<PathBuf>>) -> Space {
        let mut space = Space::default();
        for device in &self.devices {
            let Some(points) = mounts.get(device) else {
                continue;
            };
            if let Some((used, size)) = points.first().and_then(|point| filesystem_usage(point)) {
                space.used += used;
                space.size += size;
            }
            space.mounts.extend(
                points
                    .iter()
                    .map(|point| point.to_string_lossy().into_owned()),
            );
        }
        space.mounts.sort_by_key(|mount| mount.len());
        space
    }
}

fn block_names() -> Vec<String> {
    let Ok(entries) = fs::read_dir(BLOCK) else {
        return Vec::new();
    };
    let mut names: Vec<String> = entries
        .flatten()
        .filter_map(|entry| entry.file_name().into_string().ok())
        .collect();
    names.sort_by(|a, b| natural(a).cmp(&natural(b)));
    names
}

fn natural(name: &str) -> (u8, &str, usize) {
    let rank = match name {
        name if name.starts_with("nvme") => 0,
        name if name.starts_with("sd") || name.starts_with("mmcblk") => 1,
        name if name.starts_with("dm-") || name.starts_with("md") => 2,
        _ => 3,
    };
    let digits = name.trim_end_matches(|c: char| c.is_ascii_digit());
    (rank, digits, name[digits.len()..].parse().unwrap_or(0))
}

fn kind(name: &str, path: &Path, removable: bool) -> &'static str {
    let prefixed = |prefix: &str| name.starts_with(prefix);
    if prefixed("loop") {
        "loop"
    } else if prefixed("zram") {
        "zram"
    } else if prefixed("dm-") {
        let uuid = read_text(path.join("dm/uuid")).unwrap_or_default();
        if uuid.starts_with("CRYPT-") {
            "encrypted"
        } else {
            "mapper"
        }
    } else if prefixed("md") {
        "raid"
    } else if prefixed("sr") {
        "optical"
    } else if prefixed("nbd") || prefixed("ram") || prefixed("vd") && !path.join("device").exists()
    {
        "virtual"
    } else if prefixed("nvme") {
        "nvme"
    } else if prefixed("mmcblk") {
        if read_text(path.join("device/type")).as_deref() == Some("MMC") {
            "emmc"
        } else {
            "sd"
        }
    } else if removable {
        "usb"
    } else if read_number::<u8>(path.join("queue/rotational")) == Some(1) {
        "hdd"
    } else {
        "ssd"
    }
}

fn model(name: &str, path: &Path, udev: &str) -> Option<String> {
    if name.starts_with("dm-") {
        return read_text(path.join("dm/name"));
    }
    if name.starts_with("loop") {
        return read_text(path.join("loop/backing_file"));
    }
    udev_property(udev, "ID_MODEL_ENC")
        .or_else(|| read_text(path.join("device/model")))
        .map(|model| model.split_whitespace().collect::<Vec<_>>().join(" "))
}

fn partitions(path: &Path, name: &str) -> Vec<PathBuf> {
    let Ok(entries) = fs::read_dir(path) else {
        return Vec::new();
    };
    entries
        .flatten()
        .filter(|entry| entry.file_name().to_string_lossy().starts_with(name))
        .map(|entry| entry.path())
        .collect()
}

fn holders(path: &Path) -> Vec<String> {
    let Ok(entries) = fs::read_dir(path.join("holders")) else {
        return Vec::new();
    };
    entries
        .flatten()
        .filter_map(|entry| entry.file_name().into_string().ok())
        .collect()
}

fn mounted_filesystems() -> HashMap<String, Vec<PathBuf>> {
    let text = fs::read_to_string("/proc/self/mountinfo").unwrap_or_default();
    let mut mounts: HashMap<String, Vec<PathBuf>> = HashMap::new();
    for line in text.lines() {
        let Some((head, tail)) = line.split_once(" - ") else {
            continue;
        };
        let (Some(point), Some(source)) = (head.split(' ').nth(4), tail.split(' ').nth(1)) else {
            continue;
        };
        if !source.starts_with("/dev/") {
            continue;
        }
        let device = fs::canonicalize(source).unwrap_or_else(|_| PathBuf::from(source));
        let Some(name) = device.file_name() else {
            continue;
        };
        mounts
            .entry(name.to_string_lossy().into_owned())
            .or_default()
            .push(PathBuf::from(unescape_mount(point)));
    }
    mounts
}

fn unescape_mount(point: &str) -> String {
    point
        .replace("\\040", " ")
        .replace("\\011", "\t")
        .replace("\\012", "\n")
        .replace("\\134", "\\")
}

fn filesystem_usage(point: &Path) -> Option<(u64, u64)> {
    let path = CString::new(point.as_os_str().as_encoded_bytes()).ok()?;
    let mut stat: libc::statvfs = unsafe { std::mem::zeroed() };
    if unsafe { libc::statvfs(path.as_ptr(), &mut stat) } != 0 {
        return None;
    }
    let block = stat.f_frsize as u64;
    let size = stat.f_blocks as u64 * block;
    Some((size - stat.f_bfree as u64 * block, size))
}
