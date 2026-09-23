//! Chainload another UEFI application (e.g. Windows bootmgfw.efi).

use uefi::boot;
use uefi::Handle;

use crate::linux_boot;

pub fn start_efi(volume: Handle, efi_path: &str) -> uefi::Result<()> {
    let image = linux_boot::load_image_from_volume(volume, efi_path).or_else(|_| {
        let data = linux_boot::read_esp_file(volume, efi_path)?;
        linux_boot::load_buffer(&data)
    })?;
    boot::start_image(image)
}