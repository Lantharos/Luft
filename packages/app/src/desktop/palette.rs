use std::collections::HashMap;

use futures_util::StreamExt;
use serde::Serialize;
use zbus::Proxy;
use zbus::fdo::PropertiesProxy;

use crate::bridge::events::Events;
use crate::dbus;

pub const PALETTE_CHANGED: &str = "kestrel.palette";

const DESTINATION: &str = "com.lantharos.Kestrel";
const PATH: &str = "/com/lantharos/Kestrel/Appearance";
const INTERFACE: &str = "com.lantharos.Kestrel.Appearance";

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Palette {
    accent: String,
    wallpaper_accent: String,
    pure_black: bool,
    colors: Schemes,
    terminal: Schemes,
    app_icons: AppIcons,
    taskbar: serde_json::Value,
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
pub struct Schemes {
    light: HashMap<String, String>,
    dark: HashMap<String, String>,
}

impl Schemes {
    async fn read(proxy: &Proxy<'_>, prefix: &str) -> Option<Self> {
        Some(Self {
            light: proxy.get_property(&format!("Light{prefix}")).await.ok()?,
            dark: proxy.get_property(&format!("Dark{prefix}")).await.ok()?,
        })
    }
}

pub async fn palette() -> Option<Palette> {
    let session = dbus::session().await.ok()?;
    let proxy = Proxy::new(session, DESTINATION, PATH, INTERFACE)
        .await
        .ok()?;
    let accent = proxy.get_property::<String>("AccentColor").await.ok()?;
    (!accent.is_empty()).then_some(())?;
    Some(Palette {
        accent,
        wallpaper_accent: proxy.get_property("WallpaperAccentColor").await.ok()?,
        pure_black: proxy.get_property("PureBlack").await.ok()?,
        colors: Schemes::read(&proxy, "Colors").await?,
        terminal: Schemes::read(&proxy, "TerminalColors").await?,
        app_icons: AppIcons::from_map(proxy.get_property("AppIcons").await.ok()?)?,
        taskbar: serde_json::from_str(&proxy.get_property::<String>("Taskbar").await.ok()?).ok()?,
    })
}

pub async fn watch_palette(events: Events) {
    let Ok(session) = dbus::session().await else {
        return;
    };
    let Ok(properties) = PropertiesProxy::builder(session)
        .destination(DESTINATION)
        .path(PATH)
        .build()
        .await
    else {
        return;
    };
    let Ok(mut changes) = properties.receive_properties_changed().await else {
        return;
    };
    while changes.next().await.is_some() {
        if let Some(palette) = palette().await {
            events.emit(PALETTE_CHANGED, palette);
        }
    }
}
