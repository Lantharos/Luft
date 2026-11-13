use toml::{Table, Value};

use crate::error::{Error, Result};

/// A Luft extension as its extension.toml describes it.
#[derive(Clone, Debug, PartialEq)]
pub struct ExtensionManifest {
    pub id: String,
    pub name: String,
    pub summary: Option<String>,
    pub api: i64,
    pub helper: Option<String>,
    pub luft: Option<Value>,
}

pub fn read_extension(text: &str) -> Result<ExtensionManifest> {
    let file: Table = text
        .parse()
        .map_err(|error: toml::de::Error| Error::Other(error.message().to_owned()))?;
    let string = |key: &str| file.get(key).and_then(Value::as_str).map(str::to_owned);
    let (Some(id), Some(name)) = (
        string("id").filter(|id| !id.is_empty()),
        string("name").filter(|name| !name.is_empty()),
    ) else {
        return Err(Error::Other("extension.toml needs an id and a name".into()));
    };
    let api = match file.get("api") {
        Some(Value::Integer(api)) => *api,
        Some(Value::Float(api)) => *api as i64,
        _ => {
            return Err(Error::Other(
                "extension.toml needs the extension API version it targets".into(),
            ));
        }
    };
    let helper = file.get("helper").and_then(Value::as_table);
    let path = helper
        .and_then(|helper| helper.get("path"))
        .and_then(Value::as_str);
    if helper.is_some() && path.is_none_or(str::is_empty) {
        return Err(Error::Other(
            "extension.toml's [helper] needs the path of its program".into(),
        ));
    }
    Ok(ExtensionManifest {
        id,
        name,
        summary: string("description"),
        api,
        helper: path.map(str::to_owned),
        luft: file
            .get("luft")
            .and_then(Value::as_table)
            .and_then(|luft| luft.get("minimum"))
            .cloned(),
    })
}
