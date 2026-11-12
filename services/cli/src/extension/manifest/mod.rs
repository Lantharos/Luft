//! `extension.toml`, held to the rules Kestrel reads it by
//! (`kestrel/ui/src/extensions/runtime/manifest.ts`), with the same words for
//! what's wrong, so `luft extension check` refuses exactly what Kestrel would.

use serde::Serialize;
use toml::{Table, Value};

const PERMISSIONS: [&str; 19] = [
    "wallpaper",
    "quick-settings",
    "taskbar",
    "search",
    "notifications",
    "weather",
    "location",
    "media",
    "popups",
    "typing",
    "sounds",
    "audio-levels",
    "calls",
    "locked-sounds",
    "input-sounds",
    "do-not-disturb",
    "screen-effects",
    "clipboard",
    "file-actions",
];
const NEEDS: [(&str, &str); 2] = [("locked-sounds", "sounds"), ("input-sounds", "sounds")];
const APART: [(&str, &str); 1] = [("input-sounds", "audio-levels")];
const PAGES: [(&str, &[&str]); 4] = [
    ("appearance", &["wallpaper"]),
    ("taskbar", &["taskbar"]),
    ("sound", &["sounds", "audio-levels"]),
    ("input", &["typing", "input-sounds"]),
];
const API_VERSIONS: [i64; 1] = [1];
const IMAGES: [&str; 5] = [".png", ".jpg", ".jpeg", ".webp", ".svg"];
pub const IN_DESKTOP_ONLY: [&str; 5] = [
    "wallpaper",
    "screen-effects",
    "audio-levels",
    "typing",
    "file-actions",
];

#[derive(Serialize, Debug, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct Manifest {
    pub id: String,
    pub name: String,
    pub version: String,
    pub api: i64,
    pub permissions: Vec<String>,
    pub helper: Option<String>,
    pub listens: bool,
    pub minimum: Option<String>,
    pub labels: Vec<String>,
}

type Checked<T> = Result<T, String>;

fn table<'a>(value: &'a Value, at: &str) -> Checked<&'a Table> {
    value
        .as_table()
        .ok_or_else(|| format!("{at} must be a table"))
}

fn text(source: &Table, key: &str, at: &str, pattern: Option<fn(&str) -> bool>) -> Checked<String> {
    match source.get(key).and_then(Value::as_str) {
        Some(value) if !value.is_empty() && pattern.is_none_or(|matches| matches(value)) => {
            Ok(value.to_owned())
        }
        _ => Err(format!("{at}.{key} is missing or malformed")),
    }
}

fn optional_text(source: &Table, key: &str, at: &str) -> Checked<Option<String>> {
    source
        .get(key)
        .map(|_| text(source, key, at, None))
        .transpose()
}

fn number(source: &Table, key: &str, at: &str) -> Checked<f64> {
    match source.get(key) {
        Some(Value::Integer(value)) => Ok(*value as f64),
        Some(Value::Float(value)) if value.is_finite() => Ok(*value),
        _ => Err(format!("{at}.{key} must be a number")),
    }
}

fn list<'a>(source: &'a Table, key: &str, at: &str) -> Checked<&'a [Value]> {
    match source.get(key) {
        None => Ok(&[]),
        Some(Value::Array(values)) => Ok(values),
        Some(_) => Err(format!("{at}.{key} must be a list")),
    }
}

pub fn is_id(text: &str) -> bool {
    let parts: Vec<&str> = text.split('.').collect();
    parts.len() >= 3
        && parts.iter().all(|part| {
            let mut characters = part.chars();
            characters
                .next()
                .is_some_and(|first| first.is_ascii_alphabetic())
                && characters.all(|character| {
                    character.is_ascii_alphanumeric() || character == '_' || character == '-'
                })
        })
}

fn is_key(text: &str) -> bool {
    text.starts_with(|first: char| first.is_ascii_lowercase())
        && text.chars().all(|character| {
            character.is_ascii_lowercase() || character.is_ascii_digit() || character == '-'
        })
}

fn is_message(text: &str) -> bool {
    text.starts_with(|first: char| first.is_ascii_alphabetic())
        && text.chars().all(|character| {
            character.is_ascii_alphanumeric() || character == '_' || character == '-'
        })
}

fn is_hex(text: &str) -> bool {
    text.len() == 7
        && text.starts_with('#')
        && text[1..]
            .chars()
            .all(|character| character.is_ascii_hexdigit())
}

fn is_host(text: &str) -> bool {
    let (name, port) = text
        .split_once(':')
        .map_or((text, None), |(name, port)| (name, Some(port)));
    if port.is_some_and(|port| {
        port.is_empty() || port.len() > 5 || !port.chars().all(|digit| digit.is_ascii_digit())
    }) {
        return false;
    }
    let label = |label: &str| {
        !label.is_empty()
            && label.chars().all(|character| {
                character.is_ascii_lowercase() || character.is_ascii_digit() || character == '-'
            })
            && !label.starts_with('-')
            && !label.ends_with('-')
    };
    name == "localhost"
        || name == "127.0.0.1"
        || (name.split('.').count() >= 2 && name.split('.').all(label))
}

pub fn is_luft_version(text: &str) -> bool {
    let digits = |part: &str| !part.is_empty() && part.chars().all(|digit| digit.is_ascii_digit());
    let mut halves = text.split("-nightly.");
    let release = halves.next().unwrap_or_default();
    let nightly = halves.next();
    if halves.next().is_some() || nightly.is_some_and(|nightly| !digits(nightly)) {
        return false;
    }
    let parts: Vec<&str> = release.split('.').collect();
    parts.len() == 2 && parts.iter().all(|part| digits(part))
}

fn inside_folder(path: &str) -> bool {
    !path.starts_with('/') && !path.split('/').any(|part| part == "..")
}

fn options(source: &Table, key: &str, at: &str, labels: &mut Vec<String>) -> Checked<Vec<Value>> {
    list(source, key, at)?
        .iter()
        .enumerate()
        .map(|(index, entry)| {
            let at = format!("{at}.{key}[{index}]");
            let option = table(entry, &at)?;
            let value = text(option, "value", &at, None)?;
            labels.push(text(option, "label", &at, Some(is_message))?);
            if let Some(path) = optional_text(option, "image", &at)?
                && (!inside_folder(&path)
                    || !IMAGES
                        .iter()
                        .any(|kind| path.to_lowercase().ends_with(kind)))
            {
                return Err(format!(
                    "{at}.image must be a PNG, JPEG, WebP or SVG inside the extension"
                ));
            }
            Ok(Value::String(value))
        })
        .collect()
}

#[derive(Clone, Debug)]
enum Kind {
    Switch,
    Choice(Vec<Value>),
    Choices(Vec<Value>, f64),
    Slider(f64, f64),
    Color,
}

#[derive(Clone, Debug)]
struct Described {
    key: String,
    kind: Kind,
    depends: Option<String>,
    when: Option<Value>,
}

fn fits(kind: &Kind, value: &Value) -> bool {
    match (kind, value) {
        (Kind::Switch, Value::Boolean(_)) => true,
        (Kind::Choice(options), value) => options.contains(value),
        (Kind::Choices(options, min), Value::Array(picked)) => {
            let distinct = picked
                .iter()
                .enumerate()
                .all(|(index, value)| !picked[..index].contains(value));
            picked.len() as f64 >= *min
                && distinct
                && picked.iter().all(|value| options.contains(value))
        }
        (Kind::Slider(min, max), Value::Integer(value)) => {
            (*value as f64) >= *min && (*value as f64) <= *max
        }
        (Kind::Slider(min, max), Value::Float(value)) => value >= min && value <= max,
        (Kind::Color, Value::String(value)) => {
            value == "accent" || value == "wallpaper" || is_hex(value)
        }
        _ => false,
    }
}

fn setting(
    entry: &Value,
    index: usize,
    permissions: &[String],
    labels: &mut Vec<String>,
) -> Checked<Described> {
    let at = format!("settings[{index}]");
    let source = table(entry, &at)?;
    let key = text(source, "key", &at, Some(is_key))?;
    labels.push(text(source, "label", &at, Some(is_message))?);
    let depends = optional_text(source, "depends", &at)?;
    if let Some(page) = source.get("page") {
        let found = page
            .as_str()
            .and_then(|page| PAGES.iter().find(|(name, _)| *name == page));
        let Some((name, allowed)) = found else {
            return Err(format!(
                "{at}.page must be appearance, taskbar, sound or input"
            ));
        };
        if !allowed
            .iter()
            .any(|needed| permissions.iter().any(|permission| permission == needed))
        {
            return Err(format!(
                "{at} shows on the {name} page, which needs the {} permission",
                allowed.join(" or ")
            ));
        }
    }
    let when = match source.get("when") {
        Some(Value::Table(range)) => {
            if let Some(unknown) = range.keys().find(|end| *end != "min" && *end != "max") {
                return Err(format!(
                    "{at}.when can only have min and max, not {unknown}"
                ));
            }
            for end in range.keys() {
                number(range, end, &format!("{at}.when"))?;
            }
            Some(Value::Table(range.clone()))
        }
        other => other.cloned(),
    };
    let kind = match source.get("type").and_then(Value::as_str) {
        Some("switch") => Kind::Switch,
        Some("choice") => {
            let offered = options(source, "options", &at, labels)?;
            if offered.is_empty() {
                return Err(format!("{at} offers no options"));
            }
            Kind::Choice(offered)
        }
        Some("choices") => {
            let offered = options(source, "options", &at, labels)?;
            if offered.is_empty() {
                return Err(format!("{at} offers no options"));
            }
            let min = source
                .get("min")
                .map(|_| number(source, "min", &at))
                .transpose()?
                .unwrap_or(0.0);
            if min > offered.len() as f64 {
                return Err(format!("{at}.min is more than it offers"));
            }
            Kind::Choices(offered, min)
        }
        Some("slider") => {
            if source
                .get("unit")
                .is_some_and(|unit| unit.as_str() != Some("percent"))
            {
                return Err(format!("{at}.unit must be \"percent\""));
            }
            let (min, max) = (number(source, "min", &at)?, number(source, "max", &at)?);
            if source.get("step").is_some() {
                number(source, "step", &at)?;
            }
            if min >= max {
                return Err(format!("{at}.min must be below max"));
            }
            Kind::Slider(min, max)
        }
        Some("color") => {
            let swatches = options(source, "swatches", &at, labels)?;
            if !swatches.iter().all(|swatch| fits(&Kind::Color, swatch)) {
                return Err(format!("{at}.swatches must be colours"));
            }
            Kind::Color
        }
        _ => {
            return Err(format!(
                "{at}.type must be switch, choice, choices, slider or color"
            ));
        }
    };
    if !source
        .get("default")
        .is_some_and(|default| fits(&kind, default))
    {
        return Err(format!("{at}.default doesn't fit the setting"));
    }
    Ok(Described {
        key,
        kind,
        depends,
        when,
    })
}

fn condition(described: &Described, parent: &Described) -> Checked<()> {
    let key = &described.key;
    match &described.when {
        None if !matches!(parent.kind, Kind::Switch) => Err(format!(
            "{key} depends on {}, which isn't a switch, so it needs when",
            parent.key
        )),
        None => Ok(()),
        Some(Value::Array(values)) => {
            if values.is_empty() {
                return Err(format!("{key}'s when names no values"));
            }
            let possible = |value: &Value| match &parent.kind {
                Kind::Choices(options, _) => options.contains(value),
                kind => fits(kind, value),
            };
            match values.iter().find(|value| !possible(value)) {
                Some(wrong) => Err(format!(
                    "{key}'s when has {}, which {} can't be",
                    serde_json::to_string(wrong).unwrap_or_default(),
                    parent.key
                )),
                None => Ok(()),
            }
        }
        Some(Value::Table(range)) => {
            let Kind::Slider(lowest, highest) = parent.kind else {
                return Err(format!(
                    "{key}'s when is a range, which only works on a slider, and {} isn't one",
                    parent.key
                ));
            };
            let end = |name: &str| {
                range.get(name).and_then(|value| {
                    value
                        .as_float()
                        .or_else(|| value.as_integer().map(|value| value as f64))
                })
            };
            let (min, max) = (end("min"), end("max"));
            if min.is_none() && max.is_none() {
                return Err(format!("{key}'s when has neither min nor max"));
            }
            let (low, high) = (min.unwrap_or(lowest), max.unwrap_or(highest));
            if low > high || low > highest || high < lowest {
                return Err(format!(
                    "{key}'s when is outside what {} can be",
                    parent.key
                ));
            }
            Ok(())
        }
        Some(_) => Err(format!("{key}'s when names no values")),
    }
}

fn dependencies(settings: &[Described]) -> Checked<()> {
    for (index, described) in settings.iter().enumerate() {
        if settings[..index]
            .iter()
            .any(|other| other.key == described.key)
        {
            return Err(format!("settings has {} twice", described.key));
        }
    }
    for (index, described) in settings.iter().enumerate() {
        let Some(depends) = &described.depends else {
            if described.when.is_some() {
                return Err(format!("{} has when without depends", described.key));
            }
            continue;
        };
        let parent = settings[..index]
            .iter()
            .find(|other| &other.key == depends)
            .ok_or_else(|| {
                format!(
                    "{} depends on {depends}, which isn't declared before it",
                    described.key
                )
            })?;
        condition(described, parent)?;
    }
    Ok(())
}

fn helper(document: &Table) -> Checked<Option<String>> {
    let Some(helper) = document.get("helper") else {
        return Ok(None);
    };
    let described = table(helper, "helper")?;
    let path = text(described, "path", "helper", None)?;
    if !inside_folder(&path) {
        return Err("helper.path must stay inside the extension".to_owned());
    }
    if described.get("turned-off").is_some()
        && !list(described, "turned-off", "helper")?
            .iter()
            .all(Value::is_str)
    {
        return Err("helper.turned-off must be a list of arguments".to_owned());
    }
    Ok(Some(path))
}

fn network(document: &Table) -> Checked<bool> {
    let Some(network) = document.get("network") else {
        return Ok(false);
    };
    let described = table(network, "network")?;
    let hosts = list(described, "hosts", "network")?;
    for (index, host) in hosts.iter().enumerate() {
        if !host.as_str().is_some_and(is_host) {
            return Err(format!(
                "network.hosts[{index}] must be a host name such as api.example.com"
            ));
        }
    }
    let mut ports = Vec::new();
    for (index, entry) in list(described, "listen", "network")?.iter().enumerate() {
        let at = format!("network.listen[{index}]");
        let port = table(entry, &at)?;
        let number = port
            .get("port")
            .and_then(Value::as_integer)
            .filter(|number| (1..=65535).contains(number));
        let Some(number) = number else {
            return Err(format!("{at}.port must be a port from 1 to 65535"));
        };
        let protocol = port
            .get("protocol")
            .and_then(Value::as_str)
            .filter(|protocol| *protocol == "tcp" || *protocol == "udp");
        let Some(protocol) = protocol else {
            return Err(format!("{at}.protocol must be \"tcp\" or \"udp\""));
        };
        if ports.contains(&(number, protocol)) {
            return Err("network.listen names a port twice".to_owned());
        }
        ports.push((number, protocol));
    }
    if hosts.is_empty() && ports.is_empty() {
        return Err("network names neither hosts nor ports to listen on".to_owned());
    }
    Ok(!ports.is_empty())
}

fn shortcuts(document: &Table, labels: &mut Vec<String>) -> Checked<()> {
    let mut keys = Vec::new();
    for (index, entry) in list(document, "shortcuts", "manifest")?.iter().enumerate() {
        let at = format!("shortcuts[{index}]");
        let source = table(entry, &at)?;
        keys.push(text(source, "key", &at, Some(is_key))?);
        labels.push(text(source, "label", &at, Some(is_message))?);
        optional_text(source, "default", &at)?;
    }
    let mut unique = keys.clone();
    unique.sort();
    unique.dedup();
    if unique.len() != keys.len() {
        return Err("shortcuts has a key twice".to_owned());
    }
    Ok(())
}

fn minimum(document: &Table) -> Checked<Option<String>> {
    let Some(luft) = document.get("luft") else {
        return Ok(None);
    };
    let minimum = text(table(luft, "luft")?, "minimum", "luft", None)?;
    if !is_luft_version(&minimum) {
        return Err(
            "luft.minimum must be a version of Luft, such as 1.2 or 1.2-nightly.21".to_owned(),
        );
    }
    Ok(Some(minimum))
}

pub fn parse(source: &str) -> Checked<Manifest> {
    let document: Table = source.parse().map_err(|error: toml::de::Error| {
        format!("extension.toml isn't valid TOML: {}", error.message())
    })?;
    let api = document
        .get("api")
        .and_then(Value::as_integer)
        .filter(|api| API_VERSIONS.contains(api));
    let Some(api) = api else {
        let named = document
            .get("api")
            .map_or_else(|| "undefined".to_owned(), ToString::to_string);
        return Err(format!(
            "it targets extension API {named}, which this Kestrel doesn't support"
        ));
    };
    let mut permissions = Vec::new();
    for permission in list(&document, "permissions", "manifest")? {
        match permission
            .as_str()
            .filter(|permission| PERMISSIONS.contains(permission))
        {
            Some(permission) => permissions.push(permission.to_owned()),
            None => {
                return Err(format!(
                    "it asks for an unknown permission, {}",
                    permission
                        .as_str()
                        .map_or_else(|| permission.to_string(), str::to_owned)
                ));
            }
        }
    }
    let has = |name: &str| permissions.iter().any(|permission| permission == name);
    for permission in &permissions {
        if let Some((_, needed)) = NEEDS.iter().find(|(asking, _)| asking == permission)
            && !has(needed)
        {
            return Err(format!("{permission} needs the {needed} permission too"));
        }
        if let Some((_, apart)) = APART.iter().find(|(asking, _)| asking == permission)
            && has(apart)
        {
            return Err(format!("{permission} can't go with the {apart} permission"));
        }
    }
    let mut labels = Vec::new();
    let settings = list(&document, "settings", "manifest")?
        .iter()
        .enumerate()
        .map(|(index, entry)| setting(entry, index, &permissions, &mut labels))
        .collect::<Checked<Vec<_>>>()?;
    dependencies(&settings)?;
    let id = text(&document, "id", "manifest", Some(is_id))?;
    let name = text(&document, "name", "manifest", None)?;
    optional_text(&document, "description", "manifest")?;
    let version = text(&document, "version", "manifest", None)?;
    shortcuts(&document, &mut labels)?;
    let helper = helper(&document)?;
    let listens = network(&document)?;
    let minimum = minimum(&document)?;
    Ok(Manifest {
        id,
        name,
        version,
        api,
        permissions,
        helper,
        listens,
        minimum,
        labels,
    })
}

#[cfg(test)]
mod tests;
