use serde::Serialize;
use zbus::blocking::Proxy;
use zbus::zvariant::OwnedValue;

use crate::dbus;
use crate::events::Events;

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
    fn from_portal(value: OwnedValue) -> Option<Self> {
        let preference = u32::try_from(value).ok()?;
        Some(if preference == PREFER_DARK {
            Self::Dark
        } else {
            Self::Light
        })
    }
}

fn proxy() -> Result<Proxy<'static>, String> {
    Proxy::new(
        dbus::session()?,
        "org.freedesktop.portal.Desktop",
        "/org/freedesktop/portal/desktop",
        "org.freedesktop.portal.Settings",
    )
    .map_err(|error| error.to_string())
}

pub fn current() -> Scheme {
    proxy()
        .ok()
        .and_then(|proxy| proxy.call("ReadOne", &(NAMESPACE, KEY)).ok())
        .and_then(Scheme::from_portal)
        .unwrap_or(Scheme::Dark)
}

pub fn watch(events: Events) {
    std::thread::spawn(move || {
        let Ok(signals) = proxy().and_then(|proxy| {
            proxy
                .receive_signal("SettingChanged")
                .map_err(|error| error.to_string())
        }) else {
            return;
        };
        for signal in signals {
            let Ok((namespace, key, value)) =
                signal.body().deserialize::<(String, String, OwnedValue)>()
            else {
                continue;
            };
            if namespace == NAMESPACE
                && key == KEY
                && let Some(scheme) = Scheme::from_portal(value)
            {
                events.emit(SCHEME_CHANGED, scheme);
            }
        }
    });
}
