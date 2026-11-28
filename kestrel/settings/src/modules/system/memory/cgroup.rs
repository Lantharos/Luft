use std::fs;
use std::io;
use std::path::{Path, PathBuf};

const CGROUPS: &str = "/sys/fs/cgroup";
const ROOT_OVERRIDE: &str = "LUFT_CGROUP_ROOT";
const APP_SLICES: [&str; 3] = ["app.slice", "background.slice", "user.slice"];
const SESSION: &str = "session.slice";
const COMPOSITOR: &str = "session.slice/kestrel.service";

pub struct Unit {
    pub name: String,
    pub bytes: u64,
    pub slices: Vec<String>,
    path: PathBuf,
}

impl Unit {
    pub fn close(&self) -> io::Result<()> {
        fs::write(self.path.join("cgroup.kill"), "1")
    }

    pub fn biggest_process(&self) -> Option<u32> {
        processes(&self.path)
            .into_iter()
            .max_by_key(|&pid| process_memory(pid))
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
        let root =
            std::env::var_os(ROOT_OVERRIDE).map_or_else(|| PathBuf::from(CGROUPS), PathBuf::from);
        Some(Self(root.join(path[..end].trim_start_matches('/'))))
    }

    pub fn apps(&self) -> Vec<Unit> {
        APP_SLICES
            .iter()
            .flat_map(|slice| units(&self.0.join(slice), vec![(*slice).to_owned()]))
            .collect()
    }

    pub fn protected_leftovers(&self) -> Vec<String> {
        APP_SLICES
            .iter()
            .flat_map(|slice| protected_below(&self.0.join(slice)))
            .collect()
    }

    pub fn focus_budget(&self) -> u64 {
        read_number(&self.0.join("memory.low"))
            .saturating_sub(read_number(&self.0.join(SESSION).join("memory.low")))
    }

    pub fn compositor_pressure(&self, resource: &str) -> PathBuf {
        self.0.join(COMPOSITOR).join(format!("{resource}.pressure"))
    }

    pub fn compositor_stall_share(&self) -> f64 {
        super::pressure::stalled_share(self.compositor_pressure("memory"))
    }
}

fn units(slice: &Path, slices: Vec<String>) -> Vec<Unit> {
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
                let mut nested = slices.clone();
                nested.push(name);
                units(&path, nested)
            } else {
                vec![Unit {
                    bytes: usage(&path),
                    name,
                    slices: slices.clone(),
                    path,
                }]
            }
        })
        .collect()
}

fn protected_below(cgroup: &Path) -> Vec<String> {
    let Some(name) = cgroup
        .file_name()
        .map(|name| name.to_string_lossy().into_owned())
    else {
        return Vec::new();
    };
    let mut protected: Vec<String> = fs::read_dir(cgroup)
        .into_iter()
        .flatten()
        .flatten()
        .filter(|entry| entry.file_type().is_ok_and(|kind| kind.is_dir()))
        .flat_map(|entry| protected_below(&entry.path()))
        .collect();
    if read_number(&cgroup.join("memory.low")) > 0 {
        protected.push(name);
    }
    protected
}

fn read_number(file: &Path) -> u64 {
    fs::read_to_string(file)
        .ok()
        .and_then(|value| value.trim().parse().ok())
        .unwrap_or(0)
}

fn usage(cgroup: &Path) -> u64 {
    read_number(&cgroup.join("memory.current")) + read_number(&cgroup.join("memory.swap.current"))
}

fn processes(cgroup: &Path) -> Vec<u32> {
    let own = fs::read_to_string(cgroup.join("cgroup.procs")).unwrap_or_default();
    let mut pids: Vec<u32> = own.lines().filter_map(|pid| pid.parse().ok()).collect();
    if let Ok(children) = fs::read_dir(cgroup) {
        for child in children.flatten() {
            if child.file_type().is_ok_and(|kind| kind.is_dir()) {
                pids.extend(processes(&child.path()));
            }
        }
    }
    pids
}

fn process_memory(pid: u32) -> u64 {
    let Ok(status) = fs::read_to_string(format!("/proc/{pid}/status")) else {
        return 0;
    };
    ["VmRSS:", "VmSwap:"]
        .iter()
        .filter_map(|field| {
            status
                .lines()
                .find_map(|line| line.strip_prefix(field))?
                .split_whitespace()
                .next()?
                .parse::<u64>()
                .ok()
        })
        .sum()
}

pub fn parent(pid: u32) -> Option<u32> {
    let stat = fs::read_to_string(format!("/proc/{pid}/stat")).ok()?;
    stat.rsplit_once(')')?
        .1
        .split_whitespace()
        .nth(1)?
        .parse()
        .ok()
}
