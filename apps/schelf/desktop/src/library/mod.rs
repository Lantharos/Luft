mod appimages;
mod flatpaks;
mod packages;

use gio::prelude::*;
use luft_app::Commands;
use luft_software::flatpak::{self, Installation, Permissions};
use luft_software::packagekit::{self, Mode};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "camelCase")]
pub enum Source {
    Flatpak,
    Package,
    AppImage,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct InstalledApp {
    pub key: String,
    pub source: Source,
    pub id: String,
    pub desktop: Option<String>,
    pub name: String,
    pub summary: Option<String>,
    pub icon: Option<String>,
    pub version: Option<String>,
    pub size: u64,
    pub origin: String,
    pub installation: Option<Installation>,
    pub reference: Option<String>,
    pub package: Option<String>,
    pub path: Option<String>,
}

#[derive(Deserialize)]
struct Desktop {
    desktop: String,
}

#[derive(Deserialize)]
struct Package {
    package: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct FlatpakRef {
    installation: Installation,
    reference: String,
}

pub fn installed() -> Vec<InstalledApp> {
    let mut apps: Vec<InstalledApp> = std::thread::scope(|scope| {
        let flatpaks = scope.spawn(flatpaks::installed);
        let packages = scope.spawn(packages::installed);
        let mut apps = appimages::installed();
        apps.extend(flatpaks.join().unwrap_or_default());
        apps.extend(packages.join().unwrap_or_default());
        apps
    });
    apps.sort_by_cached_key(|app| app.name.to_lowercase());
    apps
}

fn launch(Desktop { desktop }: Desktop) -> Result<(), String> {
    let info =
        gio_unix::DesktopAppInfo::new(&desktop).ok_or("That app isn't installed any more.")?;
    info.launch(&[], gio::AppLaunchContext::NONE)
        .map_err(|error| error.to_string())
}

fn removal_plan(Package { package }: Package) -> Result<Vec<String>, String> {
    let installed = packagekit::resolve(
        &[package.as_str()],
        packagekit::filter::INSTALLED,
        Mode::Quiet,
    )?;
    let ids: Vec<_> = installed.into_iter().map(|package| package.id).collect();
    Ok(packagekit::removal_plan(&ids)?
        .into_iter()
        .map(|package| package.name)
        .filter(|name| *name != package)
        .collect())
}

fn permissions(
    FlatpakRef {
        installation,
        reference,
    }: FlatpakRef,
) -> Result<Permissions, String> {
    flatpak::permissions(installation, &reference)
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window
        .command("library_installed", |_: Value| Ok(installed()))
        .command("library_launch", launch)
        .command("library_removal_plan", removal_plan)
        .command("library_permissions", permissions)
}
