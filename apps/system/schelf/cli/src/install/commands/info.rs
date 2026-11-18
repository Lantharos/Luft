use luft_i18n::t;
use luft_software::apps::appimage;
use luft_software::system::catalog::Repositories;
use schelf_core::library::{InstalledApp, Source};
use schelf_core::store::listing::{self, Builder, Format, StoreDetails, channel};
use schelf_core::store::record;
use schelf_core::store::signed::Age;
use schelf_core::tools;

use crate::install::Exit;
use crate::install::arguments::Arguments;
use crate::install::sources::{
    Candidate, Catalog, Kind, Origin, catalogs, fedora, flathub, installed, store,
};
use crate::install::terminal::Line;
use crate::install::terminal::{Ink, Look, Table, bytes, wrap};
use crate::l10n::L10N;

const INDENT: &str = "  ";

struct Facts(Vec<(String, String)>);

impl Facts {
    fn add(&mut self, label: String, value: Option<String>) {
        if let Some(value) = value.filter(|value| !value.is_empty()) {
            self.0.push((label, value));
        }
    }

    fn installed(&mut self, installed: Option<&InstalledApp>) {
        self.add(
            t!(L10N, "cli-info-installed"),
            Some(installed.map_or_else(
                || t!(L10N, "cli-info-no"),
                |app| {
                    app.version
                        .clone()
                        .unwrap_or_else(|| t!(L10N, "cli-info-yes"))
                },
            )),
        );
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
        table.row(vec![label, value]);
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
        t!(L10N, "cli-info-source"),
        Some(t!(
            L10N,
            "cli-info-source-flathub",
            kind = details.kind().key()
        )),
    );
    facts.add(t!(L10N, "cli-info-id"), Some(details.id.clone()));
    facts.add(
        t!(L10N, "cli-info-version"),
        details.version().map(str::to_owned),
    );
    facts.installed(installed);
    if let Some(sizes) = sizes {
        facts.add(
            t!(L10N, "cli-info-download"),
            Some(bytes(sizes.download_size)),
        );
        facts.add(t!(L10N, "cli-info-size"), Some(bytes(sizes.installed_size)));
    }
    facts.add(
        t!(L10N, "cli-info-license"),
        details.project_license.clone(),
    );
    facts.add(
        t!(L10N, "cli-info-developer"),
        details.developer_name.clone(),
    );
    facts.add(
        t!(L10N, "cli-info-website"),
        details.homepage().map(str::to_owned),
    );
    show(
        &details.name,
        &details.summary,
        facts,
        &text_of(&details.description),
    );
    Ok(())
}

fn system_package(
    candidate: &Candidate,
    apps: &[InstalledApp],
    repositories: Repositories,
    source: String,
) -> Result<(), String> {
    let details = schelf_core::catalog::fedora::details(repositories, &candidate.id)?
        .ok_or_else(|| t!(L10N, "cli-info-gone"))?;
    let installed = installed_version(apps, Origin::System, &details.package);
    let mut facts = Facts(Vec::new());
    facts.add(t!(L10N, "cli-info-source"), Some(source));
    facts.add(t!(L10N, "cli-info-version"), Some(details.version.clone()));
    facts.installed(installed);
    facts.add(
        t!(L10N, "cli-info-commands"),
        installed
            .filter(|app| !app.commands.is_empty())
            .map(|app| app.commands.join(" ")),
    );
    facts.add(t!(L10N, "cli-info-download"), Some(bytes(details.download)));
    facts.add(t!(L10N, "cli-info-size"), Some(bytes(details.size)));
    facts.add(t!(L10N, "cli-info-license"), Some(details.license.clone()));
    facts.add(t!(L10N, "cli-info-website"), details.homepage.clone());
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
    facts.add(
        t!(L10N, "cli-info-source"),
        Some(Origin::of(app.source).title()),
    );
    facts.add(t!(L10N, "cli-info-id"), Some(app.id.clone()));
    facts.add(t!(L10N, "cli-info-version"), app.version.clone());
    facts.add(
        t!(L10N, "cli-info-installed"),
        Some(t!(L10N, "cli-info-yes")),
    );
    facts.add(t!(L10N, "cli-info-size"), Some(bytes(app.size)));
    facts.add(t!(L10N, "cli-info-file"), app.path.clone());
    if app.source == Source::AppImage
        && let Ok(found) = appimage::find(&app.id)
    {
        facts.add(
            t!(L10N, "cli-info-updates"),
            Some(if found.updatable {
                t!(L10N, "cli-info-updates-automatic")
            } else {
                t!(L10N, "cli-info-updates-none")
            }),
        );
    }
    show(
        &app.name,
        app.summary.as_deref().unwrap_or_default(),
        facts,
        "",
    );
}

fn store_app(candidate: &Candidate, apps: &[InstalledApp]) -> Result<(), String> {
    let listing = listing::fetch(&candidate.id, Age::Current)?;
    let installed = apps
        .iter()
        .find(|app| app.listing.as_deref() == Some(listing.id.as_str()));
    let record = record::get(&listing.id);
    let details = StoreDetails::new(listing, record.as_ref());
    let mut facts = Facts(Vec::new());
    facts.add(
        t!(L10N, "cli-info-source"),
        Some(t!(
            L10N,
            "cli-info-source-store",
            kind = candidate.kind.key()
        )),
    );
    facts.add(t!(L10N, "cli-info-id"), Some(details.id.clone()));
    facts.add(t!(L10N, "cli-info-version"), details.version.clone());
    facts.add(
        t!(L10N, "cli-info-channel"),
        (details.channel != channel::STABLE).then(|| details.channel.clone()),
    );
    facts.installed(installed);
    facts.add(t!(L10N, "cli-info-download"), details.size.map(bytes));
    facts.add(
        t!(L10N, "cli-info-file"),
        details
            .download
            .as_ref()
            .map(|download| download.url.clone()),
    );
    facts.add(t!(L10N, "cli-info-license"), details.license.clone());
    facts.add(
        t!(L10N, "cli-info-developer"),
        Some(details.developer.clone()),
    );
    facts.add(t!(L10N, "cli-info-website"), details.homepage.clone());
    facts.add(t!(L10N, "cli-info-built"), built(&details));
    facts.add(t!(L10N, "cli-info-runs"), runs(&details));
    let access = match (&details.extension, &details.declared) {
        (Some(extension), _) => store::extension_access(extension),
        (None, Some(declared)) if details.access.is_some() => store::access(declared),
        _ => vec![t!(L10N, "cli-info-access-everything")],
    };
    for (index, line) in access.into_iter().enumerate() {
        let label = if index == 0 {
            t!(L10N, "cli-info-can-use")
        } else {
            String::new()
        };
        facts.add(label, Some(line));
    }
    show(
        &details.name,
        &details.summary,
        facts,
        &text_of(&details.description),
    );
    Ok(())
}

fn runs(details: &StoreDetails) -> Option<String> {
    if !details.needs_review.is_empty() {
        return Some(t!(
            L10N,
            "cli-info-runs-after-review",
            needs = listing::sandbox_lacks(&details.needs_review)
        ));
    }
    details
        .installer
        .filter(|format| *format == Format::LuftExtension)?;
    Some(if details.in_shell {
        t!(L10N, "cli-info-runs-inside-luft")
    } else {
        t!(L10N, "cli-info-runs-sandboxed")
    })
}

fn built(details: &StoreDetails) -> Option<String> {
    let provenance = details.provenance.as_ref()?;
    Some(
        match (
            provenance.origin,
            &provenance.repository,
            &provenance.commit,
        ) {
            (Builder::GithubActions, Some(repository), Some(commit)) => t!(
                L10N,
                "cli-info-built-from",
                repository = repository.as_str(),
                commit = commit.chars().take(7).collect::<String>()
            ),
            (Builder::GithubActions, _, _) => t!(L10N, "cli-info-built-on-actions"),
            (Builder::Developer, _, _) => t!(L10N, "cli-info-built-by-developer"),
        },
    )
}

fn store_tool(candidate: &Candidate, apps: &[InstalledApp]) -> Result<(), String> {
    let tool = tools::find(&candidate.id, tools::STABLE)?
        .ok_or_else(|| t!(L10N, "cli-info-gone-from-store"))?;
    let index = &tool.index;
    let offer = tool.offer();
    let installed = installed_version(apps, Origin::Store, &index.address);
    let mut facts = Facts(Vec::new());
    facts.add(
        t!(L10N, "cli-info-source"),
        Some(t!(
            L10N,
            "cli-info-source-store",
            kind = Kind::Command.key()
        )),
    );
    facts.add(t!(L10N, "cli-info-address"), Some(index.address.clone()));
    facts.add(
        t!(L10N, "cli-info-version"),
        offer.map(|(release, _)| release.version.clone()),
    );
    facts.installed(installed);
    facts.add(
        t!(L10N, "cli-info-download"),
        offer.map(|(_, file)| bytes(file.size)),
    );
    let publisher = index.publisher.name.as_str();
    let verified = if index.publisher.verified {
        t!(L10N, "cli-info-publisher-verified", publisher = publisher)
    } else {
        t!(L10N, "cli-info-publisher-unverified", publisher = publisher)
    };
    facts.add(t!(L10N, "cli-info-publisher"), Some(verified));
    facts.add(t!(L10N, "cli-info-source-code"), index.repository.clone());
    facts.add(
        t!(L10N, "cli-info-runs-with"),
        Some(t!(L10N, "cli-info-runs-with-everything")),
    );
    show(&index.name, "", facts, "");
    Ok(())
}

fn catalog_entry(candidate: &Candidate, apps: &[InstalledApp]) -> Result<(), String> {
    match (candidate.catalog, candidate.kind) {
        (Catalog::Store, _) => store_app(candidate, apps),
        (Catalog::Tools, _) => store_tool(candidate, apps),
        (Catalog::Flathub, _) => flathub_app(candidate, apps),
        (Catalog::Fedora, kind) => {
            let kind = if kind == Kind::Desktop || fedora::graphical(&candidate.id) {
                Kind::Desktop
            } else {
                Kind::Command
            };
            system_package(
                candidate,
                apps,
                Repositories::Fedora,
                t!(L10N, "cli-info-source-fedora", kind = kind.key()),
            )
        }
        (Catalog::System, _) => system_package(
            candidate,
            apps,
            Repositories::Added,
            t!(
                L10N,
                "cli-info-source-system",
                source = candidate.catalog.title()
            ),
        ),
    }
}

pub fn run(arguments: &Arguments) -> Exit {
    let only = arguments.only;
    let looked_in: Vec<Catalog> = catalogs(only);
    let mut exit = Exit::Done;
    for (index, name) in arguments.words.iter().enumerate() {
        if index > 0 {
            println!();
        }
        let line = Line::default();
        line.say(&t!(L10N, "cli-looking-for", name = name.as_str()));
        let apps = installed::all(only);
        let mut found: Vec<Candidate> = Vec::new();
        for catalog in &looked_in {
            match catalog.find(name) {
                Ok(candidates) => found.extend(candidates),
                Err(error) => {
                    line.clear();
                    eprintln!(
                        "{}",
                        t!(
                            L10N,
                            "cli-info-look-failed",
                            source = catalog.title(),
                            error = error
                        )
                    );
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
            eprintln!(
                "{}",
                t!(
                    L10N,
                    "cli-info-nothing-called",
                    name = Ink::stderr().bold(name)
                )
            );
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
                eprintln!(
                    "{}",
                    t!(
                        L10N,
                        "cli-info-details-failed",
                        name = candidate.name.as_str(),
                        error = error
                    )
                );
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
