mod bootc;
mod command;
mod progress;
mod service;

use std::process::ExitCode;

fn main() -> ExitCode {
    match service::run() {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error:#}");
            ExitCode::FAILURE
        }
    }
}
