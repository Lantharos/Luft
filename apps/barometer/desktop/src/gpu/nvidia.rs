use std::collections::HashMap;
use std::sync::OnceLock;
use std::time::{SystemTime, UNIX_EPOCH};

use nvml_wrapper::Device;
use nvml_wrapper::Nvml;
use nvml_wrapper::enum_wrappers::device::{Clock, TemperatureSensor};
use nvml_wrapper::enums::device::UsedGpuMemory;

use super::{GpuInfo, GpuSample, ProcessGpu};

static NVML: OnceLock<Option<&'static Nvml>> = OnceLock::new();

fn nvml() -> Option<&'static Nvml> {
    *NVML.get_or_init(|| Nvml::init().ok().map(|nvml| &*Box::leak(Box::new(nvml))))
}

pub struct Nvidia {
    device: Device<'static>,
    last_seen: u64,
}

impl Nvidia {
    pub fn open(slot: &str) -> Option<Self> {
        let nvml = nvml()?;
        let device = nvml
            .device_by_pci_bus_id(slot)
            .or_else(|_| nvml.device_by_pci_bus_id(format!("0000{slot}")))
            .ok()?;
        Some(Self {
            device,
            last_seen: now_micros(),
        })
    }

    pub fn describe(&self, info: &mut GpuInfo) {
        if let Ok(name) = self.device.name() {
            info.name = name;
        }
        info.driver_version = nvml().and_then(|nvml| nvml.sys_driver_version().ok());
        info.memory_total = self.device.memory_info().ok().map(|memory| memory.total);
        info.power_cap = self
            .device
            .enforced_power_limit()
            .ok()
            .map(|milliwatts| milliwatts as f32 / 1000.0);
        info.max_clock = self.device.max_clock_info(Clock::Graphics).ok();
        info.max_memory_clock = self.device.max_clock_info(Clock::Memory).ok();
    }

    pub fn sample(&self, sample: &mut GpuSample, detailed: bool) {
        let device = &self.device;
        if let Ok(utilization) = device.utilization_rates() {
            sample.usage = Some(utilization.gpu as f32);
        }
        if let Ok(memory) = device.memory_info() {
            sample.memory_used = Some(memory.used);
            sample.memory_total = Some(memory.total);
        }
        sample.temperature = device
            .temperature(TemperatureSensor::Gpu)
            .ok()
            .map(|value| value as f32);
        sample.power = device
            .power_usage()
            .ok()
            .map(|milliwatts| milliwatts as f32 / 1000.0);
        sample.clock = device.clock_info(Clock::Graphics).ok();
        sample.memory_clock = device.clock_info(Clock::Memory).ok();
        sample.encoder = device
            .encoder_utilization()
            .ok()
            .map(|info| info.utilization as f32);
        sample.decoder = device
            .decoder_utilization()
            .ok()
            .map(|info| info.utilization as f32);
        if detailed {
            sample.fan = device.fan_speed(0).ok().map(|value| value as f32);
        }
    }

    pub fn processes(&mut self, into: &mut HashMap<u32, ProcessGpu>) {
        let device = &self.device;
        let listed = device
            .running_graphics_processes()
            .into_iter()
            .chain(device.running_compute_processes())
            .flatten();
        for process in listed {
            let memory = match process.used_gpu_memory {
                UsedGpuMemory::Used(bytes) => bytes,
                UsedGpuMemory::Unavailable => 0,
            };
            let entry = into.entry(process.pid).or_default();
            entry.memory = entry.memory.max(memory);
        }
        let Ok(samples) = device.process_utilization_stats(self.last_seen) else {
            return;
        };
        for sample in samples {
            self.last_seen = self.last_seen.max(sample.timestamp);
            let entry = into.entry(sample.pid).or_default();
            entry.usage = entry.usage.max(sample.sm_util as f32);
            entry.encoder = entry.encoder.max(sample.enc_util as f32);
            entry.decoder = entry.decoder.max(sample.dec_util as f32);
        }
    }
}

fn now_micros() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_or(0, |elapsed| elapsed.as_micros() as u64)
}
