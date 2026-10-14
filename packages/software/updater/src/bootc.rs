use std::fs::File;
use std::io::{BufRead, BufReader, Read};
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd};
use std::os::unix::process::CommandExt;
use std::process::{Child, Command, Stdio};

use anyhow::{Context, Result, anyhow, bail};
use serde_json::{Map, Value, json};

use crate::progress::Pull;

const BOOTC: &str = "bootc";
const PROGRESS_FD: i32 = 3;
const SLOTS: [&str; 3] = ["booted", "staged", "rollback"];

fn failure(stderr: &[u8]) -> anyhow::Error {
    let text = String::from_utf8_lossy(stderr);
    let message = text
        .lines()
        .rev()
        .map(str::trim)
        .find(|line| !line.is_empty())
        .map(|line| {
            line.strip_prefix("error:")
                .unwrap_or(line)
                .trim()
                .to_owned()
        })
        .unwrap_or_else(|| "bootc stopped unexpectedly.".to_owned());
    anyhow!(message)
}

fn run(command: &mut Command) -> Result<Vec<u8>> {
    let output = command
        .stdin(Stdio::null())
        .output()
        .with_context(|| format!("Starting {command:?}"))?;
    if !output.status.success() {
        return Err(failure(&output.stderr));
    }
    Ok(output.stdout)
}

fn bootc(arguments: &[&str]) -> Result<Vec<u8>> {
    run(Command::new(BOOTC).args(arguments))
}

fn image_config(digest: &str) -> Option<Value> {
    let reference = format!("@{digest}");
    let config = bootc(&["internals", "cfs", "oci", "inspect", &reference, "--config"])
        .inspect_err(|error| eprintln!("Reading the image config of {digest}: {error:#}"))
        .ok()?;
    let config: Value = serde_json::from_slice(&config).ok()?;
    Some(json!({
        "created": config["created"],
        "config": { "Labels": config["config"]["Labels"] },
        "rootfs": { "diff_ids": config["rootfs"]["diff_ids"] },
    }))
}

pub fn status() -> Result<String> {
    let host: Value = serde_json::from_slice(&bootc(&["status", "--format=json"])?)?;
    let mut configs = Map::new();
    for slot in SLOTS {
        let pointer = format!("/status/{slot}/image/imageDigest");
        let Some(digest) = host.pointer(&pointer).and_then(Value::as_str) else {
            continue;
        };
        if !configs.contains_key(digest)
            && let Some(config) = image_config(digest)
        {
            configs.insert(digest.to_owned(), config);
        }
    }
    Ok(json!({ "host": host, "configs": configs }).to_string())
}

pub fn rollback() -> Result<()> {
    bootc(&["rollback"]).map(drop)
}

pub fn apply() -> Result<()> {
    bootc(&["upgrade", "--from-downloaded"]).map(drop)
}

fn pipe() -> Result<(File, OwnedFd)> {
    let mut ends = [0; 2];
    if unsafe { libc::pipe2(ends.as_mut_ptr(), libc::O_CLOEXEC) } != 0 {
        return Err(std::io::Error::last_os_error().into());
    }
    let (read, write) = unsafe { (File::from_raw_fd(ends[0]), OwnedFd::from_raw_fd(ends[1])) };
    Ok((read, write))
}

pub struct Upgrade {
    child: Child,
    events: File,
}

impl Upgrade {
    pub fn start() -> Result<Self> {
        let (events, writer) = pipe()?;
        let source = writer.as_raw_fd();
        let mut command = Command::new(BOOTC);
        command
            .args(["upgrade", "--download-only", "--quiet"])
            .arg(format!("--progress-fd={PROGRESS_FD}"))
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::piped());
        unsafe {
            command.pre_exec(move || match libc::dup2(source, PROGRESS_FD) {
                -1 => Err(std::io::Error::last_os_error()),
                _ => Ok(()),
            });
        }
        let child = command.spawn().context("Starting bootc")?;
        drop(writer);
        Ok(Self { child, events })
    }

    pub fn pid(&self) -> i32 {
        self.child.id() as i32
    }

    pub fn follow(mut self, mut downloaded: impl FnMut(u64)) -> Result<()> {
        let mut stderr = self
            .child
            .stderr
            .take()
            .context("bootc has no error output")?;
        let errors = std::thread::spawn(move || {
            let mut text = Vec::new();
            let _ = stderr.read_to_end(&mut text);
            text
        });
        let mut pull = Pull::default();
        for line in BufReader::new(self.events).lines() {
            if let Some(bytes) = pull.update(&line?) {
                downloaded(bytes);
            }
        }
        let status = self.child.wait()?;
        let errors = errors.join().unwrap_or_default();
        if !status.success() {
            if status.code().is_none() {
                bail!("The download was stopped.");
            }
            return Err(failure(&errors));
        }
        Ok(())
    }
}
