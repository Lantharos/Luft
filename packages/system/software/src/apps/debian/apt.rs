use std::io::{BufRead, BufReader};
use std::process::{Command, Stdio};

use crate::progress::Stage;
use crate::task::{CANCELLED, Task};

/// apt-get, with its progress written as status lines to standard error.
pub fn apt_get(arguments: &[&str]) -> Command {
    let mut program = vec![
        "sudo",
        "env",
        "DEBIAN_FRONTEND=noninteractive",
        "apt-get",
        "--yes",
        "--quiet",
        "-o",
        "APT::Status-Fd=2",
        "-o",
        "Dpkg::Use-Pty=0",
    ];
    program.extend_from_slice(arguments);
    super::container::run(&program)
}

/// Runs apt-get without reporting progress, for checks no one waits on.
pub fn quietly(arguments: &[&str]) -> Result<(), String> {
    let output = apt_get(arguments)
        .env("LC_ALL", "C.UTF-8")
        .stdin(Stdio::null())
        .output()
        .map_err(|_| "Toolbox isn't installed.".to_owned())?;
    if output.status.success() {
        Ok(())
    } else {
        Err(friendly(&String::from_utf8_lossy(&output.stderr)))
    }
}

pub fn run(command: &mut Command, working: Stage, task: Task) -> Result<(), String> {
    let mut child = command
        .env("LC_ALL", "C.UTF-8")
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|_| "Toolbox isn't installed.".to_owned())?;
    let pid = child.id() as libc::pid_t;
    let stderr = child.stderr.take().ok_or("Toolbox didn't start.")?;
    let finished = task.cancel.while_running(
        move || unsafe {
            libc::kill(pid, libc::SIGTERM);
        },
        || {
            let messages = follow(stderr, working, task);
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

fn follow(stderr: impl std::io::Read, working: Stage, task: Task) -> String {
    let mut seen = String::new();
    for line in BufReader::new(stderr).lines().map_while(Result::ok) {
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
