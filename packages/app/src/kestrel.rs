use std::collections::HashMap;

use serde::Serialize;
use zbus::blocking::Proxy;
use zbus::blocking::fdo::PropertiesProxy;

use crate::dbus;
use crate::events::Events;

pub const PALETTE_CHANGED: &str = "kestrel.palette";

const DESTINATION: &str = "com.lantharos.Kestrel";
const PATH: &str = "/com/lantharos/Kestrel/Appearance";
const INTERFACE: &str = "com.lantharos.Kestrel.Appearance";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Palette {
    accent: String,
    pure_black: bool,
    colors: HashMap<String, String>,
    terminal: TerminalColors,
    app_icons: AppIcons,
}

#[derive(Serialize)]
pub struct AppIcons {
    style: String,
    glyphs: String,
    tinted: IconPaint,
    clear: IconPaint,
}

#[derive(Serialize)]
pub struct IconPaint {
    plate: String,
    ink: String,
    shade: String,
    rim: f64,
}

impl AppIcons {
    fn from_map(mut map: HashMap<String, String>) -> Option<Self> {
        let mut paint = |style: &str| {
            Some(IconPaint {
                plate: map.remove(&format!("{style}-plate"))?,
                ink: map.remove(&format!("{style}-ink"))?,
                shade: map.remove(&format!("{style}-shade"))?,
                rim: map.remove(&format!("{style}-rim"))?.parse().ok()?,
            })
        };
        Some(Self {
            tinted: paint("tinted")?,
            clear: paint("clear")?,
            style: map.remove("style")?,
            glyphs: map.remove("glyphs")?,
        })
    }
}

#[derive(Serialize)]
pub struct TerminalColors {
    light: HashMap<String, String>,
    dark: HashMap<String, String>,
}

pub fn palette() -> Option<Palette> {
    let proxy = Proxy::new(dbus::session().ok()?, DESTINATION, PATH, INTERFACE).ok()?;
    let accent = proxy.get_property::<String>("AccentColor").ok()?;
    (!accent.is_empty()).then_some(())?;
    Some(Palette {
        accent,
        pure_black: proxy.get_property("PureBlack").ok()?,
        colors: proxy.get_property("Colors").ok()?,
        terminal: TerminalColors {
            light: proxy.get_property("LightTerminalColors").ok()?,
            dark: proxy.get_property("DarkTerminalColors").ok()?,
        },
        app_icons: AppIcons::from_map(proxy.get_property("AppIcons").ok()?)?,
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
