mod info;
mod install;
mod list;
mod places;
mod remove;
pub mod repo;
mod search;
mod system;
mod trust;
mod update;

use luft_i18n::t;
use schelf_core::host;

use super::Exit;
use super::arguments::{Arguments, Command};
use super::sources::Origin;
use super::terminal::{Ink, prompt};
use crate::l10n::L10N;

fn needs_luft(reason: String) -> Exit {
    eprintln!("{reason}");
    Exit::Missing
}

pub fn run(arguments: &Arguments) -> Exit {
    let system = arguments.only == Some(Origin::System);
    let luft = host::luft();
    match arguments.command {
        Command::Install | Command::Update if system && !luft => {
            needs_luft(t!(L10N, "cli-needs-luft-system"))
        }
        Command::Repo if !luft => needs_luft(t!(L10N, "cli-needs-luft-sources")),
        Command::Trust | Command::Untrust if !luft => {
            needs_luft(t!(L10N, "cli-needs-luft-full-access"))
        }
        Command::Give | Command::Take if !luft => needs_luft(t!(L10N, "cli-needs-luft-places")),
        Command::Install if system => system::install(arguments),
        Command::Install => install::run(arguments),
        Command::Remove => remove::run(arguments),
        Command::Search => search::run(arguments),
        Command::Update => update::run(arguments),
        Command::List => list::run(arguments),
        Command::Info => info::run(arguments),
        Command::Trust => trust::run(arguments, true),
        Command::Untrust => trust::run(arguments, false),
        Command::Give => places::run(arguments, true),
        Command::Take => places::run(arguments, false),
        Command::Repo => repo::run(arguments),
    }
}

/// The source the catalogs were narrowed to, when this computer can look in it.
fn catalog(only: Option<Origin>) -> Result<Option<Origin>, Exit> {
    let Some(origin) = only else {
        return Ok(None);
    };
    let catalog = origin.catalogs().next().ok_or_else(|| {
        eprintln!("{}", t!(L10N, "cli-appimage-no-catalog"));
        Exit::Usage
    })?;
    match catalog.missing() {
        Some(reason) => {
            eprintln!("{reason}");
            Err(Exit::Missing)
        }
        None => Ok(Some(origin)),
    }
}

fn pick(name: &str, options: &[String], yes: bool, hint: &str) -> Result<usize, Exit> {
    let ink = Ink::stderr();
    eprintln!("{}", t!(L10N, "cli-pick-several", name = ink.bold(name)));
    if yes || !prompt::interactive() {
        for option in options {
            eprintln!("  {option}");
        }
        eprintln!("{hint}");
        return Err(Exit::Usage);
    }
    prompt::choose(options).ok_or(Exit::Declined)
}

pub fn confirm(question: &str, yes: bool) -> Result<(), Exit> {
    if yes {
        return Ok(());
    }
    if !prompt::interactive() {
        eprintln!("{}", needs_yes(question));
        return Err(Exit::Usage);
    }
    if prompt::confirm(question) {
        Ok(())
    } else {
        Err(Exit::Declined)
    }
}

pub fn needs_yes(question: &str) -> String {
    t!(L10N, "cli-confirm-needs-yes", question = question)
}

pub fn list_of(names: &[String]) -> String {
    match names {
        [] => String::new(),
        [only] => only.clone(),
        [rest @ .., last] => t!(
            L10N,
            "cli-list-and",
            rest = rest.join(&t!(L10N, "cli-list-separator")),
            last = last.as_str()
        ),
    }
}

pub fn either_of(names: &[&str]) -> String {
    match names {
        [rest @ .., last] if !rest.is_empty() => t!(
            L10N,
            "cli-list-or",
            rest = rest.join(&t!(L10N, "cli-list-separator")),
            last = *last
        ),
        _ => names.concat(),
    }
}
