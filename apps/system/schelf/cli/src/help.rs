use luft_i18n::t;

use crate::install::{self, Command};
use crate::l10n::L10N;

const COLUMN: usize = 20;

fn rows(rows: &[(&str, String)]) -> String {
    rows.iter()
        .map(|(usage, about)| format!("  {usage:COLUMN$}  {about}\n"))
        .collect()
}

fn installing() -> String {
    let commands = rows(&[
        ("install NAME|FILE...", t!(L10N, "cli-help-install")),
        ("remove NAME...", t!(L10N, "cli-help-remove")),
        ("search QUERY", t!(L10N, "cli-help-search")),
        ("update [NAME...]", t!(L10N, "cli-help-update")),
        ("list", t!(L10N, "cli-help-list")),
        ("info NAME", t!(L10N, "cli-help-info")),
        ("trust NAME...", t!(L10N, "cli-help-trust")),
        ("untrust NAME...", t!(L10N, "cli-help-untrust")),
        ("give NAME [PLACE]", t!(L10N, "cli-help-give")),
        ("take NAME PLACE", t!(L10N, "cli-help-take")),
        ("repo add|remove|list", t!(L10N, "cli-help-repo")),
    ]);
    let options = rows(&[
        (
            "--store, --flathub, --appimage",
            t!(L10N, "cli-help-option-only"),
        ),
        ("--read-only", t!(L10N, "cli-help-option-read-only")),
        ("-y, --yes", t!(L10N, "cli-help-option-yes")),
        ("-h, --help", t!(L10N, "cli-help-option-help")),
        ("--version", t!(L10N, "cli-help-option-version")),
    ]);
    format!(
        "{}\n{commands}\n{}\n{options}",
        t!(L10N, "cli-help-commands"),
        t!(L10N, "cli-help-options")
    )
}

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
        "{}\n{lines}\n{}\n",
        t!(L10N, "cli-help-publishing"),
        t!(L10N, "cli-help-publishing-options")
    )
}

pub fn print(program: &str) -> i32 {
    print!(
        "{}\n\n{}\n\n{}\n{}\n{}\n",
        t!(L10N, "cli-help-about"),
        t!(
            L10N,
            "cli-usage",
            usage = format!("{program} COMMAND [OPTIONS]")
        ),
        installing(),
        publishing(),
        t!(L10N, "cli-help-exits")
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
