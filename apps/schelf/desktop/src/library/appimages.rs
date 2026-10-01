use luft_software::appimage;

use super::{InstalledApp, Source};

pub fn installed() -> Vec<InstalledApp> {
    appimage::list()
        .into_iter()
        .map(|app| InstalledApp {
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
            id: app.id,
        })
        .collect()
}
