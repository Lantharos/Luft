use luft_app::dbus;
use serde::Serialize;
use specta::Type;
use zbus::{OwnedVariant, Proxy};

#[derive(Serialize, Type)]
#[serde(rename_all = "lowercase")]
pub enum Hand {
    Right,
    Left,
}

pub async fn pen_hand() -> Result<Hand, String> {
    let proxy = Proxy::new(
        dbus::session().await?,
        "org.freedesktop.portal.Desktop",
        "/org/freedesktop/portal/desktop",
        "org.freedesktop.portal.Settings",
    )
    .await
    .map_err(dbus::failed)?;
    let hand = proxy
        .call::<_, _, OwnedVariant>("ReadOne", &("com.lantharos.kestrel", "pen-hand"))
        .await
        .ok()
        .and_then(|value| String::try_from(value).ok());
    Ok(match hand.as_deref() {
        Some("left") => Hand::Left,
        _ => Hand::Right,
    })
}
