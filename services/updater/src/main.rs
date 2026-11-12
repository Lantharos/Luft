mod bootc;
mod command;
mod progress;
mod schedule;
mod service;
mod space;

use std::process::ExitCode;

fn main() -> ExitCode {
    luft_dbus::panics::report();
    match service::run() {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error:#}");
            ExitCode::FAILURE
        }
    }
}
