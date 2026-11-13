mod battery;
mod plan;
mod suspend;

use std::process::ExitCode;

fn main() -> ExitCode {
    let result = match std::env::args().nth(1).as_deref() {
        Some("suspend") => suspend::run(),
        _ => Err(anyhow::anyhow!("Usage: luft-sleep suspend")),
    };
    match result {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error:#}");
            ExitCode::FAILURE
        }
    }
}
