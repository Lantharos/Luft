use std::collections::HashMap;
use std::fs;
use std::io::ErrorKind;
use std::sync::Once;

use futures_util::StreamExt;
use gio::prelude::*;
use luft_app::dbus;
use luft_app::{Commands, Events};
use luft_i18n::t;
use sabine::SabineWindow;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use zbus::{OwnedVariant, Proxy};

use crate::L10N;

pub const PERMISSIONS_CHANGED: &str = "privacy.permissions";

const STORE: &str = "org.freedesktop.impl.portal.PermissionStore";
const STORE_PATH: &str = "/org/freedesktop/impl/portal/PermissionStore";
const NOT_FOUND: &str = "org.freedesktop.portal.Error.NotFound";
const KINDS: [Kind; 2] = [Kind::Location, Kind::Camera];

static WATCH: Once = Once::new();

type Permissions = HashMap<String, Vec<String>>;

#[derive(Deserialize, Serialize, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
enum Kind {
    Location,
    Camera,
}

impl Kind {
    fn table(self) -> &'static str {
        match self {
            Kind::Location => "location",
            Kind::Camera => "devices",
        }
    }

    fn id(self) -> &'static str {
        match self {
            Kind::Location => "location",
            Kind::Camera => "camera",
        }
    }

    fn allows(self, permissions: &[String]) -> bool {
        let first = permissions.first().map(String::as_str);
        match self {
            Kind::Location => first.is_some_and(|level| level != "NONE"),
            Kind::Camera => first == Some("yes"),
        }
    }

    fn permissions(self, allowed: bool, previous: &[String]) -> Vec<String> {
        match self {
            Kind::Location => {
                let level = if allowed { "EXACT" } else { "NONE" };
                let last_used = previous.get(1).map_or("0", String::as_str);
                vec![level.to_owned(), last_used.to_owned()]
            }
            Kind::Camera => vec![if allowed { "yes" } else { "no" }.to_owned()],
        }
    }
}

#[derive(Deserialize)]
struct Query {
    kind: Kind,
}

#[derive(Deserialize)]
struct Change {
    kind: Kind,
    app: String,
    allowed: bool,
}

#[derive(Serialize)]
struct App {
    id: String,
    name: String,
    allowed: bool,
}

#[derive(Serialize)]
struct Update {
    kind: Kind,
    apps: Vec<App>,
}

async fn store() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::session().await?, STORE, STORE_PATH, STORE)
        .await
        .map_err(dbus::failed)
}

fn app_name(id: &str) -> String {
    gio_unix::DesktopAppInfo::new(&format!("{id}.desktop"))
        .map(|info| info.display_name().to_string())
        .unwrap_or_else(|| id.to_owned())
}

fn apps(kind: Kind, permissions: Permissions) -> Vec<App> {
    let mut apps: Vec<App> = permissions
        .into_iter()
        .filter(|(id, _)| !id.is_empty())
        .map(|(id, permissions)| App {
            name: app_name(&id),
            allowed: kind.allows(&permissions),
            id,
        })
        .collect();
    apps.sort_by_key(|app| app.name.to_lowercase());
    apps
}

async fn lookup(kind: Kind) -> Result<Permissions, String> {
    let store = store().await?;
    match store
        .call::<_, _, (Permissions, OwnedVariant)>("Lookup", &(kind.table(), kind.id()))
        .await
    {
        Ok((permissions, _)) => Ok(permissions),
        Err(error) if dbus::error_name(&error).as_deref() == Some(NOT_FOUND) => {
            Ok(Permissions::new())
        }
        Err(error) => Err(error.to_string()),
    }
}

fn watch(events: Events) {
    luft_app::spawn(async move {
        let Ok(proxy) = store().await else {
            return;
        };
        let Ok(mut changes) = proxy.receive_signal("Changed").await else {
            return;
        };
        while let Some(message) = changes.next().await {
            let Ok((table, id, deleted, _, permissions)) =
                message
                    .body()
                    .deserialize::<(String, String, bool, OwnedVariant, Permissions)>()
            else {
                continue;
            };
            let Some(kind) = KINDS
                .into_iter()
                .find(|kind| kind.table() == table && kind.id() == id)
            else {
                continue;
            };
            let permissions = if deleted {
                Permissions::new()
            } else {
                permissions
            };
            events.emit(
                PERMISSIONS_CHANGED,
                Update {
                    kind,
                    apps: apps(kind, permissions),
                },
            );
        }
    });
}

async fn permissions(events: Events, Query { kind }: Query) -> Result<Vec<App>, String> {
    WATCH.call_once(|| watch(events));
    Ok(apps(kind, lookup(kind).await?))
}

async fn set_permission(Change { kind, app, allowed }: Change) -> Result<(), String> {
    let previous = lookup(kind).await?.remove(&app).unwrap_or_default();
    store()
        .await?
        .call_method(
            "SetPermission",
            &(
                kind.table(),
                true,
                kind.id(),
                app.as_str(),
                kind.permissions(allowed, &previous),
            ),
        )
        .await
        .map(|_| ())
        .map_err(|error| error.to_string())
}

fn clear_history(_: Value) -> Result<(), String> {
    let history = dirs::data_dir()
        .ok_or_else(|| t!(L10N, "desktop-no-data-folder"))?
        .join("recently-used.xbel");
    match fs::remove_file(history) {
        Err(error) if error.kind() != ErrorKind::NotFound => Err(error.to_string()),
        _ => Ok(()),
    }
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .with_async("privacy_permissions", events, permissions)
        .command_async("privacy_set_permission", set_permission)
        .command("privacy_clear_history", clear_history)
}
