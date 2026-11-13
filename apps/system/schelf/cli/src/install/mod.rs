mod arguments;
mod commands;
pub mod perform;
pub mod sources;
mod terminal;

use arguments::Request;
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
            eprintln!("{error}\nRun {program} --help to see what it can do.");
            Exit::Usage
        }
        Ok(Request::Help(command)) => {
            print!("{}", usage(program, command));
            Exit::Done
        }
        Ok(Request::Run(_)) if unsafe { libc::geteuid() } == 0 => {
            eprintln!("Schelf works in your own account, so run it without sudo.");
            Exit::Usage
        }
        Ok(Request::Run(arguments)) => {
            perform::interrupt::watch();
            commands::run(&arguments)
        }
    }) as i32
}
