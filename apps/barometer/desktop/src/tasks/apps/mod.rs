mod desktop;
mod scopes;

use std::collections::hash_map::Entry;
use std::collections::{HashMap, HashSet};
use std::time::Instant;

use serde::Serialize;

use crate::gpu::ProcessGpu;
use crate::system::procfile::ProcFile;
pub use desktop::AppInfo;
pub use scopes::{Scopes, members};

#[derive(Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
pub struct AppUsage {
    key: String,
    name: String,
    icon: Option<String>,
    cpu: f32,
    memory: u64,
    read: f64,
    write: f64,
    read_total: u64,
    write_total: u64,
    gpu: f32,
    vram: u64,
    encoder: f32,
    decoder: f32,
    processes: u32,
    threads: u32,
    paused: bool,
}

#[derive(Clone, Copy, Default)]
struct Counters {
    cpu: u64,
    read: u64,
    write: u64,
}

struct Scope {
    cpu: ProcFile,
    procs: ProcFile,
    memory: Option<ProcFile>,
    io: Option<ProcFile>,
    tasks: Option<ProcFile>,
    freeze: Option<ProcFile>,
    previous: Option<Counters>,
}

pub struct AppSampler {
    scopes: HashMap<String, Scope>,
    last: Instant,
}

impl AppSampler {
    pub fn new() -> Self {
        Self {
            scopes: HashMap::new(),
            last: Instant::now(),
        }
    }

    pub fn sample(
        &mut self,
        resolver: &mut Scopes,
        disks: &HashSet<String>,
    ) -> (Vec<AppUsage>, HashMap<String, Vec<u32>>) {
        let now = Instant::now();
        let elapsed = now.duration_since(self.last).as_secs_f64().max(0.001);
        self.last = now;
        let names = resolver.names();
        self.scopes.retain(|name, _| names.contains(name));
        resolver.forget(&names);
        let mut usage: HashMap<String, AppUsage> = HashMap::new();
        let mut pids: HashMap<String, Vec<u32>> = HashMap::new();
        for name in &names {
            let Some(key) = resolver.app_of(name) else {
                continue;
            };
            let path = resolver.path(name);
            let scope = match self.scopes.entry(name.clone()) {
                Entry::Occupied(entry) => entry.into_mut(),
                Entry::Vacant(entry) => match Scope::open(&path) {
                    Some(scope) => entry.insert(scope),
                    None => continue,
                },
            };
            let members = scope.members();
            let total = usage.entry(key.clone()).or_insert_with(|| {
                let info = resolver.info(&key);
                AppUsage {
                    key: key.clone(),
                    name: info.map_or_else(|| key.clone(), |info| info.name.clone()),
                    icon: info.and_then(|info| info.icon.clone()),
                    paused: true,
                    ..AppUsage::default()
                }
            });
            scope.add(total, elapsed, disks);
            total.processes += members.len() as u32;
            pids.entry(key).or_default().extend(members);
        }
        let mut list: Vec<AppUsage> = usage
            .into_values()
            .filter(|app| app.processes > 0)
            .collect();
        list.sort_by(|a, b| a.key.cmp(&b.key));
        (list, pids)
    }
}

impl Scope {
    fn open(path: &std::path::Path) -> Option<Self> {
        let file = |name: &str| ProcFile::open(path.join(name)).ok();
        Some(Self {
            cpu: file("cpu.stat")?,
            procs: file("cgroup.procs")?,
            memory: file("memory.stat"),
            io: file("io.stat"),
            tasks: file("pids.current"),
            freeze: file("cgroup.freeze"),
            previous: None,
        })
    }

    fn members(&mut self) -> Vec<u32> {
        self.procs
            .text()
            .map(|text| text.lines().filter_map(|line| line.parse().ok()).collect())
            .unwrap_or_default()
    }

    fn add(&mut self, total: &mut AppUsage, elapsed: f64, disks: &HashSet<String>) {
        let cpu = self
            .cpu
            .text()
            .ok()
            .and_then(|text| field(text, "usage_usec"))
            .unwrap_or(0);
        let (read, write) = self
            .io
            .as_mut()
            .and_then(|file| file.text().ok())
            .map_or((0, 0), |text| io(text, disks));
        let now = Counters { cpu, read, write };
        let before = self.previous.replace(now).unwrap_or(now);
        total.cpu += (now.cpu.saturating_sub(before.cpu) as f64 / (elapsed * 1e6) * 100.0) as f32;
        total.read += now.read.saturating_sub(before.read) as f64 / elapsed;
        total.write += now.write.saturating_sub(before.write) as f64 / elapsed;
        total.read_total += now.read;
        total.write_total += now.write;
        total.memory += self
            .memory
            .as_mut()
            .and_then(|file| field(file.text().ok()?, "anon"))
            .unwrap_or(0);
        total.threads += self
            .tasks
            .as_mut()
            .and_then(ProcFile::number::<u32>)
            .unwrap_or(0);
        total.paused &= self.freeze.as_mut().and_then(ProcFile::number::<u8>) == Some(1);
    }
}

pub fn attach_gpu(
    apps: &mut [AppUsage],
    members: &HashMap<String, Vec<u32>>,
    gpu: &HashMap<u32, ProcessGpu>,
) {
    for app in apps {
        for process in members
            .get(&app.key)
            .into_iter()
            .flatten()
            .filter_map(|pid| gpu.get(pid))
        {
            app.gpu = (app.gpu + process.usage).min(100.0);
            app.vram += process.memory;
            app.encoder = (app.encoder + process.encoder).min(100.0);
            app.decoder = (app.decoder + process.decoder).min(100.0);
        }
    }
}

fn field(text: &str, key: &str) -> Option<u64> {
    text.lines().find_map(|line| {
        let (name, value) = line.split_once(' ')?;
        (name == key).then(|| value.trim().parse().ok()).flatten()
    })
}

fn io(text: &str, disks: &HashSet<String>) -> (u64, u64) {
    let mut totals = (0, 0);
    for line in text.lines() {
        let mut fields = line.split_ascii_whitespace();
        let Some(device) = fields.next() else {
            continue;
        };
        if !disks.contains(device) {
            continue;
        }
        for field in fields {
            if let Some(bytes) = field.strip_prefix("rbytes=") {
                totals.0 += bytes.parse::<u64>().unwrap_or(0);
            } else if let Some(bytes) = field.strip_prefix("wbytes=") {
                totals.1 += bytes.parse::<u64>().unwrap_or(0);
            }
        }
    }
    totals
}
