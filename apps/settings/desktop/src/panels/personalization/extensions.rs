use std::sync::Once;

use futures_util::StreamExt;
use luft_app::{Commands, Empty, Events, dbus};
use sabine::{BridgeEvent, SabineWindow};
use serde::{Deserialize, Serialize};
use zbus::{DeserializeDict, OwnedVariant, Proxy, Type, Variant};

const KESTREL: &str = "com.lantharos.Kestrel";
const PATH: &str = "/com/lantharos/Kestrel/Extensions";
const INTERFACE: &str = "com.lantharos.Kestrel.Extensions";

const CHANGED: BridgeEvent<Vec<Extension>> = BridgeEvent::new("extensions.changed");

static WATCH: Once = Once::new();

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
}

#[derive(DeserializeDict, Type)]
#[zbus(signature = "a{sv}")]
struct Listed {
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
    })
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
        }
    }
}

async fn proxy() -> Result<Proxy<'static>, String> {
    Proxy::new(dbus::session().await?, KESTREL, PATH, INTERFACE)
        .await
        .map_err(dbus::failed)
}

async fn list() -> Result<Vec<Extension>, String> {
    let listed: Vec<Listed> = proxy()
        .await?
        .call("List", &())
        .await
        .map_err(dbus::failed)?;
    Ok(listed.into_iter().map(Extension::from).collect())
}

async fn watch(events: Events) {
    let Ok(proxy) = proxy().await else {
        return;
    };
    let Ok(mut changes) = proxy.receive_signal("ExtensionsChanged").await else {
        return;
    };
    while changes.next().await.is_some() {
        if let Ok(extensions) = list().await {
            events.emit(CHANGED, extensions);
        }
    }
}

async fn extensions(events: Events, Empty {}: Empty) -> Result<Vec<Extension>, String> {
    WATCH.call_once(|| {
        luft_app::spawn(watch(events));
    });
    list().await
}

#[derive(Deserialize, specta::Type)]
struct ExtensionTarget {
    id: String,
}

async fn request(method: &str, ExtensionTarget { id }: ExtensionTarget) -> Result<(), String> {
    proxy()
        .await?
        .call::<_, _, ()>(method, &(id,))
        .await
        .map_err(dbus::failed)
}

#[derive(Deserialize, specta::Type)]
struct ExtensionSettingChange {
    id: String,
    key: String,
    value: ExtensionSettingValue,
}

async fn set(ExtensionSettingChange { id, key, value }: ExtensionSettingChange) -> Result<(), String> {
    proxy()
        .await?
        .call::<_, _, ()>("SetSetting", &(id, key, Variant::from(value)))
        .await
        .map_err(dbus::failed)
}

pub fn register(window: SabineWindow, events: &Events) -> SabineWindow {
    window
        .bridge_event(&CHANGED)
        .with_async("extensions", events, extensions)
        .command_async("extensions_enable", |target| request("Enable", target))
        .command_async("extensions_disable", |target| request("Disable", target))
        .command_async("extensions_remove", |target| request("Remove", target))
        .command_async("extensions_set", set)
}
