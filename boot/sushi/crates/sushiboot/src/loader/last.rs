use alloc::string::String;

use uefi::{CStr16, cstr16};

use super::attempts::{read, remove, write};
use crate::entries::Catalog;

const LAST: &CStr16 = cstr16!("LuftBootLast");

// The other system started last, such as Windows, so it starts again by
// itself, as when Windows restarts to finish an update. Starting Luft forgets
// it, so Luft is always its newest version rather than one picked once.
pub fn other_system() -> Option<String> {
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
