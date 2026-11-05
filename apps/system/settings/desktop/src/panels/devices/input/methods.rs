use luft_app::{dbus, ibus};
use serde::Serialize;
use specta::Type;
use zbus::fdo::PropertiesProxy;
use zbus::names::InterfaceName;
use zbus::{OwnedVariant, Structure, Variant};

const DESTINATION: &str = "org.freedesktop.IBus";
const PATH: &str = "/org/freedesktop/IBus";
const XKB_PREFIX: &str = "xkb:";
const NAME: usize = 2;
const LONG_NAME: usize = 3;
const LANGUAGE: usize = 5;

#[derive(Serialize, Type)]
pub struct InputMethod {
    id: String,
    name: String,
    language: String,
}

fn text(structure: &Structure, index: usize) -> Option<String> {
    match structure.fields().get(index)? {
        Variant::Str(text) => Some(text.to_string()),
        _ => None,
    }
}

fn method(value: &Variant) -> Option<InputMethod> {
    let structure = match value {
        Variant::Variant(inner) => return method(inner),
        Variant::Structure(structure) => structure,
        _ => return None,
    };
    let id = text(structure, NAME)?;
    if id.starts_with(XKB_PREFIX) {
        return None;
    }
    Some(InputMethod {
        name: text(structure, LONG_NAME).unwrap_or_else(|| id.clone()),
        language: text(structure, LANGUAGE).unwrap_or_default(),
        id,
    })
}

async fn engines(properties: &PropertiesProxy<'_>, name: &str) -> Result<Vec<InputMethod>, String> {
    let interface = InterfaceName::try_from(DESTINATION).map_err(|error| error.to_string())?;
    let engines: OwnedVariant = properties
        .get(interface, name)
        .await
        .map_err(|error| error.to_string())?;
    Ok(match &*engines {
        Variant::Array(engines) => engines.iter().filter_map(method).collect(),
        _ => Vec::new(),
    })
}

pub async fn all() -> Result<Vec<InputMethod>, String> {
    let connection = dbus::at(&ibus::address()?).await?;
    let properties = PropertiesProxy::builder(&connection)
        .destination(DESTINATION)
        .path(PATH)
        .build()
        .await
        .map_err(|error| error.to_string())?;
    let mut methods = engines(&properties, "Engines").await?;
    methods.extend(engines(&properties, "ActiveEngines").await?);
    methods.sort_by_cached_key(|method| method.name.to_lowercase());
    Ok(methods)
}
