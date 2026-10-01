use std::path::PathBuf;
use std::process::ExitCode;
use std::time::Duration;

use clap::{Parser, Subcommand};

use sushi::control::{self, Command, KeyEnrollment, Mode};

const NOTICE_WAIT: Duration = Duration::from_secs(300);

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
    /// Explain the key enrollment screen at the next restart, or show a notice from a file now and wait until it's dismissed
    Notice {
        #[command(subcommand)]
        notice: Notice,
    },
}

#[derive(Subcommand)]
enum Notice {
    KeyEnrollment {
        code: String,
        /// Say that the key wasn't added at the last restart
        #[arg(long)]
        again: bool,
    },
    Clear,
    /// Show the notice described in a file and print the key that dismissed it, if it offered one
    Show {
        file: PathBuf,
    },
}

fn main() -> ExitCode {
    let command = match Cli::parse().command {
        Action::Deactivate => Command::Deactivate,
        Action::Quit => Command::Quit,
        Action::UpdateRoot { root } => Command::UpdateRoot(root),
        Action::Show { mode } => Command::Show(mode),
        Action::Status => Command::Status,
        Action::Notice {
            notice: Notice::KeyEnrollment { code, again },
        } => Command::KeyEnrollmentNotice(Some(KeyEnrollment { code, again })),
        Action::Notice {
            notice: Notice::Clear,
        } => Command::KeyEnrollmentNotice(None),
        Action::Notice {
            notice: Notice::Show { file },
        } => Command::ShowNotice(file),
    };
    let wait = match command {
        Command::Show(Mode::Shutdown) | Command::ShowNotice(_) => NOTICE_WAIT,
        _ => Duration::from_secs(5),
    };
    match control::send(&command, wait) {
        Ok(reply) if reply == "ok" => ExitCode::SUCCESS,
        Ok(reply) if reply.starts_with("key ") => {
            println!("{}", &reply["key ".len()..]);
            ExitCode::SUCCESS
        }
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
