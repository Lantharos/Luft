use std::collections::HashMap;

use zbus::{OwnedVariant, Variant};

pub type Group = HashMap<String, OwnedVariant>;
pub type Settings = HashMap<String, Group>;

pub fn read<T: TryFrom<OwnedVariant>>(group: Option<&Group>, key: &str) -> Option<T> {
    group?.get(key)?.try_clone().ok()?.try_into().ok()
}

pub fn get<T: TryFrom<OwnedVariant>>(settings: &Settings, group: &str, key: &str) -> Option<T> {
    read(settings.get(group), key)
}

pub fn put(group: &mut Group, key: &str, value: impl Into<Variant<'static>>) {
    let value = OwnedVariant::try_from(value.into()).expect("settings never hold file descriptors");
    group.insert(key.to_owned(), value);
}

pub fn put_text(group: &mut Group, key: &str, text: &str) {
    if text.is_empty() {
        group.remove(key);
    } else {
        put(group, key, text.to_owned());
    }
}
