mod activity;
mod ask;
mod crossfade;
mod daemon;
mod firmware;
mod notice;
mod screen;
mod signals;
mod takeover;
mod unlock;

use std::process::ExitCode;

fn main() -> ExitCode {
    match daemon::Daemon::start().and_then(daemon::Daemon::run) {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error:#}");
            ExitCode::FAILURE
        }
    }
}
