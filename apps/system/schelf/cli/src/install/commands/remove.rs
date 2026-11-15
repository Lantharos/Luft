use luft_i18n::t;
use schelf_core::library::{InstalledApp, Source};

use super::{confirm, pick};
use crate::install::Exit;
use crate::install::arguments::Arguments;
use crate::install::perform::{Plan, carry_out};
use crate::install::sources::installed;
use crate::install::terminal::Ink;
use crate::l10n::L10N;

fn choose(name: &str, mut found: Vec<InstalledApp>, yes: bool) -> Result<InstalledApp, Exit> {
    if found.len() == 1 {
        return Ok(found.remove(0));
    }
    let options: Vec<String> = found.iter().map(installed::describe).collect();
    let chosen = pick(name, &options, yes, &t!(L10N, "cli-remove-pick-source"))?;
    Ok(found.swap_remove(chosen))
}

fn prepare(arguments: &Arguments, everything: &[InstalledApp]) -> Result<Vec<Plan>, Exit> {
    let ink = Ink::stderr();
    let mut chosen = Vec::new();
    for name in &arguments.words {
        let found = installed::matching(everything.to_vec(), name);
        if found.is_empty() {
            eprintln!("{}", t!(L10N, "cli-not-installed", name = ink.bold(name)));
            return Err(Exit::Missing);
        }
        chosen.push(choose(name, found, arguments.yes)?);
    }
    let names: Vec<String> = chosen.iter().map(|app| app.name.clone()).collect();
    let (system, others): (Vec<&InstalledApp>, Vec<&InstalledApp>) =
        chosen.iter().partition(|app| app.source == Source::System);
    let sandboxed = chosen
        .iter()
        .any(|app| matches!(app.source, Source::Flatpak | Source::AppImage));
    let names = super::list_of(&names);
    let question = match (system.len(), sandboxed) {
        (0, false) => t!(L10N, "cli-remove-confirm", names = names),
        (0, true) => t!(L10N, "cli-remove-confirm-places", names = names),
        (count, _) => t!(
            L10N,
            "cli-remove-confirm-system",
            names = names,
            count = count
        ),
    };
    confirm(&question, arguments.yes)?;
    let mut plans: Vec<Plan> = others.into_iter().map(installed::removal).collect();
    if !system.is_empty() {
        plans.push(super::system::removal(
            system.iter().map(|app| app.id.clone()).collect(),
        ));
    }
    Ok(plans)
}

pub fn run(arguments: &Arguments) -> Exit {
    let everything = installed::all(arguments.only);
    match prepare(arguments, &everything) {
        Ok(plans) => carry_out(&plans, &[], |_| Vec::new()),
        Err(exit) => exit,
    }
}
