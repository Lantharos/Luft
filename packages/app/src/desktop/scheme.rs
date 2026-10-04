use serde::Serialize;
use zbus::zvariant::OwnedValue;

pub const SCHEME_CHANGED: &str = "appearance.scheme";

const NAMESPACE: &str = "org.freedesktop.appearance";
const KEY: &str = "color-scheme";
const PREFER_DARK: u32 = 1;

#[derive(Clone, Copy, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Scheme {
    Dark,
    Light,
}

impl Scheme {
    pub fn from_portal(value: OwnedValue) -> Option<Self> {
        let preference = u32::try_from(value).ok()?;
        Some(if preference == PREFER_DARK {
            Self::Dark
        } else {
            Self::Light
        })
    }

    pub fn current() -> Self {
        super::proxy()
            .ok()
            .and_then(|proxy| super::read(&proxy, NAMESPACE, KEY))
            .and_then(Self::from_portal)
            .unwrap_or(Self::Dark)
    }
}

pub fn changed(namespace: &str, key: &str) -> bool {
    namespace == NAMESPACE && key == KEY
}
