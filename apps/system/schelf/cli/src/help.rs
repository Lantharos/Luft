use crate::install::{self, Command};

const INSTALLING: &str = "\
Commands:
  install NAME|FILE...  Install apps, tools or a file
  remove NAME...        Remove something you installed
  search QUERY          Look for apps and tools everywhere
  update [NAME...]      Update apps, AppImages and tools
  list                  Show what you installed
  info NAME             Show details
  trust NAME...         Give Flatpak apps full access
  untrust NAME...       Put them back in their sandbox
  give NAME [PLACE]     Let an app use one drive or folder
  take NAME PLACE       Take a drive or folder away again
  repo add|remove|list  Manage software sources for system packages

Options:
  --store, --flathub, --fedora, --appimage  Use only this source
  --system              Fedora packages for the whole system, such as services
  --read-only           Give a drive or folder only to read
  -y, --yes             Go ahead without asking
  -h, --help            Show help, also for a command
  --version             Show the version
";

const EXITS: &str = "\
Exits 0 when done, 1 on failure, 2 for wrong usage, 3 when something isn't
there or you aren't signed in, 4 while waiting for a person, 5 when declined
or expired, and 130 when stopped. Luft itself updates in Settings, under Updates.
";

fn publishing() -> String {
    let commands = schelf_publish::commands();
    let width = commands
        .iter()
        .map(|(usage, _)| usage.len())
        .max()
        .unwrap_or(0)
        + 2;
    let lines: String = commands
        .iter()
        .map(|(usage, about)| format!("  {usage:width$}{about}\n"))
        .collect();
    format!(
        "Publishing on schelf.store:\n{lines}\n\
         Publishing commands also take --json to print the result as JSON and\n\
         --api ORIGIN to talk to another store.\n"
    )
}

pub fn print(program: &str) -> i32 {
    print!(
        "Schelf installs apps and command-line tools into your account, and puts\n\
         your own on schelf.store.\n\n\
         Usage: {program} COMMAND [OPTIONS]\n\n\
         {INSTALLING}\n{}\n{EXITS}",
        publishing()
    );
    0
}

/// Help for `command`, or for everything.
pub fn command(program: &str, command: Option<&String>) -> i32 {
    let Some(word) = command else {
        return print(program);
    };
    let asked = [word.clone(), "--help".to_owned()];
    if schelf_publish::recognised(&asked) {
        return schelf_publish::run(&asked);
    }
    match Command::named(word) {
        Some(command) => {
            print!("{}", install::usage(program, command));
            0
        }
        None => print(program),
    }
}
