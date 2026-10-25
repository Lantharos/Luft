//! Desktop apps from `.deb` files, installed with apt into an Ubuntu toolbox container whose menu entries and
//! icons are copied out to the desktop, so they start from Start like any other app.

mod apt;
mod container;
mod export;
mod installed;
mod package;

use std::path::Path;

use crate::apps::operand::operand;
use crate::progress::Stage;
use crate::task::Task;

pub use container::NAME as container;
pub use installed::{DebApp, installed};
pub use package::{Deb, Icon, inspect, runs_here};

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
    container::ready(task)?;
    apt::run(&mut apt::apt_get(&["update"]), Stage::Preparing, task)?;
    let inside = container::inside(file);
    let inside = inside.to_string_lossy();
    // apt-get only treats it as a file, not a package name, with a path in front
    apt::run(
        &mut apt::apt_get(&["install", "--", &inside]),
        Stage::Installing,
        task,
    )?;
    record(&deb.package, deb.name.as_deref())
}

pub fn remove(package: &str, task: Task) -> Result<(), String> {
    if container::exists() {
        apt::run(
            &mut apt::apt_get(&["remove", "--", operand(package)?]),
            Stage::Removing,
            task,
        )?;
    }
    let mut apps = installed::recorded();
    if let Some(app) = apps.iter().find(|app| app.package == package) {
        export::unexport(&app.files);
    }
    apps.retain(|app| app.package != package);
    installed::save(&apps)
}

/// Newer versions from the software sources some packages add when installed, such as a vendor's.
pub fn updates() -> Result<Vec<Update>, String> {
    let apps = installed();
    if apps.is_empty() {
        return Ok(Vec::new());
    }
    apt::quietly(&["update"])?;
    let listed = container::query(&["apt", "list", "--upgradable"])?;
    Ok(listed
        .lines()
        .filter_map(|line| {
            // name/suite new-version arch [upgradable from: old-version]
            let (name, rest) = line.split_once('/')?;
            let app = apps.iter().find(|app| app.package == name)?;
            let to = rest.split_whitespace().nth(1)?.to_owned();
            Some(Update {
                package: app.package.clone(),
                from: app.version.clone(),
                to,
            })
        })
        .collect())
}

pub fn update(packages: &[String], task: Task) -> Result<(), String> {
    let mut arguments = vec!["install", "--only-upgrade", "--"];
    for package in packages {
        arguments.push(operand(package)?);
    }
    apt::run(&mut apt::apt_get(&arguments), Stage::Installing, task)?;
    packages
        .iter()
        .try_for_each(|package| record(package, None).map(drop))
}
