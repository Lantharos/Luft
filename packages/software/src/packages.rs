use crate::packagekit::{self, Mode, PackageDetails, PackageId, filter};
use crate::system::System;
use crate::task::Task;
use crate::updates::PackageUpdates;

const UNAVAILABLE: &str = "That app isn't available from your software sources.";

async fn installed(name: &str) -> Result<Vec<PackageId>, String> {
    Ok(packagekit::resolve(&[name], filter::INSTALLED, Mode::Quiet)
        .await?
        .into_iter()
        .map(|package| package.id)
        .collect())
}

pub async fn details(name: &str) -> Option<PackageDetails> {
    let package = packagekit::resolve(&[name], filter::NEWEST | filter::ARCH, Mode::Quiet)
        .await
        .ok()?
        .into_iter()
        .next()?;
    packagekit::details(&[package.id], Mode::Quiet)
        .await
        .ok()?
        .into_iter()
        .next()
}

pub async fn install(name: &str, task: Task<'_>) -> Result<(), String> {
    let id = packagekit::resolve_available(name)
        .await?
        .ok_or(UNAVAILABLE)?;
    packagekit::install(&[id], task).await
}

pub async fn install_file(path: &str, task: Task<'_>) -> Result<(), String> {
    packagekit::install_file(path, task).await
}

pub async fn remove(name: &str, task: Task<'_>) -> Result<(), String> {
    packagekit::remove(&installed(name).await?, task).await
}

pub async fn removal_plan(name: &str) -> Result<Vec<String>, String> {
    Ok(packagekit::removal_plan(&installed(name).await?)
        .await?
        .into_iter()
        .map(|package| package.name)
        .filter(|package| package != name)
        .collect())
}

pub async fn updates() -> Result<PackageUpdates, String> {
    match System::current() {
        System::Packages => PackageUpdates::load(Mode::Quiet).await,
        System::Image => Ok(PackageUpdates::default()),
    }
}

pub async fn update(names: &[String], task: Task<'_>) -> Result<(), String> {
    let ids: Vec<PackageId> = updates()
        .await?
        .apps
        .into_iter()
        .filter(|update| names.contains(&update.package.name))
        .map(|update| update.package)
        .collect();
    if ids.is_empty() {
        return Ok(());
    }
    packagekit::update(&ids, task).await
}
