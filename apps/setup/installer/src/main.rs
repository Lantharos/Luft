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
use options::Command;

fn main() -> ExitCode {
    let options = options::Options::parse();
    let result = match options.command {
        Some(Command::Reclaim) => meet::reclaim::run(&options.state_dir),
        None => service::run(options),
    };
    match result {
        Ok(()) => ExitCode::SUCCESS,
        Err(error) => {
            eprintln!("{error:#}");
            ExitCode::FAILURE
        }
    }
}
