use uefi::runtime::{self, ResetType, VariableAttributes, VariableVendor};
use uefi::{Status, cstr16};

const BOOT_TO_FIRMWARE_UI: u64 = 1;

fn indications(name: &uefi::CStr16) -> u64 {
    let mut buffer = [0u8; 8];
    runtime::get_variable(name, &VariableVendor::GLOBAL_VARIABLE, &mut buffer)
        .ok()
        .and_then(|(data, _)| data.try_into().ok())
        .map_or(0, u64::from_le_bytes)
}

pub fn setup_supported() -> bool {
    indications(cstr16!("OsIndicationsSupported")) & BOOT_TO_FIRMWARE_UI != 0
}

pub fn secure_boot() -> bool {
    let mut buffer = [0u8; 1];
    runtime::get_variable(
        cstr16!("SecureBoot"),
        &VariableVendor::GLOBAL_VARIABLE,
        &mut buffer,
    )
    .is_ok_and(|(data, _)| data == [1])
}

pub fn reboot_to_setup() -> uefi::Result<()> {
    let requested = indications(cstr16!("OsIndications")) | BOOT_TO_FIRMWARE_UI;
    runtime::set_variable(
        cstr16!("OsIndications"),
        &VariableVendor::GLOBAL_VARIABLE,
        VariableAttributes::NON_VOLATILE
            | VariableAttributes::BOOTSERVICE_ACCESS
            | VariableAttributes::RUNTIME_ACCESS,
        &requested.to_le_bytes(),
    )?;
    runtime::reset(ResetType::COLD, Status::SUCCESS, None)
}
