use std::collections::HashSet;

use gio::prelude::*;
use luft_app::{Commands, Events};
use sabine::SabineWindow;
use serde::Serialize;
use serde_json::Value;

use luft_app::apps::App;

const SCHEMA: &str = "org.gnome.desktop.notifications";
const APPLICATION_SCHEMA: &str = "org.gnome.desktop.notifications.application";
const APPLICATION_PATH: &str = "/org/gnome/desktop/notifications/application";
const RULES_PATH: &str = "/dev/lantharos/kestrel/notifications/application";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct NotifyingApp {
    path: String,
    rules_path: String,
    #[serde(flatten)]
    app: App,
}

fn notifying_apps() -> Vec<NotifyingApp> {
    let mut seen = HashSet::new();
    let mut apps: Vec<NotifyingApp> = gio::Settings::new(SCHEMA)
        .strv("application-children")
        .iter()
        .filter_map(|child| {
            let path = format!("{APPLICATION_PATH}/{child}/");
            let id = gio::Settings::with_path(APPLICATION_SCHEMA, &path).string("application-id");
            let app = App::by_id(&id)?;
            seen.insert(app.id.clone()).then(|| NotifyingApp {
                path,
                rules_path: format!("{RULES_PATH}/{child}/"),
                app,
            })
        })
        .collect();
    apps.sort_by_cached_key(|entry| entry.app.name.to_lowercase());
    apps
}

pub fn register(window: SabineWindow, _events: &Events) -> SabineWindow {
    window.command("notifications_apps", |_: Value| Ok(notifying_apps()))
}
