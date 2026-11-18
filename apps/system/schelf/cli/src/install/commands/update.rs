use luft_dbus::runtime::block_on;
use luft_i18n::t;
use luft_software::apps::flatpak::Installation;
use schelf_core::library::Source;
use schelf_core::operations::{Job, Request};
use schelf_core::updates::{self, AppUpdate};

use crate::install::Exit;
use crate::install::arguments::Arguments;
use crate::install::perform::{Plan, Verb, carry_out};
use crate::install::sources::{Origin, installed};
use crate::install::terminal::Line;
use crate::install::terminal::{Ink, Look, Table};
use crate::l10n::L10N;

fn named(update: &AppUpdate, name: &str) -> bool {
    let wanted = name.to_lowercase();
    [
        Some(&update.name),
        Some(&update.id),
        update.package.as_ref(),
    ]
    .into_iter()
    .flatten()
    .any(|known| known.to_lowercase() == wanted)
}

fn plan(key: String, title: String, job: Job, members: Vec<String>) -> Plan {
    Plan {
        request: Request {
            key,
            title,
            job,
            members,
        },
        verb: Verb::Update,
        from: None,
    }
}

fn batch(
    key: &str,
    title: impl FnOnce(usize) -> String,
    updates: &[&AppUpdate],
    job: impl FnOnce(Vec<String>) -> Job,
    of: impl Fn(&AppUpdate) -> String,
) -> Option<Plan> {
    match updates {
        [] => None,
        [update] => Some(plan(
            update.key.clone(),
            update.name.clone(),
            job(vec![of(update)]),
            Vec::new(),
        )),
        _ => Some(plan(
            key.to_owned(),
            title(updates.len()),
            job(updates.iter().map(|update| of(update)).collect()),
            updates.iter().map(|update| update.key.clone()).collect(),
        )),
    }
}

fn plans(updates: &[AppUpdate]) -> Vec<Plan> {
    let of = |source: Source| -> Vec<&AppUpdate> {
        updates
            .iter()
            .filter(|update| update.source == source)
            .collect()
    };
    let mut plans = Vec::new();
    for installation in Installation::ALL {
        let flatpaks: Vec<&AppUpdate> = of(Source::Flatpak)
            .into_iter()
            .filter(|update| update.installation == Some(installation))
            .collect();
        let key = match installation {
            Installation::User => "flatpak-updates/user",
            Installation::System => "flatpak-updates/system",
        };
        let runtimes = flatpaks.iter().any(|update| update.platform);
        let title = |count: usize| match (installation, runtimes) {
            (Installation::User, false) => t!(L10N, "cli-update-flatpaks", count = count),
            (Installation::User, true) => {
                t!(L10N, "cli-update-flatpaks-and-runtimes", count = count)
            }
            (Installation::System, false) => {
                t!(L10N, "cli-update-flatpaks-for-everyone", count = count)
            }
            (Installation::System, true) => t!(
                L10N,
                "cli-update-flatpaks-and-runtimes-for-everyone",
                count = count
            ),
        };
        plans.extend(batch(
            key,
            title,
            &flatpaks,
            |references| Job::UpdateFlatpaks {
                installation,
                references,
            },
            |update| update.reference.clone().unwrap_or_default(),
        ));
    }
    let package = |update: &AppUpdate| update.package.clone().unwrap_or_default();
    plans.extend(batch(
        "system-updates",
        |count| t!(L10N, "cli-update-system", count = count),
        &of(Source::System),
        |_| Job::UpdateSystemPackages,
        package,
    ));
    plans.extend(batch(
        "deb-updates",
        |count| t!(L10N, "cli-update-debs", count = count),
        &of(Source::Debian),
        |packages| Job::UpdateDebs { packages },
        package,
    ));
    plans.extend(
        updates
            .iter()
            .filter(|update| update.source == Source::AppImage || update.store.is_some())
            .filter(|update| update.store.as_ref().is_none_or(|store| !store.widens))
            .map(|update| {
                let job = match &update.store {
                    Some(store) => Job::UpdateStore {
                        id: store.id.clone(),
                        consent: store.consent.clone(),
                    },
                    None => Job::UpdateAppImage {
                        id: update.id.clone(),
                    },
                };
                plan(update.key.clone(), update.name.clone(), job, Vec::new())
            }),
    );
    plans.extend(of(Source::StoreTool).into_iter().map(|update| {
        let job = Job::UpdateStoreTool {
            name: update.id.clone(),
        };
        plan(update.key.clone(), update.name.clone(), job, Vec::new())
    }));
    plans
}

fn show(updates: &[AppUpdate]) {
    let ink = Ink::stdout();
    let runtimes = updates.iter().filter(|update| update.platform).count();
    let apps = updates.len() - runtimes;
    let mut table = Table::new(&[Look::Bold, Look::Plain, Look::Dim]);
    for update in updates.iter().filter(|update| !update.platform) {
        let change = match (&update.from, &update.to) {
            (Some(from), Some(to)) => format!("{from} → {to}"),
            (None, Some(to)) => to.clone(),
            (Some(from), None) => from.clone(),
            _ => String::new(),
        };
        table.row(vec![
            update.name.clone(),
            change,
            Origin::of(update.source).title(),
        ]);
    }
    let heading = if runtimes > 0 {
        t!(
            L10N,
            "cli-update-heading-with-runtimes",
            count = apps,
            runtimes = runtimes
        )
    } else {
        t!(L10N, "cli-update-heading", count = apps)
    };
    println!("{}", ink.bold(heading));
    table.print(ink);
}

fn unknown(names: &[String], updates: &[AppUpdate], only: Option<Origin>) -> Option<Exit> {
    let everything = installed::all(only);
    let ink = Ink::stderr();
    let mut exit = None;
    for name in names {
        if updates.iter().any(|update| named(update, name)) {
            continue;
        }
        if installed::matching(everything.clone(), name).is_empty() {
            eprintln!("{}", t!(L10N, "cli-not-installed", name = ink.bold(name)));
            exit = Some(Exit::Missing);
        } else {
            println!(
                "{}",
                t!(
                    L10N,
                    "cli-update-up-to-date",
                    name = Ink::stdout().bold(name)
                )
            );
        }
    }
    exit
}

pub fn run(arguments: &Arguments) -> Exit {
    let line = Line::default();
    line.say(&t!(L10N, "cli-update-checking"));
    let (mut updates, failed) = block_on(updates::find());
    line.clear();
    for failure in &failed {
        eprintln!("{failure}");
    }
    updates.retain(|update| {
        arguments
            .only
            .is_none_or(|only| Origin::of(update.source) == only)
    });
    if !arguments.words.is_empty() {
        if let Some(exit) = unknown(&arguments.words, &updates, arguments.only) {
            return exit;
        }
        updates.retain(|update| arguments.words.iter().any(|name| named(update, name)));
    }
    if updates.is_empty() {
        if !failed.is_empty() {
            return Exit::Failed;
        }
        if arguments.words.is_empty() {
            println!("{}", t!(L10N, "cli-update-all-up-to-date"));
        }
        return Exit::Done;
    }
    show(&updates);
    for (update, store) in updates
        .iter()
        .filter_map(|update| Some((update, update.store.as_ref().filter(|store| store.widens)?)))
    {
        let name = Ink::stdout().bold(&update.name);
        let waits = if store.moves_inside {
            t!(L10N, "cli-update-waits-inside-luft", name = name)
        } else {
            t!(L10N, "cli-update-waits-more-access", name = name)
        };
        println!("{waits}");
    }
    carry_out(&plans(&updates), &[], |_| Vec::new())
}
