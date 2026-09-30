use std::collections::HashSet;
use std::fs;

use serde::Serialize;

use super::procfile::{read_number, read_text};

const CPUS: &str = "/sys/devices/system/cpu";

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Cache {
    level: u32,
    kind: String,
    size: u64,
    instances: usize,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CpuInfo {
    name: String,
    pub logical: usize,
    physical: usize,
    sockets: usize,
    architecture: String,
    virtualization: Option<&'static str>,
    max_frequency: Option<u32>,
    min_frequency: Option<u32>,
    governor: Option<String>,
    caches: Vec<Cache>,
}

impl CpuInfo {
    pub fn read() -> Self {
        let cpuinfo = fs::read_to_string("/proc/cpuinfo").unwrap_or_default();
        let cores = core_indices();
        let topology: Vec<(u32, u32)> = cores
            .iter()
            .filter_map(|core| {
                let base = format!("{CPUS}/cpu{core}/topology");
                Some((
                    read_number(format!("{base}/physical_package_id"))?,
                    read_number(format!("{base}/core_id"))?,
                ))
            })
            .collect();
        let physical = topology.iter().collect::<HashSet<_>>().len();
        let sockets = topology
            .iter()
            .map(|(package, _)| package)
            .collect::<HashSet<_>>()
            .len();
        let logical = cores.len();
        let frequency = |file: &str| -> Vec<u32> {
            cores
                .iter()
                .filter_map(|core| read_number::<u32>(format!("{CPUS}/cpu{core}/cpufreq/{file}")))
                .map(|khz| khz / 1000)
                .collect()
        };
        let flags: HashSet<&str> = field(&cpuinfo, &["flags", "Features"])
            .unwrap_or("")
            .split_ascii_whitespace()
            .collect();
        Self {
            name: model_name(&cpuinfo),
            logical,
            physical: physical.max(1),
            sockets: sockets.max(1),
            architecture: architecture(),
            virtualization: if flags.contains("svm") {
                Some("AMD-V")
            } else if flags.contains("vmx") {
                Some("VT-x")
            } else {
                None
            },
            max_frequency: frequency("cpuinfo_max_freq").into_iter().max(),
            min_frequency: frequency("cpuinfo_min_freq").into_iter().min(),
            governor: read_text(format!("{CPUS}/cpu0/cpufreq/scaling_governor")),
            caches: caches(logical),
        }
    }
}

pub fn core_indices() -> Vec<usize> {
    let Ok(entries) = fs::read_dir(CPUS) else {
        return vec![0];
    };
    let mut cores: Vec<usize> = entries
        .flatten()
        .filter_map(|entry| {
            entry
                .file_name()
                .to_str()?
                .strip_prefix("cpu")?
                .parse()
                .ok()
        })
        .collect();
    cores.sort_unstable();
    cores
}

fn field<'a>(cpuinfo: &'a str, keys: &[&str]) -> Option<&'a str> {
    cpuinfo.lines().find_map(|line| {
        let (key, value) = line.split_once(':')?;
        keys.contains(&key.trim()).then(|| value.trim())
    })
}

fn model_name(cpuinfo: &str) -> String {
    field(cpuinfo, &["model name", "Model", "Hardware", "cpu model"])
        .map(|name| name.split_whitespace().collect::<Vec<_>>().join(" "))
        .unwrap_or_else(|| "Processor".to_owned())
}

fn architecture() -> String {
    let mut name: libc::utsname = unsafe { std::mem::zeroed() };
    if unsafe { libc::uname(&mut name) } != 0 {
        return String::new();
    }
    let machine = unsafe { std::ffi::CStr::from_ptr(name.machine.as_ptr()) };
    machine.to_string_lossy().into_owned()
}

fn caches(logical: usize) -> Vec<Cache> {
    let Ok(entries) = fs::read_dir(format!("{CPUS}/cpu0/cache")) else {
        return Vec::new();
    };
    let mut caches: Vec<Cache> = entries
        .flatten()
        .filter(|entry| entry.file_name().to_string_lossy().starts_with("index"))
        .filter_map(|entry| {
            let path = entry.path();
            let sharing = count_list(&read_text(path.join("shared_cpu_list"))?);
            Some(Cache {
                level: read_number(path.join("level"))?,
                kind: read_text(path.join("type"))?,
                size: parse_size(&read_text(path.join("size"))?)?,
                instances: (logical / sharing.max(1)).max(1),
            })
        })
        .collect();
    caches.sort_by(|a, b| a.level.cmp(&b.level).then_with(|| a.kind.cmp(&b.kind)));
    caches
}

fn count_list(list: &str) -> usize {
    list.split(',')
        .filter_map(|range| match range.split_once('-') {
            Some((start, end)) => {
                Some(end.parse::<usize>().ok()? - start.parse::<usize>().ok()? + 1)
            }
            None => range.parse::<usize>().ok().map(|_| 1),
        })
        .sum()
}

fn parse_size(size: &str) -> Option<u64> {
    let (digits, unit) = size.split_at(
        size.find(|c: char| !c.is_ascii_digit())
            .unwrap_or(size.len()),
    );
    let value: u64 = digits.parse().ok()?;
    Some(match unit {
        "K" => value * 1024,
        "M" => value * 1024 * 1024,
        _ => value,
    })
}
