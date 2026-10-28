use alloc::string::String;

use uefi::{CStr16, cstr16};

use super::{read, remove, write};

const WENT_BACK: &CStr16 = cstr16!("LuftBootWentBack");
const GO_BACK: &CStr16 = cstr16!("LuftBootGoBack");
const PREVIOUS: &CStr16 = cstr16!("LuftBootPrevious");

pub fn went_back(image: &str) {
    write(WENT_BACK, image, false);
}

pub fn take_go_back() -> Option<String> {
    let entry = read(GO_BACK)?;
    remove(GO_BACK);
    Some(entry)
}

pub fn offer_previous(version: Option<&str>) {
    match version {
        Some(version) => write(PREVIOUS, version, false),
        None => remove(PREVIOUS),
    }
}
