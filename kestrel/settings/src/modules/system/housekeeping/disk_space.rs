use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use std::time::{Duration, Instant};

use super::mounts;

const LOW_FRACTION: f64 = 0.05;
const NOTICEABLE_DROP: f64 = 0.01;
const PLENTY_BYTES: u64 = 1024 * 1024 * 1024;
const QUIET_PERIOD: Duration = Duration::from_secs(10 * 60);
const IGNORED: [&str; 3] = ["/boot", "/boot/efi", "/efi"];
const SYSTEM: [&str; 2] = ["/var", "/"];

pub struct Low {
    pub path: PathBuf,
    pub free_bytes: u64,
    pub name: Option<String>,
}

pub struct Volume {
    path: PathBuf,
    stats: rustix::fs::StatVfs,
}

fn is_among(paths: &[&str], path: &Path) -> bool {
    paths.iter().any(|listed| path == Path::new(listed))
}

pub fn volumes() -> Vec<Volume> {
    let mut mounts: Vec<mounts::Mount> = mounts::mounted()
        .into_iter()
        .filter(|mount| !mount.read_only && mount.source.starts_with("/dev/"))
        .filter(|mount| !is_among(&IGNORED, &mount.path))
        .collect();
    mounts.sort_by_key(|mount| !is_among(&SYSTEM, &mount.path));
    let mut devices = HashSet::new();
    mounts
        .into_iter()
        .filter(|mount| devices.insert(mount.source.clone()) && !mount.is_removable())
        .filter_map(|mount| {
            Some(Volume {
                stats: rustix::fs::statvfs(&mount.path).ok()?,
                path: mount.path,
            })
        })
        .filter(|volume| volume.stats.f_blocks > 0)
        .collect()
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
    pub fn check(&mut self, volumes: Vec<Volume>) -> Option<Low> {
        let among_several = volumes.len() > 1;
        let mut warning = None;
        for Volume { path, stats } in volumes {
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
                let name = path
                    .file_name()
                    .filter(|_| among_several && !is_among(&SYSTEM, &path))
                    .map(|name| name.to_string_lossy().into_owned());
                warning = Some(Low {
                    path,
                    free_bytes,
                    name,
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
