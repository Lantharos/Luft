use crate::packagekit::{self, Mode, PackageDetails, PackageId, filter};
use crate::system::System;
use crate::task::Task;
use crate::updates::PackageUpdates;

const UNAVAILABLE: &str = "That app isn't available from your software sources.";

fn installed(name: &str) -> Result<Vec<PackageId>, String> {
    Ok(
        packagekit::resolve(&[name], filter::INSTALLED, Mode::Quiet)?
            .into_iter()
            .map(|package| package.id)
            .collect(),
    )
}

pub fn details(name: &str) -> Option<PackageDetails> {
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
    let id = packagekit::resolve_available(name)?.ok_or(UNAVAILABLE)?;
    packagekit::install(&[id], task)
}

pub fn install_file(path: &str, task: Task) -> Result<(), String> {
    packagekit::install_file(path, task)
}

pub fn remove(name: &str, task: Task) -> Result<(), String> {
    packagekit::remove(&installed(name)?, task)
}

pub fn removal_plan(name: &str) -> Result<Vec<String>, String> {
    Ok(packagekit::removal_plan(&installed(name)?)?
        .into_iter()
        .map(|package| package.name)
        .filter(|package| package != name)
        .collect())
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
