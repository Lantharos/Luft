use std::io::Read;
use std::path::Path;
use std::process::{Command, Stdio};

use super::{Installation, command, query};
use crate::progress::Stage;
use crate::task::{CANCELLED, Task};

const VERBS: [(&str, Stage); 3] = [
    ("Installing", Stage::Installing),
    ("Updating", Stage::Installing),
    ("Uninstalling", Stage::Removing),
];

pub fn install(
    installation: Installation,
    remote: &str,
    reference: &str,
    task: Task,
) -> Result<(), String> {
    run(
        command(installation).args(["install", "-y", "--or-update", remote, reference]),
        task,
    )
}

pub fn install_ref(installation: Installation, file: &Path, task: Task) -> Result<(), String> {
    run(
        command(installation)
            .args(["install", "-y", "--from"])
            .arg(file),
        task,
    )
}

pub fn update(installation: Installation, references: &[&str], task: Task) -> Result<(), String> {
    run(
        command(installation)
            .args(["update", "-y"])
            .args(references),
        task,
    )
}

pub fn uninstall(installation: Installation, reference: &str, task: Task) -> Result<(), String> {
    run(
        command(installation).args(["uninstall", "-y", reference]),
        task,
    )
}

pub fn add_remote(installation: Installation, name: &str, file: &Path) -> Result<(), String> {
    let file = file.to_string_lossy();
    query(
        installation,
        &["remote-add", "--if-not-exists", "--from", name, &file],
    )
    .map(|_| ())
}

fn run(command: &mut Command, task: Task) -> Result<(), String> {
    let mut child = command
        .env("LC_ALL", "C.UTF-8")
        .env_remove("LANGUAGE")
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|_| "Flatpak isn't installed.".to_string())?;
    let pid = child.id() as libc::pid_t;
    let mut stdout = child.stdout.take().ok_or("Flatpak didn't start.")?;
    let mut stderr = child.stderr.take().ok_or("Flatpak didn't start.")?;
    let errors = std::thread::spawn(move || {
        let mut text = String::new();
        let _ = stderr.read_to_string(&mut text);
        text
    });
    task.progress(Stage::Preparing, None);
    let finished = task.cancel.while_running(
        move || unsafe {
            libc::kill(pid, libc::SIGTERM);
        },
        || {
            follow(&mut stdout, task);
            child.wait()
        },
    );
    let errors = errors.join().unwrap_or_default();
    match finished {
        None => {
            let _ = child.kill();
            let _ = child.wait();
            Err(CANCELLED.into())
        }
        Some(Ok(status)) if status.success() => Ok(()),
        Some(_) if task.cancel.is_cancelled() => Err(CANCELLED.into()),
        Some(_) => Err(friendly(&errors)),
    }
}

fn follow(stdout: &mut impl Read, task: Task) {
    let mut buffer = [0u8; 4096];
    let mut line = Vec::new();
    while let Ok(read) = stdout.read(&mut buffer) {
        if read == 0 {
            break;
        }
        for &byte in &buffer[..read] {
            if byte == b'\n' || byte == b'\r' {
                if let Some((stage, fraction)) = progress(&String::from_utf8_lossy(&line)) {
                    task.progress(stage, fraction);
                }
                line.clear();
            } else {
                line.push(byte);
            }
        }
    }
}

fn progress(line: &str) -> Option<(Stage, Option<f32>)> {
    let line = line.trim();
    let (verb, stage) = VERBS.into_iter().find(|(verb, _)| line.starts_with(verb))?;
    let rest = &line[verb.len()..];
    let (step, steps) = rest
        .split_whitespace()
        .next()
        .map(|word| word.trim_end_matches('…'))
        .and_then(|word| word.split_once('/'))
        .and_then(|(step, steps)| Some((step.parse::<f32>().ok()?, steps.parse::<f32>().ok()?)))
        .unwrap_or((1.0, 1.0));
    let percent = rest
        .split_whitespace()
        .find_map(|word| word.strip_suffix('%')?.parse::<f32>().ok());
    Some((
        stage,
        percent.map(|percent| ((step - 1.0) + percent / 100.0) / steps.max(1.0)),
    ))
}

pub(super) fn friendly(stderr: &str) -> String {
    let message = stderr
        .lines()
        .rev()
        .map(str::trim)
        .find(|line| !line.is_empty())
        .map(|line| line.strip_prefix("error:").unwrap_or(line).trim())
        .unwrap_or_default();
    let lowered = message.to_lowercase();
    if lowered.contains("could not resolve")
        || lowered.contains("unable to connect")
        || lowered.contains("timeout")
    {
        "Couldn't reach the app source. Check your connection and try again.".into()
    } else if lowered.contains("not authorized") || lowered.contains("authentication") {
        "Permission to change the system's apps wasn't given.".into()
    } else if lowered.contains("no remote refs found") || lowered.contains("nothing matches") {
        "That isn't available from this source.".into()
    } else if lowered.contains("not enough space") || lowered.contains("no space left") {
        "There isn't enough free space on this computer.".into()
    } else if message.is_empty() {
        "Something went wrong.".into()
    } else {
        message.to_owned()
    }
}
