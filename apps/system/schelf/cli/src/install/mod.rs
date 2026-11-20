mod arguments;
mod commands;
pub mod managers;
pub mod perform;
pub mod sources;
mod terminal;

use arguments::Request;
use luft_i18n::t;

use crate::l10n::L10N;
pub use arguments::{Command, recognised};

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug)]
pub enum Exit {
    Done = 0,
    Failed = 1,
    Usage = 2,
    Missing = 3,
    Declined = 5,
    Interrupted = 130,
}

pub fn usage(program: &str, command: Command) -> String {
    arguments::usage(program, command)
}

pub fn run(program: &str, arguments: &[String]) -> i32 {
    (match arguments::parse(arguments) {
        Err(error) => {
            eprintln!(
                "{error}\n{}",
                t!(L10N, "cli-usage-see-help", program = program)
            );
            Exit::Usage
        }
        Ok(Request::Help(command)) => {
            print!("{}", usage(program, command));
            Exit::Done
        }
        Ok(Request::Run(_)) if unsafe { libc::geteuid() } == 0 => {
            eprintln!("{}", t!(L10N, "cli-usage-no-sudo"));
            Exit::Usage
        }
        Ok(Request::Run(arguments)) => {
            perform::interrupt::watch();
            commands::run(&arguments)
        }
    }) as i32
}
