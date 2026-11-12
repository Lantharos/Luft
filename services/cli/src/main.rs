mod bus;
mod changes;
mod cli;
mod developer;
mod extension;
mod failure;
mod logs;
mod mcp;
mod output;
mod report;
mod settings;
mod status;
mod update;

use std::process::ExitCode;

use clap::{CommandFactory, Parser};

use cli::{Cli, Command};
use failure::Outcome;
use output::Output;

fn run(cli: Cli) -> Outcome {
    let output = Output { json: cli.json };
    match cli.command {
        Command::Status => status::run(output),
        Command::Update { action } => update::run(action, output),
        Command::Channel { channel } => update::channel(channel, output),
        Command::Developer { action } => developer::run(action, output),
        Command::Settings { action } => settings::run(action, output),
        Command::Set(set) => changes::set(&set.changes, false, output),
        Command::Apply { file } => changes::apply_file(&file, output),
        Command::Undo => changes::undo(output),
        Command::History { limit } => changes::history(limit, output),
        Command::Logs(arguments) => logs::run(arguments, output),
        Command::Report { output: path } => report::run(path, output),
        Command::Extension { action } => extension::run(action, output),
        Command::Mcp => mcp::serve(),
        Command::Completions { shell } => {
            clap_complete::generate(shell, &mut Cli::command(), "luft", &mut std::io::stdout());
            Ok(())
        }
    }
}

fn main() -> ExitCode {
    let cli = Cli::parse();
    let json = cli.json;
    match run(cli) {
        Ok(()) => ExitCode::SUCCESS,
        Err(failure) => {
            if json {
                eprintln!(
                    "{}",
                    serde_json::json!({ "error": failure.message, "exit": failure.exit as u8 })
                );
            } else {
                eprintln!("{failure}");
            }
            failure.code()
        }
    }
}
