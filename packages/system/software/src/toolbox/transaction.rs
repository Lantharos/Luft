use std::io::Read;
use std::process::{Command, Stdio};

use crate::progress::Stage;
use crate::task::{CANCELLED, Task};

const TRANSACTION_STARTS: &str = "Running transaction";

pub fn run(command: &mut Command, working: Stage, task: Task) -> Result<(), String> {
    let mut child = command
        .env("LC_ALL", "C.UTF-8")
        .env_remove("LANGUAGE")
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|_| "Toolbox isn't installed.".to_string())?;
    let pid = child.id() as libc::pid_t;
    let mut stdout = child.stdout.take().ok_or("Toolbox didn't start.")?;
    let mut stderr = child.stderr.take().ok_or("Toolbox didn't start.")?;
    let output = std::thread::spawn(move || {
        let mut text = String::new();
        let _ = stdout.read_to_string(&mut text);
        text
    });
    let finished = task.cancel.while_running(
        move || unsafe {
            libc::kill(pid, libc::SIGTERM);
        },
        || {
            let messages = follow(&mut stderr, working, task);
            child.wait().map(|status| (status, messages))
        },
    );
    let output = output.join().unwrap_or_default();
    match finished {
        None => {
            let _ = child.kill();
            let _ = child.wait();
            Err(CANCELLED.into())
        }
        Some(Ok((status, _))) if status.success() => Ok(()),
        Some(_) if task.cancel.is_cancelled() => Err(CANCELLED.into()),
        Some(Ok((_, messages))) => Err(friendly(&format!("{output}\n{messages}"))),
        Some(Err(error)) => Err(error.to_string()),
    }
}

fn follow(messages: &mut impl Read, working: Stage, task: Task) -> String {
    let mut buffer = [0u8; 4096];
    let mut line = Vec::new();
    let mut seen = String::new();
    let mut stage = Stage::Downloading;
    while let Ok(read) = messages.read(&mut buffer) {
        if read == 0 {
            break;
        }
        for &byte in &buffer[..read] {
            if byte != b'\n' && byte != b'\r' {
                line.push(byte);
                continue;
            }
            let text = String::from_utf8_lossy(&line);
            if text.starts_with(TRANSACTION_STARTS) {
                stage = working;
            }
            if let Some(fraction) = step(&text) {
                task.progress(stage, Some(fraction));
            }
            seen.push_str(&text);
            seen.push('\n');
            line.clear();
        }
    }
    seen
}

fn step(line: &str) -> Option<f32> {
    let (done, total) = line
        .trim_start()
        .strip_prefix('[')?
        .split_once(']')?
        .0
        .split_once('/')?;
    let total: f32 = total.trim().parse().ok()?;
    (total > 0.0).then_some(done.trim().parse::<f32>().ok()? / total)
}

pub fn friendly(messages: &str) -> String {
    let message = messages
        .lines()
        .rev()
        .map(str::trim)
        .find(|line| !line.is_empty())
        .map(|line| line.strip_prefix("Error:").unwrap_or(line).trim())
        .unwrap_or_default();
    let lowered = messages.to_lowercase();
    if lowered.contains("no match for argument") {
        "That isn't available from Fedora.".into()
    } else if lowered.contains("cannot download")
        || lowered.contains("curl error")
        || lowered.contains("failed to download")
        || lowered.contains("unable to connect")
    {
        "Couldn't reach Fedora's software sources. Check your connection and try again.".into()
    } else if lowered.contains("no space left") || lowered.contains("not enough free space") {
        "There isn't enough free space on this computer.".into()
    } else if message.is_empty() {
        "Something went wrong.".into()
    } else {
        message.to_owned()
    }
}
