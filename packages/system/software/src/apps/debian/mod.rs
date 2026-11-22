//! Desktop apps from `.deb` files, installed with apt into Ubuntu kept in your account, whose menu entries and
//! icons are copied out to the desktop, so they start from Gust like any other app.

mod export;
mod installed;
mod package;
mod ubuntu;

use std::path::Path;

use crate::apps::operand::operand;
use crate::progress::Stage;
use crate::task::Task;

pub use export::OWNER;
pub use installed::{DebApp, installed};
pub use package::{Deb, Icon, inspect, runs_here};
pub use ubuntu::{LAUNCH, ORIGIN, launch};

pub struct Update {
    pub package: String,
    pub from: String,
    pub to: String,
}

fn record(package: &str, name: Option<&str>) -> Result<DebApp, String> {
    let mut apps = installed::recorded();
    let previous = apps.iter().find(|app| app.package == package).cloned();
    let exported = export::export(package, previous.as_ref().map_or(&[], |app| &app.files))?;
    let details = installed::details(package)?;
    let app = DebApp {
        package: package.to_owned(),
        name: name
            .map(str::to_owned)
            .or_else(|| previous.as_ref().map(|app| app.name.clone()))
            .unwrap_or_else(|| package.to_owned()),
        version: details.version,
        summary: details.summary,
        size: details.size,
        desktop: exported.desktop,
        icon: exported.icon,
        files: exported.files,
    };
    apps.retain(|existing| existing.package != package);
    apps.push(app.clone());
    apps.sort_by(|a, b| a.package.cmp(&b.package));
    installed::save(&apps)?;
    Ok(app)
}

/// Installs the app in a `.deb` file, along with what it needs from Ubuntu.
pub fn install(file: &Path, task: Task) -> Result<DebApp, String> {
    let deb = package::inspect(file)?;
    if !package::runs_here(&deb.architecture) {
        return Err(format!(
            "This package is made for {} computers, not this one.",
            deb.architecture
        ));
    }
    ubuntu::ready(task)?;
    ubuntu::apt(&["update"], Stage::Preparing, task)?;
    let inside = ubuntu::inside(file);
    let inside = inside.to_string_lossy();
    // apt-get only treats it as a file, not a package name, with a path in front
    ubuntu::apt(&["install", "--", &inside], Stage::Installing, task)?;
    record(&deb.package, deb.name.as_deref())
}

pub fn remove(package: &str, task: Task) -> Result<(), String> {
    if ubuntu::exists() {
        ubuntu::apt(&["remove", "--", operand(package)?], Stage::Removing, task)?;
    }
    let mut apps = installed::recorded();
    if let Some(app) = apps.iter().find(|app| app.package == package) {
        export::unexport(&app.files)?;
    }
    apps.retain(|app| app.package != package);
    installed::save(&apps)
}

pub struct Updates {
    pub apps: Vec<Update>,
    pub ubuntu: bool,
}

/// Newer versions of the apps, from the software sources some packages add when installed, such
/// as a vendor's, and whether Ubuntu's own packages have newer versions too.
pub fn updates() -> Result<Updates, String> {
    let apps = installed();
    let mut updates = Updates {
        apps: Vec::new(),
        ubuntu: false,
    };
    if apps.is_empty() {
        return Ok(updates);
    }
    ubuntu::quietly(&["update"])?;
    let listed = ubuntu::query(&["apt", "list", "--upgradable"])?;
    // name/suite new-version arch [upgradable from: old-version]
    for (name, rest) in listed.lines().filter_map(|line| line.split_once('/')) {
        let Some(app) = apps.iter().find(|app| app.package == name) else {
            updates.ubuntu = true;
            continue;
        };
        if let Some(to) = rest.split_whitespace().nth(1) {
            updates.apps.push(Update {
                package: app.package.clone(),
                from: app.version.clone(),
                to: to.to_owned(),
            });
        }
    }
    Ok(updates)
}

/// Brings all of Ubuntu's packages up to date, the apps' along with the rest.
pub fn update(task: Task) -> Result<(), String> {
    ubuntu::apt(&["update"], Stage::Preparing, task)?;
    ubuntu::apt(&["upgrade", "--with-new-pkgs"], Stage::Installing, task)?;
    for app in installed() {
        if installed::details(&app.package)?.version != app.version {
            record(&app.package, None)?;
        }
    }
    Ok(())
}
