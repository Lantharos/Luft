use uefi::guid;
use uefi::runtime::VariableVendor;

pub mod attempts;
pub mod conf;
pub mod vars;

pub const LUFT: VariableVendor = VariableVendor(guid!("b6a4c1e2-3f5d-4c8a-9e71-2d0f6a8b5c3e"));
