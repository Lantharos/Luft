use luft_dbus::runtime::block_on;
use luft_i18n::t;
use luft_software::system::repositories::{self, Described};
use luft_software::system::system_packages::{self, Origin, Repository};
use schelf_core::operations::{Job, Request};

use super::{list_of, needs_yes};
use crate::install::Exit;
use crate::install::arguments::Arguments;
use crate::install::perform::{Plan, Verb, carry_out};
use crate::install::terminal::Line;
use crate::install::terminal::{self, Ink, Look, Table, prompt};
use crate::l10n::L10N;

/// A fingerprint in the groups of four people compare them in.
fn grouped(fingerprint: &str) -> String {
    let groups: Vec<String> = fingerprint
        .as_bytes()
        .chunks(4)
        .map(|chunk| String::from_utf8_lossy(chunk).into_owned())
        .collect();
    let half = groups.len() / 2;
    format!("{}  {}", groups[..half].join(" "), groups[half..].join(" "))
}

/// Shows what trusting a source means before it's added.
fn show_trust(described: &Described) {
    let ink = Ink::stderr();
    for source in &described.sources {
        eprintln!("{}", ink.bold(&source.name));
        eprintln!("  {}", source.url);
    }
    eprintln!("{}", t!(L10N, "cli-repo-signed-with"));
    for key in &described.keys {
        eprintln!("  {}", key.user);
        eprintln!("  {}", ink.dim(grouped(&key.fingerprint)));
    }
    eprintln!("{}", t!(L10N, "cli-repo-warning"));
}

pub fn confirm_trust(described: &Described, yes: bool) -> Result<(), Exit> {
    show_trust(described);
    if yes {
        return Ok(());
    }
    let question = t!(L10N, "cli-repo-confirm", name = described.name());
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

fn add(source: &str, yes: bool) -> Exit {
    let ink = Ink::stdout();
    let line = Line::default();
    line.say(&t!(L10N, "cli-repo-fetching", source = source));
    let fetched = repositories::fetch(source).and_then(|draft| {
        let described = block_on(system_packages::describe(&draft))?;
        Ok((draft, described))
    });
    line.clear();
    let (draft, described) = match fetched {
        Ok(fetched) => fetched,
        Err(error) => {
            eprintln!("{error}");
            return Exit::Failed;
        }
    };
    if repositories::is_added(&draft) {
        println!(
            "{}",
            t!(L10N, "cli-repo-already", name = ink.bold(described.name()))
        );
        return Exit::Done;
    }
    if let Err(exit) = confirm_trust(&described, yes) {
        return exit;
    }
    match block_on(system_packages::add_repository(&draft)) {
        Ok(()) => {
            println!(
                "{}",
                t!(
                    L10N,
                    "cli-repo-added",
                    name = ink.bold(described.name()),
                    command = ink.bold("dnf install NAME")
                )
            );
            Exit::Done
        }
        Err(error) => {
            eprintln!("{error}");
            Exit::Failed
        }
    }
}

fn named<'a>(repositories: &'a [Repository], name: &str) -> Option<&'a Repository> {
    let wanted = name.to_lowercase();
    repositories.iter().find(|repository| {
        repository.file == wanted
            || repository.sources.iter().any(|source| {
                source.id.to_lowercase() == wanted || source.name.to_lowercase() == wanted
            })
    })
}

fn remove(name: &str, yes: bool) -> Exit {
    let ink = Ink::stderr();
    let packages = match block_on(system_packages::list()) {
        Ok(packages) => packages,
        Err(error) => {
            eprintln!("{error}");
            return Exit::Failed;
        }
    };
    let Some(repository) = named(&packages.repositories, name) else {
        eprintln!(
            "{}",
            t!(L10N, "cli-repo-nothing-called", name = ink.bold(name))
        );
        return Exit::Missing;
    };
    let origin = Origin::Repository(repository.file.clone());
    let leaving: Vec<String> = packages
        .requested()
        .filter(|package| package.origin == origin)
        .map(|package| package.name.clone())
        .collect();
    if !leaving.is_empty() {
        let question = t!(
            L10N,
            "cli-repo-remove-confirm",
            name = repository.name(),
            packages = list_of(&leaving)
        );
        if let Err(exit) = super::confirm(&question, yes) {
            return exit;
        }
    }
    let plan = Plan {
        request: Request {
            key: format!("repository/{}", repository.file),
            title: repository.name().to_owned(),
            job: Job::RemoveRepository {
                file: repository.file.clone(),
            },
            members: Vec::new(),
        },
        verb: Verb::Remove,
        from: None,
    };
    carry_out(&[plan], &[], |_| Vec::new())
}

fn list() -> Exit {
    let packages = match block_on(system_packages::list()) {
        Ok(packages) => packages,
        Err(error) => {
            eprintln!("{error}");
            return Exit::Failed;
        }
    };
    if packages.repositories.is_empty() {
        eprintln!(
            "{}",
            t!(
                L10N,
                "cli-repo-none",
                command = Ink::stderr().bold("schelf repo add")
            )
        );
        return Exit::Done;
    }
    if !terminal::stdout_is_terminal() {
        for repository in &packages.repositories {
            for source in &repository.sources {
                println!("{}\t{}\t{}", repository.file, source.name, source.url);
            }
        }
        return Exit::Done;
    }
    let mut table = Table::new(&[Look::Bold, Look::Dim, Look::Plain]);
    for repository in &packages.repositories {
        for source in &repository.sources {
            table.row(vec![
                source.name.clone(),
                repository.file.clone(),
                source.url.clone(),
            ]);
        }
    }
    table.print(Ink::stdout());
    Exit::Done
}

pub fn run(arguments: &Arguments) -> Exit {
    let (verb, rest) = arguments.words.split_first().expect("repo needs a word");
    match (verb.as_str(), rest) {
        ("add", [source]) => add(source, arguments.yes),
        ("remove" | "rm", [name]) => remove(name, arguments.yes),
        ("list" | "ls", []) => list(),
        _ => {
            eprintln!(
                "{}",
                t!(
                    L10N,
                    "cli-usage",
                    usage = "schelf repo add SOURCE | remove NAME | list"
                )
            );
            Exit::Usage
        }
    }
}
