use luft_app::block_on;
use luft_software::system::repositories::{self, Described};
use luft_software::system::system_packages::{self, Origin, Repository};

use super::list_of;
use crate::cli::Exit;
use crate::cli::arguments::Arguments;
use crate::cli::perform::{Plan, Verb, carry_out};
use crate::cli::terminal::progress::Line;
use crate::cli::terminal::{self, Ink, Look, Table, prompt};
use crate::operations::{Job, Request};

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
    eprintln!("Its packages are signed with:");
    for key in &described.keys {
        eprintln!("  {}", key.user);
        eprintln!("  {}", ink.dim(grouped(&key.fingerprint)));
    }
    eprintln!(
        "Packages from it become part of the system, with full access to the computer, and update with Luft. Only add sources you trust."
    );
}

pub fn confirm_trust(described: &Described, yes: bool) -> Result<(), Exit> {
    show_trust(described);
    if yes {
        return Ok(());
    }
    let question = format!("Add {}?", described.name());
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

fn add(source: &str, yes: bool) -> Exit {
    let ink = Ink::stdout();
    let line = Line::default();
    line.say(&format!("Fetching {source}…"));
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
            "{} is already a software source.",
            ink.bold(described.name())
        );
        return Exit::Done;
    }
    if let Err(exit) = confirm_trust(&described, yes) {
        return exit;
    }
    match block_on(system_packages::add_repository(&draft)) {
        Ok(()) => {
            println!(
                "Added {}. Install its packages with {}.",
                ink.bold(described.name()),
                ink.bold("schelf install --system NAME")
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
        eprintln!("There's no software source called {}.", ink.bold(name));
        return Exit::Missing;
    };
    let origin = Origin::Repository(repository.file.clone());
    let leaving: Vec<String> = packages
        .requested()
        .filter(|package| package.origin == origin)
        .map(|package| package.name.clone())
        .collect();
    if !leaving.is_empty() {
        let question = format!(
            "Removing {} also removes {} from the system. Go ahead?",
            repository.name(),
            list_of(&leaving)
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
    carry_out(&[plan], |_| {})
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
            "No software sources were added. Add one with {}.",
            Ink::stderr().bold("schelf repo add")
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
            eprintln!("Usage: schelf repo add SOURCE | remove NAME | list");
            Exit::Usage
        }
    }
}
