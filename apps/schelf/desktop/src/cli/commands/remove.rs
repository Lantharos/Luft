use super::{confirm, pick};
use crate::cli::Exit;
use crate::cli::arguments::Arguments;
use crate::cli::perform::{Plan, carry_out};
use crate::cli::sources::installed;
use crate::cli::terminal::Ink;
use crate::library::InstalledApp;

fn choose(name: &str, mut found: Vec<InstalledApp>, yes: bool) -> Result<InstalledApp, Exit> {
    if found.len() == 1 {
        return Ok(found.remove(0));
    }
    let options: Vec<String> = found.iter().map(installed::describe).collect();
    let chosen = pick(
        name,
        &options,
        yes,
        "Pick one with --flathub, --fedora or --appimage.",
    )?;
    Ok(found.swap_remove(chosen))
}

fn prepare(arguments: &Arguments, everything: &[InstalledApp]) -> Result<Vec<Plan>, Exit> {
    let ink = Ink::stderr();
    let mut chosen = Vec::new();
    for name in &arguments.words {
        let found = installed::matching(everything.to_vec(), name);
        if found.is_empty() {
            eprintln!("{} isn't installed.", ink.bold(name));
            return Err(Exit::Missing);
        }
        chosen.push(choose(name, found, arguments.yes)?);
    }
    let names: Vec<String> = chosen.iter().map(|app| app.name.clone()).collect();
    confirm(
        &format!("Remove {}?", super::list_of(&names)),
        arguments.yes,
    )?;
    Ok(chosen.iter().map(installed::removal).collect())
}

pub fn run(arguments: &Arguments) -> Exit {
    let everything = installed::all(arguments.only);
    match prepare(arguments, &everything) {
        Ok(plans) => carry_out(&plans, |_| {}),
        Err(exit) => exit,
    }
}
