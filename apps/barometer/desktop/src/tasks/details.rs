use std::fs;
use std::path::Path;

use serde::{Deserialize, Serialize};

use crate::system::{self, procfile::keyed};

use super::process::{Stat, read_cgroup};
use super::users::Users;

const KIB: u64 = 1024;

#[derive(Deserialize)]
pub struct DetailsRequest {
    pid: u32,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Details {
    pid: u32,
    ppid: u32,
    parent: Option<String>,
    arguments: Vec<String>,
    executable: Option<String>,
    directory: Option<String>,
    user: String,
    state: char,
    threads: u32,
    nice: i32,
    started: f64,
    cgroup: String,
    container: Option<&'static str>,
    open_files: Option<usize>,
    oom_score: Option<i32>,
    resident: Option<u64>,
    anonymous: Option<u64>,
    file_backed: Option<u64>,
    shared: Option<u64>,
    swap: Option<u64>,
    virtual_size: Option<u64>,
    switches: Option<u64>,
}

pub fn read(DetailsRequest { pid }: DetailsRequest) -> Result<Details, String> {
    let base = format!("/proc/{pid}");
    let gone = || "This process has already ended".to_owned();
    let stat = fs::read(format!("{base}/stat"))
        .ok()
        .and_then(|bytes| Stat::parse(&bytes))
        .ok_or_else(gone)?;
    let status = fs::read_to_string(format!("{base}/status")).map_err(|_| gone())?;
    let kilobytes = |key: &str| {
        keyed(&status, key)
            .and_then(|value| value.split_whitespace().next()?.parse::<u64>().ok())
            .map(|value| value * KIB)
    };
    let number = |key: &str| keyed(&status, key).and_then(|value| value.parse::<u64>().ok());
    let uid = keyed(&status, "Uid")
        .and_then(|value| value.split_whitespace().nth(1)?.parse().ok())
        .unwrap_or(0);
    let link = |name: &str| {
        fs::read_link(format!("{base}/{name}"))
            .ok()
            .map(|path| path.to_string_lossy().into_owned())
    };
    let arguments = fs::read(format!("{base}/cmdline"))
        .unwrap_or_default()
        .split(|byte| *byte == 0)
        .filter(|argument| !argument.is_empty())
        .map(|argument| String::from_utf8_lossy(argument).into_owned())
        .collect();
    let cgroup = read_cgroup(pid);
    Ok(Details {
        pid,
        ppid: stat.ppid,
        parent: fs::read_to_string(format!("/proc/{}/comm", stat.ppid))
            .ok()
            .map(|name| name.trim().to_owned()),
        arguments,
        executable: link("exe"),
        directory: link("cwd"),
        user: Users::default().name(uid).to_owned(),
        state: stat.state as char,
        threads: stat.threads,
        nice: stat.nice,
        started: system::boot_time() + stat.start as f64 / system::clock_ticks(),
        container: container(&base, &cgroup),
        cgroup,
        open_files: fs::read_dir(format!("{base}/fd"))
            .ok()
            .map(|entries| entries.count()),
        oom_score: fs::read_to_string(format!("{base}/oom_score"))
            .ok()
            .and_then(|value| value.trim().parse().ok()),
        resident: kilobytes("VmRSS"),
        anonymous: kilobytes("RssAnon"),
        file_backed: kilobytes("RssFile"),
        shared: kilobytes("RssShmem"),
        swap: kilobytes("VmSwap"),
        virtual_size: kilobytes("VmSize"),
        switches: number("voluntary_ctxt_switches")
            .zip(number("nonvoluntary_ctxt_switches"))
            .map(|(voluntary, forced)| voluntary + forced),
    })
}

fn container(base: &str, cgroup: &str) -> Option<&'static str> {
    let root = Path::new(base).join("root");
    if root.join(".flatpak-info").exists() {
        Some("Flatpak")
    } else if cgroup.contains("/snap.") {
        Some("Snap")
    } else if root.join("run/.containerenv").exists() {
        Some("Container")
    } else {
        None
    }
}
