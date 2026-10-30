mod appimages;
mod debian;
mod flatpaks;
pub mod full_access;
mod icons;
pub mod sources;
mod system;
mod tools;

use gio::prelude::*;
use luft_app::{Commands, Empty};
use luft_software::apps::flatpak::{self, Installation, Permissions};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use specta::Type;

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, Debug, Type)]
#[serde(rename_all = "camelCase")]
pub enum Source {
    Flatpak,
    AppImage,
    Tool,
    Debian,
    System,
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
}

#[derive(Deserialize, Type)]
struct Desktop {
    desktop: String,
    token: Option<String>,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
struct FlatpakRef {
    installation: Installation,
    reference: String,
}

pub fn installed() -> Vec<InstalledApp> {
    let mut apps: Vec<InstalledApp> = std::thread::scope(|scope| {
        let flatpaks = scope.spawn(flatpaks::installed);
        let tools = scope.spawn(tools::installed);
        let system = scope.spawn(system::installed);
        let debs = scope.spawn(debian::installed);
        let mut apps = appimages::installed();
        apps.extend(debs.join().unwrap_or_default());
        apps.extend(flatpaks.join().unwrap_or_default());
        apps.extend(tools.join().unwrap_or_default());
        apps.extend(system.join().unwrap_or_default());
        apps
    });
    for app in &mut apps {
        if let Some(icon) = app.desktop.as_deref().and_then(luft_app::apps::custom_icon) {
            app.icon = Some(icon.to_string_lossy().into_owned());
        }
    }
    apps.sort_by_cached_key(|app| app.name.to_lowercase());
    apps
}

fn launch(Desktop { desktop, token }: Desktop) -> Result<(), String> {
    launch_desktop(&desktop, token.as_deref())
}

fn launch_desktop(desktop: &str, token: Option<&str>) -> Result<(), String> {
    let info =
        gio_unix::DesktopAppInfo::new(desktop).ok_or("That app isn't installed any more.")?;
    luft_app::launch::start(info.upcast_ref(), &[], token).map_err(|error| error.to_string())
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
    sources::register(window)
        .command("library_installed", |Empty {}| Ok(installed()))
        .command("library_launch", launch)
        .command("library_permissions", permissions)
        .command_async("library_sandbox", appimages::sandbox)
        .command_async("library_full_access", full_access::has)
        .command_async("library_set_full_access", full_access::set)
        .command_async("library_restart", full_access::restart)
        .command("library_custom_icons", icons::state)
        .command_async("library_choose_icon", icons::choose)
        .command_async("library_choose_symbolic_icon", icons::choose_symbolic)
        .command("library_reset_icons", icons::reset)
}
