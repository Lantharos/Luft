//! Running Flatpak apps, read from the instances Flatpak keeps in the
//! runtime folder, so Schelf can tell whether one is open, close it the way
//! closing an AppImage does, and open it again.

use std::os::fd::{AsRawFd, OwnedFd};
use std::path::PathBuf;
use std::process::Command;
use std::thread::sleep;
use std::time::{Duration, Instant};

use luft_software::apps::flatpak;

use crate::drives::pidfd;
use crate::launch::{child_pid, runtime_dir};

const INSTANCES: &str = ".flatpak";
pub const OWN_SANDBOXES: &str = "schelf-";
const QUIT_WAIT: Duration = Duration::from_secs(20);
const QUIT_POLL: Duration = Duration::from_millis(100);

/// One running Flatpak sandbox: the app and its first process.
pub struct Instance {
    pub app: String,
    pub pid: u32,
}

/// The value of `key` in `section` of a key file such as an instance's info.
pub fn section_value(text: &str, section: &str, key: &str) -> Option<String> {
    let mut inside = false;
    for line in text.lines() {
        let line = line.trim();
        if line.starts_with('[') {
            inside = line == section;
        } else if inside
            && let Some(value) = line
                .strip_prefix(key)
                .and_then(|rest| rest.strip_prefix('='))
        {
            return Some(value.to_owned());
        }
    }
    None
}

pub fn instances_folder() -> Result<PathBuf, String> {
    Ok(runtime_dir()?.join(INSTANCES))
}

/// The instance `name`, as Flatpak describes it, while its first process runs.
pub fn instance(name: &str) -> Option<Instance> {
    if name.starts_with(OWN_SANDBOXES) {
        return None;
    }
    let folder = instances_folder().ok()?.join(name);
    let info = std::fs::read_to_string(folder.join("info")).ok()?;
    let app = section_value(&info, "[Application]", "name")?;
    let pid = child_pid(&std::fs::read_to_string(folder.join("bwrapinfo.json")).ok()?)?;
    (unsafe { libc::kill(pid as libc::pid_t, 0) } == 0).then_some(Instance { app, pid })
}

fn instances_of(id: &str) -> Vec<Instance> {
    std::fs::read_dir(instances_folder().unwrap_or_default())
        .into_iter()
        .flatten()
        .flatten()
        .filter_map(|entry| instance(&entry.file_name().to_string_lossy()))
        .filter(|instance| instance.app == id)
        .collect()
}

pub fn running(id: &str) -> bool {
    !instances_of(id).is_empty()
}

/// The processes the sandbox's first process started: the app itself.
fn started_by(pid: u32) -> Vec<libc::pid_t> {
    std::fs::read_to_string(format!("/proc/{pid}/task/{pid}/children"))
        .unwrap_or_default()
        .split_whitespace()
        .filter_map(|child| child.parse().ok())
        .collect()
}

fn ended(process: &OwnedFd) -> bool {
    let mut polled = libc::pollfd {
        fd: process.as_raw_fd(),
        events: libc::POLLIN,
        revents: 0,
    };
    unsafe { libc::poll(&mut polled, 1, 0) == 1 }
}

/// Asks the app to quit, as closing it would, and waits until its sandbox
/// has ended. Returns whether it was running.
pub fn quit(id: &str) -> Result<bool, String> {
    let instances = instances_of(id);
    let processes: Vec<OwnedFd> = instances
        .iter()
        .filter_map(|instance| pidfd(instance.pid))
        .collect();
    for instance in &instances {
        for app in started_by(instance.pid) {
            unsafe { libc::kill(app, libc::SIGTERM) };
        }
    }
    let started = Instant::now();
    while !processes.iter().all(ended) {
        if started.elapsed() > QUIT_WAIT {
            return Err("The app didn't quit.".into());
        }
        sleep(QUIT_POLL);
    }
    Ok(!instances.is_empty())
}

/// Opens the app again from its menu entry.
pub fn open(id: &str) -> Result<(), String> {
    let entry = flatpak::desktop_file(id).ok_or("That app isn't installed any more.")?;
    Command::new("gio")
        .arg("launch")
        .arg(entry)
        .spawn()
        .map(drop)
        .map_err(|error| error.to_string())
}

/// The app's name as its menu entry gives it.
pub fn name(id: &str) -> Option<String> {
    let entry = std::fs::read_to_string(flatpak::desktop_file(id)?).ok()?;
    section_value(&entry, "[Desktop Entry]", "Name")
}
