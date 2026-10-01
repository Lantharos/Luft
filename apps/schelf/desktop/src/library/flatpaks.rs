use gio::prelude::*;
use luft_app::apps::App;
use luft_software::flatpak;

use super::{InstalledApp, Source};

pub fn installed() -> Vec<InstalledApp> {
    flatpak::installed()
        .unwrap_or_default()
        .into_iter()
        .filter(|item| item.launchable)
        .map(|item| {
            let desktop = format!("{}.desktop", item.id);
            let info = gio_unix::DesktopAppInfo::from_filename(item.desktop_file());
            let app = info.as_ref().map(|info| App::new(desktop.clone(), info));
            InstalledApp {
                key: format!("flatpak/{}", item.reference),
                source: Source::Flatpak,
                summary: info
                    .as_ref()
                    .and_then(|info| info.description())
                    .map(|text| text.to_string()),
                name: app
                    .as_ref()
                    .map_or_else(|| item.name.clone(), |app| app.name.clone()),
                icon: app.and_then(|app| app.icon),
                desktop: Some(desktop),
                version: (!item.version.is_empty()).then(|| item.version.clone()),
                size: item.size,
                origin: item.origin,
                installation: Some(item.installation),
                reference: Some(item.reference),
                package: None,
                path: None,
                id: item.id,
            }
        })
        .collect()
}
