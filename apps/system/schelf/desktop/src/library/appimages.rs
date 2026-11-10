use luft_software::apps::appimage;
use luft_software::apps::flatpak::Permissions;
use serde::{Deserialize, Serialize};
use specta::Type;

use super::{InstalledApp, Source};
use crate::store::listing::Format;
use crate::store::record;

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

#[derive(Deserialize, Clone, Copy, Type)]
#[serde(rename_all = "camelCase")]
pub enum Switch {
    Downloads,
    X11,
    Microphone,
    Camera,
}

#[derive(Deserialize, Type)]
pub struct Change {
    id: String,
    switch: Switch,
    on: bool,
}

/// Turns one switch of an AppImage's sandbox on or off, and says whether
/// the app is open, since it keeps what it started with until it opens again.
pub async fn set_switch(Change { id, switch, on }: Change) -> Result<bool, String> {
    let switch = match switch {
        Switch::Downloads => appimage::Switch::Downloads,
        Switch::X11 => appimage::Switch::X11,
        Switch::Microphone => appimage::Switch::Microphone,
        Switch::Camera => appimage::Switch::Camera,
    };
    appimage::set_switch(&id, switch, on).await?;
    luft_sandbox::running(&id)
}

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
