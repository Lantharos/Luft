mod icons;

use gio::prelude::*;
use serde::Serialize;

#[derive(Serialize, Clone)]
pub struct App {
    pub id: String,
    pub name: String,
    pub icon: Option<String>,
}

impl App {
    pub fn from_info(info: &impl IsA<gio::AppInfo>) -> Option<Self> {
        Some(Self {
            id: info.id()?.to_string(),
            name: info.name().to_string(),
            icon: info.icon().and_then(|icon| icon_path(&icon)),
        })
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
