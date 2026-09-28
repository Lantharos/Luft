use std::collections::HashSet;

use gio::prelude::*;
use sabine::SabineWindow;
use serde::Serialize;
use serde_json::Value;

use super::apps::info::App;
use crate::bridge::Commands;
use crate::events::Events;

const SCHEMA: &str = "org.gnome.desktop.notifications";
const APPLICATION_SCHEMA: &str = "org.gnome.desktop.notifications.application";
const APPLICATION_PATH: &str = "/org/gnome/desktop/notifications/application";

#[derive(Serialize)]
struct NotifyingApp {
    path: String,
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
            seen.insert(app.id.clone())
                .then_some(NotifyingApp { path, app })
        })
        .collect();
    apps.sort_by_cached_key(|entry| entry.app.name.to_lowercase());
    apps
}

pub fn register(window: SabineWindow, _events: &Events) -> SabineWindow {
    window.command("notifications_apps", |_: Value| Ok(notifying_apps()))
}
