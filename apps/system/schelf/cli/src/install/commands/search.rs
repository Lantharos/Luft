use luft_i18n::t;
use schelf_core::library::InstalledApp;

use super::catalog;
use crate::install::Exit;
use crate::install::arguments::Arguments;
use crate::install::sources::{self, Candidate, Origin, installed};
use crate::install::terminal::Line;
use crate::install::terminal::{self, Ink, Look, Table};
use crate::l10n::L10N;

const SHOWN: usize = 10;
const INSTALLED: &str = "installed";
const AVAILABLE: &str = "available";

struct Found {
    origin: Origin,
    id: String,
    name: String,
    summary: String,
    installed: bool,
}

impl From<Candidate> for Found {
    fn from(candidate: Candidate) -> Self {
        Self {
            origin: candidate.catalog.origin(),
            id: candidate.id,
            name: candidate.name,
            summary: candidate.summary,
            installed: candidate.installed,
        }
    }
}

impl From<InstalledApp> for Found {
    fn from(app: InstalledApp) -> Self {
        Self {
            origin: Origin::AppImage,
            summary: app.summary.unwrap_or_default(),
            id: app.id,
            name: app.name,
            installed: true,
        }
    }
}

fn group(origin: Origin, found: &[Found], all: bool) {
    let ink = Ink::stdout();
    println!("{}", ink.bold(origin.heading()));
    let shown = if all { found.len() } else { SHOWN };
    let found = &found[..shown.min(found.len())];
    let with_id = found.iter().any(|found| found.id != found.name);
    let with_mark = found.iter().any(|found| found.installed);
    let mut looks = vec![Look::Bold];
    if with_id {
        looks.push(Look::Dim);
    }
    if with_mark {
        looks.push(Look::Done);
    }
    looks.push(Look::Plain);
    let mut table = Table::new(&looks);
    let installed = t!(L10N, "cli-search-installed");
    for found in found {
        let mut row = vec![found.name.clone()];
        if with_id {
            row.push(found.id.clone());
        }
        if with_mark {
            row.push(if found.installed {
                installed.clone()
            } else {
                String::new()
            });
        }
        row.push(found.summary.clone());
        table.row(row);
    }
    table.print(ink);
}

fn more(origin: Origin, hidden: usize) {
    println!(
        "  {}",
        Ink::stdout().dim(t!(
            L10N,
            "cli-search-more",
            count = hidden,
            flag = format!("--{}", origin.flag())
        ))
    );
}

fn plain(found: &Found) {
    let state = if found.installed {
        INSTALLED
    } else {
        AVAILABLE
    };
    println!(
        "{}\t{}\t{}\t{state}\t{}",
        found.origin.flag(),
        found.id,
        found.name,
        found.summary
    );
}

pub fn run(arguments: &Arguments) -> Exit {
    let only = match catalog(arguments.only) {
        Ok(only) => only,
        Err(exit) => return exit,
    };
    let query = arguments.words.join(" ");
    let line = Line::default();
    line.say(&t!(L10N, "cli-search-searching", query = query.as_str()));
    let mut groups: Vec<(Origin, Vec<Found>)> = Vec::new();
    let mut failed = false;
    for (catalog, result) in sources::search(&query, only) {
        match result {
            Ok(found) => groups.push((
                catalog.origin(),
                found.into_iter().map(Found::from).collect(),
            )),
            Err(error) => {
                line.clear();
                eprintln!(
                    "{}",
                    t!(
                        L10N,
                        "cli-search-failed",
                        source = catalog.title(),
                        error = error
                    )
                );
                failed = true;
            }
        }
    }
    if only.is_none() {
        let appimages = installed::containing(installed::all(Some(Origin::AppImage)), &query);
        groups.push((
            Origin::AppImage,
            appimages.into_iter().map(Found::from).collect(),
        ));
    }
    line.clear();
    groups.retain(|(_, found)| !found.is_empty());
    let wanted = query.to_lowercase();
    groups.sort_by_key(|(_, found)| {
        !found.iter().any(|found| {
            [
                found.name.as_str(),
                found.id.as_str(),
                found.id.rsplit('.').next().unwrap_or_default(),
            ]
            .iter()
            .any(|known| known.to_lowercase() == wanted)
        })
    });
    if groups.is_empty() {
        if !failed {
            let nothing = match only {
                Some(catalog) => t!(
                    L10N,
                    "cli-search-nothing-on",
                    query = query.as_str(),
                    source = catalog.title()
                ),
                None => t!(L10N, "cli-search-nothing", query = query.as_str()),
            };
            eprintln!("{nothing}");
        }
        return if failed { Exit::Failed } else { Exit::Missing };
    }
    let all = only.is_some();
    for (index, (origin, found)) in groups.iter().enumerate() {
        if !terminal::stdout_is_terminal() {
            found.iter().for_each(plain);
            continue;
        }
        if index > 0 {
            println!();
        }
        group(*origin, found, all);
        if !all && found.len() > SHOWN {
            more(*origin, found.len() - SHOWN);
        }
    }
    Exit::Done
}
