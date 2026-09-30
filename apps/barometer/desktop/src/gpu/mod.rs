mod amd;
mod drm;
mod intel;
mod nvidia;

use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

use serde::Serialize;

use crate::system::hwmon::{self, Sensor};
use crate::system::procfile::{link_name, read_text, udev_property};

use amd::Amd;
use drm::DrmClients;
use intel::Intel;
use nvidia::Nvidia;

const DRM: &str = "/sys/class/drm";
const PROCESS_REFRESH: Duration = Duration::from_secs(2);

#[derive(Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct GpuInfo {
    pub id: String,
    pub name: String,
    vendor: &'static str,
    driver: Option<String>,
    pub driver_version: Option<String>,
    slot: String,
    link: Option<String>,
    integrated: bool,
    pub memory_total: Option<u64>,
    pub power_cap: Option<f32>,
    pub max_clock: Option<u32>,
    pub max_memory_clock: Option<u32>,
}

#[derive(Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct GpuSample {
    id: String,
    pub usage: Option<f32>,
    pub memory_used: Option<u64>,
    pub memory_total: Option<u64>,
    pub temperature: Option<f32>,
    pub power: Option<f32>,
    pub clock: Option<u32>,
    pub memory_clock: Option<u32>,
    pub encoder: Option<f32>,
    pub decoder: Option<f32>,
    pub fan: Option<f32>,
}

#[derive(Clone, Copy, Default)]
pub struct ProcessGpu {
    pub usage: f32,
    pub memory: u64,
    pub encoder: f32,
    pub decoder: f32,
}

enum Backend {
    Nvidia(Nvidia),
    Amd(Amd),
    Intel(Intel),
    Other(Option<Sensor>),
}

struct Gpu {
    info: GpuInfo,
    backend: Backend,
}

pub struct Gpus {
    gpus: Vec<Gpu>,
    clients: Option<DrmClients>,
    recent: Option<(Instant, HashMap<u32, ProcessGpu>)>,
}

impl Gpus {
    pub fn discover() -> Self {
        let mut cards: Vec<PathBuf> = fs::read_dir(DRM)
            .map(|entries| {
                entries
                    .flatten()
                    .map(|entry| entry.path())
                    .filter(|path| {
                        path.file_name()
                            .and_then(|name| name.to_str())
                            .and_then(|name| name.strip_prefix("card"))
                            .is_some_and(|index| index.chars().all(|c| c.is_ascii_digit()))
                    })
                    .collect()
            })
            .unwrap_or_default();
        cards.sort();
        let gpus: Vec<Gpu> = cards.iter().filter_map(|card| Gpu::open(card)).collect();
        let clients = gpus
            .iter()
            .any(|gpu| matches!(gpu.backend, Backend::Amd(_) | Backend::Intel(_)))
            .then(DrmClients::new);
        Self {
            gpus,
            clients,
            recent: None,
        }
    }

    pub fn infos(&self) -> Vec<GpuInfo> {
        self.gpus.iter().map(|gpu| gpu.info.clone()).collect()
    }

    pub fn sample(&mut self, detailed: Option<&str>) -> Vec<GpuSample> {
        self.gpus
            .iter_mut()
            .map(|gpu| {
                let mut sample = GpuSample {
                    id: gpu.info.id.clone(),
                    ..GpuSample::default()
                };
                match &mut gpu.backend {
                    Backend::Nvidia(device) => {
                        device.sample(&mut sample, detailed == Some(gpu.info.id.as_str()))
                    }
                    Backend::Amd(device) => device.sample(&mut sample),
                    Backend::Intel(device) => device.sample(&mut sample),
                    Backend::Other(sensor) => {
                        sample.temperature = sensor.as_mut().and_then(Sensor::celsius)
                    }
                }
                sample
            })
            .collect()
    }

    pub fn processes(&mut self, pids: &[u32]) -> HashMap<u32, ProcessGpu> {
        if let Some((at, usage)) = &self.recent
            && at.elapsed() < PROCESS_REFRESH
        {
            return usage.clone();
        }
        let mut usage: HashMap<u32, ProcessGpu> = HashMap::new();
        for gpu in &mut self.gpus {
            if let Backend::Nvidia(device) = &mut gpu.backend {
                let mut single = HashMap::new();
                device.processes(&mut single);
                for (pid, process) in single {
                    let total = usage.entry(pid).or_default();
                    total.usage = (total.usage + process.usage).min(100.0);
                    total.memory += process.memory;
                    total.encoder = (total.encoder + process.encoder).min(100.0);
                    total.decoder = (total.decoder + process.decoder).min(100.0);
                }
            }
        }
        if let Some(clients) = &mut self.clients {
            clients.sample(pids, &mut usage);
        }
        self.recent = Some((Instant::now(), usage.clone()));
        usage
    }
}

impl Gpu {
    fn open(card: &Path) -> Option<Self> {
        let device = fs::canonicalize(card.join("device")).ok()?;
        let vendor_id = read_text(device.join("vendor"))?;
        let slot = device.file_name()?.to_string_lossy().into_owned();
        let driver = link_name(device.join("driver"));
        let vendor = match vendor_id.as_str() {
            "0x10de" => "NVIDIA",
            "0x1002" => "AMD",
            "0x8086" => "Intel",
            _ => "",
        };
        let mut info = GpuInfo {
            id: format!("gpu:{slot}"),
            name: pci_name(&slot, vendor),
            vendor,
            link: link(&device),
            integrated: slot.starts_with("0000:00:"),
            slot: slot.clone(),
            driver: driver.clone(),
            ..GpuInfo::default()
        };
        let backend = match driver.as_deref() {
            Some("nvidia") => Nvidia::open(&slot).map(Backend::Nvidia),
            Some("amdgpu") => Some(Backend::Amd(Amd::open(&device))),
            Some("i915" | "xe") => Some(Backend::Intel(Intel::open(card, &device))),
            _ => None,
        }
        .unwrap_or_else(|| Backend::Other(hwmon::device_sensor(&device, &[])));
        match &backend {
            Backend::Nvidia(device) => device.describe(&mut info),
            Backend::Amd(amd) => amd.describe(&device, &mut info),
            Backend::Intel(_) => Intel::describe(card, &device, &mut info),
            Backend::Other(_) => {}
        }
        if info.driver_version.is_none() {
            info.driver_version = driver
                .as_deref()
                .and_then(|driver| read_text(format!("/sys/module/{driver}/version")));
        }
        Some(Self { info, backend })
    }
}

fn pci_name(slot: &str, vendor: &str) -> String {
    let model = udev_property(&format!("+pci:{slot}"), "ID_MODEL_FROM_DATABASE");
    let Some(model) = model else {
        return format!("{vendor} Graphics").trim().to_owned();
    };
    let marketing = model
        .split_once('[')
        .and_then(|(_, rest)| rest.split_once(']'))
        .map(|(name, _)| name.to_owned())
        .unwrap_or(model);
    if marketing.starts_with(vendor) {
        marketing
    } else {
        format!("{vendor} {marketing}").trim().to_owned()
    }
}

fn link(device: &Path) -> Option<String> {
    let speed = read_text(device.join("max_link_speed"))?;
    let width = read_text(device.join("max_link_width"))?;
    let rate: f32 = speed.split_whitespace().next()?.parse().ok()?;
    let generation = match rate {
        rate if rate >= 64.0 => "6.0",
        rate if rate >= 32.0 => "5.0",
        rate if rate >= 16.0 => "4.0",
        rate if rate >= 8.0 => "3.0",
        rate if rate >= 5.0 => "2.0",
        _ => "1.0",
    };
    Some(format!("PCIe {generation} ×{width}"))
}
