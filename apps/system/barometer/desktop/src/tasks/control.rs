use std::fs;
use std::io;
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd, RawFd};
use std::path::{Path, PathBuf};
use std::thread;
use std::time::{Duration, Instant};

use gio::prelude::*;
use luft_app::launch;
use luft_files::client::{self, Process};
use serde::Deserialize;
use specta::Type;

use super::apps::members;
use super::process::Stat;
use crate::system;

const STOP_TIMEOUT: Duration = Duration::from_secs(5);
const STOP_CHECK: Duration = Duration::from_millis(100);

#[derive(Deserialize, Clone, Copy, Type)]
#[serde(rename_all = "lowercase")]
pub enum Signal {
    End,
    Kill,
    Stop,
    Continue,
}

impl Signal {
    fn number(self) -> i32 {
        match self {
            Self::End => libc::SIGTERM,
            Self::Kill => libc::SIGKILL,
            Self::Stop => libc::SIGSTOP,
            Self::Continue => libc::SIGCONT,
        }
    }
}

#[derive(Deserialize, Type)]
pub struct ListedProcess {
    pid: u32,
    started: f64,
}

#[derive(Deserialize, Type)]
pub struct SignalRequest {
    processes: Vec<ListedProcess>,
    signal: Signal,
}

struct Handle {
    descriptor: OwnedFd,
    process: Process,
}

impl Handle {
    fn open(pid: u32) -> io::Result<Self> {
        let number = libc::pid_t::try_from(pid)
            .ok()
            .filter(|pid| *pid > 0)
            .ok_or(io::ErrorKind::InvalidInput)?;
        let descriptor = unsafe { libc::syscall(libc::SYS_pidfd_open, number, 0) };
        if descriptor < 0 {
            return Err(io::Error::last_os_error());
        }
        let descriptor = unsafe { OwnedFd::from_raw_fd(descriptor as RawFd) };
        let start = start_of(pid).ok_or_else(|| io::Error::from_raw_os_error(libc::ESRCH))?;
        Ok(Self {
            descriptor,
            process: (pid, start),
        })
    }

    fn send(&self, signal: Signal) -> io::Result<()> {
        let sent = unsafe {
            libc::syscall(
                libc::SYS_pidfd_send_signal,
                self.descriptor.as_raw_fd(),
                signal.number(),
                std::ptr::null::<libc::siginfo_t>(),
                0,
            )
        };
        if sent < 0 {
            return Err(io::Error::last_os_error());
        }
        Ok(())
    }
}

struct Clock {
    boot: f64,
    ticks: f64,
}

impl Clock {
    fn now() -> Self {
        Self {
            boot: system::boot_time(),
            ticks: system::clock_ticks(),
        }
    }

    fn started(&self, (_, start): Process, listed: &ListedProcess) -> bool {
        (self.boot + start as f64 / self.ticks - listed.started).abs() < 0.5 / self.ticks
    }
}

#[derive(Deserialize, Type)]
pub struct OpenRequest {
    key: String,
    token: Option<String>,
}

#[derive(Deserialize, Type)]
pub struct PriorityRequest {
    pid: u32,
    nice: i32,
}

pub fn signal_processes(SignalRequest { processes, signal }: SignalRequest) -> Result<(), String> {
    let clock = Clock::now();
    let mut handles = Vec::with_capacity(processes.len());
    for process in &processes {
        match Handle::open(process.pid) {
            Ok(handle) if clock.started(handle.process, process) => handles.push(handle),
            Ok(_) => {}
            Err(error) if error.raw_os_error() == Some(libc::ESRCH) => {}
            Err(error) => return Err(error.to_string()),
        }
    }
    signal_handles(handles, signal)
}

fn signal_handles(handles: Vec<Handle>, signal: Signal) -> Result<(), String> {
    let mut denied = Vec::new();
    for handle in handles {
        let Err(error) = handle.send(signal) else {
            continue;
        };
        match error.raw_os_error() {
            Some(libc::ESRCH) => {}
            Some(libc::EPERM) => denied.push(handle.process),
            _ => return Err(error.to_string()),
        }
    }
    if denied.is_empty() {
        return Ok(());
    }
    luft_app::block_on(client::signal(&denied, signal.number()))
}

pub fn renice(PriorityRequest { pid, nice }: PriorityRequest) -> Result<(), String> {
    if pid == 0 {
        return Err(io::Error::from(io::ErrorKind::InvalidInput).to_string());
    }
    let nice = nice.clamp(-20, 19);
    let Some(start) = start_of(pid) else {
        return Ok(());
    };
    for thread in threads(pid) {
        if unsafe { libc::setpriority(libc::PRIO_PROCESS, thread, nice) } == 0 {
            continue;
        }
        let error = io::Error::last_os_error();
        match error.raw_os_error() {
            Some(libc::ESRCH) => {}
            Some(libc::EPERM | libc::EACCES) => {
                return luft_app::block_on(client::set_priority((pid, start), nice));
            }
            _ => return Err(error.to_string()),
        }
    }
    Ok(())
}

pub fn signal_scopes(scopes: &[PathBuf], signal: Signal) -> Result<(), String> {
    let control = |file: &str, value: &str| {
        scopes
            .iter()
            .try_for_each(|scope| fs::write(scope.join(file), value))
            .map_err(|error| error.to_string())
    };
    match signal {
        Signal::Kill => control("cgroup.kill", "1"),
        Signal::Stop => control("cgroup.freeze", "1"),
        Signal::Continue => control("cgroup.freeze", "0"),
        Signal::End => signal_handles(
            scopes
                .iter()
                .flat_map(|scope| members(scope))
                .filter_map(|pid| Handle::open(pid).ok())
                .collect(),
            signal,
        ),
    }
}

pub fn stop_scopes(mut scopes: Vec<PathBuf>) -> Result<(), String> {
    signal_scopes(&scopes, Signal::Continue)?;
    signal_scopes(&scopes, Signal::End)?;
    thread::Builder::new()
        .name("barometer-stop".into())
        .spawn(move || {
            let deadline = Instant::now() + STOP_TIMEOUT;
            while scopes.iter().any(|scope| populated(scope)) && Instant::now() < deadline {
                thread::sleep(STOP_CHECK);
            }
            scopes.retain(|scope| populated(scope));
            let _ = signal_scopes(&scopes, Signal::Kill);
        })
        .map(drop)
        .map_err(|error| error.to_string())
}

pub fn open_app(OpenRequest { key, token }: OpenRequest) -> Result<(), String> {
    let app = gio_unix::DesktopAppInfo::new(&key).ok_or("That app is no longer installed")?;
    launch::start(app.upcast_ref(), &[], token.as_deref()).map_err(|error| error.to_string())
}

fn populated(scope: &Path) -> bool {
    fs::read_to_string(scope.join("cgroup.events"))
        .is_ok_and(|events| events.lines().any(|line| line == "populated 1"))
}

fn threads(pid: u32) -> Vec<u32> {
    let Ok(entries) = fs::read_dir(format!("/proc/{pid}/task")) else {
        return vec![pid];
    };
    entries
        .flatten()
        .filter_map(|entry| entry.file_name().to_str()?.parse().ok())
        .collect()
}

fn start_of(pid: u32) -> Option<u64> {
    fs::read(format!("/proc/{pid}/stat"))
        .ok()
        .and_then(|stat| Stat::parse(&stat))
        .map(|stat| stat.start)
}
