use std::time::{SystemTime, UNIX_EPOCH};

use luft_app::Commands;
use luft_app::apps::App;
use luft_software::classify::Classification;
use luft_software::flatpak::{self, Installation};
use luft_software::packagekit::Mode;
use luft_software::updates::{self, PackageUpdates};
use sabine::SabineWindow;
use serde::Serialize;
use serde_json::Value;

use crate::library::Source;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AppUpdate {
    key: String,
    source: Source,
    id: String,
    desktop: Option<String>,
    name: String,
    icon: Option<String>,
    from: Option<String>,
    to: Option<String>,
    size: u64,
    platform: bool,
    installation: Option<Installation>,
    reference: Option<String>,
    package: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Updates {
    apps: Vec<AppUpdate>,
    checked: u64,
    error: Option<String>,
}

fn packages(updates: PackageUpdates) -> Vec<AppUpdate> {
    let classification = Classification::current();
    updates
        .apps
        .into_iter()
        .map(|update| {
            let name = update.package.name.clone();
            let desktop = classification.desktop_ids(&name).first().cloned();
            let app = desktop.as_deref().and_then(App::by_id);
            AppUpdate {
                key: format!("package/{name}"),
                source: Source::Package,
                id: desktop.clone().unwrap_or_else(|| name.clone()),
                name: app
                    .as_ref()
                    .map_or_else(|| name.clone(), |app| app.name.clone()),
                icon: app.and_then(|app| app.icon),
                desktop,
                from: update.installed_version,
                to: Some(update.package.version),
                size: update.download_size,
                platform: false,
                installation: None,
                reference: None,
                package: Some(name),
            }
        })
        .collect()
}

fn flatpaks(updates: Vec<flatpak::Update>) -> Vec<AppUpdate> {
    updates
        .into_iter()
        .map(|update| {
            let item = update.installed;
            let desktop = item.launchable.then(|| format!("{}.desktop", item.id));
            let app = desktop.as_deref().and_then(App::by_id);
            AppUpdate {
                key: format!("flatpak/{}", item.reference),
                source: Source::Flatpak,
                name: app
                    .as_ref()
                    .map_or_else(|| item.name.clone(), |app| app.name.clone()),
                icon: app.and_then(|app| app.icon),
                desktop,
                from: (!item.version.is_empty()).then(|| item.version.clone()),
                to: (!update.new_version.is_empty()).then_some(update.new_version),
                size: update.download_size,
                platform: !item.launchable,
                installation: Some(item.installation),
                reference: Some(item.reference),
                package: None,
                id: item.id,
            }
        })
        .collect()
}

fn appimages() -> Vec<AppUpdate> {
    updates::appimages()
        .into_iter()
        .map(|(app, available)| AppUpdate {
            key: format!("appimage/{}", app.id),
            source: Source::AppImage,
            desktop: Some(format!("{}.desktop", app.id)),
            name: app.name,
            icon: app.icon.map(|icon| icon.to_string_lossy().into_owned()),
            from: app.version,
            to: available.version,
            size: available.size,
            platform: false,
            installation: None,
            reference: None,
            package: None,
            id: app.id,
        })
        .collect()
}

fn check(_: Value) -> Result<Updates, String> {
    let (packages, flatpaks, appimages) = std::thread::scope(|scope| {
        let packages = scope.spawn(|| PackageUpdates::load(Mode::Quiet).map(packages));
        let flatpaks = scope.spawn(|| flatpak::updates().map(flatpaks));
        let appimages = scope.spawn(appimages);
        (
            packages.join().unwrap_or_else(|_| Err(String::new())),
            flatpaks.join().unwrap_or_else(|_| Err(String::new())),
            appimages.join().unwrap_or_default(),
        )
    });
    let error = packages.as_ref().err().or(flatpaks.as_ref().err()).cloned();
    let mut apps: Vec<AppUpdate> = packages.unwrap_or_default();
    apps.extend(flatpaks.unwrap_or_default());
    apps.extend(appimages);
    apps.sort_by_cached_key(|update| (update.platform, update.name.to_lowercase()));
    Ok(Updates {
        apps,
        checked: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_or(0, |time| time.as_secs()),
        error,
    })
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window.command("updates_check", check)
}
