use std::collections::HashMap;

use serde::Serialize;
use zbus::blocking::Proxy;
use zbus::blocking::fdo::PropertiesProxy;

use crate::dbus;
use crate::events::Events;

pub const PALETTE_CHANGED: &str = "kestrel.palette";

const DESTINATION: &str = "dev.lantharos.Kestrel";
const PATH: &str = "/dev/lantharos/Kestrel/Appearance";
const INTERFACE: &str = "dev.lantharos.Kestrel.Appearance";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Palette {
    accent: String,
    pure_black: bool,
    colors: HashMap<String, String>,
}

pub fn palette() -> Option<Palette> {
    let proxy = Proxy::new(dbus::session().ok()?, DESTINATION, PATH, INTERFACE).ok()?;
    let accent = proxy.get_property::<String>("AccentColor").ok()?;
    (!accent.is_empty()).then_some(())?;
    Some(Palette {
        accent,
        pure_black: proxy.get_property("PureBlack").ok()?,
        colors: proxy.get_property("Colors").ok()?,
    })
}

fn properties() -> zbus::Result<PropertiesProxy<'static>> {
    PropertiesProxy::builder(dbus::session().map_err(zbus::Error::Failure)?)
        .destination(DESTINATION)?
        .path(PATH)?
        .build()
}

pub fn watch_palette(events: Events) {
    std::thread::spawn(move || {
        let Ok(changes) = properties().and_then(|proxy| proxy.receive_properties_changed()) else {
            return;
        };
        for _ in changes {
            if let Some(palette) = palette() {
                events.emit(PALETTE_CHANGED, palette);
            }
        }
    });
}
