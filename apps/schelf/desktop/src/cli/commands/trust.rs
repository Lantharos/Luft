use luft_app::block_on;
use luft_software::apps::flatpak;

use super::pick;
use crate::cli::Exit;
use crate::cli::arguments::Arguments;
use crate::cli::sources::{Origin, installed};
use crate::cli::terminal::{Ink, prompt};
use crate::library::full_access;
use crate::library::{InstalledApp, Source};

const ABILITIES: [&str; 4] = [
    "see and change all your files",
    "read the clipboard in the background",
    "control other apps' windows",
    "act like an app installed on the system",
];

fn flatpak_named(name: &str, everything: &[InstalledApp], yes: bool) -> Result<InstalledApp, Exit> {
    let ink = Ink::stderr();
    let found = installed::matching(everything.to_vec(), name);
    let (mut flatpaks, others): (Vec<InstalledApp>, Vec<InstalledApp>) = found
        .into_iter()
        .partition(|app| app.source == Source::Flatpak);
    match (flatpaks.len(), others.first()) {
        (0, None) => {
            eprintln!("{} isn't installed.", ink.bold(name));
            Err(Exit::Missing)
        }
        (0, Some(app)) => {
            let how = if app.source == Source::AppImage {
                "is an AppImage, which already runs outside a sandbox"
            } else {
                "isn't in a sandbox, so it has full access already"
            };
            eprintln!("{} {how}.", ink.bold(&app.name));
            Err(Exit::Usage)
        }
        (1, _) => Ok(flatpaks.remove(0)),
        _ => {
            let options: Vec<String> = flatpaks.iter().map(installed::describe).collect();
            let chosen = pick(name, &options, yes, "Name it by its app ID instead.")?;
            Ok(flatpaks.swap_remove(chosen))
        }
    }
}

fn warn(app: &InstalledApp, yes: bool) -> Result<(), Exit> {
    if yes {
        return Ok(());
    }
    let ink = Ink::stderr();
    eprintln!("With full access, {} can:", ink.bold(&app.name));
    for ability in ABILITIES {
        eprintln!("  {ability}");
    }
    eprintln!(
        "Only give full access to apps you trust. It takes effect the next time the app opens."
    );
    let question = format!("Give {} full access?", app.name);
    if !prompt::interactive() {
        eprintln!("{question} Add --yes to go ahead without being asked.");
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
    if flatpak::has_full_access(&app.id) == on {
        let state = if on {
            "has full access already"
        } else {
            "doesn't have full access"
        };
        println!("{} {state}.", ink.bold(&app.name));
        return Exit::Done;
    }
    if on && let Err(exit) = warn(app, yes) {
        return exit;
    }
    match block_on(full_access::set(app.id.clone(), on)) {
        Ok(()) if on => {
            println!(
                "{} has full access from the next time it opens.",
                ink.bold(&app.name)
            );
            Exit::Done
        }
        Ok(()) => {
            println!(
                "{} is back in its sandbox from the next time it opens.",
                ink.bold(&app.name)
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
    if !full_access::offered() {
        eprintln!("Full access is for Flatpak apps on Luft.");
        return Exit::Usage;
    }
    if arguments
        .only
        .is_some_and(|origin| origin != Origin::Flathub)
    {
        eprintln!("Only Flatpak apps run in a sandbox.");
        return Exit::Usage;
    }
    let everything = installed::all(None);
    let mut worst = Exit::Done;
    for name in &arguments.words {
        let exit = match flatpak_named(name, &everything, arguments.yes) {
            Ok(app) => change(&app, on, arguments.yes),
            Err(exit) => exit,
        };
        worst = worst.max(exit);
    }
    worst
}
