mod enums;
pub mod offline;
mod package;
pub mod running;
mod transaction;

use std::collections::HashMap;

use serde::Serialize;
use zbus::zvariant::OwnedValue;

use crate::task::Task;
use enums::{flag, info};
use transaction::Details;

pub use enums::filter;
pub use offline::Results;
pub use package::{Package, PackageId};
pub use transaction::{Mode, follow};

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Update {
    pub package: PackageId,
    pub summary: String,
    pub security: bool,
    pub download_size: u64,
    pub installed_version: Option<String>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PackageDetails {
    pub package: PackageId,
    pub summary: String,
    pub description: String,
    pub url: String,
    pub license: String,
    pub size: u64,
    pub download_size: u64,
}

fn text(details: &Details, key: &str) -> String {
    details
        .get(key)
        .and_then(|value| String::try_from(value.clone()).ok())
        .unwrap_or_default()
}

fn number(details: &Details, key: &str) -> u64 {
    details
        .get(key)
        .and_then(|value: &OwnedValue| u64::try_from(value).ok())
        .unwrap_or(0)
}

fn ids(packages: &[PackageId]) -> Vec<&str> {
    packages.iter().map(|package| package.id.as_str()).collect()
}

pub fn refresh(force: bool, mode: Mode, task: Option<Task>) -> Result<(), String> {
    transaction::run("RefreshCache", &(force,), mode, task).map(|_| ())
}

pub fn updates(mode: Mode) -> Result<Vec<Update>, String> {
    let packages: Vec<Package> = transaction::run("GetUpdates", &(filter::NONE,), mode, None)?
        .packages
        .into_iter()
        .filter(|package| package.info != info::BLOCKED)
        .collect();
    if packages.is_empty() {
        return Ok(Vec::new());
    }
    let ids: Vec<PackageId> = packages.iter().map(|package| package.id.clone()).collect();
    let sizes: HashMap<String, u64> = details(&ids, mode)?
        .into_iter()
        .map(|details| (details.package.id, details.download_size))
        .collect();
    let names: Vec<&str> = packages
        .iter()
        .map(|package| package.id.name.as_str())
        .collect();
    let installed: HashMap<(String, String), String> = resolve(&names, filter::INSTALLED, mode)?
        .into_iter()
        .map(|package| ((package.id.name, package.id.arch), package.id.version))
        .collect();
    Ok(packages
        .into_iter()
        .map(|package| Update {
            security: package.info == info::SECURITY,
            download_size: sizes.get(&package.id.id).copied().unwrap_or(0),
            installed_version: installed
                .get(&(package.id.name.clone(), package.id.arch.clone()))
                .cloned(),
            summary: package.summary,
            package: package.id,
        })
        .collect())
}

pub fn resolve(names: &[&str], filter: u64, mode: Mode) -> Result<Vec<Package>, String> {
    if names.is_empty() {
        return Ok(Vec::new());
    }
    Ok(transaction::run("Resolve", &(filter, names), mode, None)?.packages)
}

pub fn resolve_available(name: &str) -> Result<Option<PackageId>, String> {
    let available = resolve(
        &[name],
        filter::NOT_INSTALLED | filter::NEWEST | filter::ARCH,
        Mode::Quiet,
    )?;
    Ok(available.into_iter().next().map(|package| package.id))
}

pub fn details(packages: &[PackageId], mode: Mode) -> Result<Vec<PackageDetails>, String> {
    if packages.is_empty() {
        return Ok(Vec::new());
    }
    let outcome = transaction::run("GetDetails", &(ids(packages),), mode, None)?;
    Ok(outcome.details.iter().filter_map(read_details).collect())
}

fn read_details(details: &Details) -> Option<PackageDetails> {
    Some(PackageDetails {
        package: PackageId::parse(&text(details, "package-id"))?,
        summary: text(details, "summary"),
        description: text(details, "description"),
        url: text(details, "url"),
        license: text(details, "license"),
        size: number(details, "size"),
        download_size: number(details, "download-size"),
    })
}

pub fn install(packages: &[PackageId], task: Task) -> Result<(), String> {
    transaction::run(
        "InstallPackages",
        &(flag::ONLY_TRUSTED, ids(packages)),
        Mode::Interactive,
        Some(task),
    )
    .map(|_| ())
}

pub fn install_file(path: &str, task: Task) -> Result<(), String> {
    transaction::run(
        "InstallFiles",
        &(flag::NONE, vec![path]),
        Mode::Interactive,
        Some(task),
    )
    .map(|_| ())
}

pub fn removal_plan(packages: &[PackageId]) -> Result<Vec<PackageId>, String> {
    let outcome = transaction::run(
        "RemovePackages",
        &(flag::SIMULATE, ids(packages), true, false),
        Mode::Quiet,
        None,
    )?;
    Ok(outcome
        .packages
        .into_iter()
        .filter(|package| package.info == info::REMOVING)
        .map(|package| package.id)
        .collect())
}

pub fn remove(packages: &[PackageId], task: Task) -> Result<(), String> {
    transaction::run(
        "RemovePackages",
        &(flag::NONE, ids(packages), true, false),
        Mode::Interactive,
        Some(task),
    )
    .map(|_| ())
}

pub fn update(packages: &[PackageId], task: Task) -> Result<(), String> {
    transaction::run(
        "UpdatePackages",
        &(flag::ONLY_TRUSTED, ids(packages)),
        Mode::Interactive,
        Some(task),
    )
    .map(|_| ())
}

pub fn prepare(packages: &[PackageId], task: Task) -> Result<(), String> {
    transaction::run(
        "UpdatePackages",
        &(flag::ONLY_TRUSTED | flag::ONLY_DOWNLOAD, ids(packages)),
        Mode::Background,
        Some(task),
    )
    .map(|_| ())
}
