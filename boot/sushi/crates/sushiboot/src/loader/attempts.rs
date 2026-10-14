use alloc::format;
use alloc::string::{String, ToString};

use uefi::runtime::{self, VariableAttributes, VariableVendor};
use uefi::{CStr16, cstr16, guid};

const LUFT: VariableVendor = VariableVendor(guid!("b6a4c1e2-3f5d-4c8a-9e71-2d0f6a8b5c3e"));
const TRIES: u32 = 3;
const GOOD: &CStr16 = cstr16!("LuftBootGood");
const TRIED: &CStr16 = cstr16!("LuftBootTried");
const TRYING: &CStr16 = cstr16!("LuftBootTrying");
const WENT_BACK: &CStr16 = cstr16!("LuftBootWentBack");

pub struct Attempts {
    good: Option<String>,
    tried: Option<(u32, String)>,
}

fn read(name: &CStr16) -> Option<String> {
    let (data, _) = runtime::get_variable_boxed(name, &LUFT).ok()?;
    String::from_utf8(data.into_vec()).ok()
}

fn write(name: &CStr16, text: &str, lasting: bool) {
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

pub fn went_back(version: &str) {
    write(WENT_BACK, version, false);
}
