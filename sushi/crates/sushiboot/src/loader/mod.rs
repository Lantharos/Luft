use alloc::string::String;

use uefi::runtime::{self, VariableAttributes, VariableVendor};
use uefi::{CStr16, guid};

pub mod back;
pub mod conf;
pub mod last;
pub mod vars;

pub const LUFT: VariableVendor = VariableVendor(guid!("b6a4c1e2-3f5d-4c8a-9e71-2d0f6a8b5c3e"));

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

fn remove(name: &CStr16) {
    let _ = runtime::delete_variable(name, &LUFT);
}
