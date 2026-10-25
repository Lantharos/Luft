use luft_software::apps::toolbox;

use super::{catalog, list_of, pick};
use crate::cli::Exit;
use crate::cli::arguments::Arguments;
use crate::cli::perform::{Plan, carry_out};
use crate::cli::sources::{Candidate, Catalog, Resolved, fedora, file, resolve};
use crate::cli::terminal::progress::Line;
use crate::cli::terminal::{Ink, Look, Table};
use crate::operations::Job;

const COMMANDS_SHOWN: usize = 5;

fn nothing(name: &str, only: Option<Catalog>, suggestions: &[Candidate]) {
    let ink = Ink::stderr();
    let places = only.map_or("Flathub or Fedora", Catalog::title);
    eprintln!("There's nothing called {} on {places}.", ink.bold(name));
    if suggestions.is_empty() {
        return;
    }
    eprintln!("Close matches:");
    let mut table = Table::new(&[Look::Bold, Look::Dim, Look::Plain]);
    for candidate in suggestions {
        table.row(vec![
            candidate.id.clone(),
            candidate.catalog.title().to_owned(),
            candidate.summary.clone(),
        ]);
    }
    table.eprint(ink);
}

fn choose(name: &str, found: Vec<Candidate>, yes: bool) -> Result<Candidate, Exit> {
    let options: Vec<String> = found.iter().map(Candidate::describe).collect();
    let hint = if found
        .iter()
        .all(|candidate| candidate.catalog == found[0].catalog)
    {
        format!("Name the one you want by its ID, such as {}.", found[0].id)
    } else {
        "Pick one with --flathub or --fedora.".to_owned()
    };
    let chosen = pick(name, &options, yes, &hint)?;
    Ok(found
        .into_iter()
        .nth(chosen)
        .expect("the choice is one of the options"))
}

fn prepare(target: &str, only: Option<Catalog>, yes: bool) -> Result<Option<Plan>, Exit> {
    let ink = Ink::stdout();
    if file::named(target) {
        let prepared = file::prepare(target).map_err(|error| {
            eprintln!("{error}");
            Exit::Missing
        })?;
        if prepared.installed {
            println!("{} is already installed.", ink.bold(prepared.plan.name()));
            return Ok(None);
        }
        if let Some(described) = &prepared.trust {
            eprintln!(
                "{} gets its updates from a software source of its own:",
                ink.bold(prepared.plan.name())
            );
            super::repo::confirm_trust(described, yes)?;
        }
        return Ok(Some(prepared.plan));
    }
    let line = Line::default();
    line.say(&format!("Looking for {target}…"));
    let resolved = resolve(target, only);
    line.clear();
    let candidate = match resolved {
        Err(error) => {
            eprintln!("Couldn't look for {target}. {error}");
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
        println!("{} comes with Luft.", ink.bold(&candidate.name));
        return Ok(None);
    }
    if candidate.installed {
        println!(
            "{} is already installed from {}.",
            ink.bold(&candidate.name),
            candidate.catalog.title()
        );
        return Ok(None);
    }
    Ok(Some(candidate.plan()))
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
        [command] => notes.push(format!("Run it as {}.", ink.bold(command))),
        _ => {
            let shown: Vec<String> = commands
                .iter()
                .take(COMMANDS_SHOWN)
                .map(|command| ink.bold(command))
                .collect();
            let more = commands.len().saturating_sub(COMMANDS_SHOWN);
            let tail = if more > 0 {
                format!(", and {more} more")
            } else {
                String::new()
            };
            notes.push(format!("Its commands are {}{tail}.", list_of(&shown)));
        }
    }
    if fedora::is_library(package, &commands) {
        notes.push(format!(
            "It lives in your Toolbox, so build against it inside {}.",
            ink.bold("toolbox enter")
        ));
    }
    notes
}

fn notes(plan: &Plan) -> Vec<String> {
    let ink = Ink::stdout();
    match &plan.request.job {
        Job::InstallTool { package } => tool_notes(package),
        Job::InstallToolFile { .. } => tool_notes(plan.name()),
        Job::InstallFlathub { id } => vec![format!(
            "Open it from Start, or run {}.",
            ink.bold(format!("flatpak run {id}"))
        )],
        Job::InstallFlatpakRef { .. } | Job::InstallFlatpakBundle { .. } | Job::InstallAppImage { .. } => {
            vec!["Open it from Start.".to_owned()]
        }
        Job::InstallSystemPackageFile {
            repository: Some(_),
            ..
        } => vec!["It's part of the system now, and updates with Luft.".to_owned()],
        Job::InstallSystemPackageFile { .. } => vec![
            "It's part of the system now. It doesn't get updates of its own, so remove it and install a newer file when one comes out.".to_owned(),
        ],
        _ => Vec::new(),
    }
}

pub fn run(arguments: &Arguments) -> Exit {
    let only = match catalog(arguments.only) {
        Ok(only) => only,
        Err(exit) => return exit,
    };
    let mut plans = Vec::new();
    for target in &arguments.words {
        match prepare(target, only, arguments.yes) {
            Ok(plan) => plans.extend(plan),
            Err(exit) => return exit,
        }
    }
    carry_out(&plans, |plan| {
        for note in notes(plan) {
            println!("  {note}");
        }
    })
}
