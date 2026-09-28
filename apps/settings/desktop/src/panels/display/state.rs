use std::collections::HashMap;

use luft_app::dbus;
use serde::Serialize;
use zbus::blocking::Proxy;
use zbus::zvariant::OwnedValue;

pub type Properties = HashMap<String, OwnedValue>;
pub type MonitorSpec = (String, String, String, String);
type ModeInfo = (String, i32, i32, f64, f64, Vec<f64>, Properties);
pub type MonitorInfo = (MonitorSpec, Vec<ModeInfo>, Properties);
type LogicalInfo = (i32, i32, f64, u32, bool, Vec<MonitorSpec>, Properties);
pub type CurrentState = (u32, Vec<MonitorInfo>, Vec<LogicalInfo>, Properties);

const LOGICAL_LAYOUT: u32 = 1;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Displays {
    serial: u32,
    monitors: Vec<Monitor>,
    logical: Vec<LogicalMonitor>,
    logical_layout: bool,
    global_scale: bool,
    night_light: bool,
    orientation_managed: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Monitor {
    connector: String,
    name: String,
    builtin: bool,
    modes: Vec<Mode>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Mode {
    id: String,
    width: i32,
    height: i32,
    refresh: f64,
    preferred_scale: f64,
    scales: Vec<f64>,
    preferred: bool,
    current: bool,
    variable: bool,
}

#[derive(Serialize)]
struct LogicalMonitor {
    x: i32,
    y: i32,
    scale: f64,
    transform: u32,
    primary: bool,
    monitors: Vec<String>,
}

pub fn proxy() -> Result<Proxy<'static>, String> {
    Proxy::new(
        dbus::session()?,
        "org.gnome.Mutter.DisplayConfig",
        "/org/gnome/Mutter/DisplayConfig",
        "org.gnome.Mutter.DisplayConfig",
    )
    .map_err(|error| error.to_string())
}

pub fn flag(properties: &Properties, key: &str) -> bool {
    properties
        .get(key)
        .and_then(|value| value.downcast_ref::<bool>().ok())
        .unwrap_or(false)
}

pub fn number(properties: &Properties, key: &str) -> Option<u32> {
    properties
        .get(key)
        .and_then(|value| value.downcast_ref::<u32>().ok())
}

fn text(properties: &Properties, key: &str) -> Option<String> {
    properties
        .get(key)
        .and_then(|value| value.downcast_ref::<String>().ok())
}

pub fn read(proxy: &Proxy) -> Result<CurrentState, String> {
    proxy
        .call("GetCurrentState", &())
        .map_err(|error| error.to_string())
}

fn mode((id, width, height, refresh, preferred_scale, scales, properties): ModeInfo) -> Mode {
    Mode {
        preferred: flag(&properties, "is-preferred"),
        current: flag(&properties, "is-current"),
        variable: text(&properties, "refresh-rate-mode").as_deref() == Some("variable"),
        id,
        width,
        height,
        refresh,
        preferred_scale,
        scales,
    }
}

fn monitor(((connector, vendor, product, _), modes, properties): MonitorInfo) -> Monitor {
    Monitor {
        name: text(&properties, "display-name").unwrap_or_else(|| format!("{vendor} {product}")),
        builtin: flag(&properties, "is-builtin"),
        modes: modes.into_iter().map(mode).collect(),
        connector,
    }
}

fn logical((x, y, scale, transform, primary, monitors, _): LogicalInfo) -> LogicalMonitor {
    LogicalMonitor {
        x,
        y,
        scale,
        transform,
        primary,
        monitors: monitors
            .into_iter()
            .map(|(connector, ..)| connector)
            .collect(),
    }
}

pub fn current() -> Result<Displays, String> {
    let proxy = proxy()?;
    let (serial, monitors, logical_monitors, properties) = read(&proxy)?;
    Ok(Displays {
        serial,
        monitors: monitors
            .into_iter()
            .filter(|(_, _, properties)| !flag(properties, "is-for-lease"))
            .map(monitor)
            .collect(),
        logical: logical_monitors.into_iter().map(logical).collect(),
        logical_layout: number(&properties, "layout-mode") == Some(LOGICAL_LAYOUT),
        global_scale: flag(&properties, "global-scale-required"),
        night_light: proxy.get_property("NightLightSupported").unwrap_or(false),
        orientation_managed: proxy
            .get_property("PanelOrientationManaged")
            .unwrap_or(false),
    })
}
