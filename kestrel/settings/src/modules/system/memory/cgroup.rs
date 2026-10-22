use std::fs;
use std::io;
use std::path::{Path, PathBuf};

const CGROUPS: &str = "/sys/fs/cgroup";
const APP_SLICES: [&str; 3] = ["app.slice", "background.slice", "user.slice"];
const COMPOSITOR: &str = "session.slice/kestrel.service";

pub struct Unit {
    pub name: String,
    pub bytes: u64,
    path: PathBuf,
}

impl Unit {
    pub fn close(&self) -> io::Result<()> {
        fs::write(self.path.join("cgroup.kill"), "1")
    }
}

#[derive(Clone)]
pub struct UserManager(PathBuf);

impl UserManager {
    pub fn own() -> Option<Self> {
        let cgroup = fs::read_to_string("/proc/self/cgroup").ok()?;
        let path = cgroup.lines().find_map(|line| line.strip_prefix("0::"))?;
        let manager = path.find("/user@")?;
        let end = manager + path[manager..].find(".service")? + ".service".len();
        Some(Self(
            Path::new(CGROUPS).join(path[..end].trim_start_matches('/')),
        ))
    }

    pub fn biggest_app(&self) -> Option<Unit> {
        APP_SLICES
            .iter()
            .flat_map(|slice| units(&self.0.join(slice)))
            .max_by_key(|unit| unit.bytes)
    }

    pub fn compositor_stall_share(&self) -> f64 {
        fs::read_to_string(self.0.join(COMPOSITOR).join("memory.pressure"))
            .ok()
            .and_then(|pressure| {
                pressure
                    .lines()
                    .find_map(|line| line.strip_prefix("some "))?
                    .split_whitespace()
                    .find_map(|field| field.strip_prefix("avg10="))?
                    .parse()
                    .ok()
            })
            .unwrap_or(0.0)
    }
}

fn units(slice: &Path) -> Vec<Unit> {
    let Ok(entries) = fs::read_dir(slice) else {
        return Vec::new();
    };
    entries
        .flatten()
        .filter(|entry| entry.file_type().is_ok_and(|kind| kind.is_dir()))
        .flat_map(|entry| {
            let path = entry.path();
            let name = entry.file_name().to_string_lossy().into_owned();
            if name.ends_with(".slice") {
                units(&path)
            } else {
                vec![Unit {
                    bytes: usage(&path),
                    name,
                    path,
                }]
            }
        })
        .collect()
}

fn usage(cgroup: &Path) -> u64 {
    ["memory.current", "memory.swap.current"]
        .iter()
        .filter_map(|file| {
            fs::read_to_string(cgroup.join(file))
                .ok()?
                .trim()
                .parse::<u64>()
                .ok()
        })
        .sum()
}
