mod arguments;
mod commands;
pub mod perform;
mod publishing;
pub mod sources;
mod terminal;

use std::io::IsTerminal;
use std::path::Path;

use arguments::Request;

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug)]
pub enum Exit {
    Done = 0,
    Failed = 1,
    Usage = 2,
    Missing = 3,
    Declined = 4,
    Interrupted = 130,
}

fn program() -> String {
    std::env::args()
        .next()
        .as_deref()
        .and_then(|program| Path::new(program).file_name())
        .map_or_else(
            || "schelf".to_owned(),
            |name| name.to_string_lossy().into_owned(),
        )
}

fn execute(arguments: &[String]) -> Exit {
    let program = program();
    match arguments::parse(arguments) {
        Err(error) => {
            eprintln!("{error}\nRun {program} --help to see what it can do.");
            Exit::Usage
        }
        Ok(Request::Version) => {
            println!("Schelf {}", env!("CARGO_PKG_VERSION"));
            Exit::Done
        }
        Ok(Request::Help(command)) => {
            print!("{}", arguments::help(&program, command));
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
    }
}

pub fn run(arguments: &[String]) -> Option<i32> {
    let Some(first) = arguments.first() else {
        return std::io::stdin().is_terminal().then(|| {
            print!("{}", arguments::help(&program(), None));
            Exit::Done as i32
        });
    };
    if publishing::recognised(first) {
        return Some(publishing::run(arguments));
    }
    arguments::recognised(first).then(|| execute(arguments) as i32)
}
