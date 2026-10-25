pub mod corners;
pub mod motion;
pub mod palette;
pub mod typography;

use futures_util::StreamExt;
use zbus::{OwnedVariant, Proxy};

use crate::bridge::events::Events;
use crate::dbus;

async fn proxy() -> Result<Proxy<'static>, String> {
    Proxy::new(
        dbus::session().await?,
        "org.freedesktop.portal.Desktop",
        "/org/freedesktop/portal/desktop",
        "org.freedesktop.portal.Settings",
    )
    .await
    .map_err(dbus::failed)
}

async fn read(proxy: &Proxy<'_>, namespace: &str, key: &str) -> Option<OwnedVariant> {
    proxy.call("ReadOne", &(namespace, key)).await.ok()
}

pub async fn watch(events: Events) {
    let Ok(proxy) = proxy().await else {
        return;
    };
    let Ok(mut signals) = proxy.receive_signal("SettingChanged").await else {
        return;
    };
    // The page read its corners before this subscribed, so a change in between reaches it here
    let corners = corners::Corners::read(&proxy).await;
    events.set_square_corners(corners == corners::Corners::Square);
    events.emit(corners::CORNERS_CHANGED, corners);
    while let Some(signal) = signals.next().await {
        let Ok((namespace, key, _)) = signal
            .body()
            .deserialize::<(String, String, OwnedVariant)>()
        else {
            continue;
        };
        if typography::changed(&namespace, &key) {
            events.emit(
                typography::TYPOGRAPHY_CHANGED,
                typography::Typography::read(&proxy).await,
            );
        }
        if motion::changed(&namespace, &key) {
            events.emit(motion::MOTION_CHANGED, motion::Motion::read(&proxy).await);
        }
        if corners::changed(&namespace, &key) {
            let corners = corners::Corners::read(&proxy).await;
            events.set_square_corners(corners == corners::Corners::Square);
            events.emit(corners::CORNERS_CHANGED, corners);
        }
    }
}
