mod activation;
mod build;
mod changes;
mod command;
mod repositories;
mod service;
mod state;

use std::process::ExitCode;

fn main() -> ExitCode {
    let result = match std::env::args().nth(1).as_deref() {
        None => service::run(),
        Some("activate") => activation::serve(),
        Some("link") => activation::link(),
        Some("settle") => activation::settle(),
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
