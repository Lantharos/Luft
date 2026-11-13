use std::time::{SystemTime, UNIX_EPOCH};

use luft_app::apps::App;
use luft_app::{Commands, Empty};
use sabine::SabineWindow;
use schelf_core::library::Source;
use schelf_core::updates::{self, AppUpdate};
use serde::Serialize;
use specta::Type;

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
struct Updates {
    apps: Vec<AppUpdate>,
    checked: u64,
    failed: Vec<String>,
}

/// Flatpak apps by the name and icon their menu entries give them.
fn named(mut apps: Vec<AppUpdate>) -> Vec<AppUpdate> {
    for update in &mut apps {
        if update.source == Source::Flatpak
            && let Some(app) = update.desktop.as_deref().and_then(App::by_id)
        {
            update.name = app.name;
            update.icon = app.icon;
        }
    }
    apps.sort_by_cached_key(|update| (update.platform, update.name.to_lowercase()));
    apps
}

async fn check(Empty {}: Empty) -> Result<Updates, String> {
    let (apps, failed) = updates::find().await;
    Ok(Updates {
        apps: named(apps),
        checked: SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .map_or(0, |time| time.as_secs()),
        failed,
    })
}

pub fn register(window: SabineWindow) -> SabineWindow {
    window.command_async("updates_check", check)
}
