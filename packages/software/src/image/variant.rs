use serde_json::{Map, Value as Json};
use zbus::zvariant::Value;

pub fn json(value: &Value) -> Json {
    match value {
        Value::U8(number) => (*number).into(),
        Value::Bool(flag) => (*flag).into(),
        Value::I16(number) => (*number).into(),
        Value::U16(number) => (*number).into(),
        Value::I32(number) => (*number).into(),
        Value::U32(number) => (*number).into(),
        Value::I64(number) => (*number).into(),
        Value::U64(number) => (*number).into(),
        Value::F64(number) => (*number).into(),
        Value::Str(text) => text.as_str().into(),
        Value::Signature(signature) => signature.to_string().into(),
        Value::ObjectPath(path) => path.as_str().into(),
        Value::Value(inner) => json(inner),
        Value::Array(array) => array.iter().map(json).collect(),
        Value::Structure(structure) => structure.fields().iter().map(json).collect(),
        Value::Dict(dict) => Json::Object(
            dict.iter()
                .filter_map(|(key, value)| match json(key) {
                    Json::String(key) => Some((key, json(value))),
                    _ => None,
                })
                .collect::<Map<_, _>>(),
        ),
        _ => Json::Null,
    }
}
