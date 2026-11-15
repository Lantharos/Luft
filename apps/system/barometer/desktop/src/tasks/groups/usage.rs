use std::collections::HashSet;
use std::path::Path;

use crate::system::procfile::ProcFile;

use super::Entry;

#[derive(Clone, Copy, Default)]
struct Counters {
    cpu: u64,
    read: u64,
    write: u64,
}

pub struct Cgroup {
    cpu: ProcFile,
    procs: ProcFile,
    memory: Option<ProcFile>,
    io: Option<ProcFile>,
    tasks: Option<ProcFile>,
    freeze: Option<ProcFile>,
    previous: Option<Counters>,
}

impl Cgroup {
    pub fn open(path: &Path) -> Option<Self> {
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

    pub fn members(&mut self) -> Vec<u32> {
        self.procs
            .text()
            .map(|text| text.lines().filter_map(|line| line.parse().ok()).collect())
            .unwrap_or_default()
    }

    pub fn add_to(&mut self, total: &mut Entry, elapsed: f64, disks: &HashSet<String>) {
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
