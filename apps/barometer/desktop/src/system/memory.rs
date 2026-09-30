use std::fs;

use serde::Serialize;

use super::procfile::{ProcFile, read_text};

const KIB: u64 = 1024;

#[derive(Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct MemorySample {
    pub total: u64,
    pub available: u64,
    pub free: u64,
    pub buffers: u64,
    pub cached: u64,
    pub reclaimable: u64,
    pub shared: u64,
    pub dirty: u64,
    pub anon: u64,
    pub kernel: u64,
    pub committed: u64,
    pub swap_total: u64,
    pub swap_free: u64,
    pub swap_cached: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub compressed: Option<Compressed>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub swaps: Option<Vec<SwapDevice>>,
}

#[derive(Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct Compressed {
    pub stored: u64,
    pub size: u64,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SwapDevice {
    name: String,
    kind: String,
    size: u64,
    used: u64,
}

pub struct Memory {
    meminfo: ProcFile,
}

impl Memory {
    pub fn new() -> std::io::Result<Self> {
        Ok(Self {
            meminfo: ProcFile::open("/proc/meminfo")?,
        })
    }

    pub fn sample(&mut self, detailed: bool) -> MemorySample {
        let mut sample = MemorySample::default();
        if let Ok(text) = self.meminfo.text() {
            let mut zswap = Compressed::default();
            for line in text.lines() {
                let Some((key, value)) = line.split_once(':') else {
                    continue;
                };
                let value = value
                    .split_ascii_whitespace()
                    .next()
                    .and_then(|value| value.parse::<u64>().ok())
                    .unwrap_or(0)
                    * KIB;
                match key {
                    "MemTotal" => sample.total = value,
                    "MemFree" => sample.free = value,
                    "MemAvailable" => sample.available = value,
                    "Buffers" => sample.buffers = value,
                    "Cached" => sample.cached = value,
                    "SReclaimable" => sample.reclaimable = value,
                    "Shmem" => sample.shared = value,
                    "Dirty" => sample.dirty = value,
                    "AnonPages" => sample.anon = value,
                    "SUnreclaim" | "KernelStack" | "PageTables" => sample.kernel += value,
                    "Committed_AS" => sample.committed = value,
                    "SwapTotal" => sample.swap_total = value,
                    "SwapFree" => sample.swap_free = value,
                    "SwapCached" => sample.swap_cached = value,
                    "Zswap" => zswap.size = value,
                    "Zswapped" => zswap.stored = value,
                    _ => {}
                }
            }
            if detailed {
                sample.compressed = zram().or((zswap.stored > 0).then_some(zswap));
                sample.swaps = Some(swap_devices());
            }
        }
        sample
    }
}

fn zram() -> Option<Compressed> {
    let entries = fs::read_dir("/sys/block").ok()?;
    let mut total = Compressed::default();
    for entry in entries.flatten() {
        if !entry.file_name().to_string_lossy().starts_with("zram") {
            continue;
        }
        let Some(stat) = read_text(entry.path().join("mm_stat")) else {
            continue;
        };
        let values: Vec<u64> = stat
            .split_ascii_whitespace()
            .filter_map(|value| value.parse().ok())
            .collect();
        if let [stored, _, size, ..] = values[..] {
            total.stored += stored;
            total.size += size;
        }
    }
    (total.stored > 0).then_some(total)
}

fn swap_devices() -> Vec<SwapDevice> {
    let text = fs::read_to_string("/proc/swaps").unwrap_or_default();
    text.lines()
        .skip(1)
        .filter_map(|line| {
            let fields: Vec<&str> = line.split_ascii_whitespace().collect();
            let [path, kind, size, used, ..] = fields[..] else {
                return None;
            };
            let name = path.rsplit('/').next().unwrap_or(path);
            Some(SwapDevice {
                kind: if name.starts_with("zram") {
                    "compressed".to_owned()
                } else {
                    kind.to_owned()
                },
                name: name.to_owned(),
                size: size.parse::<u64>().ok()? * KIB,
                used: used.parse::<u64>().ok()? * KIB,
            })
        })
        .collect()
}
