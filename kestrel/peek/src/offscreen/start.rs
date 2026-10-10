use std::ffi::OsString;
use std::fs::{DirBuilder, File};
use std::io::{BufRead, BufReader};
use std::os::unix::fs::DirBuilderExt;
use std::path::Path;
use std::process::{Command, Stdio};

use super::host::HOST;
use super::paths::{new_handle, root};
use crate::service::Failure;

pub fn start(command: &[OsString], size: &str, log: &Path) -> Result<String, Failure> {
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
        ])
        .arg(format!("--unit=peek-{handle}"))
        .arg("--")
        .arg(std::env::current_exe()?)
        .arg(HOST)
        .arg(&handle)
        .arg(size)
        .args(command)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(output)
        .spawn()?;
    let mut answer = String::new();
    BufReader::new(host.stdout.take().expect("the display's answer is piped"))
        .read_line(&mut answer)?;
    match answer.trim() {
        "ready" => Ok(handle),
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
