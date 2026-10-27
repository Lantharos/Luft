mod enums;
pub mod offline;
mod package;
pub mod running;
mod transaction;

use std::collections::HashMap;

use serde::Serialize;
use zbus::OwnedVariant;

use crate::task::Task;
use enums::{flag, info};
use specta::Type;
use transaction::Details;

pub use enums::filter;
pub use offline::Results;
pub use package::{Package, PackageId};
pub use transaction::{Mode, follow};

#[derive(Serialize, Clone, Type)]
#[serde(rename_all = "camelCase")]
pub struct Update {
    pub package: PackageId,
    pub summary: String,
    pub security: bool,
    pub download_size: u64,
    pub installed_version: Option<String>,
}

#[derive(Serialize, Clone, Type)]
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
        .and_then(|value: &OwnedVariant| u64::try_from(value).ok())
        .unwrap_or(0)
}

fn ids(packages: &[PackageId]) -> Vec<&str> {
    packages.iter().map(|package| package.id.as_str()).collect()
}

pub async fn refresh(force: bool, mode: Mode, task: Option<Task<'_>>) -> Result<(), String> {
    transaction::run("RefreshCache", &(force,), mode, task)
        .await
        .map(drop)
}

pub async fn updates(mode: Mode) -> Result<Vec<Update>, String> {
    let packages: Vec<Package> = transaction::run("GetUpdates", &(filter::NONE,), mode, None)
        .await?
        .packages
        .into_iter()
        .filter(|package| package.info != info::BLOCKED)
        .collect();
    if packages.is_empty() {
        return Ok(Vec::new());
    }
    let ids: Vec<PackageId> = packages.iter().map(|package| package.id.clone()).collect();
    let sizes: HashMap<String, u64> = details(&ids, mode)
        .await?
        .into_iter()
        .map(|details| (details.package.id, details.download_size))
        .collect();
    let names: Vec<&str> = packages
        .iter()
        .map(|package| package.id.name.as_str())
        .collect();
    let installed: HashMap<(String, String), String> = resolve(&names, filter::INSTALLED, mode)
        .await?
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

pub async fn resolve(names: &[&str], filter: u64, mode: Mode) -> Result<Vec<Package>, String> {
    if names.is_empty() {
        return Ok(Vec::new());
    }
    Ok(transaction::run("Resolve", &(filter, names), mode, None)
        .await?
        .packages)
}

pub async fn resolve_available(name: &str) -> Result<Option<PackageId>, String> {
    let available = resolve(
        &[name],
        filter::NOT_INSTALLED | filter::NEWEST | filter::ARCH,
        Mode::Quiet,
    )
    .await?;
    Ok(available.into_iter().next().map(|package| package.id))
}

pub async fn details(packages: &[PackageId], mode: Mode) -> Result<Vec<PackageDetails>, String> {
    if packages.is_empty() {
        return Ok(Vec::new());
    }
    let outcome = transaction::run("GetDetails", &(ids(packages),), mode, None).await?;
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

pub async fn install(packages: &[PackageId], task: Task<'_>) -> Result<(), String> {
    transaction::run(
        "InstallPackages",
        &(flag::ONLY_TRUSTED, ids(packages)),
        Mode::Interactive,
        Some(task),
    )
    .await
    .map(drop)
}

pub async fn install_file(path: &str, task: Task<'_>) -> Result<(), String> {
    transaction::run(
        "InstallFiles",
        &(flag::NONE, vec![path]),
        Mode::Interactive,
        Some(task),
    )
    .await
    .map(drop)
}

pub async fn removal_plan(packages: &[PackageId]) -> Result<Vec<PackageId>, String> {
    let outcome = transaction::run(
        "RemovePackages",
        &(flag::SIMULATE, ids(packages), true, false),
        Mode::Quiet,
        None,
    )
    .await?;
    Ok(outcome
        .packages
        .into_iter()
        .filter(|package| package.info == info::REMOVING)
        .map(|package| package.id)
        .collect())
}

pub async fn remove(packages: &[PackageId], task: Task<'_>) -> Result<(), String> {
    transaction::run(
        "RemovePackages",
        &(flag::NONE, ids(packages), true, false),
        Mode::Interactive,
        Some(task),
    )
    .await
    .map(drop)
}

pub async fn update(packages: &[PackageId], task: Task<'_>) -> Result<(), String> {
    transaction::run(
        "UpdatePackages",
        &(flag::ONLY_TRUSTED, ids(packages)),
        Mode::Interactive,
        Some(task),
    )
    .await
    .map(drop)
}

pub async fn prepare(packages: &[PackageId], task: Task<'_>) -> Result<(), String> {
    transaction::run(
        "UpdatePackages",
        &(flag::ONLY_TRUSTED | flag::ONLY_DOWNLOAD, ids(packages)),
        Mode::Background,
        Some(task),
    )
    .await
    .map(drop)
}
