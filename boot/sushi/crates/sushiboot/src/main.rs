#![no_main]
#![no_std]

extern crate alloc;

mod bgrt;
mod bmp;
mod chainload;
mod entries;
mod font;
mod linux_boot;
mod loader_conf;
mod menu;
mod scene;
mod tpm;
mod tpm2;
mod volume;

use alloc::format;
use alloc::string::String;
use alloc::vec::Vec;

use core::fmt::Write as _;
use entries::{BootEntry, BootKind};
use linux_boot::LinuxEntry;
use loader_conf::LoaderConfig;
use scene::{BootScene, MIN_ANIM_FRAMES, SPINNER_FRAME_US};
use uefi::boot;
use uefi::prelude::*;
use uefi::proto::console::gop::GraphicsOutput;
use uefi::proto::console::serial::Serial;
use uefi::proto::loaded_image::LoadedImage;
use uefi::table::boot::SearchType;
use uefi::{Handle, Identify};

pub(crate) const SUSHI_VENDOR_GUID: uefi::Guid = uefi::guid!("a7b3c4d5-e6f7-4890-abcd-ef1234567890");

#[entry]
fn efi_main() -> Status {
    uefi::helpers::init().unwrap();

    let loaded = boot::open_protocol_exclusive::<LoadedImage>(boot::image_handle()).unwrap();
    let device = loaded.device().unwrap();
    let gop_device = find_gop_device(device);
    let mut gop = boot::open_protocol_exclusive::<GraphicsOutput>(gop_device).unwrap();
    let (width, height) = gop.current_mode_info().resolution();
    let mut scene = BootScene::new(width as u32, height as u32);

    boot_log(&format!("SushiBoot: GOP {}x{} fmt={:?}", scene.width, scene.height, gop.current_mode_info().pixel_format()));
    boot_log(&format!(
        "SushiBoot: logo {:?} ({}x{})",
        scene.logo_kind, scene.logo_native_w, scene.logo_native_h
    ));

    present_frame(&mut scene, &mut gop, "first frame");

    let mut collected: Option<Vec<BootEntry>> = None;
    let mut loader_conf: Option<LoaderConfig> = None;

    while scene.animation_frames < MIN_ANIM_FRAMES || collected.is_none() {
        if collected.is_none() && scene.animation_frames >= 1 {
            let (mut list, esp_count) = entries::collect_all(device);
            if list.is_empty() {
                list.push(entries::fallback_entry(device));
            }
            loader_conf = Some(loader_conf::load(device));
            boot_log(&format!("SushiBoot: {} entries from {} ESP(s)", list.len(), esp_count));
            collected = Some(list);
        }
        spin_frame(&mut scene, &mut gop);
    }

    let entries = collected.unwrap_or_else(|| alloc::vec![entries::fallback_entry(device)]);
    let conf = loader_conf.unwrap_or_default();
    let selected_idx = menu::run_menu(&mut scene, &mut gop, &entries, &conf);
    let entry = &entries[selected_idx];
    boot_log(&format!("SushiBoot: booting {}", entry.title));

    match &entry.kind {
        BootKind::Linux { linux, initrd, options } => {
            boot_linux(entry.volume, &mut scene, &mut gop, linux, initrd.as_deref(), options)
        }
        BootKind::Efi { efi, .. } => {
            present_handoff_frame(&mut scene, &mut gop);
            clear_serial_console();
            match chainload::start_efi(entry.volume, efi) {
                Ok(()) => Status::SUCCESS,
                Err(err) => {
                    boot_log(&format!("SushiBoot: chainload failed: {err:?}"));
                    Status::LOAD_ERROR
                }
            }
        }
    }
}

fn boot_linux(
    device: Handle,
    scene: &mut BootScene,
    gop: &mut GraphicsOutput,
    linux: &str,
    initrd: Option<&str>,
    options: &str,
) -> Status {
    store_sushi_state(scene);
    let cmdline = build_linux_cmdline(device, options, &scene.handoff_json());
    let kernel = match linux_boot::preload_kernel(device, linux) {
        Ok(image) => image,
        Err(err) => {
            boot_log(&format!("SushiBoot: kernel load failed: {err:?}"));
            return Status::LOAD_ERROR;
        }
    };
    present_handoff_frame(scene, gop);
    clear_serial_console();
    let linux_entry = LinuxEntry {
        initrd,
        cmdline: &cmdline,
    };
    match linux_boot::start_preloaded(kernel, &linux_entry) {
        Ok(()) => Status::SUCCESS,
        Err(err) => {
            boot_log(&format!("SushiBoot: boot failed: {err:?}"));
            Status::LOAD_ERROR
        }
    }
}

fn ensure_kernel_logo_suppressed(cmdline: &mut String) {
    for flag in ["fbcon.logo=0"] {
        let key = flag.split('=').next().unwrap_or(flag);
        if !cmdline.split_whitespace().any(|tok| tok == flag || tok.starts_with(&format!("{key}=")))
        {
            cmdline.push(' ');
            cmdline.push_str(flag);
        }
    }
}

fn build_linux_cmdline(device: Handle, options: &str, state_json: &str) -> String {
    let b64 = base64_encode(state_json.as_bytes());
    let mut cmdline = String::from(options);
    if !cmdline.contains("rd.sushi") {
        cmdline.push_str(" rd.sushi=1");
    }
    ensure_kernel_logo_suppressed(&mut cmdline);
    tpm::append_tpm_hint(&mut cmdline);
    if let Some(key) = tpm::try_unseal_luks_key(device) {
        let key_b64 = base64_encode(key.as_bytes());
        cmdline.push_str(" sushi.luks.key=b64:");
        cmdline.push_str(&key_b64);
    }
    cmdline.push_str(" sushi.state=b64:");
    cmdline.push_str(&b64);
    cmdline
}

fn boot_log(msg: &str) {
    if let Ok(handles) = boot::locate_handle_buffer(SearchType::ByProtocol(&Serial::GUID)) {
        for &handle in handles.iter() {
            if let Ok(mut serial) = boot::open_protocol_exclusive::<Serial>(handle) {
                let _ = serial.write_str(msg);
                let _ = serial.write_str("\r\n");
                return;
            }
        }
    }
}

/// Drop firmware/SushiBoot scrollback before the next image owns the console.
fn clear_serial_console() {
    const CLEAR: &str = "\x1b[2J\x1b[3J\x1b[H";
    if let Ok(handles) = boot::locate_handle_buffer(SearchType::ByProtocol(&Serial::GUID)) {
        for &handle in handles.iter() {
            if let Ok(mut serial) = boot::open_protocol_exclusive::<Serial>(handle) {
                let _ = serial.write_str(CLEAR);
                return;
            }
        }
    }
}

fn find_gop_device(fallback_device: Handle) -> Handle {
    boot::get_handle_for_protocol::<GraphicsOutput>()
        .ok()
        .or_else(|| {
            boot::locate_handle_buffer(SearchType::ByProtocol(&GraphicsOutput::GUID))
                .ok()
                .and_then(|handles| handles.first().copied())
        })
        .unwrap_or(fallback_device)
}

fn spin_frame(scene: &mut BootScene, gop: &mut GraphicsOutput) {
    scene.advance_frame();
    present_frame(scene, gop, "spin");
    boot::stall(SPINNER_FRAME_US as usize);
}

fn present_frame(scene: &mut BootScene, gop: &mut GraphicsOutput, label: &str) {
    if let Err(err) = scene.draw_and_present(gop) {
        boot_log(&format!("SushiBoot: present failed ({label}): {err:?}"));
    }
}

fn present_handoff_frame(scene: &mut BootScene, gop: &mut GraphicsOutput) {
    if let Err(err) = scene.draw_handoff_and_present(gop) {
        boot_log(&format!("SushiBoot: handoff present failed: {err:?}"));
    }
}

fn store_sushi_state(scene: &BootScene) {
    let json = scene.store_state_json();
    let bytes = json.as_bytes();
    let pages = (bytes.len() + 4095) / 4096;
    if let Ok(addr) = boot::allocate_pages(uefi::table::boot::AllocateType::AnyPages, uefi::table::boot::MemoryType::LOADER_DATA, pages) {
        let ptr = addr.as_ptr();
        unsafe {
            core::ptr::copy_nonoverlapping(bytes.as_ptr(), ptr, bytes.len());
            let _ = boot::install_configuration_table(&SUSHI_VENDOR_GUID, ptr.cast());
        }
    }
}

fn base64_encode(input: &[u8]) -> String {
    const TABLE: &[u8; 64] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    let mut out = String::new();
    let mut i = 0;
    while i < input.len() {
        let b0 = input[i] as u32;
        let b1 = if i + 1 < input.len() { input[i + 1] as u32 } else { 0 };
        let b2 = if i + 2 < input.len() { input[i + 2] as u32 } else { 0 };
        let triple = (b0 << 16) | (b1 << 8) | b2;
        out.push(TABLE[((triple >> 18) & 63) as usize] as char);
        out.push(TABLE[((triple >> 12) & 63) as usize] as char);
        out.push(if i + 1 < input.len() {
            TABLE[((triple >> 6) & 63) as usize] as char
        } else {
            '='
        });
        out.push(if i + 2 < input.len() {
            TABLE[(triple & 63) as usize] as char
        } else {
            '='
        });
        i += 3;
    }
    out
}