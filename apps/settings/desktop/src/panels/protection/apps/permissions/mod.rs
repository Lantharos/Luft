mod grants;
mod passwords;
mod watch;

use std::sync::Once;

use luft_app::apps::App;
use luft_app::dbus;
use luft_app::identity::permissions;
use luft_app::{Commands, Events};
use luft_software::apps::flatpak;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use zbus::Connection;

use grants::{Grant, Switch};
use passwords::Remembered;

static WATCH: Once = Once::new();

#[derive(Clone, Copy, PartialEq, Eq)]
enum Kind {
    Location,
    Camera,
    Clipboard,
    FullAccess,
    Passwords,
}

const KINDS: [Kind; 5] = [
    Kind::Location,
    Kind::Camera,
    Kind::Clipboard,
    Kind::FullAccess,
    Kind::Passwords,
];

#[derive(Serialize)]
#[serde(tag = "kind", content = "apps", rename_all = "camelCase")]
enum Update {
    Location(Vec<Grant>),
    Camera(Vec<Grant>),
    Clipboard(Vec<Grant>),
    FullAccess(Vec<App>),
    Passwords(Vec<Remembered>),
}

#[derive(Deserialize)]
struct Change {
    kind: Switch,
    app: String,
    allowed: bool,
}

#[derive(Deserialize)]
struct Revoke {
    app: String,
}

impl Kind {
    fn of(table: &str) -> Option<Self> {
        KINDS.into_iter().find(|kind| kind.table() == table)
    }

    fn table(self) -> &'static str {
        match self {
            Self::Location => Switch::Location.entry().0,
            Self::Camera => Switch::Camera.entry().0,
            Self::Clipboard => Switch::Clipboard.entry().0,
            Self::FullAccess => permissions::FULL_ACCESS.table,
            Self::Passwords => permissions::KEYRING_ITEMS,
        }
    }

    async fn read(self, connection: &Connection) -> zbus::Result<Update> {
        Ok(match self {
            Self::Location => Update::Location(grants::list(connection, Switch::Location).await?),
            Self::Camera => Update::Camera(grants::list(connection, Switch::Camera).await?),
            Self::Clipboard => {
                Update::Clipboard(grants::list(connection, Switch::Clipboard).await?)
            }
            Self::FullAccess => Update::FullAccess(grants::full_access(connection).await?),
            Self::Passwords => Update::Passwords(passwords::list(connection).await?),
        })
    }
}

fn known(id: &str) -> Option<App> {
    App::by_id(&format!("{id}.desktop")).map(|app| App {
        id: id.to_owned(),
        ..app
    })
}

fn identify(id: String) -> App {
    known(&id).unwrap_or_else(|| App {
        name: id.clone(),
        id,
        icon: None,
    })
}

fn sort<T>(apps: &mut [T], app: impl Fn(&T) -> &App) {
    apps.sort_by_cached_key(|entry| app(entry).name.to_lowercase());
}

fn explain(error: zbus::Error) -> String {
    dbus::explain(&error)
}

async fn list(events: Events, _: Value) -> Result<Vec<Update>, String> {
    WATCH.call_once(|| watch::watch(events));
    let session = dbus::session().await?;
    let mut updates = Vec::with_capacity(KINDS.len());
    for kind in KINDS {
        updates.push(kind.read(session).await.map_err(explain)?);
    }
    Ok(updates)
}

async fn set(Change { kind, app, allowed }: Change) -> Result<(), String> {
    grants::set(dbus::session().await?, kind, &app, allowed)
        .await
        .map_err(explain)
}

async fn revoke_full_access(Revoke { app }: Revoke) -> Result<(), String> {
    flatpak::set_full_access(&app, false).await
}

async fn forget_passwords(Revoke { app }: Revoke) -> Result<(), String> {
    passwords::forget(dbus::session().await?, &app)
        .await
        .map_err(explain)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with_async("apps_permissions", events, list)
        .command_async("apps_permission_set", set)
        .command_async("apps_full_access_revoke", revoke_full_access)
        .command_async("apps_passwords_forget", forget_passwords)
}
