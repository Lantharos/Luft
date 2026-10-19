use std::fs;
use std::io;
use std::os::fd::{AsFd, AsRawFd};
use std::path::{Path, PathBuf};

const SETTINGS_UNIT: &str = "kestrel-settings.service";
const COMPOSITOR_UNIT: &str = "kestrel.service";

pub struct Programs {
    settings: PathBuf,
    compositor: PathBuf,
}

impl Programs {
    pub fn installed() -> io::Result<Self> {
        let watchdog = executable("self").ok_or(io::ErrorKind::NotFound)?;
        let libexec = watchdog.parent().ok_or(io::ErrorKind::NotFound)?;
        let prefix = libexec.parent().ok_or(io::ErrorKind::NotFound)?;
        Ok(Self {
            settings: libexec.join("kestrel-settings"),
            compositor: prefix.join("bin/kestrel"),
        })
    }

    pub fn is_settings(&self, pid: u32, uid: u32) -> bool {
        runs(pid, uid, SETTINGS_UNIT, &self.settings)
    }

    pub fn is_compositor(&self, pid: u32, uid: u32) -> bool {
        runs(pid, uid, COMPOSITOR_UNIT, &self.compositor)
    }
}

pub fn pid_of(pidfd: impl AsFd) -> Option<u32> {
    fs::read_to_string(format!("/proc/self/fdinfo/{}", pidfd.as_fd().as_raw_fd()))
        .ok()?
        .lines()
        .find_map(|line| line.strip_prefix("Pid:"))?
        .trim()
        .parse()
        .ok()
}

fn runs(pid: u32, uid: u32, unit: &str, program: &Path) -> bool {
    user_unit(pid, uid).as_deref() == Some(unit)
        && executable(&pid.to_string()).as_deref() == Some(program)
}

fn user_unit(pid: u32, uid: u32) -> Option<String> {
    let cgroup = fs::read_to_string(format!("/proc/{pid}/cgroup")).ok()?;
    let path = cgroup.lines().find_map(|line| line.strip_prefix("0::"))?;
    let (_, inside) = path.split_once(&format!("/user@{uid}.service/"))?;
    inside
        .split('/')
        .find(|part| part.ends_with(".service"))
        .map(str::to_owned)
}

fn executable(process: &str) -> Option<PathBuf> {
    let target = fs::read_link(format!("/proc/{process}/exe")).ok()?;
    let target = target.to_str()?;
    Some(PathBuf::from(
        target.strip_suffix(" (deleted)").unwrap_or(target),
    ))
}
