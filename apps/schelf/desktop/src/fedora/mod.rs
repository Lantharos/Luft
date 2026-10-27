mod appstream;
mod catalog;
mod jobs;
mod library;
mod updates;

use luft_app::{Commands, Empty};
use luft_software::system::System;
use luft_software::system::packagekit::PackageDetails;
use luft_software::system::packages;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use specta::Type;
use tokio::task::spawn_blocking;

use crate::library::InstalledApp;
use crate::updates::AppUpdate;
use appstream::FedoraComponent;

pub use jobs::PackageJob;
pub use library::is_installed;

pub fn available() -> bool {
    System::current() == System::Packages
}

pub fn installed() -> Vec<InstalledApp> {
    if available() {
        library::installed()
    } else {
        Vec::new()
    }
}

pub async fn updates() -> Result<Vec<AppUpdate>, String> {
    if available() {
        updates::load().await
    } else {
        Ok(Vec::new())
    }
}

#[derive(Deserialize, Type)]
struct Id {
    id: String,
}

#[derive(Deserialize, Type)]
struct Package {
    package: String,
}

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct FedoraApp {
    #[serde(flatten)]
    component: FedoraComponent,
    details: Option<PackageDetails>,
}

async fn app(Id { id }: Id) -> Result<FedoraApp, String> {
    let component = spawn_blocking(move || catalog::find(&id))
        .await
        .map_err(|error| error.to_string())?
        .ok_or("That app isn't in the catalog any more.")?;
    let details = packages::details(&component.package).await;
    Ok(FedoraApp { component, details })
}

async fn removal_plan(Package { package }: Package) -> Result<Vec<String>, String> {
    packages::removal_plan(&package).await
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("fedora_apps", |Empty {}| Ok(catalog::list()))
        .command_async("fedora_app", app)
        .command_async("fedora_removal_plan", removal_plan)
}
