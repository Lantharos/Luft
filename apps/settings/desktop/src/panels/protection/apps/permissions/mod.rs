mod grants;
mod passwords;
mod sandbox;
mod watch;

use std::collections::{BTreeSet, HashMap};
use std::sync::Once;

use luft_app::apps::App;
use luft_app::dbus;
use luft_app::identity::permissions::{self, Apps, DEVICES, FOLDERS};
use luft_app::{Commands, Empty, Events};
use luft_i18n::t;
use luft_software::apps::{appimage, flatpak};
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use zbus::Connection;

use crate::L10N;
use grants::{SWITCHES, Switchable};
use passwords::Remembered;
use sandbox::SandboxDevice;
use specta::Type;

const FULL_ACCESS_LINK: &str = "schelf:full-access?";

static WATCH: Once = Once::new();

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct AppAccess {
    #[serde(flatten)]
    app: App,
    app_image: bool,
    location: Option<bool>,
    camera: Option<bool>,
    clipboard: Option<bool>,
    passwords: Option<Remembered>,
    full_access: bool,
    folders: Vec<String>,
    devices: Vec<String>,
}

#[derive(Deserialize, Type)]
struct PermissionChange {
    kind: Switchable,
    app: String,
    allowed: bool,
}

#[derive(Deserialize, Type)]
struct AppTarget {
    app: String,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
struct Revoke {
    app: String,
    app_image: bool,
}

#[derive(Deserialize, Type)]
struct Folder {
    app: String,
    folder: String,
}

#[derive(Deserialize, Type)]
struct DeviceChange {
    app: String,
    device: SandboxDevice,
    on: bool,
}

fn identify(id: &str) -> App {
    App::by_id(&format!("{id}.desktop"))
        .map(|app| App {
            id: id.to_owned(),
            ..app
        })
        .unwrap_or_else(|| App {
            name: id.to_owned(),
            id: id.to_owned(),
            icon: None,
        })
}

fn by_app(apps: Apps) -> HashMap<String, Vec<String>> {
    apps.into_iter()
        .filter(|(app, _)| !app.is_empty())
        .collect()
}

async fn read(connection: &Connection) -> zbus::Result<Vec<AppAccess>> {
    let [location, camera, clipboard] = [
        SWITCHES[0].answers(connection).await?,
        SWITCHES[1].answers(connection).await?,
        SWITCHES[2].answers(connection).await?,
    ];
    let passwords = passwords::counts(connection).await?;
    let full_access = sandbox::full_access(connection).await?;
    let folders = by_app(permissions::lookup(connection, FOLDERS.table, FOLDERS.id).await?);
    let devices = by_app(permissions::lookup(connection, DEVICES.table, DEVICES.id).await?);
    let app_images: BTreeSet<String> = appimage::list().into_iter().map(|app| app.id).collect();
    let ids: BTreeSet<&String> = location
        .keys()
        .chain(camera.keys())
        .chain(clipboard.keys())
        .chain(passwords.keys())
        .chain(&full_access)
        .chain(folders.keys())
        .chain(devices.keys())
        .chain(&app_images)
        .collect();
    let mut apps: Vec<AppAccess> = ids
        .into_iter()
        .map(|id| AppAccess {
            app: identify(id),
            app_image: app_images.contains(id),
            location: location.get(id).copied(),
            camera: camera.get(id).copied(),
            clipboard: clipboard.get(id).copied(),
            passwords: passwords.get(id).copied(),
            full_access: full_access.contains(id),
            folders: folders.get(id).cloned().unwrap_or_default(),
            devices: devices.get(id).cloned().unwrap_or_default(),
        })
        .collect();
    apps.sort_by_cached_key(|access| access.app.name.to_lowercase());
    Ok(apps)
}

fn explain(error: zbus::Error) -> String {
    dbus::explain(&error)
}

async fn list(events: Events, Empty {}: Empty) -> Result<Vec<AppAccess>, String> {
    WATCH.call_once(|| watch::watch(events));
    read(dbus::session().await?).await.map_err(explain)
}

async fn set(PermissionChange { kind, app, allowed }: PermissionChange) -> Result<(), String> {
    grants::set(dbus::session().await?, kind, &app, allowed)
        .await
        .map_err(explain)
}

async fn revoke_full_access(Revoke { app, app_image }: Revoke) -> Result<(), String> {
    if app_image {
        appimage::set_full_access(&app, false).await
    } else {
        flatpak::set_full_access(&app, false).await
    }
}

fn ask_for_full_access(AppTarget { app }: AppTarget) -> Result<(), String> {
    gio::AppInfo::launch_default_for_uri(
        &format!("{FULL_ACCESS_LINK}{app}"),
        None::<&gio::AppLaunchContext>,
    )
    .map_err(|error| error.to_string())
}

async fn forget_passwords(AppTarget { app }: AppTarget) -> Result<(), String> {
    passwords::forget(dbus::session().await?, &app)
        .await
        .map_err(explain)
}

async fn add_folder(AppTarget { app }: AppTarget) -> Result<bool, String> {
    sandbox::add_folder(
        dbus::session().await?,
        &app,
        &t!(L10N, "desktop-apps-folder-title"),
    )
    .await
}

async fn remove_folder(Folder { app, folder }: Folder) -> Result<(), String> {
    sandbox::remove_folder(dbus::session().await?, &app, &folder)
        .await
        .map_err(explain)
}

async fn set_device(DeviceChange { app, device, on }: DeviceChange) -> Result<(), String> {
    sandbox::set_device(dbus::session().await?, &app, device, on)
        .await
        .map_err(explain)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .bridge_event(&watch::CHANGED)
        .with_async("apps_permissions", events, list)
        .command_async("apps_permission_set", set)
        .command_async("apps_full_access_revoke", revoke_full_access)
        .command("apps_full_access_ask", ask_for_full_access)
        .command_async("apps_passwords_forget", forget_passwords)
        .command_async("apps_folder_add", add_folder)
        .command_async("apps_folder_remove", remove_folder)
        .command_async("apps_device_set", set_device)
}
