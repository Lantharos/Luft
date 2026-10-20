use luft_software::flatpak;
use luft_software::system::System;
use serde::Deserialize;
use tokio::task::spawn_blocking;

#[derive(Deserialize)]
pub struct App {
    id: String,
}

#[derive(Deserialize)]
pub struct Change {
    pub id: String,
    pub on: bool,
}

pub fn offered() -> bool {
    System::current() == System::Image
}

pub fn has(App { id }: App) -> Result<bool, String> {
    Ok(offered() && flatpak::has_full_access(&id))
}

/// Trusts the app on this computer first, which asks for an administrator's password, then opens
/// its sandbox for this account. Taking it away goes the same way, so a refused password changes
/// nothing.
pub async fn set(id: String, on: bool) -> Result<(), String> {
    if !offered() {
        return Err("Full access is for Flatpak apps on Luft.".to_owned());
    }
    flatpak::set_trusted(&id, on).await?;
    spawn_blocking(move || {
        if on {
            flatpak::open_sandbox(&id)
        } else {
            flatpak::reset_sandbox(&id)
        }
    })
    .await
    .map_err(|error| error.to_string())?
}
