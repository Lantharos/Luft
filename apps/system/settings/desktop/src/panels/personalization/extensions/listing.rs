use serde::{Deserialize, Serialize};
use zbus::{DeserializeDict, OwnedVariant, Type, Variant};

#[derive(Deserialize, Serialize, Clone, specta::Type)]
#[serde(untagged)]
pub enum ExtensionSettingValue {
    Switch(bool),
    Number(f64),
    Text(String),
    Options(Vec<String>),
}

impl From<ExtensionSettingValue> for Variant<'static> {
    fn from(value: ExtensionSettingValue) -> Self {
        match value {
            ExtensionSettingValue::Switch(on) => Variant::Bool(on),
            ExtensionSettingValue::Number(number) => Variant::F64(number),
            ExtensionSettingValue::Text(text) => Variant::from(text),
            ExtensionSettingValue::Options(options) => Variant::from(options),
        }
    }
}

fn setting_value(value: &OwnedVariant) -> Option<ExtensionSettingValue> {
    match &**value {
        Variant::Bool(on) => Some(ExtensionSettingValue::Switch(*on)),
        Variant::F64(number) => Some(ExtensionSettingValue::Number(*number)),
        Variant::Str(text) => Some(ExtensionSettingValue::Text(text.to_string())),
        Variant::Array(_) => <Vec<String>>::try_from(value.try_clone().ok()?)
            .ok()
            .map(ExtensionSettingValue::Options),
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
    hidden: Option<bool>,
    when: Option<Vec<OwnedVariant>>,
    #[zbus(rename = "when-min")]
    when_min: Option<f64>,
    #[zbus(rename = "when-max")]
    when_max: Option<f64>,
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
    path: String,
    origin: String,
    ignored: Vec<String>,
    luft: Option<String>,
    enabled: bool,
    state: String,
    problem: String,
    permissions: Option<Vec<String>>,
    network: Option<Vec<String>>,
    listen: Option<Vec<(u16, String)>>,
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
    hidden: bool,
    when: Vec<ExtensionSettingValue>,
    when_min: Option<f64>,
    when_max: Option<f64>,
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
    path: String,
    /// Where it comes from: `store`, `store-sandboxed`, `copy`, `development`,
    /// `folder` or `own`.
    origin: String,
    /// Copies of it elsewhere that are left alone.
    ignored: Vec<String>,
    /// The oldest version of Luft it runs on.
    luft: String,
    enabled: bool,
    state: String,
    problem: String,
    permissions: Vec<String>,
    network: Vec<String>,
    listen: Vec<u16>,
    settings: Vec<ExtensionSetting>,
    shortcuts: Vec<ExtensionShortcut>,
    page: bool,
}

fn ports(listen: Vec<(u16, String)>) -> Vec<u16> {
    let mut ports: Vec<u16> = listen.into_iter().map(|(port, _)| port).collect();
    ports.sort_unstable();
    ports.dedup();
    ports
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
        hidden: listed.hidden.unwrap_or_default(),
        when: listed
            .when
            .unwrap_or_default()
            .iter()
            .filter_map(setting_value)
            .collect(),
        when_min: listed.when_min,
        when_max: listed.when_max,
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
            path: listed.path,
            origin: listed.origin,
            ignored: listed.ignored,
            luft: listed.luft.unwrap_or_default(),
            enabled: listed.enabled,
            state: listed.state,
            problem: listed.problem,
            permissions: listed.permissions.unwrap_or_default(),
            network: listed.network.unwrap_or_default(),
            listen: ports(listed.listen.unwrap_or_default()),
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
