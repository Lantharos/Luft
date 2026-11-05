use std::path::Path;

use luft_app::dbus;
use serde::Deserialize;
use specta::Type;
use zbus::Proxy;

const KESTREL: &str = "com.lantharos.Kestrel";
const SOUNDS_PATH: &str = "/com/lantharos/Kestrel/Sounds";
const SOUNDS: &str = "com.lantharos.Kestrel.Sounds";

#[derive(Deserialize, Type)]
pub struct Sound {
    name: String,
}

pub enum Verdict {
    Playable,
    TooLong,
    Unplayable,
}

async fn sounds() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::session().await?, KESTREL, SOUNDS_PATH, SOUNDS)
        .await
        .map_err(dbus::failed)
}

async fn call(method: &str, Sound { name }: Sound) -> Result<(), String> {
    sounds()
        .await?
        .call::<_, _, ()>(method, &(name,))
        .await
        .map_err(dbus::failed)
}

pub async fn check(path: &Path) -> Result<Verdict, String> {
    let verdict: String = sounds()
        .await?
        .call("Check", &(path.to_string_lossy(),))
        .await
        .map_err(dbus::failed)?;
    Ok(match verdict.as_str() {
        "playable" => Verdict::Playable,
        "too-long" => Verdict::TooLong,
        _ => Verdict::Unplayable,
    })
}

pub async fn preview(sound: Sound) -> Result<(), String> {
    call("Preview", sound).await
}

pub async fn play(sound: Sound) -> Result<(), String> {
    call("Play", sound).await
}
