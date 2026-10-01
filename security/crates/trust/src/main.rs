use std::process::ExitCode;

fn main() -> ExitCode {
    match trustd::service::run() {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error:#}");
            ExitCode::FAILURE
        }
    }
}
