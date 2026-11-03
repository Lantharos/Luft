use serde::{Deserialize, Serialize};
use zbus::{DeserializeDict, OwnedVariant, Type, Variant};

#[derive(Deserialize, Serialize, Clone, specta::Type)]
#[serde(untagged)]
pub enum ExtensionSettingValue {
    Switch(bool),
    Number(f64),
    Text(String),
}

impl From<ExtensionSettingValue> for Variant<'static> {
    fn from(value: ExtensionSettingValue) -> Self {
        match value {
            ExtensionSettingValue::Switch(on) => Variant::Bool(on),
            ExtensionSettingValue::Number(number) => Variant::F64(number),
            ExtensionSettingValue::Text(text) => Variant::from(text),
        }
    }
}

fn setting_value(value: &OwnedVariant) -> Option<ExtensionSettingValue> {
    match &**value {
        Variant::Bool(on) => Some(ExtensionSettingValue::Switch(*on)),
        Variant::F64(number) => Some(ExtensionSettingValue::Number(*number)),
        Variant::Str(text) => Some(ExtensionSettingValue::Text(text.to_string())),
        _ => None,
    }
}

#[derive(DeserializeDict, Type)]
#[zbus(signature = "a{sv}")]
struct ListedSetting {
    key: String,
    #[zbus(rename = "type")]
    kind: String,
    label: String,
    description: String,
    value: OwnedVariant,
    depends: Option<String>,
    options: Option<Vec<(String, String)>>,
    swatches: Option<Vec<(String, String)>>,
    min: Option<f64>,
    max: Option<f64>,
    step: Option<f64>,
    unit: Option<String>,
    page: Option<String>,
    images: Option<Vec<String>>,
}

#[derive(DeserializeDict, Type)]
#[zbus(signature = "a{sv}")]
struct ListedShortcut {
    key: String,
    label: String,
    accelerators: Vec<String>,
    default: String,
    changed: bool,
}

#[derive(DeserializeDict, Type)]
#[zbus(signature = "a{sv}")]
pub(super) struct Listed {
    id: String,
    name: String,
    description: Option<String>,
    version: Option<String>,
    enabled: bool,
    state: String,
    problem: String,
    permissions: Option<Vec<String>>,
    cpu: Option<f64>,
    memory: Option<u64>,
    settings: Option<Vec<ListedSetting>>,
    shortcuts: Option<Vec<ListedShortcut>>,
    page: Option<bool>,
}

#[derive(Serialize, specta::Type)]
pub struct ExtensionChoice {
    value: String,
    label: String,
}

#[derive(Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionSetting {
    key: String,
    kind: String,
    label: String,
    description: String,
    value: ExtensionSettingValue,
    depends: Option<String>,
    options: Vec<ExtensionChoice>,
    swatches: Vec<ExtensionChoice>,
    min: Option<f64>,
    max: Option<f64>,
    step: Option<f64>,
    unit: Option<String>,
    page: Option<String>,
    images: Vec<String>,
}

#[derive(Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct ExtensionShortcut {
    key: String,
    label: String,
    accelerators: Vec<String>,
    default: String,
    changed: bool,
}

#[derive(Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
pub struct Extension {
    id: String,
    name: String,
    description: String,
    version: String,
    enabled: bool,
    state: String,
    problem: String,
    permissions: Vec<String>,
    cpu: Option<f64>,
    memory: Option<u64>,
    settings: Vec<ExtensionSetting>,
    shortcuts: Vec<ExtensionShortcut>,
    page: bool,
}

fn choices(pairs: Option<Vec<(String, String)>>) -> Vec<ExtensionChoice> {
    pairs
        .unwrap_or_default()
        .into_iter()
        .map(|(value, label)| ExtensionChoice { value, label })
        .collect()
}

fn setting(listed: ListedSetting) -> Option<ExtensionSetting> {
    Some(ExtensionSetting {
        value: setting_value(&listed.value)?,
        key: listed.key,
        kind: listed.kind,
        label: listed.label,
        description: listed.description,
        depends: listed.depends,
        options: choices(listed.options),
        swatches: choices(listed.swatches),
        min: listed.min,
        max: listed.max,
        step: listed.step,
        unit: listed.unit,
        page: listed.page,
        images: listed.images.unwrap_or_default(),
    })
}

fn shortcut(listed: ListedShortcut) -> ExtensionShortcut {
    ExtensionShortcut {
        key: listed.key,
        label: listed.label,
        accelerators: listed.accelerators,
        default: listed.default,
        changed: listed.changed,
    }
}

impl From<Listed> for Extension {
    fn from(listed: Listed) -> Self {
        Extension {
            id: listed.id,
            name: listed.name,
            description: listed.description.unwrap_or_default(),
            version: listed.version.unwrap_or_default(),
            enabled: listed.enabled,
            state: listed.state,
            problem: listed.problem,
            permissions: listed.permissions.unwrap_or_default(),
            cpu: listed.cpu,
            memory: listed.memory,
            settings: listed
                .settings
                .unwrap_or_default()
                .into_iter()
                .filter_map(setting)
                .collect(),
            shortcuts: listed
                .shortcuts
                .unwrap_or_default()
                .into_iter()
                .map(shortcut)
                .collect(),
            page: listed.page.unwrap_or_default(),
        }
    }
}
