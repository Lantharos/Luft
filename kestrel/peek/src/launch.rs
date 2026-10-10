use std::ffi::OsString;
use std::fs::File;
use std::io::{Read, Write};
use std::os::unix::process::CommandExt;
use std::path::Path;
use std::process::{Command, ExitCode, Stdio};

use rustix::process::{Pid, PidfdFlags, pidfd_open, setsid};
use zbus::zvariant::Fd;

use crate::service::{Failure, Peek};

pub const STUB: &str = "started-program";

pub fn launch(peek: &Peek, command: &[OsString], log: &Path) -> Result<String, Failure> {
    let output = File::create(log)
        .map_err(|error| Failure(format!("Couldn't write {}: {error}", log.display())))?;
    let mut child = Command::new(std::env::current_exe()?)
        .arg(STUB)
        .args(command)
        .stdin(Stdio::piped())
        .stdout(output.try_clone()?)
        .stderr(output)
        .spawn()?;
    let mut go = child.stdin.take().expect("the program's input is piped");
    let pidfd =
        pidfd_open(Pid::from_child(&child), PidfdFlags::empty()).map_err(std::io::Error::from)?;
    let handle = match peek.launch(Fd::from(&pidfd)) {
        Ok(handle) => handle,
        Err(error) => {
            drop(go);
            child.wait()?;
            return Err(error.into());
        }
    };
    go.write_all(b"\n")?;
    Ok(handle)
}

pub fn start_program(command: &[OsString]) -> ExitCode {
    let mut go = [0];
    if !matches!(std::io::stdin().read(&mut go), Ok(1)) {
        return ExitCode::FAILURE;
    }
    let Some((program, arguments)) = command.split_first() else {
        return ExitCode::FAILURE;
    };
    if let Err(error) = setsid() {
        eprintln!("peek: couldn't start a new session: {error}");
        return ExitCode::FAILURE;
    }
    let error = Command::new(program)
        .args(arguments)
        .stdin(Stdio::null())
        .exec();
    eprintln!(
        "peek: couldn't start {}: {error}",
        program.to_string_lossy()
    );
    ExitCode::from(127)
}
