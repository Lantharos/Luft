use std::collections::HashMap;
use std::fs;
use std::time::Instant;

use super::ProcessGpu;

const RESCAN_TICKS: u64 = 10;
const DRI: &str = "/dev/dri/";

#[derive(Clone, Copy, Default)]
struct Engines {
    graphics: u64,
    encoder: u64,
    decoder: u64,
    cycles: u64,
    total_cycles: u64,
}

struct Client {
    fds: Vec<String>,
    scanned: u64,
    previous: HashMap<String, Engines>,
}

pub struct DrmClients {
    tick: u64,
    last: Instant,
    clients: HashMap<u32, Client>,
}

impl DrmClients {
    pub fn new() -> Self {
        Self {
            tick: 0,
            last: Instant::now(),
            clients: HashMap::new(),
        }
    }

    pub fn sample(&mut self, pids: &[u32], into: &mut HashMap<u32, ProcessGpu>) {
        let now = Instant::now();
        let elapsed = now.duration_since(self.last).as_secs_f64().max(0.001);
        self.last = now;
        self.tick += 1;
        let tick = self.tick;
        self.clients
            .retain(|pid, _| pids.binary_search(pid).is_ok());
        for &pid in pids {
            let client = self.clients.entry(pid).or_insert_with(|| Client {
                fds: Vec::new(),
                scanned: 0,
                previous: HashMap::new(),
            });
            if client.scanned == 0 || tick - client.scanned >= RESCAN_TICKS {
                client.fds = drm_fds(pid);
                client.scanned = tick;
            }
            if client.fds.is_empty() {
                continue;
            }
            let mut current = HashMap::new();
            let mut memory = 0;
            for fd in &client.fds {
                let Ok(text) = fs::read_to_string(format!("/proc/{pid}/fdinfo/{fd}")) else {
                    continue;
                };
                let (key, engines, bytes) = parse(&text);
                let Some(key) = key else {
                    continue;
                };
                if current.insert(key, engines).is_none() {
                    memory += bytes;
                }
            }
            let usage = into.entry(pid).or_default();
            usage.memory += memory;
            for (key, now) in &current {
                let Some(before) = client.previous.get(key) else {
                    continue;
                };
                let share = |now: u64, before: u64| {
                    (now.saturating_sub(before) as f64 / (elapsed * 1e9) * 100.0) as f32
                };
                let graphics = if now.total_cycles > before.total_cycles {
                    (now.cycles.saturating_sub(before.cycles) as f64
                        / (now.total_cycles - before.total_cycles) as f64
                        * 100.0) as f32
                } else {
                    share(now.graphics, before.graphics)
                };
                usage.usage = (usage.usage + graphics).min(100.0);
                usage.encoder = (usage.encoder + share(now.encoder, before.encoder)).min(100.0);
                usage.decoder = (usage.decoder + share(now.decoder, before.decoder)).min(100.0);
            }
            client.previous = current;
        }
    }
}

fn drm_fds(pid: u32) -> Vec<String> {
    let Ok(entries) = fs::read_dir(format!("/proc/{pid}/fd")) else {
        return Vec::new();
    };
    entries
        .flatten()
        .filter(|entry| {
            fs::read_link(entry.path())
                .is_ok_and(|target| target.to_string_lossy().starts_with(DRI))
        })
        .filter_map(|entry| entry.file_name().into_string().ok())
        .collect()
}

fn parse(text: &str) -> (Option<String>, Engines, u64) {
    let mut engines = Engines::default();
    let mut device = None;
    let mut client = None;
    let mut memory = 0;
    for line in text.lines() {
        let Some((key, value)) = line.split_once(':') else {
            continue;
        };
        let value = value.trim();
        let number = value
            .split_ascii_whitespace()
            .next()
            .and_then(|number| number.parse::<u64>().ok())
            .unwrap_or(0);
        if let Some(engine) = key.strip_prefix("drm-engine-") {
            match engine {
                "enc" | "enc_1" | "vcn_enc" => engines.encoder += number,
                "dec" | "jpeg" | "video" | "vcn_dec" => engines.decoder += number,
                "gfx" | "compute" | "render" => engines.graphics += number,
                _ => {}
            }
        } else if let Some(class) = key.strip_prefix("drm-total-cycles-") {
            if class == "rcs" || class == "ccs" {
                engines.total_cycles = engines.total_cycles.max(number);
            }
        } else if let Some(class) = key.strip_prefix("drm-cycles-") {
            if class == "rcs" || class == "ccs" {
                engines.cycles = engines.cycles.max(number);
            }
        } else if key == "drm-pdev" {
            device = Some(value.to_owned());
        } else if key == "drm-client-id" {
            client = Some(value.to_owned());
        } else if key == "drm-memory-vram"
            || key == "drm-resident-vram0"
            || key == "drm-resident-local0"
        {
            memory = memory.max(
                number
                    * if value.ends_with("MiB") {
                        1024 * 1024
                    } else {
                        1024
                    },
            );
        }
    }
    let key = device
        .zip(client)
        .map(|(device, client)| format!("{device}/{client}"));
    (key, engines, memory)
}
