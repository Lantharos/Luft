use alloc::vec::Vec;
use core::mem::MaybeUninit;

use uefi::boot::{self, AllocateType, LoadImageSource, MemoryType};
use uefi::proto::BootPolicy;
use uefi::proto::device_path::build::{self, media::FilePath};
use uefi::proto::device_path::{DevicePath, DeviceSubType};
use uefi::proto::loaded_image::LoadedImage;
use uefi::{CString16, Handle, Status};

use crate::files::{self, Volume};

fn resources() -> uefi::Error {
    uefi::Error::from(Status::OUT_OF_RESOURCES)
}

fn load_from_path(volume: Handle, path: &str) -> uefi::Result<Handle> {
    let volume_path = boot::open_protocol_exclusive::<DevicePath>(volume)?;
    let name = CString16::try_from(files::efi_path(path).as_str())
        .map_err(|_| uefi::Error::from(Status::INVALID_PARAMETER))?;
    let mut buffer = [MaybeUninit::uninit(); 1024];
    let mut builder = build::DevicePathBuilder::with_buf(&mut buffer);
    for node in volume_path.node_iter() {
        if matches!(
            node.sub_type(),
            DeviceSubType::END_ENTIRE | DeviceSubType::END_INSTANCE
        ) {
            break;
        }
        builder = builder.push(&node).map_err(|_| resources())?;
    }
    let full = builder
        .push(&FilePath { path_name: &name })
        .map_err(|_| resources())?
        .finalize()
        .map_err(|_| resources())?;
    boot::load_image(
        boot::image_handle(),
        LoadImageSource::FromDevicePath {
            device_path: full,
            boot_policy: BootPolicy::ExactMatch,
        },
    )
}

fn load_from_memory(volume: Handle, path: &str) -> uefi::Result<Handle> {
    let data = Volume::open(volume)
        .and_then(|mut volume| volume.read(path))
        .ok_or_else(|| uefi::Error::from(Status::NOT_FOUND))?;
    let pages = data.len().div_ceil(4096);
    let address = boot::allocate_pages(AllocateType::AnyPages, MemoryType::LOADER_DATA, pages)?;
    let buffer = unsafe {
        core::ptr::copy_nonoverlapping(data.as_ptr(), address.as_ptr(), data.len());
        core::slice::from_raw_parts(address.as_ptr(), data.len())
    };
    boot::load_image(
        boot::image_handle(),
        LoadImageSource::FromBuffer {
            buffer,
            file_path: None,
        },
    )
}

pub fn load(volume: Handle, path: &str) -> uefi::Result<Handle> {
    load_from_path(volume, path).or_else(|_| load_from_memory(volume, path))
}

fn utf16(text: &str) -> Vec<u8> {
    text.encode_utf16()
        .chain([0])
        .flat_map(u16::to_le_bytes)
        .collect()
}

pub fn start(image: Handle, options: &str) -> uefi::Result<()> {
    let encoded = utf16(options);
    if !options.is_empty() {
        let mut loaded = boot::open_protocol_exclusive::<LoadedImage>(image)?;
        unsafe {
            loaded.set_load_options(encoded.as_ptr(), encoded.len() as u32);
        }
    }
    boot::start_image(image)
}
