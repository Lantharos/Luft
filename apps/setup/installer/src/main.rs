mod config;
mod first_boot;
mod install;
mod meet;
mod options;
mod phase;
mod service;
mod survey;
mod system;

use std::process::ExitCode;

use clap::Parser;

fn main() -> ExitCode {
    let options = options::Options::parse();
    match service::run(options) {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error:#}");
            ExitCode::FAILURE
        }
    }
}
