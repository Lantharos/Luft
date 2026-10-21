use luft_software::apps::appimage;
use luft_software::apps::toolbox::Repositories;

use crate::cli::Exit;
use crate::cli::arguments::Arguments;
use crate::cli::sources::{Candidate, Catalog, Kind, Origin, catalogs, fedora, flathub, installed};
use crate::cli::terminal::progress::Line;
use crate::cli::terminal::{Ink, Look, Table, bytes, wrap};
use crate::library::{InstalledApp, Source};

const INDENT: &str = "  ";

struct Facts(Vec<(&'static str, String)>);

impl Facts {
    fn add(&mut self, label: &'static str, value: Option<String>) {
        if let Some(value) = value.filter(|value| !value.is_empty()) {
            self.0.push((label, value));
        }
    }
}

fn show(name: &str, summary: &str, facts: Facts, description: &str) {
    let ink = Ink::stdout();
    println!("{}", ink.bold(name));
    if !summary.is_empty() {
        println!("{summary}");
    }
    println!();
    let mut table = Table::new(&[Look::Dim, Look::Plain]);
    for (label, value) in facts.0 {
        table.row(vec![label.to_owned(), value]);
    }
    table.print(ink);
    if !description.trim().is_empty() {
        println!("\n{}", wrap(description.trim(), INDENT));
    }
}

fn text_of(html: &str) -> String {
    let mut text = String::new();
    let mut tag = String::new();
    let mut inside = false;
    for character in html.chars() {
        match character {
            '<' => {
                inside = true;
                tag.clear();
            }
            '>' if inside => {
                inside = false;
                match tag.trim_start_matches('/').split_whitespace().next() {
                    Some("p" | "ul" | "ol") if tag.starts_with('/') => text.push_str("\n\n"),
                    Some("li") if !tag.starts_with('/') => text.push_str("\n- "),
                    _ => {}
                }
            }
            _ if inside => tag.push(character),
            _ => text.push(character),
        }
    }
    text.replace("&amp;", "&")
        .replace("&lt;", "<")
        .replace("&gt;", ">")
        .replace("&quot;", "\"")
        .replace("&#39;", "'")
}

fn installed_version<'a>(
    apps: &'a [InstalledApp],
    origin: Origin,
    id: &str,
) -> Option<&'a InstalledApp> {
    apps.iter().find(|app| {
        Origin::of(app.source) == origin && (app.id == id || app.package.as_deref() == Some(id))
    })
}

fn flathub_app(candidate: &Candidate, apps: &[InstalledApp]) -> Result<(), String> {
    let details = flathub::details(&candidate.id)?;
    let sizes = flathub::sizes(&candidate.id);
    let installed = installed_version(apps, Origin::Flathub, &details.id);
    let mut facts = Facts(Vec::new());
    facts.add(
        "Source",
        Some(format!("Flathub, {}", details.kind().describe())),
    );
    facts.add("ID", Some(details.id.clone()));
    facts.add("Version", details.version().map(str::to_owned));
    facts.add(
        "Installed",
        Some(installed.map_or_else(
            || "no".to_owned(),
            |app| app.version.clone().unwrap_or_else(|| "yes".to_owned()),
        )),
    );
    if let Some(sizes) = sizes {
        facts.add("Download", Some(bytes(sizes.download_size)));
        facts.add("Size", Some(bytes(sizes.installed_size)));
    }
    facts.add("License", details.project_license.clone());
    facts.add("Developer", details.developer_name.clone());
    facts.add("Website", details.homepage().map(str::to_owned));
    show(
        &details.name,
        &details.summary,
        facts,
        &text_of(&details.description),
    );
    Ok(())
}

fn fedora_package(candidate: &Candidate, apps: &[InstalledApp]) -> Result<(), String> {
    let details = fedora::details(Repositories::Fedora, &candidate.id)?
        .ok_or("Fedora doesn't have it any more.")?;
    let installed = installed_version(apps, Origin::Fedora, &details.package);
    let kind = if fedora::graphical(&details.package) {
        Kind::Desktop
    } else {
        Kind::Command
    };
    let place = if fedora::in_toolbox() {
        ", in your Toolbox"
    } else {
        ""
    };
    let mut facts = Facts(Vec::new());
    facts.add(
        "Source",
        Some(format!("Fedora, {}{place}", kind.describe())),
    );
    facts.add("Version", Some(details.version.clone()));
    facts.add(
        "Installed",
        Some(installed.map_or_else(
            || "no".to_owned(),
            |app| app.version.clone().unwrap_or_else(|| "yes".to_owned()),
        )),
    );
    facts.add("Commands", installed.map(|app| app.commands.join(" ")));
    facts.add("Download", Some(bytes(details.download)));
    facts.add("Size", Some(bytes(details.size)));
    facts.add("License", Some(details.license.clone()));
    facts.add("Website", details.homepage.clone());
    show(
        &details.package,
        &details.summary,
        facts,
        &details.description,
    );
    Ok(())
}

fn system_package(candidate: &Candidate, apps: &[InstalledApp]) -> Result<(), String> {
    let details = fedora::details(Repositories::Added, &candidate.id)?
        .ok_or("Your software sources don't have it any more.")?;
    let installed = installed_version(apps, Origin::System, &details.package);
    let mut facts = Facts(Vec::new());
    facts.add(
        "Source",
        Some(format!(
            "System package, from {}",
            candidate.catalog.title()
        )),
    );
    facts.add("Version", Some(details.version.clone()));
    facts.add(
        "Installed",
        Some(installed.map_or_else(
            || "no".to_owned(),
            |app| app.version.clone().unwrap_or_else(|| "yes".to_owned()),
        )),
    );
    facts.add("Download", Some(bytes(details.download)));
    facts.add("Size", Some(bytes(details.size)));
    facts.add("License", Some(details.license.clone()));
    facts.add("Website", details.homepage.clone());
    show(
        &details.package,
        &details.summary,
        facts,
        &details.description,
    );
    Ok(())
}

fn installed_app(app: &InstalledApp) {
    let mut facts = Facts(Vec::new());
    facts.add("Source", Some(Origin::of(app.source).title().to_owned()));
    facts.add("ID", Some(app.id.clone()));
    facts.add("Version", app.version.clone());
    facts.add("Installed", Some("yes".to_owned()));
    facts.add("Size", Some(bytes(app.size)));
    facts.add("File", app.path.clone());
    if app.source == Source::AppImage
        && let Ok(found) = appimage::find(&app.id)
    {
        facts.add(
            "Updates",
            Some(
                if found.updatable {
                    "automatic"
                } else {
                    "none offered"
                }
                .to_owned(),
            ),
        );
    }
    show(
        &app.name,
        app.summary.as_deref().unwrap_or_default(),
        facts,
        "",
    );
}

fn catalog_entry(candidate: &Candidate, apps: &[InstalledApp]) -> Result<(), String> {
    match candidate.catalog {
        Catalog::Flathub => flathub_app(candidate, apps),
        Catalog::Fedora => fedora_package(candidate, apps),
        Catalog::System => system_package(candidate, apps),
    }
}

pub fn run(arguments: &Arguments) -> Exit {
    let only = arguments.only;
    let looked_in: Vec<Catalog> = match only {
        Some(origin) => origin.catalog().into_iter().collect(),
        None => catalogs(None),
    };
    let mut exit = Exit::Done;
    for (index, name) in arguments.words.iter().enumerate() {
        if index > 0 {
            println!();
        }
        let line = Line::default();
        line.say(&format!("Looking for {name}…"));
        let apps = installed::all(only);
        let mut found: Vec<Candidate> = Vec::new();
        for catalog in &looked_in {
            match catalog.find(name) {
                Ok(candidates) => found.extend(candidates),
                Err(error) => {
                    line.clear();
                    eprintln!("Couldn't look in {}. {error}", catalog.title());
                    exit = exit.max(Exit::Failed);
                }
            }
        }
        let extra: Vec<InstalledApp> = installed::matching(apps.clone(), name)
            .into_iter()
            .filter(|app| {
                !found.iter().any(|candidate| {
                    candidate.catalog.origin() == Origin::of(app.source)
                        && (candidate.id == app.id || app.package.as_ref() == Some(&candidate.id))
                })
            })
            .collect();
        line.clear();
        if found.is_empty() && extra.is_empty() {
            eprintln!("There's nothing called {}.", Ink::stderr().bold(name));
            exit = exit.max(Exit::Missing);
            continue;
        }
        let mut first = true;
        for candidate in &found {
            if !first {
                println!();
            }
            first = false;
            if let Err(error) = catalog_entry(candidate, &apps) {
                eprintln!("Couldn't get the details of {}. {error}", candidate.name);
                exit = exit.max(Exit::Failed);
            }
        }
        for app in &extra {
            if !first {
                println!();
            }
            first = false;
            installed_app(app);
        }
    }
    exit
}
