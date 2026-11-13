use luft_software::apps::appimage;

use super::{InstalledApp, Source};
use crate::store::listing::Format;
use crate::store::record;

pub fn installed() -> Vec<InstalledApp> {
    let from_store = record::all();
    appimage::list()
        .into_iter()
        .map(|app| InstalledApp {
            listing: from_store
                .iter()
                .find(|(_, installed)| {
                    installed.format == Format::Appimage && installed.local == app.id
                })
                .map(|(id, _)| id.clone()),
            key: format!("appimage/{}", app.id),
            source: Source::AppImage,
            desktop: Some(format!("{}.desktop", app.id)),
            name: app.name,
            summary: app.summary,
            icon: app.icon.map(|icon| icon.to_string_lossy().into_owned()),
            version: app.version,
            size: app.size,
            origin: app
                .path
                .parent()
                .map(|folder| folder.to_string_lossy().into_owned())
                .unwrap_or_default(),
            installation: None,
            reference: None,
            package: None,
            path: Some(app.path.to_string_lossy().into_owned()),
            commands: Vec::new(),
            services: Vec::new(),
            id: app.id,
        })
        .collect()
}
