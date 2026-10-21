mod info;
mod install;
mod list;
mod remove;
pub mod repo;
mod search;
mod system;
mod trust;
mod update;

use super::Exit;
use super::arguments::{Arguments, Command};
use super::sources::{Catalog, Origin};
use super::terminal::{Ink, prompt};

pub fn run(arguments: &Arguments) -> Exit {
    let system = arguments.only == Some(Origin::System);
    match arguments.command {
        Command::Install if system => system::install(arguments),
        Command::Update if system => system::explain_updates(),
        Command::Install => install::run(arguments),
        Command::Remove => remove::run(arguments),
        Command::Search => search::run(arguments),
        Command::Update => update::run(arguments),
        Command::List => list::run(arguments),
        Command::Info => info::run(arguments),
        Command::Trust => trust::run(arguments, true),
        Command::Untrust => trust::run(arguments, false),
        Command::Repo => repo::run(arguments),
    }
}

fn catalog(only: Option<Origin>) -> Result<Option<Catalog>, Exit> {
    match only {
        None => Ok(None),
        Some(origin) => origin.catalog().map(Some).ok_or_else(|| {
            eprintln!(
                "AppImages have no catalog to look in. Install one from its file, such as ./App.AppImage."
            );
            Exit::Usage
        }),
    }
}

fn pick(name: &str, options: &[String], yes: bool, hint: &str) -> Result<usize, Exit> {
    let ink = Ink::stderr();
    eprintln!("{} is in more than one place:", ink.bold(name));
    if yes || !prompt::interactive() {
        for option in options {
            eprintln!("  {option}");
        }
        eprintln!("{hint}");
        return Err(Exit::Usage);
    }
    prompt::choose(options).ok_or(Exit::Declined)
}

fn confirm(question: &str, yes: bool) -> Result<(), Exit> {
    if yes {
        return Ok(());
    }
    if !prompt::interactive() {
        eprintln!("{question} Add --yes to go ahead without being asked.");
        return Err(Exit::Usage);
    }
    if prompt::confirm(question) {
        Ok(())
    } else {
        Err(Exit::Declined)
    }
}

fn list_of(names: &[String]) -> String {
    match names {
        [] => String::new(),
        [only] => only.clone(),
        [rest @ .., last] => format!("{} and {last}", rest.join(", ")),
    }
}
