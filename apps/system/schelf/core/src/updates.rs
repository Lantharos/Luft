use std::collections::HashSet;

use luft_dbus::runtime::block_on;
use luft_i18n::t;
use luft_software::apps::flatpak::{self, Installation};
use luft_software::apps::{debian, updates};
use luft_software::system::catalog::{self, without_epoch};
use luft_software::system::system_packages::{self, Origin};
use serde::Serialize;
use specta::Type;
use tokio::task::{JoinHandle, spawn_blocking};

use crate::l10n::L10N;
use crate::library::Source;
use crate::store;
use crate::store::listing::Format;
use crate::store::record;
use crate::store::updates::StoreUpdate;
use crate::{host, tools};

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct AppUpdate {
    pub key: String,
    pub source: Source,
    pub id: String,
    pub desktop: Option<String>,
    pub name: String,
    pub icon: Option<String>,
    pub from: Option<String>,
    pub to: Option<String>,
    pub size: u64,
    pub platform: bool,
    pub installation: Option<Installation>,
    pub reference: Option<String>,
    pub package: Option<String>,
    pub store: Option<StoreUpdate>,
}

fn flatpaks(updates: Vec<flatpak::Update>) -> Vec<AppUpdate> {
    updates
        .into_iter()
        .map(|update| {
            let item = update.installed;
            let desktop = item.launchable.then(|| format!("{}.desktop", item.id));
            AppUpdate {
                key: format!("flatpak/{}", item.reference),
                source: Source::Flatpak,
                name: item.name.clone(),
                icon: None,
                desktop,
                from: (!item.version.is_empty()).then(|| item.version.clone()),
                to: (!update.new_version.is_empty()).then_some(update.new_version),
                size: update.download_size,
                platform: !item.launchable,
                installation: Some(item.installation),
                reference: Some(item.reference),
                package: None,
                store: None,
                id: item.id,
            }
        })
        .collect()
}

fn appimages() -> Vec<AppUpdate> {
    let managed: HashSet<String> = record::all()
        .into_values()
        .map(|installed| installed.local)
        .collect();
    updates::appimages()
        .into_iter()
        .filter(|(app, _)| !managed.contains(&app.id))
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
            store: None,
            id: app.id,
        })
        .collect()
}

/// The system packages someone asked for that Fedora or an added source has a newer version
/// of. Package files only change when another file is opened.
fn system() -> Result<Vec<AppUpdate>, String> {
    let packages = block_on(system_packages::list())?;
    let names: Vec<&str> = packages
        .requested()
        .filter(|package| package.origin != Origin::File)
        .map(|package| package.name.as_str())
        .collect();
    let newest = catalog::newest(&names)?;
    Ok(packages
        .requested()
        .filter_map(|package| {
            let (to, size) = newest.get(&package.name)?;
            let from = without_epoch(&package.version);
            (to != from).then(|| AppUpdate {
                key: format!("system/{}", package.name),
                source: Source::System,
                id: package.name.clone(),
                desktop: package.apps.first().cloned(),
                name: package.name.clone(),
                icon: None,
                from: Some(from.to_owned()),
                to: Some(to.clone()),
                size: *size,
                platform: false,
                installation: None,
                reference: None,
                package: Some(package.name.clone()),
                store: None,
            })
        })
        .collect())
}

fn debs(updates: Vec<debian::Update>) -> Vec<AppUpdate> {
    let apps = debian::installed();
    updates
        .into_iter()
        .map(|update| {
            let app = apps.iter().find(|app| app.package == update.package);
            AppUpdate {
                key: format!("deb/{}", update.package),
                source: Source::Debian,
                id: update.package.clone(),
                desktop: app.and_then(|app| app.desktop.first().cloned()),
                name: app.map_or_else(|| update.package.clone(), |app| app.name.clone()),
                icon: app.and_then(|app| app.icon.clone()),
                from: Some(update.from),
                to: Some(update.to),
                size: 0,
                platform: false,
                installation: None,
                reference: None,
                package: Some(update.package),
                store: None,
            }
        })
        .collect()
}

fn from_store(updates: Vec<StoreUpdate>) -> Vec<AppUpdate> {
    updates
        .into_iter()
        .map(|update| {
            let desktop = Some(format!("{}.desktop", update.local));
            let (key, source, desktop) = match update.format {
                Format::Appimage => (
                    format!("appimage/{}", update.local),
                    Source::AppImage,
                    desktop,
                ),
                Format::Sabine => (format!("sabine/{}", update.id), Source::Sabine, desktop),
                Format::LuftExtension => {
                    (format!("extension/{}", update.id), Source::Extension, None)
                }
            };
            AppUpdate {
                key,
                source,
                id: update.local.clone(),
                desktop,
                name: update.name.clone(),
                icon: update.icon.clone(),
                from: Some(update.from.clone()),
                to: Some(match &update.replacement {
                    Some(replacement) => format!("{replacement} {}", update.to),
                    None => update.to.clone(),
                }),
                size: update.size,
                platform: false,
                installation: None,
                reference: None,
                package: None,
                store: Some(update),
            }
        })
        .collect()
}

async fn joined<T>(work: JoinHandle<Result<T, String>>) -> Result<T, String> {
    work.await.unwrap_or_else(|error| Err(error.to_string()))
}

fn store_tools(updates: Vec<tools::ToolUpdate>) -> Vec<AppUpdate> {
    updates
        .into_iter()
        .map(|update| AppUpdate {
            key: format!("storetool/{}", update.name),
            source: Source::StoreTool,
            id: update.name.clone(),
            desktop: None,
            name: update.name,
            icon: None,
            from: Some(update.from),
            to: Some(update.to),
            size: 0,
            platform: false,
            installation: None,
            reference: None,
            package: None,
            store: None,
        })
        .collect()
}

fn when(
    available: bool,
    find: impl FnOnce() -> Result<Vec<AppUpdate>, String>,
) -> Result<Vec<AppUpdate>, String> {
    if available { find() } else { Ok(Vec::new()) }
}

/// Updates for everything installed, from the places this system has.
pub async fn find() -> (Vec<AppUpdate>, Vec<String>) {
    let luft = host::luft();
    let flatpaks = spawn_blocking(|| when(host::flatpak(), || flatpak::updates().map(flatpaks)));
    let system = spawn_blocking(move || when(luft, system));
    let appimages = spawn_blocking(appimages);
    let debs = spawn_blocking(move || when(luft, || debian::updates().map(debs)));
    let store = spawn_blocking(|| store::updates::find().map(from_store));
    let store_tools = spawn_blocking(|| tools::updates().map(store_tools));
    let debs = joined(debs).await;
    let store = joined(store).await;
    let store_tools = joined(store_tools).await;
    let flatpaks = joined(flatpaks).await;
    let system = joined(system).await;
    let appimages = appimages.await.unwrap_or_default();
    let failed = [
        ("flathub", flatpaks.as_ref().err()),
        ("system", system.as_ref().err()),
        ("ubuntu", debs.as_ref().err()),
        ("store", store.as_ref().err()),
        ("store-tools", store_tools.as_ref().err()),
    ]
    .into_iter()
    .filter_map(|(source, reason)| {
        Some(t!(
            L10N,
            "core-updates-check-failed",
            source = source,
            reason = reason?.as_str()
        ))
    })
    .collect();
    let mut apps: Vec<AppUpdate> = flatpaks.unwrap_or_default();
    apps.extend(appimages);
    apps.extend(system.unwrap_or_default());
    apps.extend(debs.unwrap_or_default());
    apps.extend(store.unwrap_or_default());
    apps.extend(store_tools.unwrap_or_default());
    apps.sort_by_cached_key(|update| (update.platform, update.name.to_lowercase()));
    (apps, failed)
}
