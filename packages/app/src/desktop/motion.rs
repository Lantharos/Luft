use sabine::BridgeEvent;
use serde::Serialize;
use specta::Type;
use zbus::{OwnedVariant, Proxy};

pub const MOTION_CHANGED: BridgeEvent<Motion> = BridgeEvent::new("appearance.motion");

const INTERFACE: &str = "org.gnome.desktop.interface";
const ANIMATIONS: &str = "enable-animations";
const APPEARANCE: &str = "org.freedesktop.appearance";
const REDUCED_MOTION: &str = "reduced-motion";

#[derive(Clone, Copy, Default, PartialEq, Serialize, Type)]
#[serde(rename_all = "lowercase")]
pub enum Motion {
    #[default]
    Full,
    Reduced,
    Off,
}

impl Motion {
    pub async fn read(proxy: &Proxy<'_>) -> Self {
        let animations = super::read(proxy, INTERFACE, ANIMATIONS)
            .await
            .and_then(|value: OwnedVariant| bool::try_from(value).ok())
            .unwrap_or(true);
        let reduced = super::read(proxy, APPEARANCE, REDUCED_MOTION)
            .await
            .and_then(|value: OwnedVariant| u32::try_from(value).ok())
            == Some(1);
        match (animations, reduced) {
            (false, _) => Self::Off,
            (true, true) => Self::Reduced,
            (true, false) => Self::Full,
        }
    }

    pub async fn current() -> Self {
        match super::proxy().await {
            Ok(proxy) => Self::read(&proxy).await,
            Err(_) => Self::default(),
        }
    }
}

pub fn changed(namespace: &str, key: &str) -> bool {
    (namespace == INTERFACE && key == ANIMATIONS)
        || (namespace == APPEARANCE && key == REDUCED_MOTION)
}
