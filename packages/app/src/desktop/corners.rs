use serde::Serialize;
use zbus::{OwnedVariant, Proxy};

pub const CORNERS_CHANGED: &str = "appearance.corners";

const KESTREL: &str = "com.lantharos.kestrel";
const ROUNDED: &str = "rounded-window-corners";

#[derive(Clone, Copy, Default, PartialEq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Corners {
    #[default]
    Rounded,
    Square,
}

impl Corners {
    pub async fn read(proxy: &Proxy<'_>) -> Self {
        let rounded = super::read(proxy, KESTREL, ROUNDED)
            .await
            .and_then(|value: OwnedVariant| bool::try_from(value).ok())
            .unwrap_or(true);
        if rounded { Self::Rounded } else { Self::Square }
    }

    pub async fn current() -> Self {
        match super::proxy().await {
            Ok(proxy) => Self::read(&proxy).await,
            Err(_) => Self::default(),
        }
    }
}

pub fn changed(namespace: &str, key: &str) -> bool {
    namespace == KESTREL && key == ROUNDED
}
