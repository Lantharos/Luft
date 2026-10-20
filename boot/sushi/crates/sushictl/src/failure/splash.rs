use std::fs::OpenOptions;
use std::os::unix::process::CommandExt;
use std::path::Path;
use std::process::{Command, Stdio};
use std::time::{Duration, Instant};

use sushi::control::{self, Command as Request};
use sushi::failure_file::FailureFile;

const ANSWER_WAIT: Duration = Duration::from_secs(1);
const START_WAIT: Duration = Duration::from_secs(5);
const QUIT_WAIT: Duration = Duration::from_secs(5);
const NO_DISPLAY: &str = "no display";

fn answers() -> bool {
    control::send(&Request::Status, ANSWER_WAIT).is_ok()
}

fn answers_soon() -> bool {
    let started = Instant::now();
    while started.elapsed() < START_WAIT {
        if answers() {
            return true;
        }
        std::thread::sleep(Duration::from_millis(100));
    }
    false
}

fn spawn() -> bool {
    let log = OpenOptions::new()
        .write(true)
        .open("/dev/kmsg")
        .map_or_else(|_| Stdio::null(), Stdio::from);
    let mut daemon = Command::new("sushid");
    daemon
        .arg0("@sushid")
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(log);
    unsafe {
        daemon.pre_exec(|| {
            libc::setsid();
            Ok(())
        });
    }
    daemon.spawn().is_ok()
}

fn start() -> bool {
    if answers() {
        return true;
    }
    let _ = Command::new("systemctl")
        .args(["start", "sushi.service"])
        .stderr(Stdio::null())
        .status();
    answers() || (spawn() && answers_soon())
}

pub fn ask(screen: &FailureFile) -> Option<String> {
    if !start() || std::fs::write(control::FAILURE, screen.encode()).is_err() {
        return None;
    }
    let reply = control::send_and_wait(&Request::ShowFailure(Path::new(control::FAILURE).into()));
    let _ = std::fs::remove_file(control::FAILURE);
    let reply = reply
        .inspect_err(|error| eprintln!("The splash stopped answering: {error}"))
        .ok()?;
    if reply == NO_DISPLAY {
        leave();
    }
    reply.strip_prefix("choice ").map(str::to_owned)
}

pub fn leave() {
    let _ = control::send(&Request::Quit, QUIT_WAIT);
}
