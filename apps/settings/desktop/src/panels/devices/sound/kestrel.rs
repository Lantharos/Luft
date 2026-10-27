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

async fn call(method: &str, Sound { name }: Sound) -> Result<(), String> {
    let sounds = Proxy::new(dbus::session().await?, KESTREL, SOUNDS_PATH, SOUNDS)
        .await
        .map_err(dbus::failed)?;
    sounds
        .call::<_, _, ()>(method, &(name,))
        .await
        .map_err(dbus::failed)
}

pub async fn preview(sound: Sound) -> Result<(), String> {
    call("Preview", sound).await
}

pub async fn play(sound: Sound) -> Result<(), String> {
    call("Play", sound).await
}
