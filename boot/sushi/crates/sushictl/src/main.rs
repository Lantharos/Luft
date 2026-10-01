use std::path::PathBuf;
use std::process::ExitCode;
use std::time::Duration;

use clap::{Parser, Subcommand};
use sushi::control::{self, Command, Mode};

#[derive(Parser)]
#[command(name = "sushictl", version, about = "Control the Sushi boot splash")]
struct Cli {
    #[command(subcommand)]
    command: Action,
}

#[derive(Subcommand)]
enum Action {
    /// Fade the splash out and hand the display to the next program, keeping the last frame on screen
    Deactivate,
    /// Close the splash and return to the text console
    Quit,
    /// Move the splash into another root file system, such as the installed system when the initramfs hands over to it
    UpdateRoot { root: PathBuf },
    /// Take the screen back and show the splash: boot-up, shutdown, reboot, updates, system-upgrade, or firmware-upgrade
    Show { mode: Mode },
    /// Print whether the splash is showing, handing over, or holding the display between sessions
    Status,
}

fn main() -> ExitCode {
    let command = match Cli::parse().command {
        Action::Deactivate => Command::Deactivate,
        Action::Quit => Command::Quit,
        Action::UpdateRoot { root } => Command::UpdateRoot(root),
        Action::Show { mode } => Command::Show(mode),
        Action::Status => Command::Status,
    };
    match control::send(&command, Duration::from_secs(5)) {
        Ok(reply) if reply == "ok" => ExitCode::SUCCESS,
        Ok(reply) if command == Command::Status => {
            println!("{reply}");
            ExitCode::SUCCESS
        }
        Ok(reply) => {
            eprintln!("{reply}");
            ExitCode::FAILURE
        }
        Err(error) => {
            eprintln!("Sushi isn't running: {error}");
            ExitCode::FAILURE
        }
    }
}
