mod bootc;
mod command;
mod progress;
mod service;
mod system_packages;

use std::process::ExitCode;

fn main() -> ExitCode {
    let result = match std::env::args().nth(1).as_deref() {
        None => service::run(),
        Some("link-system-packages") => system_packages::link(),
        Some("settle-system-packages") => system_packages::settle(),
        Some("rebuild-system-packages") => system_packages::rebuild(),
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
