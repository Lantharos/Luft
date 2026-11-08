use sabine::BridgeEvent;
use serde::Serialize;
use specta::Type;
use zbus::{OwnedVariant, Proxy};

pub const POSTURE_CHANGED: BridgeEvent<Posture> = BridgeEvent::new("appearance.posture");

const KESTREL: &str = "com.lantharos.kestrel";
const TABLET_MODE: &str = "tablet-mode";

/// Whether the computer is used as a laptop or folded into a tablet.
#[derive(Clone, Copy, Default, PartialEq, Serialize, Type)]
#[serde(rename_all = "lowercase")]
pub enum Posture {
    #[default]
    Laptop,
    Tablet,
}

impl Posture {
    pub async fn read(proxy: &Proxy<'_>) -> Self {
        let tablet = super::read(proxy, KESTREL, TABLET_MODE)
            .await
            .and_then(|value: OwnedVariant| bool::try_from(value).ok())
            .unwrap_or(false);
        if tablet { Self::Tablet } else { Self::Laptop }
    }

    pub async fn current() -> Self {
        match super::proxy().await {
            Ok(proxy) => Self::read(&proxy).await,
            Err(_) => Self::default(),
        }
    }
}

pub fn changed(namespace: &str, key: &str) -> bool {
    namespace == KESTREL && key == TABLET_MODE
}
