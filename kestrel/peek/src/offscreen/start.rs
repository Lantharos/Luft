use std::ffi::OsString;
use std::fs::{DirBuilder, File};
use std::io::{BufRead, BufReader};
use std::os::unix::fs::DirBuilderExt;
use std::path::Path;
use std::process::{ChildStdout, Command, Stdio};

use rustix::event::{PollFd, PollFlags, Timespec, poll};

use super::host::{ENDED, HOST, ISOLATED, SHARED};
use super::paths::{new_handle, root};
use crate::service::Failure;

pub struct Started {
    pub handle: String,
    answers: BufReader<ChildStdout>,
}

impl Started {
    pub fn ending(&mut self) -> Option<String> {
        if self.answers.buffer().is_empty() {
            let mut fds = [PollFd::new(self.answers.get_ref(), PollFlags::IN)];
            poll(&mut fds, Some(&Timespec::default())).ok()?;
            if fds[0].revents().is_empty() {
                return None;
            }
        }
        let mut answer = String::new();
        self.answers.read_line(&mut answer).ok()?;
        answer
            .trim()
            .strip_prefix(ENDED)
            .map(|status| status.trim().to_owned())
    }
}

pub fn start(
    command: &[OsString],
    size: &str,
    shared: bool,
    log: &Path,
) -> Result<Started, Failure> {
    let handle = new_handle()?;
    DirBuilder::new()
        .mode(0o700)
        .recursive(true)
        .create(root()?)?;
    let output = File::create(log)
        .map_err(|error| Failure(format!("Couldn't write {}: {error}", log.display())))?;
    let mut host = Command::new("systemd-run")
        .args([
            "--user",
            "--scope",
            "--quiet",
            "--collect",
            "--property=Delegate=yes",
            "--expand-environment=no",
        ])
        .arg(format!("--unit=peek-{handle}"))
        .arg("--")
        .arg(std::env::current_exe()?)
        .arg(HOST)
        .arg(&handle)
        .arg(size)
        .arg(if shared { SHARED } else { ISOLATED })
        .args(command)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(output)
        .spawn()?;
    let mut answers = BufReader::new(host.stdout.take().expect("the display's answer is piped"));
    let mut answer = String::new();
    answers.read_line(&mut answer)?;
    match answer.trim() {
        "ready" => Ok(Started { handle, answers }),
        "" => Err(Failure(format!(
            "The hidden display didn't start. Its output is in {}",
            log.display()
        ))),
        message => Err(Failure(format!(
            "{message}. Its output is in {}",
            log.display()
        ))),
    }
}
