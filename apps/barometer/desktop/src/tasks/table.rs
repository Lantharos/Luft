use std::collections::{HashMap, HashSet};
use std::fs;
use std::time::Instant;

use serde::Serialize;

use super::apps::{AppInfo, Scopes};
use super::process::{Opened, Process};
use super::users::Users;
use crate::gpu::ProcessGpu;
use crate::system::{self, procfile::ProcFile};

const YOUNG_SECONDS: f64 = 5.0;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Entry {
    pid: u32,
    ppid: u32,
    name: String,
    command: String,
    user: String,
    uid: u32,
    app: Option<String>,
    started: f64,
}

#[derive(Serialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct Catalog {
    reset: bool,
    added: Vec<Entry>,
    removed: Vec<u32>,
    apps: Vec<AppInfo>,
}

impl Catalog {
    pub fn is_empty(&self) -> bool {
        !self.reset && self.added.is_empty() && self.removed.is_empty()
    }
}

pub struct Table {
    processes: HashMap<u32, Box<Process>>,
    kernel: HashSet<u32>,
    sent_apps: HashSet<String>,
    users: Users,
    reset: bool,
    ticks: f64,
    page: u64,
    boot: f64,
    uptime: Option<ProcFile>,
    last: Instant,
    rows: Vec<u8>,
}

impl Table {
    pub fn new() -> Self {
        Self {
            processes: HashMap::new(),
            kernel: HashSet::new(),
            sent_apps: HashSet::new(),
            users: Users::default(),
            reset: true,
            ticks: system::clock_ticks(),
            page: unsafe { libc::sysconf(libc::_SC_PAGESIZE) } as u64,
            boot: system::boot_time(),
            uptime: ProcFile::open("/proc/uptime").ok(),
            last: Instant::now(),
            rows: Vec::new(),
        }
    }

    pub fn reset(&mut self) {
        self.reset = true;
    }

    pub fn sample(
        &mut self,
        scopes: &mut Scopes,
        pids: &[u32],
        io: bool,
        gpu: &HashMap<u32, ProcessGpu>,
    ) -> (Catalog, &[u8]) {
        let now = Instant::now();
        let elapsed = now.duration_since(self.last).as_secs_f64().max(0.001);
        self.last = now;
        let uptime = self.uptime();
        let mut removed = Vec::new();
        self.processes.retain(|pid, _| {
            let alive = pids.binary_search(pid).is_ok();
            if !alive {
                removed.push(*pid);
            }
            alive
        });
        self.kernel.retain(|pid| pids.binary_search(pid).is_ok());
        let mut fresh = Vec::new();
        for &pid in pids {
            if self.kernel.contains(&pid) {
                continue;
            }
            if let Some(process) = self.processes.get_mut(&pid) {
                if process.update(elapsed, self.ticks, self.page, io) {
                    continue;
                }
                self.processes.remove(&pid);
                removed.push(pid);
            }
            match Process::open(pid) {
                Some(Opened::Process(process)) => {
                    self.processes.insert(pid, process);
                    fresh.push(pid);
                }
                Some(Opened::KernelThread) => {
                    self.kernel.insert(pid);
                }
                None => {}
            }
        }
        let young = (uptime - YOUNG_SECONDS) * self.ticks;
        for process in self.processes.values_mut() {
            if process.start as f64 > young && process.refresh_cgroup() {
                fresh.push(process.pid);
            }
        }
        fresh.sort_unstable();
        fresh.dedup();
        for pid in &fresh {
            if let Some(process) = self.processes.get_mut(pid) {
                process.app = scopes.app_of_cgroup(&process.cgroup);
            }
        }
        self.encode(gpu);
        let catalog = self.catalog(scopes, fresh, removed);
        (catalog, &self.rows)
    }

    fn uptime(&mut self) -> f64 {
        self.uptime
            .as_mut()
            .and_then(|file| {
                file.text()
                    .ok()?
                    .split_ascii_whitespace()
                    .next()?
                    .parse()
                    .ok()
            })
            .unwrap_or(0.0)
    }

    fn encode(&mut self, gpu: &HashMap<u32, ProcessGpu>) {
        self.rows.clear();
        for process in self.processes.values() {
            let usage = gpu.get(&process.pid).copied().unwrap_or_default();
            let values = [
                process.pid as f32,
                process.rates.cpu,
                process.rates.memory as f32,
                process.rates.read,
                process.rates.write,
                usage.usage,
                usage.memory as f32,
                usage.encoder,
                usage.decoder,
                process.nice as f32,
                process.state as f32,
                process.threads as f32,
                (process.user as f64 / self.ticks) as f32,
                (process.system as f64 / self.ticks) as f32,
                process.read_total as f32,
                process.write_total as f32,
            ];
            for value in values {
                self.rows.extend_from_slice(&value.to_le_bytes());
            }
        }
    }

    fn catalog(&mut self, scopes: &Scopes, fresh: Vec<u32>, removed: Vec<u32>) -> Catalog {
        let reset = std::mem::take(&mut self.reset);
        if reset {
            self.sent_apps.clear();
        }
        let listed: Vec<u32> = if reset {
            self.processes.keys().copied().collect()
        } else {
            fresh
        };
        let mut catalog = Catalog {
            reset,
            removed: if reset { Vec::new() } else { removed },
            ..Catalog::default()
        };
        for pid in listed {
            let Some(process) = self.processes.get(&pid) else {
                continue;
            };
            if let Some(app) = &process.app
                && self.sent_apps.insert(app.clone())
                && let Some(info) = scopes.info(app)
            {
                catalog.apps.push(info.clone());
            }
            catalog.added.push(Entry {
                pid,
                ppid: process.ppid,
                name: process.name.clone(),
                command: process.command.clone(),
                user: self.users.name(process.uid).to_owned(),
                uid: process.uid,
                app: process.app.clone(),
                started: self.boot + process.start as f64 / self.ticks,
            });
        }
        catalog
    }
}

pub fn process_ids() -> Vec<u32> {
    let Ok(entries) = fs::read_dir("/proc") else {
        return Vec::new();
    };
    let mut pids: Vec<u32> = entries
        .flatten()
        .filter_map(|entry| entry.file_name().to_str()?.parse().ok())
        .collect();
    pids.sort_unstable();
    pids
}
