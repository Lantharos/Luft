use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::process::Command;

use serde::Deserialize;

use super::apps::members;

const SYSTEM_BIN_DIRS: [&str; 2] = ["/usr/bin", "/bin"];

#[derive(Deserialize, Clone, Copy)]
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

    fn name(self) -> &'static str {
        match self {
            Self::End => "TERM",
            Self::Kill => "KILL",
            Self::Stop => "STOP",
            Self::Continue => "CONT",
        }
    }
}

#[derive(Deserialize)]
pub struct SignalRequest {
    pids: Vec<u32>,
    signal: Signal,
}

#[derive(Deserialize)]
pub struct PriorityRequest {
    pid: u32,
    nice: i32,
}

pub fn signal_processes(SignalRequest { pids, signal }: SignalRequest) -> Result<(), String> {
    let mut denied = Vec::new();
    for pid in pids {
        if unsafe { libc::kill(pid as i32, signal.number()) } == 0 {
            continue;
        }
        let error = io::Error::last_os_error();
        match error.raw_os_error() {
            Some(libc::ESRCH) => {}
            Some(libc::EPERM) => denied.push(pid.to_string()),
            _ => return Err(error.to_string()),
        }
    }
    if denied.is_empty() {
        return Ok(());
    }
    let mut arguments = vec!["-s".to_owned(), signal.name().to_owned(), "--".to_owned()];
    arguments.extend(denied);
    elevated("kill", &arguments)
}

pub fn renice(PriorityRequest { pid, nice }: PriorityRequest) -> Result<(), String> {
    let nice = nice.clamp(-20, 19);
    let threads = threads(pid);
    let mut denied = Vec::new();
    for thread in &threads {
        if unsafe { libc::setpriority(libc::PRIO_PROCESS, *thread, nice) } == 0 {
            continue;
        }
        let error = io::Error::last_os_error();
        match error.raw_os_error() {
            Some(libc::ESRCH) => {}
            Some(libc::EPERM | libc::EACCES) => denied.push(thread.to_string()),
            _ => return Err(error.to_string()),
        }
    }
    if denied.is_empty() {
        return Ok(());
    }
    let mut arguments = vec!["-n".to_owned(), nice.to_string(), "-p".to_owned()];
    arguments.extend(denied);
    elevated("renice", &arguments)
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
        Signal::End => signal_processes(SignalRequest {
            pids: scopes.iter().flat_map(|scope| members(scope)).collect(),
            signal,
        }),
    }
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

fn elevated(program: &str, arguments: &[String]) -> Result<(), String> {
    let path = SYSTEM_BIN_DIRS
        .iter()
        .map(|directory| Path::new(directory).join(program))
        .find(|path| path.is_file())
        .ok_or_else(|| format!("{program} isn't installed"))?;
    let output = Command::new("pkexec")
        .arg(path)
        .args(arguments)
        .output()
        .map_err(|_| "Authentication isn't available on this system".to_owned())?;
    let message = String::from_utf8_lossy(&output.stderr);
    let message = message.lines().last().unwrap_or("").trim();
    match output.status.code() {
        Some(0) => Ok(()),
        Some(126) => Err("Authentication was cancelled".to_owned()),
        Some(127) if message.contains("agent") => {
            Err("There's nothing to ask for your password right now".to_owned())
        }
        Some(127) => Err("You aren't allowed to do that".to_owned()),
        _ if message.is_empty() => Err("That didn't work".to_owned()),
        _ => Err(message.to_owned()),
    }
}
