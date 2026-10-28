use std::path::PathBuf;
use std::process::ExitCode;

fn main() -> ExitCode {
    let Some(folder) = std::env::args_os().nth(1).map(PathBuf::from) else {
        eprintln!("Usage: trustd-drives-generator NORMAL-DIR [EARLY-DIR LATE-DIR]");
        return ExitCode::FAILURE;
    };
    match trustd::generator::generate(&folder) {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error:#}");
            ExitCode::FAILURE
        }
    }
}
