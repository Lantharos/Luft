mod appimages;
mod flatpaks;
pub mod full_access;
mod system;
mod tools;

use gio::prelude::*;
use luft_app::Commands;
use luft_software::flatpak::{self, Installation, Permissions};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::fedora;

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Debug)]
#[serde(rename_all = "camelCase")]
pub enum Source {
    Flatpak,
    Package,
    AppImage,
    Tool,
    System,
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
    pub commands: Vec<String>,
    pub services: Vec<String>,
}

#[derive(Deserialize)]
struct Desktop {
    desktop: String,
    token: Option<String>,
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
        let packages = scope.spawn(fedora::installed);
        let tools = (!fedora::available()).then(|| scope.spawn(tools::installed));
        let system = scope.spawn(system::installed);
        let mut apps = appimages::installed();
        apps.extend(flatpaks.join().unwrap_or_default());
        apps.extend(packages.join().unwrap_or_default());
        if let Some(tools) = tools {
            apps.extend(tools.join().unwrap_or_default());
        }
        apps.extend(system.join().unwrap_or_default());
        apps
    });
    apps.sort_by_cached_key(|app| app.name.to_lowercase());
    apps
}

fn launch(Desktop { desktop, token }: Desktop) -> Result<(), String> {
    let info =
        gio_unix::DesktopAppInfo::new(&desktop).ok_or("That app isn't installed any more.")?;
    luft_app::launch::start(info.upcast_ref(), &[], token.as_deref())
        .map_err(|error| error.to_string())
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
        .command("library_permissions", permissions)
        .command("library_full_access", full_access::has)
        .command_async(
            "library_set_full_access",
            |full_access::Change { id, on }| full_access::set(id, on),
        )
}
