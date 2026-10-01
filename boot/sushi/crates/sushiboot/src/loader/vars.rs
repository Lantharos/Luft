use alloc::format;
use alloc::string::String;
use alloc::vec::Vec;

use uefi::runtime::{self, VariableAttributes, VariableVendor};
use uefi::{CStr16, cstr16, guid};

use crate::entries::Catalog;

const LOADER: VariableVendor = VariableVendor(guid!("4a67b082-0a4c-41cf-b6c7-440b29bb8c4f"));
const ENTRY_DEFAULT: u64 = 1 << 2;
const ENTRY_ONESHOT: u64 = 1 << 3;
const MULTI_PROFILE_UKI: u64 = 1 << 14;

fn utf16(text: &str) -> Vec<u8> {
    text.encode_utf16()
        .chain([0])
        .flat_map(u16::to_le_bytes)
        .collect()
}

fn text(name: &CStr16) -> Option<String> {
    let (data, _) = runtime::get_variable_boxed(name, &LOADER).ok()?;
    let units: Vec<u16> = data
        .as_chunks::<2>()
        .0
        .iter()
        .map(|pair| u16::from_le_bytes(*pair))
        .take_while(|unit| *unit != 0)
        .collect();
    String::from_utf16(&units).ok()
}

fn announce(name: &CStr16, data: &[u8]) {
    let _ = runtime::set_variable(
        name,
        &LOADER,
        VariableAttributes::BOOTSERVICE_ACCESS | VariableAttributes::RUNTIME_ACCESS,
        data,
    );
}

pub fn take_oneshot() -> Option<String> {
    let name = cstr16!("LoaderEntryOneShot");
    let entry = text(name)?;
    let _ = runtime::delete_variable(name, &LOADER);
    Some(entry)
}

pub fn chosen_default() -> Option<String> {
    text(cstr16!("LoaderEntryDefault"))
}

pub fn describe(catalog: &Catalog) {
    announce(
        cstr16!("LoaderInfo"),
        &utf16(&format!("SushiBoot {}", env!("CARGO_PKG_VERSION"))),
    );
    announce(
        cstr16!("LoaderFeatures"),
        &(ENTRY_DEFAULT | ENTRY_ONESHOT | MULTI_PROFILE_UKI).to_le_bytes(),
    );
    let entries: Vec<u8> = catalog
        .entries
        .iter()
        .flat_map(|entry| utf16(&entry.id))
        .collect();
    announce(cstr16!("LoaderEntries"), &entries);
}

pub fn selected(id: &str) {
    announce(cstr16!("LoaderEntrySelected"), &utf16(id));
}
