use std::io::{BufRead, BufReader, Write};
use std::os::unix::process::CommandExt;
use std::path::Path;
use std::process::{Child, Command, Stdio};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::mpsc::RecvTimeoutError;
use std::time::{Duration, Instant};

use anyhow::{Context, Result};
use serde::Deserialize;

use crate::system::power;
use crate::system::secret::Secret;

const IDLE_IO: libc::c_int = 3 << 13;
const TICK: Duration = Duration::from_secs(1);
const BATTERY_CHECK: Duration = Duration::from_secs(20);

#[derive(Clone, Copy, Debug, Default)]
pub struct Progress {
    pub done: f64,
    pub remaining_seconds: u64,
}

#[derive(Deserialize)]
struct Line {
    device_bytes: String,
    device_size: String,
    eta_ms: String,
}

fn spawn(device: &Path, header: Option<&Path>, key: &Secret) -> Result<Child> {
    let mut command = Command::new("cryptsetup");
    command.args([
        "reencrypt",
        "--resume-only",
        "--progress-json",
        "--progress-frequency",
        "1",
        "--key-file",
        "-",
    ]);
    if let Some(header) = header {
        command.arg("--header").arg(header);
    }
    command
        .arg(device)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::inherit());
    unsafe {
        command.pre_exec(|| {
            libc::setpriority(libc::PRIO_PROCESS, 0, 19);
            libc::syscall(libc::SYS_ioprio_set, 1, 0, IDLE_IO);
            Ok(())
        });
    }
    let mut child = command.spawn().context("cryptsetup couldn't be started")?;
    if let Some(mut input) = child.stdin.take() {
        input.write_all(key.bytes())?;
    }
    Ok(child)
}

fn interrupt(child: &mut Child) {
    unsafe { libc::kill(child.id() as libc::c_int, libc::SIGTERM) };
    let _ = child.wait();
}

fn follow(child: &mut Child, stop: &AtomicBool, report: &mut impl FnMut(Progress)) -> bool {
    let Some(output) = child.stdout.take() else {
        return false;
    };
    let (sender, receiver) = std::sync::mpsc::channel();
    std::thread::spawn(move || {
        for line in BufReader::new(output).lines().map_while(Result::ok) {
            if sender.send(line).is_err() {
                break;
            }
        }
    });
    let mut checked = Instant::now();
    loop {
        match receiver.recv_timeout(TICK) {
            Ok(line) => {
                if let Ok(line) = serde_json::from_str::<Line>(&line) {
                    let done = line.device_bytes.parse::<f64>().unwrap_or(0.0);
                    let size = line.device_size.parse::<f64>().unwrap_or(1.0).max(1.0);
                    report(Progress {
                        done: (done / size).clamp(0.0, 1.0),
                        remaining_seconds: line.eta_ms.parse::<u64>().unwrap_or(0) / 1000,
                    });
                }
            }
            Err(RecvTimeoutError::Timeout) => {}
            Err(RecvTimeoutError::Disconnected) => {
                return child.wait().is_ok_and(|status| status.success());
            }
        }
        if stop.load(Ordering::Relaxed) {
            interrupt(child);
            return false;
        }
        if checked.elapsed() >= BATTERY_CHECK {
            checked = Instant::now();
            if power::on_battery() {
                interrupt(child);
                return false;
            }
        }
    }
}

pub fn run(
    device: &Path,
    header: Option<&Path>,
    key: &Secret,
    stop: &AtomicBool,
    report: &mut impl FnMut(Progress),
) -> Result<bool> {
    let mut child = spawn(device, header, key)?;
    Ok(follow(&mut child, stop, report))
}
