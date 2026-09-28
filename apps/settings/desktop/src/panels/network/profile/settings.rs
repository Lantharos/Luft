use std::collections::HashMap;

use zbus::zvariant::{OwnedValue, Value};

pub type Group = HashMap<String, OwnedValue>;
pub type Settings = HashMap<String, Group>;

pub fn read<T: TryFrom<OwnedValue>>(group: Option<&Group>, key: &str) -> Option<T> {
    group?.get(key)?.try_clone().ok()?.try_into().ok()
}

pub fn get<T: TryFrom<OwnedValue>>(settings: &Settings, group: &str, key: &str) -> Option<T> {
    read(settings.get(group), key)
}

pub fn put(group: &mut Group, key: &str, value: impl Into<Value<'static>>) {
    let value = OwnedValue::try_from(value.into()).expect("settings never hold file descriptors");
    group.insert(key.to_owned(), value);
}

pub fn put_text(group: &mut Group, key: &str, text: &str) {
    if text.is_empty() {
        group.remove(key);
    } else {
        put(group, key, text.to_owned());
    }
}
