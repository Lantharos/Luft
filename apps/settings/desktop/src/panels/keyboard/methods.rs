use luft_app::{dbus, ibus};
use serde::Serialize;
use zbus::blocking::fdo::PropertiesProxy;
use zbus::names::InterfaceName;
use zbus::zvariant::{OwnedValue, Structure, Value};

const DESTINATION: &str = "org.freedesktop.IBus";
const PATH: &str = "/org/freedesktop/IBus";
const XKB_PREFIX: &str = "xkb:";
const NAME: usize = 2;
const LONG_NAME: usize = 3;
const LANGUAGE: usize = 5;

#[derive(Serialize)]
pub struct InputMethod {
    id: String,
    name: String,
    language: String,
}

fn text(structure: &Structure, index: usize) -> Option<String> {
    match structure.fields().get(index)? {
        Value::Str(text) => Some(text.to_string()),
        _ => None,
    }
}

fn method(value: &Value) -> Option<InputMethod> {
    let structure = match value {
        Value::Value(inner) => return method(inner),
        Value::Structure(structure) => structure,
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

fn engines(properties: &PropertiesProxy, name: &str) -> Result<Vec<InputMethod>, String> {
    let interface = InterfaceName::try_from(DESTINATION).map_err(|error| error.to_string())?;
    let engines: OwnedValue = properties
        .get(interface, name)
        .map_err(|error| error.to_string())?;
    Ok(match &*engines {
        Value::Array(engines) => engines.iter().filter_map(method).collect(),
        _ => Vec::new(),
    })
}

pub fn all() -> Result<Vec<InputMethod>, String> {
    let connection = dbus::at(&ibus::address()?)?;
    let properties = PropertiesProxy::builder(&connection)
        .destination(DESTINATION)
        .and_then(|builder| builder.path(PATH))
        .and_then(|builder| builder.build())
        .map_err(|error| error.to_string())?;
    let mut methods = engines(&properties, "Engines")?;
    methods.extend(engines(&properties, "ActiveEngines")?);
    methods.sort_by_cached_key(|method| method.name.to_lowercase());
    Ok(methods)
}
