use sabine::BridgeEvent;
use serde::Serialize;
use specta::Type;
use zbus::{OwnedVariant, Proxy};

pub const LINES_CHANGED: BridgeEvent<Lines> = BridgeEvent::new("appearance.lines");

const KESTREL: &str = "com.lantharos.kestrel";
const LINES: &str = "app-lines";

#[derive(Clone, Copy, Default, PartialEq, Serialize, Type)]
#[serde(rename_all = "lowercase")]
pub enum Lines {
    #[default]
    None,
    #[serde(rename = "lines")]
    Rule,
    Scanlines,
}

impl Lines {
    pub async fn read(proxy: &Proxy<'_>) -> Self {
        let style = super::read(proxy, KESTREL, LINES)
            .await
            .and_then(|value: OwnedVariant| String::try_from(value).ok());
        match style.as_deref() {
            Some("lines") => Self::Rule,
            Some("scanlines") => Self::Scanlines,
            _ => Self::None,
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
    namespace == KESTREL && key == LINES
}
