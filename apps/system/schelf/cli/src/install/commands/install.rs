use luft_i18n::t;
use luft_software::apps::toolbox;
use schelf_core::operations::Job;

use super::{catalog, confirm, either_of, list_of, pick};
use crate::install::Exit;
use crate::install::arguments::Arguments;
use crate::install::perform::{Missed, Plan, Verb, carry_out};
use crate::install::sources::{
    Candidate, Catalog, Kind, Origin, Resolved, catalogs, fedora, file, installed, resolve,
};
use crate::install::terminal::Line;
use crate::install::terminal::{Ink, Look, Table};
use crate::l10n::L10N;

const COMMANDS_SHOWN: usize = 5;

fn nothing(name: &str, only: Option<Catalog>, suggestions: &[Candidate]) {
    let ink = Ink::stderr();
    let mut places: Vec<String> = catalogs(only)
        .into_iter()
        .filter(|catalog| *catalog != Catalog::System)
        .map(Catalog::title)
        .collect();
    places.dedup();
    let places: Vec<&str> = places.iter().map(String::as_str).collect();
    eprintln!(
        "{}",
        t!(
            L10N,
            "cli-install-nothing-called",
            name = ink.bold(name),
            places = either_of(&places)
        )
    );
    if suggestions.is_empty() {
        return;
    }
    eprintln!("{}", t!(L10N, "cli-install-close-matches"));
    let mut table = Table::new(&[Look::Bold, Look::Dim, Look::Plain]);
    for candidate in suggestions {
        table.row(vec![
            candidate.id.clone(),
            candidate.catalog.title(),
            candidate.summary.clone(),
        ]);
    }
    table.eprint(ink);
}

fn choose(name: &str, found: Vec<Candidate>, yes: bool) -> Result<Candidate, Exit> {
    let options: Vec<String> = found.iter().map(Candidate::describe).collect();
    let hint = if found
        .iter()
        .all(|candidate| candidate.catalog.origin() == found[0].catalog.origin())
    {
        t!(
            L10N,
            "cli-install-name-by-id",
            example = found[0].id.as_str()
        )
    } else {
        t!(L10N, "cli-install-pick-source")
    };
    let chosen = pick(name, &options, yes, &hint)?;
    Ok(found
        .into_iter()
        .nth(chosen)
        .expect("the choice is one of the options"))
}

/// The plan for `target`, and whether it waits for your yes along with the rest.
fn prepare(target: &str, only: Option<Catalog>, yes: bool) -> Result<Option<(Plan, bool)>, Exit> {
    let ink = Ink::stdout();
    if file::named(target) {
        let prepared = file::prepare(target).map_err(|error| {
            eprintln!("{error}");
            Exit::Missing
        })?;
        if prepared.installed {
            println!(
                "{}",
                t!(
                    L10N,
                    "cli-install-already",
                    name = ink.bold(prepared.plan.name())
                )
            );
            return Ok(None);
        }
        if let Some(described) = &prepared.trust {
            eprintln!(
                "{}",
                t!(
                    L10N,
                    "cli-install-own-source",
                    name = ink.bold(prepared.plan.name())
                )
            );
            super::repo::confirm_trust(described, yes)?;
        }
        return Ok(Some((prepared.plan, false)));
    }
    let line = Line::default();
    line.say(&t!(L10N, "cli-looking-for", name = target));
    let resolved = resolve(target, only);
    line.clear();
    let candidate = match resolved {
        Err(error) => {
            eprintln!(
                "{}",
                t!(
                    L10N,
                    "cli-install-look-failed",
                    name = target,
                    error = error
                )
            );
            return Err(Exit::Failed);
        }
        Ok(Resolved::One(candidate)) => candidate,
        Ok(Resolved::Several(found)) => choose(target, found, yes)?,
        Ok(Resolved::Nothing { suggestions }) => {
            nothing(target, only, &suggestions);
            return Err(Exit::Missing);
        }
    };
    if candidate.installed
        && candidate.catalog == Catalog::Fedora
        && fedora::comes_with_luft(&candidate.id)
    {
        println!(
            "{}",
            t!(
                L10N,
                "cli-install-comes-with-luft",
                name = ink.bold(&candidate.name)
            )
        );
        return Ok(None);
    }
    if candidate.installed {
        println!(
            "{}",
            t!(
                L10N,
                "cli-install-already-from",
                name = ink.bold(&candidate.name),
                source = candidate.catalog.title()
            )
        );
        return Ok(None);
    }
    if candidate.catalog == Catalog::Fedora
        && candidate.kind == Kind::Command
        && only != Some(Catalog::Fedora)
        && toolbox::needs_system(&candidate.id).unwrap_or(false)
    {
        if installed::all(Some(Origin::System))
            .iter()
            .any(|app| app.id == candidate.id)
        {
            println!(
                "{}",
                t!(L10N, "cli-system-already", name = ink.bold(&candidate.name))
            );
            return Ok(None);
        }
        println!(
            "{}",
            t!(
                L10N,
                "cli-install-goes-to-system",
                name = ink.bold(&candidate.name)
            )
        );
        return Ok(Some((
            super::system::plan(vec![candidate.id], Verb::Install),
            false,
        )));
    }
    candidate.plan(yes).map(Some)
}

fn tool_notes(package: &str) -> Vec<String> {
    let commands = toolbox::installed()
        .into_iter()
        .find(|tool| tool.package == package)
        .map(|tool| tool.commands)
        .unwrap_or_default();
    let ink = Ink::stdout();
    let mut notes = Vec::new();
    match commands.as_slice() {
        [] => {}
        [command] => notes.push(t!(L10N, "cli-install-run-as", command = ink.bold(command))),
        _ => {
            let shown: Vec<String> = commands
                .iter()
                .take(COMMANDS_SHOWN)
                .map(|command| ink.bold(command))
                .collect();
            let more = commands.len().saturating_sub(COMMANDS_SHOWN);
            notes.push(if more > 0 {
                t!(
                    L10N,
                    "cli-install-commands-and-more",
                    commands = list_of(&shown),
                    count = more
                )
            } else {
                t!(L10N, "cli-install-commands", commands = list_of(&shown))
            });
        }
    }
    if fedora::is_library(package, &commands) {
        notes.push(t!(
            L10N,
            "cli-install-library",
            command = ink.bold("toolbox enter")
        ));
    }
    notes
}

fn notes(plan: &Plan) -> Vec<String> {
    let ink = Ink::stdout();
    match &plan.request.job {
        Job::InstallTool { package } => tool_notes(package),
        Job::InstallToolFile { .. } => tool_notes(plan.name()),
        Job::InstallFlathub { id } => vec![t!(
            L10N,
            "cli-install-open-or-run",
            command = ink.bold(format!("flatpak run {id}"))
        )],
        Job::InstallFlatpakRef { .. }
        | Job::InstallFlatpakBundle { .. }
        | Job::InstallDeb { .. }
        | Job::InstallAppImage { .. } => {
            vec![t!(L10N, "cli-install-open")]
        }
        Job::InstallSystemPackageFile {
            repository: Some(_),
            ..
        } => vec![t!(L10N, "cli-install-system-file-updates")],
        Job::InstallSystemPackageFile { .. } => vec![t!(L10N, "cli-install-system-file")],
        _ => Vec::new(),
    }
}

pub fn run(arguments: &Arguments) -> Exit {
    let only = match catalog(arguments.only) {
        Ok(only) => only,
        Err(exit) => return exit,
    };
    let mut plans = Vec::new();
    let mut asks = false;
    let mut missed = Vec::new();
    for target in &arguments.words {
        match prepare(target, only, arguments.yes) {
            Ok(Some((plan, asked))) => {
                asks |= asked;
                plans.push(plan);
            }
            Ok(None) => {}
            Err(exit @ (Exit::Missing | Exit::Failed)) => missed.push(Missed {
                name: target.clone(),
                exit,
            }),
            Err(exit) => return exit,
        }
    }
    if asks {
        let names: Vec<String> = plans.iter().map(|plan| plan.name().to_owned()).collect();
        let question = t!(L10N, "cli-install-confirm", names = list_of(&names));
        if let Err(exit) = confirm(&question, arguments.yes) {
            return exit;
        }
    }
    carry_out(&plans, &missed, notes)
}
