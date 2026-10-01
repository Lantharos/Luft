mod actions;
mod boot;
mod cli;
mod disk;
mod errors;
mod keys;
mod paths;
mod service;
mod status;
mod system;

use std::process::ExitCode;

use clap::Parser;

fn main() -> ExitCode {
    match cli::Cli::parse().run() {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error:#}");
            ExitCode::FAILURE
        }
    }
}
