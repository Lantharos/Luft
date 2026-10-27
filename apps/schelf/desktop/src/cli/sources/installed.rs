use super::Origin;
use crate::cli::perform::{Plan, Verb};
use crate::fedora;
use crate::library::{self, InstalledApp, Source};
use crate::operations::{Job, Request};

pub fn all(only: Option<Origin>) -> Vec<InstalledApp> {
    library::installed()
        .into_iter()
        .filter(|app| only.is_none_or(|origin| Origin::of(app.source) == origin))
        .collect()
}

fn names(app: &InstalledApp) -> impl Iterator<Item = &str> {
    let short = (app.source == Source::Flatpak)
        .then(|| app.id.rsplit('.').next())
        .flatten();
    [
        Some(app.id.as_str()),
        Some(app.name.as_str()),
        app.package.as_deref(),
        short,
    ]
    .into_iter()
    .flatten()
}

pub fn matching(apps: Vec<InstalledApp>, name: &str) -> Vec<InstalledApp> {
    let wanted = name.to_lowercase();
    apps.into_iter()
        .filter(|app| names(app).any(|known| known.to_lowercase() == wanted))
        .collect()
}

pub fn containing(apps: Vec<InstalledApp>, query: &str) -> Vec<InstalledApp> {
    let wanted = query.to_lowercase();
    apps.into_iter()
        .filter(|app| names(app).any(|known| known.to_lowercase().contains(&wanted)))
        .collect()
}

pub fn describe(app: &InstalledApp) -> String {
    let id = app
        .package
        .as_deref()
        .filter(|package| *package != app.name)
        .unwrap_or(&app.id);
    let id = if id == app.name {
        String::new()
    } else {
        format!(" ({id})")
    };
    match app.source {
        Source::System => format!("{}, a system package", app.name),
        source => format!("{}{id}, from {}", app.name, Origin::of(source).title()),
    }
}

fn removal_job(app: &InstalledApp) -> Job {
    match app.source {
        Source::Flatpak => Job::RemoveFlatpak {
            installation: app
                .installation
                .unwrap_or(luft_software::apps::flatpak::Installation::User),
            reference: app.reference.clone().unwrap_or_default(),
        },
        Source::Package => Job::Fedora(fedora::PackageJob::RemovePackage {
            package: app.package.clone().unwrap_or_default(),
        }),
        Source::Tool => Job::RemoveTool {
            package: app.package.clone().unwrap_or_default(),
        },
        Source::AppImage => Job::RemoveAppImage { id: app.id.clone() },
        Source::Debian => Job::RemoveDeb {
            package: app.package.clone().unwrap_or_default(),
        },
        Source::System => Job::RemoveSystemPackages {
            packages: vec![app.id.clone()],
        },
    }
}

pub fn removal(app: &InstalledApp) -> Plan {
    Plan {
        request: Request {
            key: app.key.clone(),
            title: app.name.clone(),
            job: removal_job(app),
            members: Vec::new(),
        },
        verb: Verb::Remove,
        from: None,
    }
}
