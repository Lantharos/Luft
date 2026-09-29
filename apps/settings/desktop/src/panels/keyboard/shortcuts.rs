use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

use serde::Serialize;

const SCHEMAS: [&str; 5] = [
    "org.gnome.desktop.wm.keybindings",
    "com.lantharos.kestrel.keybindings",
    "org.gnome.mutter.keybindings",
    "org.gnome.mutter.wayland.keybindings",
    "org.gnome.settings-daemon.plugins.media-keys",
];
const KESTREL: &str = "com.lantharos.kestrel.keybindings";
const DESCRIPTIONS: &str = "gnome-control-center/keybindings";

#[derive(Serialize, Clone, Copy)]
#[serde(rename_all = "lowercase")]
enum Category {
    System,
    Windows,
    Workspaces,
    Screenshots,
    Media,
}

#[derive(Serialize)]
pub struct Shortcut {
    schema: String,
    key: String,
    name: String,
    category: Category,
    defaults: Vec<String>,
}

struct Description {
    name: String,
    group: String,
    hidden: bool,
}

type Descriptions = HashMap<(String, String), Description>;

fn data_directories() -> Vec<PathBuf> {
    let mut directories: Vec<PathBuf> = dirs::data_dir().into_iter().collect();
    directories.extend(
        std::env::var("XDG_DATA_DIRS")
            .unwrap_or_else(|_| "/usr/local/share:/usr/share".into())
            .split(':')
            .map(PathBuf::from),
    );
    directories
}

fn describe(xml: &str, descriptions: &mut Descriptions) {
    let Ok(document) = roxmltree::Document::parse(xml) else {
        return;
    };
    let root = document.root_element();
    let group = root.attribute("name").unwrap_or_default();
    for entry in root
        .children()
        .filter(|node| node.has_tag_name("KeyListEntry"))
    {
        let (Some(key), Some(name)) = (entry.attribute("name"), entry.attribute("description"))
        else {
            continue;
        };
        let Some(schema) = entry.attribute("schema").or(root.attribute("schema")) else {
            continue;
        };
        descriptions
            .entry((schema.to_owned(), key.to_owned()))
            .or_insert_with(|| Description {
                name: name.to_owned(),
                group: group.to_owned(),
                hidden: entry.attribute("hidden") == Some("true"),
            });
    }
}

fn descriptions() -> Descriptions {
    let mut descriptions = Descriptions::new();
    for directory in data_directories() {
        let Ok(entries) = fs::read_dir(directory.join(DESCRIPTIONS)) else {
            continue;
        };
        let mut files: Vec<PathBuf> = entries.flatten().map(|entry| entry.path()).collect();
        files.sort();
        for file in files {
            if let Ok(xml) = fs::read_to_string(file) {
                describe(&xml, &mut descriptions);
            }
        }
    }
    descriptions
}

fn category(key: &str, group: &str) -> Category {
    if key.contains("workspace") {
        return Category::Workspaces;
    }
    if key.contains("screenshot") || key.contains("screen-recording") || group == "Screenshots" {
        return Category::Screenshots;
    }
    if key.contains("brightness") || group == "Sound and Media" {
        return Category::Media;
    }
    if key.contains("tiled") || key == "snap-layouts" || matches!(group, "Navigation" | "Windows") {
        return Category::Windows;
    }
    Category::System
}

fn summary(key: &gio::SettingsSchemaKey) -> Option<String> {
    let summary = key.summary()?;
    let summary = summary.trim().trim_end_matches('.');
    (!summary.is_empty()).then(|| summary.to_owned())
}

fn shortcut(
    schema: &gio::SettingsSchema,
    key: &str,
    descriptions: &Descriptions,
) -> Option<Shortcut> {
    let schema_id = schema.id().to_string();
    let settings_key = schema.key(key);
    if settings_key.value_type().as_str() != "as" {
        return None;
    }
    let (name, group) = match descriptions.get(&(schema_id.clone(), key.to_owned())) {
        Some(description) if description.hidden => return None,
        Some(description) => (description.name.clone(), description.group.as_str()),
        None if schema_id == KESTREL => (summary(&settings_key)?, ""),
        None => return None,
    };
    Some(Shortcut {
        category: category(key, group),
        defaults: settings_key.default_value().get().unwrap_or_default(),
        key: key.to_owned(),
        schema: schema_id,
        name,
    })
}

pub fn all() -> Vec<Shortcut> {
    let Some(source) = gio::SettingsSchemaSource::default() else {
        return Vec::new();
    };
    let descriptions = descriptions();
    SCHEMAS
        .iter()
        .filter_map(|id| source.lookup(id, true))
        .flat_map(|schema| {
            schema
                .list_keys()
                .iter()
                .filter_map(|key| shortcut(&schema, key, &descriptions))
                .collect::<Vec<_>>()
        })
        .collect()
}
