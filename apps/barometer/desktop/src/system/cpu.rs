use serde::Serialize;

use super::hwmon::{self, Sensor};
use super::procfile::ProcFile;

#[derive(Clone, Copy, Default)]
struct Times {
    busy: u64,
    total: u64,
}

impl Times {
    fn parse(fields: &str) -> Self {
        let mut values = fields
            .split_ascii_whitespace()
            .map(|value| value.parse::<u64>().unwrap_or(0));
        let mut next = || values.next().unwrap_or(0);
        let (user, nice, system, idle, iowait, irq, softirq, steal) = (
            next(),
            next(),
            next(),
            next(),
            next(),
            next(),
            next(),
            next(),
        );
        let busy = user + nice + system + irq + softirq + steal;
        Self {
            busy,
            total: busy + idle + iowait,
        }
    }

    fn usage_since(self, previous: Self) -> f32 {
        let total = self.total.saturating_sub(previous.total);
        if total == 0 {
            return 0.0;
        }
        (self.busy.saturating_sub(previous.busy) as f32 / total as f32 * 100.0).clamp(0.0, 100.0)
    }
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct CpuSample {
    usage: f32,
    cores: Vec<f32>,
    temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    frequencies: Option<Vec<u32>>,
    load: [f32; 3],
    threads: u32,
    switches: f64,
    uptime: f64,
}

pub struct Cpu {
    stat: ProcFile,
    loadavg: ProcFile,
    uptime: ProcFile,
    previous: Vec<Times>,
    switches: Option<u64>,
    frequencies: Vec<Option<ProcFile>>,
    sensor: Option<Sensor>,
}

impl Cpu {
    pub fn new(logical: usize) -> std::io::Result<Self> {
        let frequencies = (0..logical)
            .map(|index| {
                ProcFile::open(format!(
                    "/sys/devices/system/cpu/cpu{index}/cpufreq/scaling_cur_freq"
                ))
                .ok()
            })
            .collect();
        Ok(Self {
            stat: ProcFile::open("/proc/stat")?,
            loadavg: ProcFile::open("/proc/loadavg")?,
            uptime: ProcFile::open("/proc/uptime")?,
            previous: vec![Times::default(); logical + 1],
            switches: None,
            frequencies,
            sensor: hwmon::cpu_sensor(),
        })
    }

    pub fn sample(&mut self, elapsed: f64, detailed: bool) -> CpuSample {
        let mut usage = 0.0;
        let mut cores = vec![0.0; self.previous.len() - 1];
        let mut switches = 0.0;
        if let Ok(text) = self.stat.text() {
            for line in text.lines() {
                if let Some(rest) = line.strip_prefix("cpu") {
                    let (index, fields) = rest.split_once(' ').unwrap_or((rest, ""));
                    let slot = if index.is_empty() {
                        0
                    } else {
                        match index.parse::<usize>() {
                            Ok(core) if core + 1 < self.previous.len() => core + 1,
                            _ => continue,
                        }
                    };
                    let times = Times::parse(fields);
                    let value = times.usage_since(self.previous[slot]);
                    self.previous[slot] = times;
                    if slot == 0 {
                        usage = value;
                    } else {
                        cores[slot - 1] = value;
                    }
                } else if let Some(count) = line.strip_prefix("ctxt ") {
                    let count = count.trim().parse::<u64>().unwrap_or(0);
                    if let Some(previous) = self.switches {
                        switches = count.saturating_sub(previous) as f64 / elapsed.max(0.001);
                    }
                    self.switches = Some(count);
                }
            }
        }
        let (load, threads) = self.load();
        CpuSample {
            usage,
            cores,
            temperature: self.sensor.as_mut().and_then(Sensor::celsius),
            frequencies: detailed.then(|| self.frequencies()),
            load,
            threads,
            switches,
            uptime: self
                .uptime
                .text()
                .ok()
                .and_then(|text| text.split_ascii_whitespace().next()?.parse().ok())
                .unwrap_or(0.0),
        }
    }

    fn load(&mut self) -> ([f32; 3], u32) {
        let Ok(text) = self.loadavg.text() else {
            return ([0.0; 3], 0);
        };
        let fields: Vec<&str> = text.split_ascii_whitespace().collect();
        let average = |index: usize| {
            fields
                .get(index)
                .and_then(|value| value.parse().ok())
                .unwrap_or(0.0)
        };
        let threads = fields
            .get(3)
            .and_then(|value| value.split_once('/')?.1.parse().ok())
            .unwrap_or(0);
        ([average(0), average(1), average(2)], threads)
    }

    fn frequencies(&mut self) -> Vec<u32> {
        self.frequencies
            .iter_mut()
            .map(|file| {
                file.as_mut()
                    .and_then(ProcFile::number::<u32>)
                    .map_or(0, |khz| khz / 1000)
            })
            .collect()
    }
}
