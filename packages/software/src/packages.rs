use serde::Serialize;

use crate::image::{self, Deployments};
use crate::packagekit::{self, Mode, PackageDetails, PackageId, filter};
use crate::system::System;
use crate::task::Task;
use crate::updates::PackageUpdates;

const UNAVAILABLE: &str = "That app isn't available from your software sources.";

#[derive(Serialize, Clone, Default, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Pending {
    pub installing: Vec<String>,
    pub removing: Vec<String>,
}

#[derive(Serialize, Clone, Default, Debug)]
#[serde(rename_all = "camelCase")]
pub struct Packages {
    pub at_restart: bool,
    pub pending: Pending,
    pub layered: Option<Vec<String>>,
}

impl Packages {
    pub fn current() -> Result<Self, String> {
        if System::current() == System::Packages {
            return Ok(Self::default());
        }
        let status = Deployments::load()?.status()?;
        Ok(Self {
            at_restart: true,
            pending: Pending {
                installing: status.installing,
                removing: status.removing,
            },
            layered: Some(status.layered),
        })
    }
}

fn installed(name: &str) -> Result<Vec<PackageId>, String> {
    Ok(
        packagekit::resolve(&[name], filter::INSTALLED, Mode::Quiet)?
            .into_iter()
            .map(|package| package.id)
            .collect(),
    )
}

pub fn details(name: &str) -> Option<PackageDetails> {
    if System::current() == System::Image {
        return None;
    }
    let package = packagekit::resolve(&[name], filter::NEWEST | filter::ARCH, Mode::Quiet)
        .ok()?
        .into_iter()
        .next()?;
    packagekit::details(&[package.id], Mode::Quiet)
        .ok()?
        .into_iter()
        .next()
}

pub fn install(name: &str, task: Task) -> Result<(), String> {
    match System::current() {
        System::Packages => {
            let id = packagekit::resolve_available(name)?.ok_or(UNAVAILABLE)?;
            packagekit::install(&[id], task)
        }
        System::Image => image::install(&[name], task),
    }
}

pub fn install_file(path: &str, task: Task) -> Result<(), String> {
    match System::current() {
        System::Packages => packagekit::install_file(path, task),
        System::Image => image::install_file(path, task),
    }
}

pub fn remove(name: &str, task: Task) -> Result<(), String> {
    match System::current() {
        System::Packages => packagekit::remove(&installed(name)?, task),
        System::Image => image::remove(&[name], task),
    }
}

pub fn removal_plan(name: &str) -> Result<Vec<String>, String> {
    match System::current() {
        System::Packages => Ok(packagekit::removal_plan(&installed(name)?)?
            .into_iter()
            .map(|package| package.name)
            .filter(|package| package != name)
            .collect()),
        System::Image => Ok(Vec::new()),
    }
}

pub fn updates() -> Result<PackageUpdates, String> {
    match System::current() {
        System::Packages => PackageUpdates::load(Mode::Quiet),
        System::Image => Ok(PackageUpdates::default()),
    }
}

pub fn update(names: &[String], task: Task) -> Result<(), String> {
    let ids: Vec<PackageId> = updates()?
        .apps
        .into_iter()
        .filter(|update| names.contains(&update.package.name))
        .map(|update| update.package)
        .collect();
    if ids.is_empty() {
        return Ok(());
    }
    packagekit::update(&ids, task)
}
