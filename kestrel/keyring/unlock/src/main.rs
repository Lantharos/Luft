mod chip;
mod peer;
mod seals;
mod service;
mod slot;

use std::os::fd::FromRawFd;
use std::path::PathBuf;
use std::process::ExitCode;
use std::sync::Arc;
use std::time::Duration;

use service::Service;
use tokio::net::UnixListener;

const IDLE_CHECK: Duration = Duration::from_secs(60);
const LISTEN_FD: i32 = 3;

struct Options {
    daemon: PathBuf,
    state: PathBuf,
    tcti: String,
}

impl Options {
    fn parse() -> Result<Self, String> {
        let mut daemon = None;
        let mut tcti = String::from("device:/dev/tpmrm0");
        let mut state = std::env::var_os("STATE_DIRECTORY")
            .map_or_else(|| PathBuf::from("/var/lib/luft-keyring"), PathBuf::from);
        let mut arguments = std::env::args().skip(1);
        while let Some(argument) = arguments.next() {
            let mut value = || {
                arguments
                    .next()
                    .ok_or_else(|| format!("{argument} needs a value"))
            };
            match argument.as_str() {
                "--keyring" => daemon = Some(PathBuf::from(value()?)),
                "--tcti" => tcti = value()?,
                "--state" => state = PathBuf::from(value()?),
                _ => return Err(format!("Unknown option {argument}")),
            }
        }
        Ok(Self {
            daemon: daemon.ok_or("--keyring is required")?,
            state,
            tcti,
        })
    }
}

fn activated_listener() -> Option<std::os::unix::net::UnixListener> {
    let pid = std::env::var("LISTEN_PID").ok()?.parse::<u32>().ok()?;
    let count = std::env::var("LISTEN_FDS").ok()?.parse::<i32>().ok()?;
    (pid == std::process::id() && count == 1)
        .then(|| unsafe { std::os::unix::net::UnixListener::from_raw_fd(LISTEN_FD) })
}

#[tokio::main(flavor = "current_thread")]
async fn main() -> ExitCode {
    let options = match Options::parse() {
        Ok(options) => options,
        Err(message) => {
            eprintln!("{message}");
            return ExitCode::from(2);
        }
    };
    let Some(listener) = activated_listener() else {
        eprintln!("luft-keyring-unlock runs from its systemd socket");
        return ExitCode::FAILURE;
    };
    let listener = match listener
        .set_nonblocking(true)
        .and_then(|()| UnixListener::from_std(listener))
    {
        Ok(listener) => listener,
        Err(error) => {
            eprintln!("Couldn't use the unlock socket: {error}");
            return ExitCode::FAILURE;
        }
    };
    let service = Arc::new(Service::new(options.daemon, options.state, options.tcti));
    let mut idle = tokio::time::interval(IDLE_CHECK);
    idle.tick().await;
    loop {
        tokio::select! {
            accepted = listener.accept() => if let Ok((stream, _)) = accepted {
                tokio::spawn(service.clone().serve(stream));
            },
            _ = idle.tick() => if Arc::strong_count(&service) == 1 && service.is_idle() {
                return ExitCode::SUCCESS;
            },
        }
    }
}
