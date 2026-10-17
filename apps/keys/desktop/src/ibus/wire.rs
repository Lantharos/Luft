use std::collections::HashMap;

use zbus::Variant;

const ATTRIBUTE_UNDERLINE: u32 = 1;
const UNDERLINE_SINGLE: u32 = 1;
const ORIENTATION_VERTICAL: i32 = 1;

type Attachments = HashMap<String, Variant<'static>>;

fn attribute(kind: u32, value: u32, start: u32, end: u32) -> Variant<'static> {
    Variant::from((
        "IBusAttribute".to_owned(),
        Attachments::new(),
        kind,
        value,
        start,
        end,
    ))
}

fn styled(text: &str, attributes: Vec<Variant<'static>>) -> Variant<'static> {
    let list = Variant::from(("IBusAttrList".to_owned(), Attachments::new(), attributes));
    Variant::from((
        "IBusText".to_owned(),
        Attachments::new(),
        text.to_owned(),
        list,
    ))
}

pub fn text(text: &str) -> Variant<'static> {
    styled(text, Vec::new())
}

pub fn underlined(text: &str) -> Variant<'static> {
    let length = text.chars().count() as u32;
    let attributes = if length == 0 {
        Vec::new()
    } else {
        vec![attribute(ATTRIBUTE_UNDERLINE, UNDERLINE_SINGLE, 0, length)]
    };
    styled(text, attributes)
}

pub fn lookup_table(candidates: &[String], page: u32, cursor: u32) -> Variant<'static> {
    let candidates: Vec<Variant<'static>> =
        candidates.iter().map(|candidate| text(candidate)).collect();
    Variant::from((
        "IBusLookupTable".to_owned(),
        Attachments::new(),
        page,
        cursor,
        true,
        false,
        ORIENTATION_VERTICAL,
        candidates,
        Vec::<Variant<'static>>::new(),
    ))
}

pub fn plain(value: &Variant<'_>) -> Option<String> {
    let Variant::Structure(structure) = value else {
        return None;
    };
    match structure.fields().get(2)? {
        Variant::Str(text) => Some(text.to_string()),
        _ => None,
    }
}
