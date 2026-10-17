mod appstream;
mod catalog;
mod jobs;
mod library;
mod updates;

use luft_app::Commands;
use luft_software::packagekit::PackageDetails;
use luft_software::packages;
use luft_software::system::System;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio::task::spawn_blocking;

use crate::library::InstalledApp;
use crate::updates::AppUpdate;
use appstream::Component;

pub use jobs::Job;
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

#[derive(Deserialize)]
struct Id {
    id: String,
}

#[derive(Deserialize)]
struct Package {
    package: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct App {
    #[serde(flatten)]
    component: Component,
    details: Option<PackageDetails>,
}

async fn app(Id { id }: Id) -> Result<App, String> {
    let component = spawn_blocking(move || catalog::find(&id))
        .await
        .map_err(|error| error.to_string())?
        .ok_or("That app isn't in the catalog any more.")?;
    let details = packages::details(&component.package).await;
    Ok(App { component, details })
}

async fn removal_plan(Package { package }: Package) -> Result<Vec<String>, String> {
    packages::removal_plan(&package).await
}

pub fn register(window: SabineWindow) -> SabineWindow {
    if !available() {
        return window;
    }
    window
        .command("fedora_apps", |_: Value| Ok(catalog::list()))
        .command_async("fedora_app", app)
        .command_async("fedora_removal_plan", removal_plan)
}
