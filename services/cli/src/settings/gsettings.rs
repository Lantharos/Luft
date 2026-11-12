//! Settings kept as GSettings keys, which every program of yours may change.

use gio::prelude::*;
use glib::{Variant, VariantTy};
use serde_json::Value as Json;

use super::catalogue::{Range, Setting, split};
use super::kind::{Choice, Kind};
use crate::failure::{Failure, Outcome};

pub struct Key {
    settings: gio::Settings,
    key: String,
    kind: glib::VariantType,
}

fn not_installed(schema: &str) -> Failure {
    Failure::unavailable(format!(
        "The settings {schema} aren't installed on this computer."
    ))
}

impl Key {
    pub fn open(key: &str) -> Outcome<Self> {
        let (schema, name) = split(key);
        let source = gio::SettingsSchemaSource::default().ok_or_else(|| not_installed(schema))?;
        let found = source
            .lookup(schema, true)
            .filter(|found| found.has_key(name))
            .ok_or_else(|| not_installed(schema))?;
        let kind = found.key(name).value_type();
        Ok(Self {
            settings: gio::Settings::new_full(&found, None::<&gio::SettingsBackend>, None),
            key: name.to_owned(),
            kind,
        })
    }

    fn schema_key(&self) -> gio::SettingsSchemaKey {
        self.settings
            .settings_schema()
            .expect("an open key has its schema")
            .key(&self.key)
    }

    /// The choices an enum key allows, or the range a number key allows.
    fn allowed(&self) -> (Vec<String>, Option<Range>) {
        let range = self.schema_key().range();
        let (kind, allowed) = (range.child_value(0), range.child_value(1).as_variant());
        match (kind.str(), allowed) {
            (Some("enum"), Some(values)) => (values.get::<Vec<String>>().unwrap_or_default(), None),
            (Some("range"), Some(bounds)) => {
                let bound = |index| number(&bounds.child_value(index)).unwrap_or_default();
                (
                    Vec::new(),
                    Some(Range {
                        min: bound(0),
                        max: bound(1),
                    }),
                )
            }
            _ => (Vec::new(), None),
        }
    }

    pub fn kind(&self, setting: &Setting, choices: Vec<Choice>) -> Kind {
        let (names, range) = self.allowed();
        if self.kind.as_str() == "b" {
            return Kind::Switch { notes: choices };
        }
        if !choices.is_empty() {
            return Kind::Choice { choices };
        }
        if !names.is_empty() {
            let choices = names
                .into_iter()
                .map(|name| Choice {
                    value: Json::String(name.clone()),
                    name,
                    note: None,
                })
                .collect();
            return Kind::Choice { choices };
        }
        let (min, max) = integer_bounds(self.kind.as_str());
        match self.kind.as_str() {
            "s" => Kind::Text,
            "d" => {
                let range = setting.range.or(range).unwrap_or(Range {
                    min: f64::MIN,
                    max: f64::MAX,
                });
                Kind::Number {
                    integer: false,
                    min: range.min,
                    max: range.max,
                    unit: setting.unit,
                }
            }
            _ => {
                let range = setting.range.or(range).unwrap_or(Range { min, max });
                Kind::Number {
                    integer: true,
                    min: range.min,
                    max: range.max,
                    unit: setting.unit,
                }
            }
        }
    }

    pub fn read(&self) -> Json {
        to_json(&self.settings.value(&self.key))
    }

    /// The value someone set themselves, as GVariant text, or none when the
    /// key keeps its default.
    pub fn own_value(&self) -> Option<String> {
        self.settings
            .user_value(&self.key)
            .map(|value| value.print(true).to_string())
    }

    pub fn write(&self, value: &Json) -> Outcome {
        if value.is_null() {
            self.settings.reset(&self.key);
            return Ok(());
        }
        let variant = from_json(value, &self.kind).ok_or_else(|| {
            Failure::invalid(format!("{value} doesn't fit the setting {}.", self.key))
        })?;
        self.settings
            .set_value(&self.key, &variant)
            .map_err(|error| Failure::invalid(error.to_string()))
    }

    /// Puts back a value `own_value` gave, or the default for none.
    pub fn restore(&self, own: Option<&str>) -> Outcome {
        let Some(text) = own else {
            self.settings.reset(&self.key);
            return Ok(());
        };
        let variant = Variant::parse(Some(&self.kind), text)
            .map_err(|error| Failure::invalid(error.to_string()))?;
        self.settings
            .set_value(&self.key, &variant)
            .map_err(|error| Failure::failed(error.to_string()))
    }
}

pub fn sync() {
    gio::Settings::sync();
}

fn integer_bounds(kind: &str) -> (f64, f64) {
    match kind {
        "y" => (0.0, f64::from(u8::MAX)),
        "n" => (f64::from(i16::MIN), f64::from(i16::MAX)),
        "q" => (0.0, f64::from(u16::MAX)),
        "i" => (f64::from(i32::MIN), f64::from(i32::MAX)),
        "u" => (0.0, f64::from(u32::MAX)),
        _ => (i64::MIN as f64, i64::MAX as f64),
    }
}

fn number(value: &Variant) -> Option<f64> {
    value
        .get::<f64>()
        .or_else(|| value.get::<i32>().map(f64::from))
        .or_else(|| value.get::<u32>().map(f64::from))
        .or_else(|| value.get::<i64>().map(|number| number as f64))
        .or_else(|| value.get::<u64>().map(|number| number as f64))
        .or_else(|| value.get::<i16>().map(f64::from))
        .or_else(|| value.get::<u16>().map(f64::from))
        .or_else(|| value.get::<u8>().map(f64::from))
}

fn to_json(value: &Variant) -> Json {
    if let Some(on) = value.get::<bool>() {
        return Json::Bool(on);
    }
    if let Some(text) = value.str() {
        return Json::String(text.to_owned());
    }
    if let Some(double) = value.get::<f64>() {
        return Json::from(double);
    }
    number(value).map_or_else(
        || Json::String(value.print(true).to_string()),
        |number| Json::from(number as i64),
    )
}

fn from_json(value: &Json, kind: &VariantTy) -> Option<Variant> {
    Some(match (kind.as_str(), value) {
        ("b", Json::Bool(on)) => on.to_variant(),
        ("s", Json::String(text)) => text.to_variant(),
        ("d", value) => value.as_f64()?.to_variant(),
        ("i", value) => i32::try_from(value.as_i64()?).ok()?.to_variant(),
        ("u", value) => u32::try_from(value.as_i64()?).ok()?.to_variant(),
        ("x", value) => value.as_i64()?.to_variant(),
        ("t", value) => value.as_u64()?.to_variant(),
        ("n", value) => i16::try_from(value.as_i64()?).ok()?.to_variant(),
        ("q", value) => u16::try_from(value.as_i64()?).ok()?.to_variant(),
        ("y", value) => u8::try_from(value.as_i64()?).ok()?.to_variant(),
        _ => return None,
    })
}
