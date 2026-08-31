use super::model::WebShellSurface;
use serde_json::{Map, Value};

const PANEL_FIELDS: &[&str] = &["time", "date", "windows", "panelApps", "status", "tray"];
const PANEL_MENU_FIELDS: &[&str] = &["windows", "panelApps", "panelMenuCommand"];
const QUICK_SETTINGS_FIELDS: &[&str] = &[
    "userProfileIconUri",
    "status",
    "doNotDisturb",
    "notifications",
];
const DATE_CENTER_FIELDS: &[&str] = &[
    "outputHeight",
    "time",
    "date",
    "doNotDisturb",
    "notifications",
];
const NOTIFICATION_TOAST_FIELDS: &[&str] = &["toastNotifications"];
const START_MENU_FIELDS: &[&str] = &["workspaces", "windows", "applications", "doNotDisturb"];

pub(super) fn project(snapshot: &Value, surface: WebShellSurface) -> Value {
    let mut payload = Map::new();
    payload.insert(
        "surface".to_string(),
        Value::String(surface.as_str().to_string()),
    );

    let Some(source) = snapshot.as_object() else {
        return Value::Object(payload);
    };
    copy_field(source, &mut payload, "palette");
    for field in fields(surface) {
        copy_field(source, &mut payload, field);
    }
    Value::Object(payload)
}

fn fields(surface: WebShellSurface) -> &'static [&'static str] {
    match surface {
        WebShellSurface::Panel => PANEL_FIELDS,
        WebShellSurface::PanelMenu => PANEL_MENU_FIELDS,
        WebShellSurface::SessionMenu => &[],
        WebShellSurface::QuickSettings => QUICK_SETTINGS_FIELDS,
        WebShellSurface::DateCenter => DATE_CENTER_FIELDS,
        WebShellSurface::NotificationToast => NOTIFICATION_TOAST_FIELDS,
        WebShellSurface::StartMenu => START_MENU_FIELDS,
    }
}

fn copy_field(source: &Map<String, Value>, target: &mut Map<String, Value>, field: &str) {
    if let Some(value) = source.get(field) {
        target.insert(field.to_string(), value.clone());
    }
}
