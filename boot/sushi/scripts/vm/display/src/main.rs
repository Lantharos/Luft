#![no_main]
#![no_std]

extern crate alloc;

use alloc::boxed::Box;
use alloc::string::String;
use core::mem::MaybeUninit;

use uefi::boot::{
    self, LoadImageSource, OpenProtocolAttributes, OpenProtocolParams, ScopedProtocol,
};
use uefi::fs::FileSystem;
use uefi::prelude::*;
use uefi::proto::BootPolicy;
use uefi::proto::ProtocolPointer;
use uefi::proto::console::gop::GraphicsOutput;
use uefi::proto::device_path::build::{self, media::FilePath};
use uefi::proto::device_path::{DevicePath, DeviceSubType, DeviceType};
use uefi::proto::loaded_image::LoadedImage;
use uefi::{Guid, Handle, cstr16, guid};

const SETTINGS: &uefi::CStr16 = cstr16!("\\vm-display.conf");
const BOOT_LOADER: &uefi::CStr16 = cstr16!("\\EFI\\sushi\\SushiBoot.efi");
const EDID_PROTOCOLS: [Guid; 2] = [
    guid!("1c0c34f6-d380-41fa-a049-8ad06c1a66aa"),
    guid!("bd8c1056-9f36-44ec-92a8-a6337f817986"),
];

#[repr(C)]
struct EdidProtocol {
    size: u32,
    edid: *const u8,
}

fn shared<P: ProtocolPointer + ?Sized>(handle: Handle) -> uefi::Result<ScopedProtocol<P>> {
    let params = OpenProtocolParams {
        handle,
        agent: boot::image_handle(),
        controller: None,
    };
    unsafe { boot::open_protocol::<P>(params, OpenProtocolAttributes::GetProtocol) }
}

fn size(text: &str) -> Option<(u32, u32)> {
    let (width, height) = text.trim().split_once('x')?;
    Some((width.parse().ok()?, height.parse().ok()?))
}

fn detailed_timing((width, height): (u32, u32), (width_mm, height_mm): (u32, u32)) -> [u8; 18] {
    let (h_blank, v_blank) = (160u32, 30u32);
    let clock = (width + h_blank) * (height + v_blank) * 60 / 10_000;
    let high = |value: u32| ((value >> 8) & 0x0f) as u8;
    [
        clock as u8,
        (clock >> 8) as u8,
        width as u8,
        h_blank as u8,
        high(width) << 4 | high(h_blank),
        height as u8,
        v_blank as u8,
        high(height) << 4 | high(v_blank),
        48,
        32,
        3 << 4 | 10,
        0,
        width_mm as u8,
        height_mm as u8,
        high(width_mm) << 4 | high(height_mm),
        0,
        0,
        0x1e,
    ]
}

fn edid(native: (u32, u32)) -> [u8; 128] {
    let physical = (native.0 * 800 / 3440, native.1 * 800 / 3440);
    let mut edid = [0u8; 128];
    edid[..8].copy_from_slice(&[0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x00]);
    edid[8..10].copy_from_slice(&[0x45, 0xb5]);
    edid[18..21].copy_from_slice(&[1, 4, 0x80]);
    edid[21] = (physical.0 / 10) as u8;
    edid[22] = (physical.1 / 10) as u8;
    edid[24] = 0x02;
    edid[35..38].copy_from_slice(&[0x21, 0x08, 0x00]);
    edid[38..54].fill(0x01);
    edid[54..72].copy_from_slice(&detailed_timing(native, physical));
    for descriptor in [72, 90, 108] {
        edid[descriptor + 3] = 0x10;
    }
    let sum = edid[..127]
        .iter()
        .fold(0u8, |sum, byte| sum.wrapping_add(*byte));
    edid[127] = sum.wrapping_neg();
    edid
}

fn describe_monitor(gop: Handle, native: (u32, u32)) {
    let data: &'static [u8; 128] = Box::leak(Box::new(edid(native)));
    let protocol: &'static EdidProtocol = Box::leak(Box::new(EdidProtocol {
        size: data.len() as u32,
        edid: data.as_ptr(),
    }));
    for guid in &EDID_PROTOCOLS {
        let installed = unsafe {
            boot::install_protocol_interface(
                Some(gop),
                guid,
                (protocol as *const EdidProtocol).cast(),
            )
        };
        if let Err(error) = installed {
            log::error!("vm-display: no EDID for the boot loader: {error:?}");
        }
    }
}

fn hand_over(gop: &mut GraphicsOutput, wanted: (u32, u32)) {
    let mode = gop.modes().find(|mode| {
        let (width, height) = mode.info().resolution();
        (width as u32, height as u32) == wanted
    });
    match mode {
        Some(mode) => {
            if let Err(error) = gop.set_mode(&mode) {
                log::error!("vm-display: couldn't switch to {wanted:?}: {error:?}");
            }
        }
        None => log::error!("vm-display: the firmware has no {wanted:?} mode"),
    }
}

fn start_boot_loader() -> uefi::Result<()> {
    let image = shared::<LoadedImage>(boot::image_handle())?;
    let device = image.device().ok_or(Status::NOT_FOUND)?;
    let volume = shared::<DevicePath>(device)?;
    let mut buffer = [MaybeUninit::uninit(); 1024];
    let mut builder = build::DevicePathBuilder::with_buf(&mut buffer);
    for node in volume
        .node_iter()
        .take_while(|node| node.full_type() != (DeviceType::END, DeviceSubType::END_INSTANCE))
    {
        builder = builder.push(&node).map_err(|_| Status::OUT_OF_RESOURCES)?;
    }
    let path = builder
        .push(&FilePath {
            path_name: BOOT_LOADER,
        })
        .and_then(|builder| builder.finalize())
        .map_err(|_| Status::OUT_OF_RESOURCES)?;
    let loader = boot::load_image(
        boot::image_handle(),
        LoadImageSource::FromDevicePath {
            device_path: path,
            boot_policy: BootPolicy::ExactMatch,
        },
    )?;
    drop(volume);
    drop(image);
    boot::start_image(loader)
}

#[entry]
fn efi_main() -> Status {
    uefi::helpers::init().expect("the UEFI helpers start once");
    let settings = boot::get_image_file_system(boot::image_handle())
        .ok()
        .and_then(|volume| FileSystem::new(volume).read(SETTINGS).ok())
        .and_then(|data| String::from_utf8(data).ok())
        .unwrap_or_default();
    if let Ok(handle) = boot::get_handle_for_protocol::<GraphicsOutput>()
        && let Ok(mut gop) = shared::<GraphicsOutput>(handle)
    {
        for (key, value) in settings.lines().filter_map(|line| line.split_once(' ')) {
            match (key, size(value)) {
                ("monitor", Some(native)) => describe_monitor(handle, native),
                ("framebuffer", Some(wanted)) => hand_over(&mut gop, wanted),
                _ => {}
            }
        }
    }
    match start_boot_loader() {
        Ok(()) => Status::SUCCESS,
        Err(error) => error.status(),
    }
}
