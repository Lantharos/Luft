use alloc::format;
use alloc::string::{String, ToString};

use uefi::runtime::{self, VariableAttributes};
use uefi::{CStr16, cstr16};

use super::LUFT;

const TRIES: u32 = 3;
const GOOD: &CStr16 = cstr16!("LuftBootGood");
const TRIED: &CStr16 = cstr16!("LuftBootTried");
const TRYING: &CStr16 = cstr16!("LuftBootTrying");
const WENT_BACK: &CStr16 = cstr16!("LuftBootWentBack");
const GO_BACK: &CStr16 = cstr16!("LuftBootGoBack");
const PREVIOUS: &CStr16 = cstr16!("LuftBootPrevious");

pub struct Attempts {
    good: Option<String>,
    tried: Option<(u32, String)>,
}

pub(super) fn read(name: &CStr16) -> Option<String> {
    let (data, _) = runtime::get_variable_boxed(name, &LUFT).ok()?;
    String::from_utf8(data.into_vec()).ok()
}

pub(super) fn write(name: &CStr16, text: &str, lasting: bool) {
    let mut attributes =
        VariableAttributes::BOOTSERVICE_ACCESS | VariableAttributes::RUNTIME_ACCESS;
    if lasting {
        attributes |= VariableAttributes::NON_VOLATILE;
    }
    let _ = runtime::set_variable(name, &LUFT, attributes, text.as_bytes());
}

impl Attempts {
    pub fn load() -> Self {
        let tried = read(TRIED).and_then(|text| {
            let (count, image) = text.split_once(' ')?;
            Some((count.parse().ok()?, image.to_string()))
        });
        Self {
            good: read(GOOD),
            tried,
        }
    }

    pub fn is_good(&self, image: &str) -> bool {
        self.good.as_deref() == Some(image)
    }

    pub fn exhausted(&self, image: &str) -> bool {
        matches!(&self.tried, Some((count, tried)) if tried == image && *count >= TRIES)
    }

    pub fn start(&mut self, image: &str, counted: bool) {
        if self.is_good(image) {
            return;
        }
        write(TRYING, image, false);
        if !counted {
            return;
        }
        let count = match &self.tried {
            Some((count, tried)) if tried == image => count.saturating_add(1),
            _ => 1,
        };
        write(TRIED, &format!("{count} {image}"), true);
        self.tried = Some((count, image.to_string()));
    }
}

pub(super) fn remove(name: &CStr16) {
    let _ = runtime::delete_variable(name, &LUFT);
}

pub fn went_back(image: &str) {
    write(WENT_BACK, image, false);
}

pub fn take_go_back() -> Option<String> {
    let entry = read(GO_BACK)?;
    let _ = runtime::delete_variable(GO_BACK, &LUFT);
    Some(entry)
}

pub fn offer_previous(version: Option<&str>) {
    match version {
        Some(version) => write(PREVIOUS, version, false),
        None => {
            let _ = runtime::delete_variable(PREVIOUS, &LUFT);
        }
    }
}
