use luft_app::block_on;
use luft_software::flatpak::Installation;

use crate::cli::Exit;
use crate::cli::arguments::Arguments;
use crate::cli::perform::{Plan, Verb, carry_out};
use crate::cli::sources::{Origin, installed};
use crate::cli::terminal::progress::Line;
use crate::cli::terminal::{Ink, Look, Table};
use crate::fedora;
use crate::library::Source;
use crate::operations::{Job, Request};
use crate::updates::{self, AppUpdate};

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
    what: &str,
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
            format!("{} {what}", updates.len()),
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
        let (key, everyone) = match installation {
            Installation::User => ("flatpak-updates/user", ""),
            Installation::System => ("flatpak-updates/system", " for everyone"),
        };
        let kinds = if flatpaks.iter().any(|update| update.platform) {
            "Flatpak apps and runtimes"
        } else {
            "Flatpak apps"
        };
        plans.extend(batch(
            key,
            &format!("{kinds}{everyone}"),
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
        "package-updates",
        "apps from Fedora",
        &of(Source::Package),
        |packages| Job::Fedora(fedora::Job::UpdatePackages { packages }),
        package,
    ));
    plans.extend(batch(
        "tool-updates",
        "command-line tools",
        &of(Source::Tool),
        |packages| Job::UpdateTools { packages },
        package,
    ));
    plans.extend(of(Source::AppImage).into_iter().map(|update| {
        plan(
            update.key.clone(),
            update.name.clone(),
            Job::UpdateAppImage {
                id: update.id.clone(),
            },
            Vec::new(),
        )
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
            Origin::of(update.source).title().to_owned(),
        ]);
    }
    let counted = |count: usize, one: &str, many: &str| {
        format!("{count} {}", if count == 1 { one } else { many })
    };
    let mut heading = counted(apps, "update", "updates");
    if runtimes > 0 {
        heading = format!(
            "{heading}, and {} that apps run on",
            counted(runtimes, "runtime", "runtimes")
        );
    }
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
            eprintln!("{} isn't installed.", ink.bold(name));
            exit = Some(Exit::Missing);
        } else {
            println!("{} is up to date.", Ink::stdout().bold(name));
        }
    }
    exit
}

pub fn run(arguments: &Arguments) -> Exit {
    let line = Line::default();
    line.say("Checking for updates…");
    let (mut updates, error) = block_on(updates::find());
    line.clear();
    if let Some(error) = &error {
        eprintln!("Not every update could be checked. {error}");
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
        if error.is_some() {
            return Exit::Failed;
        }
        if arguments.words.is_empty() {
            println!("Everything is up to date.");
        }
        return Exit::Done;
    }
    show(&updates);
    carry_out(&plans(&updates), |_| {})
}
