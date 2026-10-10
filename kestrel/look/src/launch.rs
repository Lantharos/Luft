use std::ffi::OsString;
use std::fs::File;
use std::io::{Read, Write};
use std::os::unix::process::CommandExt;
use std::path::PathBuf;
use std::process::{Command, ExitCode, Stdio};

use rustix::process::{Pid, PidfdFlags, pidfd_open, setsid};
use zbus::zvariant::Fd;

use crate::files::scratch_file;
use crate::service::{Failure, Look, Window};

pub const STUB: &str = "started-program";

pub struct Launched {
    pub pid: u32,
    pub unit: String,
    pub log: PathBuf,
    pub window: Option<Window>,
}

pub fn launch(
    look: &Look,
    command: &[OsString],
    log: Option<PathBuf>,
    wait: Option<u32>,
) -> Result<Launched, Failure> {
    let log = match log {
        Some(log) => log,
        None => scratch_file("run", "log")?,
    };
    let output = File::create(&log)
        .map_err(|error| Failure(format!("Couldn't write {}: {error}", log.display())))?;
    let mut child = Command::new(std::env::current_exe()?)
        .arg(STUB)
        .args(command)
        .stdin(Stdio::piped())
        .stdout(output.try_clone()?)
        .stderr(output)
        .spawn()?;
    let mut go = child.stdin.take().expect("the program's input is piped");
    let pid = child.id();
    let pidfd =
        pidfd_open(Pid::from_child(&child), PidfdFlags::empty()).map_err(std::io::Error::from)?;
    let unit = match look.launch(Fd::from(&pidfd)) {
        Ok(unit) => unit,
        Err(error) => {
            drop(go);
            child.wait()?;
            return Err(error.into());
        }
    };
    go.write_all(b"\n")?;
    drop(go);
    let window = match wait {
        Some(timeout) => Some(
            look.wait_for_window(&unit, timeout)
                .map_err(Failure::from)
                .and_then(Window::try_from)
                .map_err(|Failure(message)| {
                    Failure(format!(
                        "{message}. The program's output is in {}",
                        log.display()
                    ))
                })?,
        ),
        None => None,
    };
    Ok(Launched {
        pid,
        unit,
        log: std::path::absolute(&log)?,
        window,
    })
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
        eprintln!("luft-look: couldn't start a new session: {error}");
        return ExitCode::FAILURE;
    }
    let error = Command::new(program)
        .args(arguments)
        .stdin(Stdio::null())
        .exec();
    eprintln!(
        "luft-look: couldn't start {}: {error}",
        program.to_string_lossy()
    );
    ExitCode::from(127)
}
