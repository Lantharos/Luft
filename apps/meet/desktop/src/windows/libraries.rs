use windows::Win32::System::Diagnostics::Debug::IMAGE_LOAD_CONFIG_DIRECTORY64;
use windows::Win32::System::LibraryLoader::{
    LOAD_LIBRARY_SEARCH_SYSTEM32, SetDefaultDllDirectories,
};

#[repr(C, align(8))]
struct LoadConfig(IMAGE_LOAD_CONFIG_DIRECTORY64);

#[used]
#[unsafe(export_name = "_load_config_used")]
static IMPORTS_FROM_SYSTEM32: LoadConfig = LoadConfig(IMAGE_LOAD_CONFIG_DIRECTORY64 {
    Size: size_of::<IMAGE_LOAD_CONFIG_DIRECTORY64>() as u32,
    DependentLoadFlags: LOAD_LIBRARY_SEARCH_SYSTEM32.0 as u16,
    ..unsafe { std::mem::zeroed() }
});

pub fn only_from_system32() -> bool {
    unsafe { SetDefaultDllDirectories(LOAD_LIBRARY_SEARCH_SYSTEM32) }.is_ok()
}
