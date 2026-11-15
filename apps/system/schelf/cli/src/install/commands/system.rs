use luft_i18n::t;
use luft_software::apps::toolbox::Repositories;
use luft_software::system::repositories;
use schelf_core::catalog::tools;
use schelf_core::operations::{Job, Request};

use crate::install::Exit;
use crate::install::arguments::Arguments;
use crate::install::perform::{Plan, Verb, carry_out};
use crate::install::sources::{Origin, fedora, installed};
use crate::install::terminal::Ink;
use crate::l10n::L10N;

const KEY: &str = "system";

pub(super) fn plan(packages: Vec<String>, verb: Verb) -> Plan {
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
        from: (verb == Verb::Install).then(|| {
            if repositories::added_ids().is_empty() {
                t!(L10N, "cli-system-from-fedora")
            } else {
                t!(L10N, "cli-system-from-fedora-and-sources")
            }
        }),
    }
}

/// The package `name` is, or the one that brings the command `name`.
fn package_of(name: &str) -> Result<String, String> {
    for repositories in [Repositories::Fedora, Repositories::Added] {
        if tools::find_in(repositories, name)?.is_some() {
            return Ok(name.to_owned());
        }
    }
    for repositories in [Repositories::Fedora, Repositories::Added] {
        if let Some(package) = fedora::providing(repositories, name)? {
            println!(
                "{}",
                t!(
                    L10N,
                    "cli-system-comes-from",
                    command = Ink::stdout().bold(name),
                    package = Ink::stdout().bold(&package)
                )
            );
            return Ok(package);
        }
    }
    Ok(name.to_owned())
}

/// Fedora packages go into the system itself, so services and udev rules they bring work like
/// on any Fedora install. They're rebuilt with every update of Luft.
pub fn install(arguments: &Arguments) -> Exit {
    let ink = Ink::stdout();
    let present: Vec<String> = installed::all(Some(Origin::System))
        .into_iter()
        .map(|app| app.id)
        .collect();
    let packages = match arguments
        .words
        .iter()
        .map(|name| package_of(name))
        .collect::<Result<Vec<String>, String>>()
    {
        Ok(packages) => packages,
        Err(error) => {
            eprintln!("{error}");
            return Exit::Failed;
        }
    };
    let (already, wanted): (Vec<String>, Vec<String>) = packages
        .into_iter()
        .partition(|name| present.contains(name));
    for name in &already {
        println!("{}", t!(L10N, "cli-system-already", name = ink.bold(name)));
    }
    if wanted.is_empty() {
        return Exit::Done;
    }
    let note = t!(L10N, "cli-system-installed-note", count = wanted.len());
    carry_out(&[plan(wanted, Verb::Install)], &[], |_| vec![note.clone()])
}

/// Removes several system packages in one go, since each change rebuilds them all.
pub fn removal(packages: Vec<String>) -> Plan {
    plan(packages, Verb::Remove)
}

pub fn explain_updates() -> Exit {
    eprintln!("{}", t!(L10N, "cli-system-updates"));
    Exit::Usage
}
