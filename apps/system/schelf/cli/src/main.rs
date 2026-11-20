mod help;
mod install;
mod l10n;

use std::io::IsTerminal;
use std::os::unix::process::CommandExt;
use std::path::Path;
use std::process::Command;

use luft_i18n::t;
use luft_software::apps::debian;
use schelf_core::host;

use l10n::L10N;

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
    eprintln!("{}", t!(L10N, "cli-open-failed", error = error.to_string()));
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
                    "{}\n{}",
                    t!(L10N, "cli-usage-unknown-command", command = first.as_str()),
                    t!(L10N, "cli-usage-see-help", program = program)
                );
                install::Exit::Usage as i32
            }
        },
    }
}

fn main() {
    let arguments: Vec<String> = std::env::args().skip(1).collect();
    if let Some((flag, program)) = arguments.split_first()
        && flag == debian::LAUNCH
    {
        std::process::exit(debian::launch(program));
    }
    unsafe { libc::signal(libc::SIGPIPE, libc::SIG_DFL) };
    luft_software::apps::appimage::launch_through(host::app().map(Path::to_path_buf));
    schelf_core::tools::adopt_self(env!("CARGO_PKG_VERSION"));
    let program = program();
    if let Some(manager) = install::managers::Manager::named(&program) {
        std::process::exit(install::managers::run(&program, manager, &arguments));
    }
    std::process::exit(run(&program, &arguments));
}
