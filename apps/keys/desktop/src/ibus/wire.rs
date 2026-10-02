use std::collections::HashMap;

use zbus::zvariant::Value;

const ATTRIBUTE_UNDERLINE: u32 = 1;
const UNDERLINE_SINGLE: u32 = 1;
const ORIENTATION_VERTICAL: i32 = 1;

type Attachments = HashMap<String, Value<'static>>;

fn attribute(kind: u32, value: u32, start: u32, end: u32) -> Value<'static> {
    Value::from((
        "IBusAttribute".to_owned(),
        Attachments::new(),
        kind,
        value,
        start,
        end,
    ))
}

fn styled(text: &str, attributes: Vec<Value<'static>>) -> Value<'static> {
    let list = Value::from(("IBusAttrList".to_owned(), Attachments::new(), attributes));
    Value::from((
        "IBusText".to_owned(),
        Attachments::new(),
        text.to_owned(),
        list,
    ))
}

pub fn text(text: &str) -> Value<'static> {
    styled(text, Vec::new())
}

pub fn underlined(text: &str) -> Value<'static> {
    let length = text.chars().count() as u32;
    let attributes = if length == 0 {
        Vec::new()
    } else {
        vec![attribute(ATTRIBUTE_UNDERLINE, UNDERLINE_SINGLE, 0, length)]
    };
    styled(text, attributes)
}

pub fn lookup_table(candidates: &[String], page: u32, cursor: u32) -> Value<'static> {
    let candidates: Vec<Value<'static>> =
        candidates.iter().map(|candidate| text(candidate)).collect();
    Value::from((
        "IBusLookupTable".to_owned(),
        Attachments::new(),
        page,
        cursor,
        true,
        false,
        ORIENTATION_VERTICAL,
        candidates,
        Vec::<Value<'static>>::new(),
    ))
}

pub fn plain(value: &Value<'_>) -> Option<String> {
    let Value::Structure(structure) = value else {
        return None;
    };
    match structure.fields().get(2)? {
        Value::Str(text) => Some(text.to_string()),
        _ => None,
    }
}
