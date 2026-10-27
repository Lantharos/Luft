use luft_app::block_on;
use luft_software::apps::flatpak;

use super::pick;
use crate::cli::Exit;
use crate::cli::arguments::Arguments;
use crate::cli::sources::{Origin, installed};
use crate::cli::terminal::{Ink, prompt};
use crate::library::{InstalledApp, full_access};

const ABILITIES: [&str; 5] = [
    "read, change and delete all your files",
    "use every device, such as USB drives, cameras and game controllers",
    "read what you copy, even while it's in the background",
    "read the passwords and keys saved in your keyring, other apps' too",
    "start any program as you, outside a sandbox",
];

fn sandboxed(app: &InstalledApp) -> bool {
    full_access::offered(app.source)
}

fn sandboxed_named(
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
            eprintln!("{} isn't installed.", ink.bold(name));
            Err(Exit::Missing)
        }
        (0, Some(app)) => {
            eprintln!(
                "{} isn't in a sandbox, so it has full access already.",
                ink.bold(&app.name)
            );
            Err(Exit::Usage)
        }
        (1, _) => Ok(apps.remove(0)),
        _ => {
            let options: Vec<String> = apps.iter().map(installed::describe).collect();
            let chosen = pick(name, &options, yes, "Name it by its app ID instead.")?;
            Ok(apps.swap_remove(chosen))
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
    if block_on(flatpak::has_full_access(&app.id)) == on {
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
    let change = full_access::Change {
        id: app.id.clone(),
        source: app.source,
        on,
    };
    match block_on(full_access::set(change)) {
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
    if arguments
        .only
        .is_some_and(|origin| origin != Origin::Flathub && origin != Origin::AppImage)
    {
        eprintln!("Only Flatpak apps and AppImages run in a sandbox.");
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
