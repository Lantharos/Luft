use std::io::{BufRead, BufReader};
use std::os::fd::AsRawFd;
use std::os::unix::process::CommandExt;
use std::path::Path;
use std::process::{Command, Stdio};

use super::setup;
use crate::progress::Stage;
use crate::task::{CANCELLED, Task};

pub const UNAVAILABLE: &str = "Ubuntu couldn't start.";
/// Not standard error, which dpkg would close for the packages' scripts
const STATUS_FD: i32 = 3;

fn apt_get(tree: &Path, options: &[&str], arguments: &[&str]) -> Command {
    let mut program = vec![
        "env",
        "DEBIAN_FRONTEND=noninteractive",
        "apt-get",
        "--yes",
        "--quiet",
        "-o",
        "Dpkg::Use-Pty=0",
    ];
    program.extend_from_slice(options);
    program.extend_from_slice(arguments);
    let mut command = super::as_root(tree, &program);
    command
        .env("LC_ALL", "C.UTF-8")
        .stdin(Stdio::null())
        .stdout(Stdio::null());
    command
}

/// Runs apt-get without reporting progress, for checks no one waits on.
pub fn quietly(arguments: &[&str]) -> Result<(), String> {
    let output = apt_get(&super::tree(), &[], arguments)
        .output()
        .map_err(|_| UNAVAILABLE.to_owned())?;
    if output.status.success() {
        Ok(())
    } else {
        Err(friendly(&String::from_utf8_lossy(&output.stderr)))
    }
}

/// Runs apt-get in the Ubuntu at `tree`, then points the files it shares with this computer back at
/// this computer's, since packages such as tzdata replace them.
pub fn run(tree: &Path, arguments: &[&str], working: Stage, task: Task) -> Result<(), String> {
    let status = format!("APT::Status-Fd={STATUS_FD}");
    let ran = follow_through(apt_get(tree, &["-o", &status], arguments), working, task);
    setup::share_host_files(tree)?;
    ran
}

/// Runs apt-get with its messages and status lines both written to one pipe.
fn follow_through(mut command: Command, working: Stage, task: Task) -> Result<(), String> {
    let (output, input) = std::io::pipe().map_err(|error| error.to_string())?;
    let status = input.as_raw_fd();
    command.stderr(input.try_clone().map_err(|error| error.to_string())?);
    unsafe {
        command.pre_exec(move || {
            let inherited = if status == STATUS_FD {
                libc::fcntl(status, libc::F_SETFD, 0)
            } else {
                libc::dup2(status, STATUS_FD)
            };
            match inherited {
                -1 => Err(std::io::Error::last_os_error()),
                _ => Ok(()),
            }
        });
    }
    let spawned = command.spawn();
    drop(command);
    drop(input);
    let mut child = spawned.map_err(|_| UNAVAILABLE.to_owned())?;
    let pid = child.id() as libc::pid_t;
    let finished = task.cancel.while_running(
        move || unsafe {
            libc::kill(pid, libc::SIGTERM);
        },
        || {
            let messages = follow(output, working, task);
            child.wait().map(|status| (status, messages))
        },
    );
    match finished {
        None => {
            let _ = child.kill();
            let _ = child.wait();
            Err(CANCELLED.into())
        }
        Some(Ok((status, _))) if status.success() => Ok(()),
        Some(_) if task.cancel.is_cancelled() => Err(CANCELLED.into()),
        Some(Ok((_, messages))) => Err(friendly(&messages)),
        Some(Err(error)) => Err(error.to_string()),
    }
}

fn follow(output: impl std::io::Read, working: Stage, task: Task) -> String {
    let mut seen = String::new();
    for line in BufReader::new(output).lines().map_while(Result::ok) {
        // dlstatus:<n>:<percent>:<what> while downloading, pmstatus:<package>:<percent>:<what> while installing
        let mut fields = line.splitn(4, ':');
        let stage = match fields.next() {
            Some("dlstatus") => Some(Stage::Downloading),
            Some("pmstatus") => Some(working),
            _ => None,
        };
        if let Some(stage) = stage {
            let percent = fields
                .nth(1)
                .and_then(|percent| percent.parse::<f32>().ok());
            task.progress(
                stage,
                percent.map(|percent| (percent / 100.0).clamp(0.0, 1.0)),
            );
            continue;
        }
        seen.push_str(&line);
        seen.push('\n');
    }
    seen
}

pub fn friendly(messages: &str) -> String {
    let message = messages
        .lines()
        .rev()
        .map(str::trim)
        .find(|line| !line.is_empty() && !line.starts_with("W:"))
        .map(|line| line.strip_prefix("E:").unwrap_or(line).trim())
        .unwrap_or_default();
    let lowered = messages.to_lowercase();
    if lowered.contains("unmet dependencies") || lowered.contains("but it is not installable") {
        "It needs software that Ubuntu doesn't have, so it can't be installed here.".into()
    } else if lowered.contains("temporary failure resolving")
        || lowered.contains("could not resolve")
        || lowered.contains("failed to fetch")
    {
        "Couldn't reach Ubuntu's software sources. Check your connection and try again.".into()
    } else if lowered.contains("no space left")
        || lowered.contains("you don't have enough free space")
    {
        "There isn't enough free space on this computer.".into()
    } else if message.is_empty() {
        "Something went wrong.".into()
    } else {
        message.to_owned()
    }
}
