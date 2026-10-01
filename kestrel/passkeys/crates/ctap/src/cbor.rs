use ciborium::Value;

use crate::status::{Result, Status};

pub fn encode(value: &Value) -> Vec<u8> {
    let mut bytes = Vec::new();
    ciborium::into_writer(&canonical(value), &mut bytes)
        .expect("writing CBOR to memory cannot fail");
    bytes
}

pub fn decode(bytes: &[u8]) -> Result<Value> {
    ciborium::from_reader(bytes).map_err(|_| Status::InvalidCbor)
}

fn canonical(value: &Value) -> Value {
    match value {
        Value::Map(entries) => {
            let mut sorted: Vec<(Vec<u8>, Value, Value)> = entries
                .iter()
                .map(|(key, value)| {
                    let key = canonical(key);
                    let mut encoded = Vec::new();
                    ciborium::into_writer(&key, &mut encoded)
                        .expect("writing CBOR to memory cannot fail");
                    (encoded, key, canonical(value))
                })
                .collect();
            sorted
                .sort_by(|(a, ..), (b, ..)| (a[0] >> 5, a.len(), a).cmp(&(b[0] >> 5, b.len(), b)));
            Value::Map(
                sorted
                    .into_iter()
                    .map(|(_, key, value)| (key, value))
                    .collect(),
            )
        }
        Value::Array(items) => Value::Array(items.iter().map(canonical).collect()),
        other => other.clone(),
    }
}

pub fn map<K: Into<Value>>(entries: impl IntoIterator<Item = (K, Value)>) -> Value {
    Value::Map(
        entries
            .into_iter()
            .map(|(key, value)| (key.into(), value))
            .collect(),
    )
}

pub fn count(count: usize) -> Value {
    Value::from(count as u64)
}

pub struct Fields<'a>(&'a [(Value, Value)]);

impl<'a> Fields<'a> {
    pub fn new(value: &'a Value) -> Result<Self> {
        value
            .as_map()
            .map(|entries| Self(entries))
            .ok_or(Status::CborUnexpectedType)
    }

    pub fn get(&self, key: impl Into<Value>) -> Option<&'a Value> {
        let key = key.into();
        self.0
            .iter()
            .find(|(candidate, _)| *candidate == key)
            .map(|(_, value)| value)
    }

    pub fn required(&self, key: impl Into<Value>) -> Result<&'a Value> {
        self.get(key).ok_or(Status::MissingParameter)
    }
}

pub fn bytes(value: &Value) -> Result<&[u8]> {
    value
        .as_bytes()
        .map(Vec::as_slice)
        .ok_or(Status::CborUnexpectedType)
}

pub fn text(value: &Value) -> Result<&str> {
    value.as_text().ok_or(Status::CborUnexpectedType)
}

pub fn boolean(value: &Value) -> Result<bool> {
    value.as_bool().ok_or(Status::CborUnexpectedType)
}

pub fn integer(value: &Value) -> Result<i64> {
    value
        .as_integer()
        .and_then(|integer| i64::try_from(integer).ok())
        .ok_or(Status::CborUnexpectedType)
}

pub fn array(value: &Value) -> Result<&[Value]> {
    value
        .as_array()
        .map(Vec::as_slice)
        .ok_or(Status::CborUnexpectedType)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn sorts_keys_by_major_type_then_length_then_bytes() {
        let value = map([
            (Value::from(-3), Value::from(0)),
            (Value::from("aa"), Value::from(0)),
            (Value::from(1000), Value::from(0)),
            (Value::from(3), Value::from(0)),
            (Value::from("b"), Value::from(0)),
            (Value::from(-1), Value::from(0)),
            (Value::from(1), Value::from(0)),
        ]);
        let encoded = encode(&value);
        let Value::Map(entries) = decode(&encoded).unwrap() else {
            panic!()
        };
        let keys: Vec<Value> = entries.into_iter().map(|(key, _)| key).collect();
        assert_eq!(
            keys,
            [
                1.into(),
                3.into(),
                1000.into(),
                (-1).into(),
                (-3).into(),
                "b".into(),
                "aa".into()
            ]
        );
    }
}
