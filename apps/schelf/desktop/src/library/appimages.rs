use luft_software::apps::appimage;
use luft_software::apps::flatpak::Permissions;
use serde::{Deserialize, Serialize};
use specta::Type;

use super::{InstalledApp, Source};

#[derive(Deserialize, Type)]
pub struct App {
    id: String,
}

/// What an installed AppImage's sandbox opens to it, and why it asked to run
/// without one, if it did.
#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Sandbox {
    permissions: Permissions,
    unsandboxed: Option<String>,
}

pub async fn sandbox(App { id }: App) -> Result<Sandbox, String> {
    let app = appimage::find(&id)?;
    let unsandboxed = appimage::inspect(&app.path)
        .ok()
        .and_then(|bundle| bundle.declaration)
        .and_then(|declaration| declaration.unsandboxed);
    Ok(Sandbox {
        permissions: appimage::granted(&id).await?,
        unsandboxed,
    })
}

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
            commands: Vec::new(),
            services: Vec::new(),
            id: app.id,
        })
        .collect()
}
