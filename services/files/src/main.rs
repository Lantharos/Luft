mod service;
mod work;

use std::process::ExitCode;

fn main() -> ExitCode {
    luft_dbus::panics::report();
    match service::run() {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error}");
            ExitCode::FAILURE
        }
    }
}
