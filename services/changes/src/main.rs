mod service;
mod settings;

use std::process::ExitCode;

fn main() -> ExitCode {
    match service::run() {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error}");
            ExitCode::FAILURE
        }
    }
}
