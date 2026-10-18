use luft_software::system::System;

use crate::cli::Exit;
use crate::cli::arguments::{Arguments, Command};
use crate::cli::perform::{Plan, Verb, carry_out};
use crate::cli::sources::{Origin, installed};
use crate::cli::terminal::Ink;
use crate::operations::{Job, Request};

const KEY: &str = "system";

fn plan(packages: Vec<String>, verb: Verb) -> Plan {
    let title = super::list_of(&packages);
    let job = match verb {
        Verb::Remove => Job::RemoveSystemPackages { packages },
        _ => Job::InstallSystemPackages { packages },
    };
    Plan {
        request: Request {
            key: KEY.to_owned(),
            title,
            job,
            members: Vec::new(),
        },
        verb,
        from: (verb == Verb::Install).then(|| "Fedora into the system".to_owned()),
    }
}

/// Fedora packages go into the system itself, so services and udev rules they bring work like
/// on any Fedora install. They're rebuilt with every update of Luft.
pub fn install(arguments: &Arguments) -> Exit {
    if System::current() != System::Image {
        eprintln!("System packages are for Luft. On Fedora, install packages with --fedora.");
        return Exit::Usage;
    }
    let ink = Ink::stdout();
    let present: Vec<String> = installed::all(Some(Origin::System))
        .into_iter()
        .map(|app| app.id)
        .collect();
    let (already, wanted): (Vec<String>, Vec<String>) = arguments
        .words
        .iter()
        .cloned()
        .partition(|name| present.contains(name));
    for name in &already {
        println!("{} is already a system package.", ink.bold(name));
    }
    if wanted.is_empty() {
        return Exit::Done;
    }
    let note = if wanted.len() == 1 {
        "  It's rebuilt with every update of Luft, and its services start with the computer."
    } else {
        "  They're rebuilt with every update of Luft, and their services start with the computer."
    };
    carry_out(&[plan(wanted, Verb::Install)], |_| {
        println!("{note}");
    })
}

/// Removes several system packages in one go, since each change rebuilds them all.
pub fn removal(packages: Vec<String>) -> Plan {
    plan(packages, Verb::Remove)
}

pub fn explain(command: Command) -> Exit {
    match command {
        Command::Update => eprintln!(
            "System packages update with Luft, in Settings, under Updates. Every update brings their newest versions."
        ),
        _ => eprintln!(
            "--system works with install, remove and list. System packages come from Fedora, so look for them with --fedora."
        ),
    }
    Exit::Usage
}
