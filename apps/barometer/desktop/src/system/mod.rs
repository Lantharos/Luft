mod battery;
mod cpu;
mod cpu_info;
mod drives;
pub mod hwmon;
mod memory;
mod network;
pub mod procfile;

use std::collections::HashSet;
use std::fs;
use std::io;

use serde::Serialize;

use crate::gpu::{GpuInfo, GpuSample, Gpus};
use battery::{Batteries, BatteryInfo, BatterySample};
use cpu::{Cpu, CpuSample};
use cpu_info::CpuInfo;
use drives::{DriveInfo, DriveSample, Drives};
use memory::{Memory, MemorySample};
use network::{NetworkInfo, NetworkSample, Networks};

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Devices {
    cpu: CpuInfo,
    gpus: Vec<GpuInfo>,
    drives: Vec<DriveInfo>,
    networks: Vec<NetworkInfo>,
    batteries: Vec<BatteryInfo>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Tick {
    pub time: u64,
    cpu: CpuSample,
    memory: MemorySample,
    gpus: Vec<GpuSample>,
    drives: Vec<DriveSample>,
    networks: Vec<NetworkSample>,
    batteries: Vec<BatterySample>,
}

pub struct System {
    info: CpuInfo,
    cpu: Cpu,
    memory: Memory,
    drives: Drives,
    networks: Networks,
    batteries: Batteries,
    pub gpus: Gpus,
}

impl System {
    pub fn new() -> io::Result<Self> {
        let info = CpuInfo::read();
        Ok(Self {
            cpu: Cpu::new(info.logical)?,
            info,
            memory: Memory::new()?,
            drives: Drives::new()?,
            networks: Networks::new(),
            batteries: Batteries::new(),
            gpus: Gpus::discover(),
        })
    }

    pub fn devices(&self) -> Devices {
        Devices {
            cpu: self.info.clone(),
            gpus: self.gpus.infos(),
            drives: self.drives.infos(),
            networks: self.networks.infos(),
            batteries: self.batteries.infos(),
        }
    }

    pub fn disks(&self) -> HashSet<String> {
        self.drives.disks()
    }

    pub fn refresh(&mut self) -> bool {
        let drives = self.drives.refresh();
        let networks = self.networks.refresh();
        drives || networks
    }

    pub fn sample(&mut self, time: u64, elapsed: f64, page: Option<&str>) -> Tick {
        Tick {
            time,
            cpu: self.cpu.sample(elapsed, page == Some("cpu")),
            memory: self.memory.sample(page == Some("memory")),
            gpus: self
                .gpus
                .sample(page.filter(|page| page.starts_with("gpu:"))),
            drives: self
                .drives
                .sample(elapsed, page.filter(|page| page.starts_with("drive:"))),
            networks: self
                .networks
                .sample(elapsed, page.filter(|page| page.starts_with("net:"))),
            batteries: self.batteries.sample(),
        }
    }
}

pub fn boot_time() -> f64 {
    fs::read_to_string("/proc/stat")
        .ok()
        .and_then(|text| {
            text.lines()
                .find_map(|line| line.strip_prefix("btime ")?.trim().parse().ok())
        })
        .unwrap_or(0.0)
}

pub fn clock_ticks() -> f64 {
    unsafe { libc::sysconf(libc::_SC_CLK_TCK) as f64 }
}
