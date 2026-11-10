use alloc::string::String;

use sushi_scene::firmware::LUFT_VARIABLES;
use uefi::runtime::{self, VariableAttributes, VariableVendor};
use uefi::{CStr16, Guid};

pub mod back;
pub mod conf;
pub mod last;
pub mod vars;

pub const LUFT: VariableVendor = VariableVendor(Guid::parse_or_panic(LUFT_VARIABLES));

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
