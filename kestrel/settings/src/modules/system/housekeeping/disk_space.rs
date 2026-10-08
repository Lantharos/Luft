use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

use super::mounts;

const LOW_FRACTION: f64 = 0.05;
const NOTICEABLE_DROP: f64 = 0.01;
const PLENTY_BYTES: u64 = 1024 * 1024 * 1024;
const QUIET_PERIOD: Duration = Duration::from_secs(10 * 60);
const IGNORED: [&str; 1] = ["/boot"];

pub struct Low {
    pub path: PathBuf,
    pub free_bytes: u64,
    pub among_several: bool,
}

struct Warned {
    free_fraction: f64,
    at: Instant,
}

#[derive(Default)]
pub struct DiskSpace {
    warned: HashMap<PathBuf, Warned>,
}

impl DiskSpace {
    pub fn check(&mut self) -> Option<Low> {
        let configured = mounts::configured();
        let volumes: Vec<(PathBuf, rustix::fs::StatVfs)> = mounts::mounted()
            .into_iter()
            .filter(|mount| !mount.read_only && configured.contains(&mount.path))
            .filter(|mount| {
                !IGNORED
                    .iter()
                    .any(|ignored| mount.path == Path::new(ignored))
            })
            .filter_map(|mount| Some((mount.path.clone(), rustix::fs::statvfs(&mount.path).ok()?)))
            .filter(|(_, stats)| stats.f_blocks > 0)
            .collect();
        let among_several = volumes.len() > 1;
        let mut warning = None;
        for (path, stats) in volumes {
            let free_fraction = stats.f_bavail as f64 / stats.f_blocks as f64;
            let free_bytes = stats.f_frsize * stats.f_bavail;
            if free_fraction > LOW_FRACTION || free_bytes > PLENTY_BYTES {
                self.warned.remove(&path);
                continue;
            }
            if warning.is_some() {
                continue;
            }
            let now = Instant::now();
            let due = match self.warned.get(&path) {
                None => true,
                Some(warned) => {
                    warned.free_fraction - free_fraction > NOTICEABLE_DROP
                        && now - warned.at > QUIET_PERIOD
                }
            };
            if due {
                self.warned.insert(
                    path.clone(),
                    Warned {
                        free_fraction,
                        at: now,
                    },
                );
                warning = Some(Low {
                    path,
                    free_bytes,
                    among_several,
                });
            }
        }
        warning
    }
}

pub fn format_size(bytes: u64) -> String {
    const UNITS: [&str; 5] = ["kB", "MB", "GB", "TB", "PB"];
    if bytes < 1000 {
        return format!("{bytes} bytes");
    }
    let mut value = bytes as f64 / 1000.0;
    let mut unit = 0;
    while value >= 1000.0 && unit < UNITS.len() - 1 {
        value /= 1000.0;
        unit += 1;
    }
    format!("{value:.1} {}", UNITS[unit])
}
