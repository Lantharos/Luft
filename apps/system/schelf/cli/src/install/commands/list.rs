use luft_i18n::t;
use luft_software::apps::flatpak::{FLATHUB, Installation};
use schelf_core::library::{InstalledApp, Source};

use crate::install::Exit;
use crate::install::arguments::Arguments;
use crate::install::sources::{Origin, installed};
use crate::install::terminal::{self, Ink, Look, Table};
use crate::l10n::L10N;

fn shown_id(app: &InstalledApp) -> &str {
    app.package.as_deref().unwrap_or(&app.id)
}

fn extra(app: &InstalledApp) -> String {
    let mut parts = Vec::new();
    if app.installation == Some(Installation::System) {
        parts.push(t!(L10N, "cli-list-for-everyone"));
    }
    if app.installation.is_some() && app.origin != FLATHUB {
        parts.push(t!(L10N, "cli-list-from", source = app.origin.as_str()));
    }
    if !app.commands.is_empty() {
        parts.push(app.commands.join(" "));
    }
    if !app.services.is_empty() {
        parts.push(t!(L10N, "cli-list-runs", services = app.services.join(" ")));
    }
    if app.source == Source::System && app.version.is_none() {
        parts.push(t!(L10N, "cli-list-being-set-up"));
    }
    parts.join(&t!(L10N, "cli-list-separator"))
}

fn group(origin: Origin, apps: &[&InstalledApp]) {
    let ink = Ink::stdout();
    println!("{}", ink.bold(origin.heading()));
    let mut table = Table::new(&[Look::Bold, Look::Dim, Look::Plain, Look::Dim]);
    for app in apps {
        let id = shown_id(app);
        table.row(vec![
            app.name.clone(),
            if id == app.name {
                String::new()
            } else {
                id.to_owned()
            },
            app.version.clone().unwrap_or_default(),
            extra(app),
        ]);
    }
    table.print(ink);
}

pub fn run(arguments: &Arguments) -> Exit {
    let apps = installed::all(arguments.only);
    if apps.is_empty() {
        match arguments.only {
            Some(Origin::AppImage) => eprintln!("{}", t!(L10N, "cli-list-no-appimages")),
            Some(Origin::System) => eprintln!("{}", t!(L10N, "cli-list-no-system-packages")),
            Some(origin) => eprintln!(
                "{}",
                t!(L10N, "cli-list-nothing-from", source = origin.title())
            ),
            None => eprintln!("{}", t!(L10N, "cli-list-nothing")),
        }
        return Exit::Done;
    }
    if !terminal::stdout_is_terminal() {
        for app in &apps {
            println!(
                "{}\t{}\t{}\t{}",
                Origin::of(app.source).flag(),
                shown_id(app),
                app.name,
                app.version.as_deref().unwrap_or_default()
            );
        }
        return Exit::Done;
    }
    let mut first = true;
    for origin in Origin::ALL {
        let grouped: Vec<&InstalledApp> = apps
            .iter()
            .filter(|app| Origin::of(app.source) == origin)
            .collect();
        if grouped.is_empty() {
            continue;
        }
        if !first {
            println!();
        }
        first = false;
        group(origin, &grouped);
    }
    Exit::Done
}
