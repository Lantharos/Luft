use luft_software::apps::flatpak;
use luft_software::system::System;
use serde::Deserialize;

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

pub async fn has(App { id }: App) -> Result<bool, String> {
    Ok(offered() && flatpak::has_full_access(&id).await)
}

pub async fn set(id: String, on: bool) -> Result<(), String> {
    if !offered() {
        return Err("Full access is for Flatpak apps on Luft.".to_owned());
    }
    flatpak::set_full_access(&id, on).await
}
