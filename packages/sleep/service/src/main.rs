mod battery;
mod config;
mod plan;
mod service;
mod suspend;

use std::process::ExitCode;

fn main() -> ExitCode {
    let result = match std::env::args().nth(1).as_deref() {
        None => service::run(),
        Some("suspend") => suspend::run(),
        Some(other) => Err(anyhow::anyhow!("Unknown command {other}")),
    };
    match result {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error:#}");
            ExitCode::FAILURE
        }
    }
}
