use luft_software::apps::appimage;
use luft_software::apps::flatpak;
use luft_software::apps::flatpak::Permissions;
use schelf_core::library::{Source, full_access};
use serde::{Deserialize, Serialize};
use specta::Type;

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

#[derive(Deserialize, Type)]
pub struct Access {
    id: String,
    source: Source,
}

pub async fn has_full_access(Access { id, source }: Access) -> Result<bool, String> {
    Ok(full_access::offered(source) && flatpak::has_full_access(&id).await)
}

/// Changes full access, and says whether the app is open, since it keeps
/// running the way it started until it opens again.
pub async fn set_full_access(change: full_access::Change) -> Result<bool, String> {
    let (id, appimage) = (change.id.clone(), change.source == Source::AppImage);
    full_access::change(change).await?;
    if appimage {
        luft_sandbox::running(&id)
    } else {
        Ok(false)
    }
}

#[derive(Deserialize, Type)]
pub struct Restart {
    id: String,
    desktop: String,
    token: Option<String>,
}

pub async fn restart(Restart { id, desktop, token }: Restart) -> Result<(), String> {
    tokio::task::spawn_blocking(move || {
        luft_sandbox::quit(&id)?;
        super::launch_desktop(&desktop, token.as_deref())
    })
    .await
    .map_err(|error| error.to_string())?
}
