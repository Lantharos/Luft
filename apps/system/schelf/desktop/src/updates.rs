use std::collections::HashSet;
use std::time::{SystemTime, UNIX_EPOCH};

use luft_app::apps::App;
use luft_app::{Commands, Empty};
use luft_software::apps::flatpak::{self, Installation};
use luft_software::apps::{debian, toolbox, updates};
use sabine::SabineWindow;
use serde::Serialize;
use specta::Type;
use tokio::task::{JoinHandle, spawn_blocking};

use crate::library::Source;
use crate::store;
use crate::store::listing::Format;
use crate::store::record;
use crate::store::updates::StoreUpdate;

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

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct Updates {
    apps: Vec<AppUpdate>,
    checked: u64,
    failed: Vec<String>,
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

fn tools(updates: Vec<toolbox::Update>) -> Vec<AppUpdate> {
    updates
        .into_iter()
        .map(|update| AppUpdate {
            key: format!("tool/{}", update.package),
            source: Source::Tool,
            id: update.package.clone(),
            desktop: None,
            name: update.package.clone(),
            icon: None,
            from: update.from,
            to: Some(update.to),
            size: update.size,
            platform: false,
            installation: None,
            reference: None,
            package: Some(update.package),
            store: None,
        })
        .collect()
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

pub async fn find() -> (Vec<AppUpdate>, Vec<String>) {
    let flatpaks = spawn_blocking(|| flatpak::updates().map(flatpaks));
    let tools = spawn_blocking(|| toolbox::updates().map(tools));
    let appimages = spawn_blocking(appimages);
    let debs = spawn_blocking(|| debian::updates().map(debs));
    let store = spawn_blocking(|| store::updates::find().map(from_store));
    let debs = joined(debs).await;
    let store = joined(store).await;
    let flatpaks = joined(flatpaks).await;
    let tools = joined(tools).await;
    let appimages = appimages.await.unwrap_or_default();
    let failed = [
        ("Flathub apps", flatpaks.as_ref().err()),
        ("command-line tools", tools.as_ref().err()),
        ("Ubuntu apps", debs.as_ref().err()),
        ("schelf.store apps", store.as_ref().err()),
    ]
    .into_iter()
    .filter_map(|(source, reason)| Some(format!("Couldn't check your {source}. {}", reason?)))
    .collect();
    let mut apps: Vec<AppUpdate> = flatpaks.unwrap_or_default();
    apps.extend(appimages);
    apps.extend(tools.unwrap_or_default());
    apps.extend(debs.unwrap_or_default());
    apps.extend(store.unwrap_or_default());
    apps.sort_by_cached_key(|update| (update.platform, update.name.to_lowercase()));
    (apps, failed)
}

async fn check(Empty {}: Empty) -> Result<Updates, String> {
    let (apps, failed) = find().await;
    Ok(Updates {
        apps,
        checked: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_or(0, |time| time.as_secs()),
        failed,
    })
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window.command_async("updates_check", check)
}
