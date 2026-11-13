mod help;
mod install;

use std::io::IsTerminal;
use std::os::unix::process::CommandExt;
use std::path::Path;
use std::process::Command;

use schelf_core::host;

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

/// Hands what isn't a command, such as a file or a `schelf:` link from the
/// app menu, to the Schelf app.
fn open_app(app: &Path, arguments: &[String]) -> i32 {
    let error = Command::new(app).args(arguments).exec();
    eprintln!("Couldn't open Schelf: {error}");
    install::Exit::Failed as i32
}

fn run(program: &str, arguments: &[String]) -> i32 {
    let Some(first) = arguments.first() else {
        return match host::app() {
            Some(app) if !std::io::stdin().is_terminal() => open_app(app, arguments),
            _ => help::print(program),
        };
    };
    match first.as_str() {
        "-h" | "--help" | "help" => help::command(program, arguments.get(1)),
        "--version" | "-V" => {
            println!("{}", env!("CARGO_PKG_VERSION"));
            0
        }
        _ if schelf_publish::recognised(arguments) => schelf_publish::run(arguments),
        word if install::recognised(word) => install::run(program, arguments),
        _ => match host::app() {
            Some(app) => open_app(app, arguments),
            None => {
                eprintln!(
                    "There's no command called {first}.\nRun {program} --help to see what it can do."
                );
                install::Exit::Usage as i32
            }
        },
    }
}

fn main() {
    luft_software::apps::appimage::launch_through(host::app().map(Path::to_path_buf));
    let arguments: Vec<String> = std::env::args().skip(1).collect();
    std::process::exit(run(&program(), &arguments));
}
