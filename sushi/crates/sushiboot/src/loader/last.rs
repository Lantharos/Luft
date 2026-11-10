use alloc::string::String;

use uefi::{CStr16, cstr16};

use super::{read, remove, write};
use crate::entries::Catalog;

const LAST: &CStr16 = cstr16!("LuftBootLast");

pub fn other_system_started_last() -> Option<String> {
    read(LAST)
}

pub fn started(catalog: &Catalog, chosen: usize) {
    let remembered = read(LAST);
    if catalog.others.contains(&chosen) {
        let id = &catalog.entries[chosen].id;
        if remembered.as_deref() != Some(id.as_str()) {
            write(LAST, id, true);
        }
    } else if remembered.is_some() && catalog.entries[chosen].image().is_some() {
        remove(LAST);
    }
}
