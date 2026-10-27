use alloc::format;
use alloc::string::String;

use uefi::Handle;

use super::image;
use crate::files;

pub fn start(volume: Handle, linux: &str, initrd: Option<&str>, options: &str) -> uefi::Result<()> {
    let kernel = image::load(volume, linux)?;
    let options = match initrd {
        Some(initrd) if !options.contains("initrd=") => {
            format!("initrd={} {options}", files::efi_path(initrd))
        }
        _ => String::from(options),
    };
    image::start(kernel, options.trim())
}
