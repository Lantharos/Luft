mod appimages;
mod debian;
mod flatpaks;
pub mod full_access;
pub mod sources;
mod store;
mod store_tools;
mod system;
mod tools;

use luft_software::apps::flatpak::Installation;
use serde::{Deserialize, Serialize};
use specta::Type;

use crate::host;

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Debug, Type)]
#[serde(rename_all = "camelCase")]
pub enum Source {
    Flatpak,
    AppImage,
    Tool,
    Debian,
    System,
    Sabine,
    Extension,
    StoreTool,
}

#[derive(Serialize, Clone, Debug, Type)]
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
    pub commands: Vec<String>,
    pub services: Vec<String>,
    /// The schelf.store app it was installed as.
    pub listing: Option<String>,
}

fn when(available: bool, list: fn() -> Vec<InstalledApp>) -> Vec<InstalledApp> {
    if available { list() } else { Vec::new() }
}

/// Everything installed here, from the places this system has.
pub fn installed() -> Vec<InstalledApp> {
    let luft = host::luft();
    let mut apps: Vec<InstalledApp> = std::thread::scope(|scope| {
        let flatpaks = scope.spawn(|| when(host::flatpak(), flatpaks::installed));
        let tools = scope.spawn(|| when(luft, tools::installed));
        let system = scope.spawn(|| when(luft, system::installed));
        let debs = scope.spawn(|| when(luft, debian::installed));
        let mut apps = appimages::installed();
        apps.extend(store::installed());
        apps.extend(store_tools::installed());
        apps.extend(debs.join().unwrap_or_default());
        apps.extend(flatpaks.join().unwrap_or_default());
        apps.extend(tools.join().unwrap_or_default());
        apps.extend(system.join().unwrap_or_default());
        apps
    });
    apps.sort_by_cached_key(|app| app.name.to_lowercase());
    apps
}
