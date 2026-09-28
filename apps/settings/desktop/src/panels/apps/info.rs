use gio::prelude::*;
use serde::Serialize;

use super::icons;

#[derive(Serialize, Clone)]
pub struct App {
    pub id: String,
    pub name: String,
    pub icon: Option<String>,
}

impl App {
    pub fn new(id: String, info: &impl IsA<gio::AppInfo>) -> Self {
        Self {
            id,
            name: info.name().to_string(),
            icon: info.icon().and_then(|icon| icon_path(&icon)),
        }
    }

    pub fn from_info(info: &impl IsA<gio::AppInfo>) -> Option<Self> {
        Some(Self::new(info.id()?.to_string(), info))
    }

    pub fn by_id(id: &str) -> Option<Self> {
        Self::from_info(&gio_unix::DesktopAppInfo::new(id)?)
    }
}

pub fn icon_path(icon: &gio::Icon) -> Option<String> {
    let path = if let Some(themed) = icon.downcast_ref::<gio::ThemedIcon>() {
        themed.names().iter().find_map(|name| icons::lookup(name))
    } else {
        icon.downcast_ref::<gio::FileIcon>()?.file().path()
    };
    path.map(|path| path.to_string_lossy().into_owned())
}

pub fn sort_by_name(apps: &mut [App]) {
    apps.sort_by_cached_key(|app| app.name.to_lowercase());
}
