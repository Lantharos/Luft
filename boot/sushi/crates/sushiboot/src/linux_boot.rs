//! Boot Linux bzImage/PE kernels from the ESP (replaces GRUB/systemd-boot load path).

use alloc::string::String;
use alloc::vec::Vec;
use core::mem::MaybeUninit;

use uefi::boot::{self, LoadImageSource};
use uefi::proto::BootPolicy;
use uefi::proto::device_path::build::{self, media::FilePath};
use uefi::proto::device_path::{DevicePath, DeviceSubType, LoadedImageDevicePath};
use uefi::proto::loaded_image::LoadedImage;
use uefi::proto::media::file::{File, FileAttribute, FileInfo, FileMode, FileType};
use uefi::proto::media::fs::SimpleFileSystem;
use uefi::table::boot::{AllocateType, MemoryType};
use uefi::{CString16, Handle};

pub struct LinuxEntry<'a> {
    pub initrd: Option<&'a str>,
    pub cmdline: &'a str,
}

/// Load the kernel image from a specific ESP/volume.
pub fn preload_kernel(volume: Handle, linux_path: &str) -> uefi::Result<Handle> {
    let on_boot_esp = boot_volume_handle()
        .map(|boot| boot == volume)
        .unwrap_or(true);

    if on_boot_esp {
        if let Ok(image) = load_via_device_path(linux_path) {
            return Ok(image);
        }
    }

    load_image_from_volume(volume, linux_path).or_else(|_| {
        let kernel = load_file(volume, linux_path)?;
        load_via_buffer(&kernel)
    })
}

fn boot_volume_handle() -> Option<Handle> {
    boot::open_protocol_exclusive::<LoadedImage>(boot::image_handle())
        .ok()
        .and_then(|loaded| loaded.device())
}

fn load_via_device_path(linux_path: &str) -> uefi::Result<Handle> {
    let boot_path = boot::open_protocol_exclusive::<LoadedImageDevicePath>(boot::image_handle())?;
    let file_name = normalize_path(linux_path);
    let cname = CString16::try_from(file_name.as_str())
        .map_err(|_| uefi::Error::from(uefi::Status::INVALID_PARAMETER))?;

    let mut buf = [MaybeUninit::uninit(); 1024];
    let mut builder = build::DevicePathBuilder::with_buf(&mut buf);
    for node in boot_path.node_iter() {
        if node.sub_type() == DeviceSubType::MEDIA_FILE_PATH {
            break;
        }
        builder = builder
            .push(&node)
            .map_err(|_| uefi::Error::from(uefi::Status::OUT_OF_RESOURCES))?;
    }
    let full_path = builder
        .push(&FilePath { path_name: &cname })
        .map_err(|_| uefi::Error::from(uefi::Status::OUT_OF_RESOURCES))?
        .finalize()
        .map_err(|_| uefi::Error::from(uefi::Status::OUT_OF_RESOURCES))?;

    match boot::load_image(
        boot::image_handle(),
        LoadImageSource::FromDevicePath {
            device_path: full_path,
            boot_policy: BootPolicy::BootSelection,
        },
    ) {
        Ok(handle) => Ok(handle),
        Err(_) => boot::load_image(
            boot::image_handle(),
            LoadImageSource::FromDevicePath {
                device_path: full_path,
                boot_policy: BootPolicy::ExactMatch,
            },
        ),
    }
}

pub fn load_image_from_volume(volume: Handle, file_path: &str) -> uefi::Result<Handle> {
    let vol_path = boot::open_protocol_exclusive::<DevicePath>(volume)?;
    let normalized = normalize_path(file_path);
    let cname = CString16::try_from(normalized.as_str())
        .map_err(|_| uefi::Error::from(uefi::Status::INVALID_PARAMETER))?;

    let mut buf = [MaybeUninit::uninit(); 1024];
    let mut builder = build::DevicePathBuilder::with_buf(&mut buf);
    for node in vol_path.node_iter() {
        if matches!(
            node.sub_type(),
            DeviceSubType::END_ENTIRE | DeviceSubType::END_INSTANCE
        ) {
            break;
        }
        builder = builder
            .push(&node)
            .map_err(|_| uefi::Error::from(uefi::Status::OUT_OF_RESOURCES))?;
    }
    let full = builder
        .push(&FilePath { path_name: &cname })
        .map_err(|_| uefi::Error::from(uefi::Status::OUT_OF_RESOURCES))?
        .finalize()
        .map_err(|_| uefi::Error::from(uefi::Status::OUT_OF_RESOURCES))?;

    boot::load_image(
        boot::image_handle(),
        LoadImageSource::FromDevicePath {
            device_path: full,
            boot_policy: BootPolicy::ExactMatch,
        },
    )
}

pub fn start_preloaded(image: Handle, entry: &LinuxEntry<'_>) -> uefi::Result<()> {
    let mut cmdline = String::from(entry.cmdline);
    if let Some(initrd_path) = entry.initrd {
        let initrd_arg = initrd_cmdline_arg(initrd_path);
        if !cmdline.contains("initrd=") {
            let prefix = alloc::format!("initrd={initrd_arg} ");
            cmdline = alloc::format!("{prefix}{cmdline}");
        }
    }
    start_with_cmdline(image, &cmdline)
}

fn load_via_buffer(kernel: &[u8]) -> uefi::Result<Handle> {
    let pages = (kernel.len() + 4095) / 4096;
    let addr = boot::allocate_pages(AllocateType::AnyPages, MemoryType::LOADER_DATA, pages)?;
    unsafe {
        core::ptr::copy_nonoverlapping(kernel.as_ptr(), addr.as_ptr(), kernel.len());
    }
    let buffer = unsafe { core::slice::from_raw_parts(addr.as_ptr(), kernel.len()) };
    boot::load_image(
        boot::image_handle(),
        LoadImageSource::FromBuffer {
            buffer,
            file_path: None,
        },
    )
}

fn start_with_cmdline(image: Handle, cmdline: &str) -> uefi::Result<()> {
    let mut loaded = boot::open_protocol_exclusive::<LoadedImage>(image)?;
    let options = cmdline_utf16(cmdline);
    unsafe {
        loaded.set_load_options(options.as_ptr(), options.len() as u32);
    }
    boot::start_image(image)
}

fn cmdline_utf16(cmdline: &str) -> Vec<u8> {
    let mut out = Vec::with_capacity(cmdline.len() * 2 + 2);
    for unit in cmdline.encode_utf16() {
        out.extend_from_slice(&unit.to_le_bytes());
    }
    out.extend_from_slice(&[0, 0]);
    out
}

pub fn read_esp_file(device: Handle, path: &str) -> uefi::Result<Vec<u8>> {
    load_file(device, path)
}

pub fn load_buffer(kernel: &[u8]) -> uefi::Result<Handle> {
    load_via_buffer(kernel)
}

fn load_file(device: Handle, path: &str) -> uefi::Result<Vec<u8>> {
    let mut fs = boot::open_protocol_exclusive::<SimpleFileSystem>(device)?;
    let mut root = fs.open_volume()?;
    let normalized = normalize_path(path);
    let cpath = CString16::try_from(normalized.as_str())
        .map_err(|_| uefi::Error::from(uefi::Status::INVALID_PARAMETER))?;
    let file = root.open(&cpath, FileMode::Read, FileAttribute::empty())?;
    let FileType::Regular(mut regular) = file.into_type()? else {
        return Err(uefi::Error::from(uefi::Status::NOT_FOUND));
    };
    let info = regular.get_boxed_info::<FileInfo>()?;
    let mut data = alloc::vec![0u8; info.file_size() as usize];
    regular.read(&mut data)?;
    Ok(data)
}

/// Kernel cmdline initrd path — absolute from ESP root, EFI backslashes (see kernel efi-stub docs).
fn initrd_cmdline_arg(path: &str) -> String {
    normalize_path(path)
}

/// UEFI device path for FAT file open — backslashes, leading slash.
fn normalize_path(path: &str) -> String {
    let trimmed = path.trim_start_matches('\\').trim_start_matches('/');
    let normalized = trimmed.replace('/', "\\");
    if normalized.starts_with('\\') {
        normalized
    } else {
        alloc::format!("\\{normalized}")
    }
}



