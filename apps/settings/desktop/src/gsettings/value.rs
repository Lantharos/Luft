use gio::glib::{self, Variant, VariantTy};
use gio::prelude::*;
use serde_json::{Map, Number, Value};

pub fn to_json(variant: &Variant) -> Value {
    match variant.classify() {
        glib::VariantClass::Boolean => Value::Bool(variant.get::<bool>().unwrap_or_default()),
        glib::VariantClass::Byte => variant.get::<u8>().map_or(Value::Null, Value::from),
        glib::VariantClass::Int16 => variant.get::<i16>().map_or(Value::Null, Value::from),
        glib::VariantClass::Uint16 => variant.get::<u16>().map_or(Value::Null, Value::from),
        glib::VariantClass::Int32 => variant.get::<i32>().map_or(Value::Null, Value::from),
        glib::VariantClass::Uint32 => variant.get::<u32>().map_or(Value::Null, Value::from),
        glib::VariantClass::Int64 => variant.get::<i64>().map_or(Value::Null, Value::from),
        glib::VariantClass::Uint64 => variant.get::<u64>().map_or(Value::Null, Value::from),
        glib::VariantClass::Double => variant
            .get::<f64>()
            .and_then(Number::from_f64)
            .map_or(Value::Null, Value::Number),
        glib::VariantClass::String
        | glib::VariantClass::ObjectPath
        | glib::VariantClass::Signature => {
            Value::String(variant.str().unwrap_or_default().to_owned())
        }
        glib::VariantClass::Variant => variant
            .as_variant()
            .map_or(Value::Null, |inner| to_json(&inner)),
        glib::VariantClass::Maybe => variant
            .as_maybe()
            .map_or(Value::Null, |inner| to_json(&inner)),
        glib::VariantClass::Array if variant.type_().element().is_dict_entry() => {
            let mut object = Map::new();
            for entry in variant.iter() {
                let key = entry.child_value(0);
                let key = key
                    .str()
                    .map(str::to_owned)
                    .unwrap_or_else(|| key.print(false).to_string());
                object.insert(key, to_json(&entry.child_value(1)));
            }
            Value::Object(object)
        }
        glib::VariantClass::Array | glib::VariantClass::Tuple | glib::VariantClass::DictEntry => {
            Value::Array(variant.iter().map(|child| to_json(&child)).collect())
        }
        _ => Value::Null,
    }
}

pub fn from_json(value: &Value, ty: &VariantTy) -> Result<Variant, String> {
    let invalid = || format!("{value} does not fit {}", ty.as_str());
    let variant = match ty.as_str() {
        "b" => value.as_bool().ok_or_else(invalid)?.to_variant(),
        "y" => u8::try_from(value.as_u64().ok_or_else(invalid)?)
            .map_err(|_| invalid())?
            .to_variant(),
        "n" => i16::try_from(value.as_i64().ok_or_else(invalid)?)
            .map_err(|_| invalid())?
            .to_variant(),
        "q" => u16::try_from(value.as_u64().ok_or_else(invalid)?)
            .map_err(|_| invalid())?
            .to_variant(),
        "i" => i32::try_from(value.as_i64().ok_or_else(invalid)?)
            .map_err(|_| invalid())?
            .to_variant(),
        "u" => u32::try_from(value.as_u64().ok_or_else(invalid)?)
            .map_err(|_| invalid())?
            .to_variant(),
        "x" => value.as_i64().ok_or_else(invalid)?.to_variant(),
        "t" => value.as_u64().ok_or_else(invalid)?.to_variant(),
        "d" => value.as_f64().ok_or_else(invalid)?.to_variant(),
        "s" => value.as_str().ok_or_else(invalid)?.to_variant(),
        "v" => from_json(value, guess_type(value)?)?.to_variant(),
        _ if ty.is_array() && ty.element().is_dict_entry() => {
            let entry = ty.element();
            let object = value.as_object().ok_or_else(invalid)?;
            let entries = object
                .iter()
                .map(|(key, item)| {
                    Ok(Variant::from_dict_entry(
                        &from_json(&Value::String(key.clone()), entry.key())?,
                        &from_json(item, entry.value())?,
                    ))
                })
                .collect::<Result<Vec<_>, String>>()?;
            Variant::array_from_iter_with_type(entry, entries)
        }
        _ if ty.is_array() => {
            let items = value
                .as_array()
                .ok_or_else(invalid)?
                .iter()
                .map(|item| from_json(item, ty.element()))
                .collect::<Result<Vec<_>, String>>()?;
            Variant::array_from_iter_with_type(ty.element(), items)
        }
        _ if ty.is_tuple() => {
            let values = value.as_array().ok_or_else(invalid)?;
            let mut members = Vec::with_capacity(values.len());
            let mut member = ty.first();
            for item in values {
                let current = member.ok_or_else(invalid)?;
                members.push(from_json(item, current)?);
                member = current.next();
            }
            if member.is_some() {
                return Err(invalid());
            }
            Variant::tuple_from_iter(members)
        }
        _ => {
            return Err(format!(
                "Settings of type {} cannot be changed here",
                ty.as_str()
            ));
        }
    };
    Ok(variant)
}

fn guess_type(value: &Value) -> Result<&'static VariantTy, String> {
    match value {
        Value::Bool(_) => Ok(VariantTy::BOOLEAN),
        Value::Number(number) if number.is_f64() => Ok(VariantTy::DOUBLE),
        Value::Number(_) => Ok(VariantTy::INT32),
        Value::String(_) => Ok(VariantTy::STRING),
        _ => Err(format!("{value} cannot be stored as a variant")),
    }
}
