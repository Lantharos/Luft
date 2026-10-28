mod crashes;
mod socket;

use std::ffi::OsString;
use std::io;
use std::os::unix::process::ExitStatusExt;
use std::process::{ExitCode, ExitStatus};
use std::time::Instant;

use rustix::process::{Pid, Signal, kill_process};
use tokio::process::{Child, Command};
use tokio::signal::unix::{SignalKind, signal};

use crashes::Crashes;
use socket::WaylandSocket;

const RESTARTED: &str = "KESTREL_RESTARTED";

fn crashed(status: ExitStatus) -> bool {
    status
        .signal()
        .is_some_and(|signal| signal != Signal::TERM.as_raw() && signal != Signal::INT.as_raw())
}

fn exit_code(status: ExitStatus) -> ExitCode {
    match status.code() {
        Some(0) | None => ExitCode::SUCCESS,
        Some(code) => ExitCode::from(code as u8),
    }
}

fn start(
    program: &OsString,
    arguments: &[OsString],
    socket: &WaylandSocket,
    restarted: bool,
) -> io::Result<Child> {
    let mut command = Command::new(program);
    command
        .args(arguments)
        .env("WAYLAND_SOCKET_NAME", &socket.name)
        .env("WAYLAND_SOCKET_FD", socket.fd().to_string());
    if restarted {
        command.env(RESTARTED, "1");
    } else {
        command.env_remove(RESTARTED);
    }
    command.spawn()
}

async fn stop(mut kestrel: Child) -> ExitCode {
    if let Some(pid) = kestrel.id().and_then(|id| Pid::from_raw(id as i32)) {
        let _ = kill_process(pid, Signal::TERM);
    }
    let _ = kestrel.wait().await;
    ExitCode::SUCCESS
}

async fn run(program: OsString, arguments: Vec<OsString>) -> io::Result<ExitCode> {
    let socket = WaylandSocket::create()?;
    let mut terminate = signal(SignalKind::terminate())?;
    let mut interrupt = signal(SignalKind::interrupt())?;
    let mut crashes = Crashes::default();
    let mut restarted = false;
    loop {
        let mut kestrel = start(&program, &arguments, &socket, restarted)?;
        let status = tokio::select! {
            status = kestrel.wait() => status?,
            _ = terminate.recv() => return Ok(stop(kestrel).await),
            _ = interrupt.recv() => return Ok(stop(kestrel).await),
        };
        if !crashed(status) {
            return Ok(exit_code(status));
        }
        if crashes.too_many_after(Instant::now()) {
            eprintln!(
                "Kestrel stopped ({status}) for the third time within a minute, so the session ends"
            );
            return Ok(ExitCode::FAILURE);
        }
        eprintln!(
            "Kestrel stopped ({status}), starting it again on {}",
            socket.name
        );
        restarted = true;
    }
}

#[tokio::main(flavor = "current_thread")]
async fn main() -> ExitCode {
    let mut arguments = std::env::args_os().skip(1);
    let Some(program) = arguments.next() else {
        eprintln!("Usage: kestrel-wrapper KESTREL [ARGUMENTS...]");
        return ExitCode::from(2);
    };
    match run(program, arguments.collect()).await {
        Ok(code) => code,
        Err(error) => {
            eprintln!("Couldn't hold Kestrel's Wayland socket: {error}");
            ExitCode::FAILURE
        }
    }
}
