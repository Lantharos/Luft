use std::collections::HashMap;

use futures_util::StreamExt;
use sabine::BridgeEvent;
use serde::de::{IntoDeserializer, value};
use serde::{Deserialize, Serialize};
use specta::datatype::DataType;
use specta::{Type, Types};
use zbus::Proxy;
use zbus::fdo::PropertiesProxy;

use crate::bridge::events::Events;
use crate::dbus;

pub const PALETTE_CHANGED: BridgeEvent<Palette> = BridgeEvent::new("kestrel.palette");

const DESTINATION: &str = "com.lantharos.Kestrel";
const PATH: &str = "/com/lantharos/Kestrel/Appearance";
const INTERFACE: &str = "com.lantharos.Kestrel.Appearance";

#[derive(Serialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Palette {
    accent: String,
    wallpaper_accent: String,
    pure_black: bool,
    colors: SchemeColors,
    terminal: SchemeColors,
    app_icons: AppIcons,
    taskbar: TaskbarLooks,
}

#[derive(Serialize)]
#[serde(transparent)]
pub struct TaskbarLooks(serde_json::Value);

impl Type for TaskbarLooks {
    fn definition(_: &mut Types) -> DataType {
        DataType::Reference(specta_typescript::define(
            "import(\"@luft/ui\").TaskbarLooks",
        ))
    }
}

#[derive(Deserialize, Serialize, Type)]
#[serde(rename_all = "lowercase")]
pub enum AppIconStyle {
    Default,
    Tinted,
    Clear,
}

#[derive(Serialize, Type)]
pub struct AppIcons {
    style: AppIconStyle,
    glyphs: String,
    tinted: IconPaint,
    clear: IconPaint,
}

#[derive(Serialize, Type)]
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
            style: AppIconStyle::deserialize(IntoDeserializer::<value::Error>::into_deserializer(
                map.remove("style")?,
            ))
            .ok()?,
            glyphs: map.remove("glyphs")?,
        })
    }
}

#[derive(Serialize, Type)]
pub struct SchemeColors {
    light: HashMap<String, String>,
    dark: HashMap<String, String>,
}

impl SchemeColors {
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
        colors: SchemeColors::read(&proxy, "Colors").await?,
        terminal: SchemeColors::read(&proxy, "TerminalColors").await?,
        app_icons: AppIcons::from_map(proxy.get_property("AppIcons").await.ok()?)?,
        taskbar: TaskbarLooks(
            serde_json::from_str(&proxy.get_property::<String>("Taskbar").await.ok()?).ok()?,
        ),
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
