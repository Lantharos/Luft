use luft_dbus::runtime::block_on;
use luft_i18n::t;
use luft_software::apps::flatpak;
use schelf_core::library::{InstalledApp, full_access};

use super::{needs_yes, pick};
use crate::install::Exit;
use crate::install::arguments::Arguments;
use crate::install::sources::{Origin, installed};
use crate::install::terminal::{Ink, prompt};
use crate::l10n::L10N;

fn sandboxed(app: &InstalledApp) -> bool {
    full_access::offered(app.source)
}

pub(super) fn sandboxed_named(
    name: &str,
    everything: &[InstalledApp],
    yes: bool,
) -> Result<InstalledApp, Exit> {
    let ink = Ink::stderr();
    let found = installed::matching(everything.to_vec(), name);
    let (mut apps, others): (Vec<InstalledApp>, Vec<InstalledApp>) =
        found.into_iter().partition(sandboxed);
    match (apps.len(), others.first()) {
        (0, None) => {
            eprintln!("{}", t!(L10N, "cli-not-installed", name = ink.bold(name)));
            Err(Exit::Missing)
        }
        (0, Some(app)) => {
            eprintln!(
                "{}",
                t!(L10N, "cli-trust-not-sandboxed", name = ink.bold(&app.name))
            );
            Err(Exit::Usage)
        }
        (1, _) => Ok(apps.remove(0)),
        _ => {
            let options: Vec<String> = apps.iter().map(installed::describe).collect();
            let chosen = pick(name, &options, yes, &t!(L10N, "cli-trust-name-by-id"))?;
            Ok(apps.swap_remove(chosen))
        }
    }
}

fn warn(app: &InstalledApp, yes: bool) -> Result<(), Exit> {
    if yes {
        return Ok(());
    }
    let ink = Ink::stderr();
    eprintln!(
        "{}",
        t!(L10N, "cli-trust-abilities", name = ink.bold(&app.name))
    );
    for ability in [
        t!(L10N, "cli-trust-ability-files"),
        t!(L10N, "cli-trust-ability-devices"),
        t!(L10N, "cli-trust-ability-clipboard"),
        t!(L10N, "cli-trust-ability-keyring"),
        t!(L10N, "cli-trust-ability-programs"),
    ] {
        eprintln!("  {ability}");
    }
    eprintln!("{}", t!(L10N, "cli-trust-warning"));
    eprintln!(
        "{}",
        t!(
            L10N,
            "cli-trust-give-instead",
            command = format!("schelf give {} PLACE", app.id)
        )
    );
    let question = t!(L10N, "cli-trust-confirm", name = app.name.as_str());
    if !prompt::interactive() {
        eprintln!("{}", needs_yes(&question));
        return Err(Exit::Usage);
    }
    if prompt::agree(&question) {
        Ok(())
    } else {
        Err(Exit::Declined)
    }
}

fn change(app: &InstalledApp, on: bool, yes: bool) -> Exit {
    let ink = Ink::stdout();
    if block_on(flatpak::has_full_access(&app.id)) == on {
        let name = ink.bold(&app.name);
        let state = if on {
            t!(L10N, "cli-trust-already", name = name)
        } else {
            t!(L10N, "cli-trust-not-trusted", name = name)
        };
        println!("{state}");
        return Exit::Done;
    }
    if on && let Err(exit) = warn(app, yes) {
        return exit;
    }
    let change = full_access::Change {
        id: app.id.clone(),
        source: app.source,
        on,
    };
    match block_on(full_access::change(change)) {
        Ok(_) if on => {
            println!(
                "{}",
                t!(L10N, "cli-trust-given", name = ink.bold(&app.name))
            );
            Exit::Done
        }
        Ok(_) => {
            println!(
                "{}",
                t!(L10N, "cli-trust-taken", name = ink.bold(&app.name))
            );
            Exit::Done
        }
        Err(error) => {
            eprintln!("{error}");
            Exit::Failed
        }
    }
}

pub fn run(arguments: &Arguments, on: bool) -> Exit {
    if arguments
        .only
        .is_some_and(|origin| origin != Origin::Flathub && origin != Origin::AppImage)
    {
        eprintln!("{}", t!(L10N, "cli-trust-only-sandboxed"));
        return Exit::Usage;
    }
    let everything = installed::all(None);
    let mut worst = Exit::Done;
    for name in &arguments.words {
        let exit = match sandboxed_named(name, &everything, arguments.yes) {
            Ok(app) => change(&app, on, arguments.yes),
            Err(exit) => exit,
        };
        worst = worst.max(exit);
    }
    worst
}
