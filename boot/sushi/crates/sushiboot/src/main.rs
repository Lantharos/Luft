#![no_main]
#![no_std]

extern crate alloc;

mod bgrt;
mod bmp;
mod font;
mod linux_boot;
mod scene;
mod tpm;
mod tpm2;

use alloc::format;
use alloc::string::{String, ToString};
use alloc::vec;
use alloc::vec::Vec;

use core::fmt::Write as _;
use linux_boot::LinuxEntry;
use scene::{BootScene, MIN_ANIM_FRAMES, SPINNER_FRAME_US};
use uefi::boot;
use uefi::cstr16;
use uefi::prelude::*;
use uefi::proto::console::gop::GraphicsOutput;
use uefi::proto::console::serial::Serial;
use uefi::proto::loaded_image::LoadedImage;
use uefi::proto::media::file::{File, FileAttribute, FileInfo, FileMode, FileType};
use uefi::proto::media::fs::SimpleFileSystem;
use uefi::table::boot::{AllocateType, MemoryType, SearchType};
use uefi::{CString16, Handle, Identify};

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

    let fmt = gop.current_mode_info().pixel_format();
    boot_log(&format!("SushiBoot: GOP {}x{} fmt={fmt:?}", scene.width, scene.height));
    boot_log(&format!(
        "SushiBoot: logo {:?} ({}x{})",
        scene.logo_kind, scene.logo_native_w, scene.logo_native_h
    ));

    // Cover OVMF splash before any disk/TPM work.
    present_frame(&mut scene, &mut gop, "first frame");

    let mut entry: Option<BlsEntry> = None;
    let mut cmdline: Option<String> = None;
    let mut preloaded_kernel: Option<Handle> = None;

    // Keep the spinner moving while BLS/cmdline/TPM work and the kernel image
    // preloads from disk — StartImage then only jumps into a loaded bzImage.
    while scene.animation_frames < MIN_ANIM_FRAMES
        || entry.is_none()
        || cmdline.is_none()
        || preloaded_kernel.is_none()
    {
        if entry.is_none() && scene.animation_frames >= 1 {
            let entries = collect_bls_entries(device);
            let selected = select_entry(&entries);
            boot_log(&format!("SushiBoot: booting {}", selected.title));
            entry = Some(selected);
        }
        if cmdline.is_none() && entry.is_some() {
            store_sushi_state(&scene);
            let selected = entry.as_ref().unwrap();
            cmdline = Some(build_cmdline(device, selected, &scene.handoff_json()));
        }
        if preloaded_kernel.is_none() {
            if let Some(selected) = entry.as_ref() {
                if let Ok(image) = linux_boot::preload_kernel(device, &selected.linux) {
                    preloaded_kernel = Some(image);
                    boot_log("SushiBoot: kernel ready");
                }
            }
        }
        spin_frame(&mut scene, &mut gop);
    }

    let entry = entry.expect("entry selected");
    let cmdline = cmdline.expect("cmdline built");
    let kernel = preloaded_kernel.expect("kernel preloaded");
    present_handoff_frame(&mut scene, &mut gop);
    let linux = LinuxEntry {
        initrd: entry.initrd.as_deref(),
        cmdline: &cmdline,
    };

    boot_log("SushiBoot: handing off!");

    match linux_boot::start_preloaded(kernel, &linux) {
        Ok(()) => Status::SUCCESS,
        Err(err) => {
            boot_log(&format!("SushiBoot: boot failed: {err:?}"));
            Status::LOAD_ERROR
        }
    }
}

fn ensure_kernel_logo_suppressed(cmdline: &mut String) {
    for flag in [
        "fbcon.logo=0",
        "rdinit=/usr/bin/sushid",
    ] {
        let key = flag.split('=').next().unwrap_or(flag);
        if !cmdline.split_whitespace().any(|tok| tok == flag || tok.starts_with(&format!("{key}=")))
        {
            cmdline.push(' ');
            cmdline.push_str(flag);
        }
    }
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

fn select_entry(entries: &[BlsEntry]) -> BlsEntry {
    if entries.is_empty() {
        BlsEntry {
            title: String::from("Sushi Linux"),
            linux: String::from("vmlinuz"),
            initrd: Some(String::from("initramfs.img")),
            options: String::from("rd.sushi=1"),
        }
    } else {
        entries[0].clone()
    }
}

fn build_cmdline(device: Handle, entry: &BlsEntry, state_json: &str) -> String {
    let b64 = base64_encode(state_json.as_bytes());
    let mut cmdline = entry.options.clone();
    if !cmdline.contains("rd.sushi") {
        cmdline.push_str(" rd.sushi=1");
    }
    if !cmdline.contains("console=") {
        cmdline.push_str(" console=ttyS0,115200n8");
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

fn store_sushi_state(scene: &BootScene) {
    let json = scene.store_state_json();
    let bytes = json.as_bytes();
    let pages = (bytes.len() + 4095) / 4096;
    if let Ok(addr) = boot::allocate_pages(AllocateType::AnyPages, MemoryType::LOADER_DATA, pages) {
        let ptr = addr.as_ptr();
        unsafe {
            core::ptr::copy_nonoverlapping(bytes.as_ptr(), ptr, bytes.len());
            let _ = boot::install_configuration_table(&SUSHI_VENDOR_GUID, ptr.cast());
        }
    }
}

#[derive(Clone)]
struct BlsEntry {
    title: String,
    linux: String,
    initrd: Option<String>,
    options: String,
}

fn collect_bls_entries(device: Handle) -> Vec<BlsEntry> {
    let mut fs = match boot::open_protocol_exclusive::<SimpleFileSystem>(device) {
        Ok(fs) => fs,
        Err(_) => return Vec::new(),
    };
    let mut root = match fs.open_volume() {
        Ok(root) => root,
        Err(_) => return Vec::new(),
    };
    let mut out = Vec::new();
    for dir_path in [
        cstr16!("\\loader\\entries"),
        cstr16!("loader\\entries"),
        cstr16!("loader/entries"),
    ] {
        read_bls_dir(&mut root, dir_path, &mut out);
    }
    out
}

fn read_bls_dir(
    root: &mut uefi::proto::media::file::Directory,
    dir_path: &uefi::CStr16,
    out: &mut Vec<BlsEntry>,
) {
    let dir = match root.open(dir_path, FileMode::Read, FileAttribute::empty()) {
        Ok(dir) => dir,
        Err(_) => return,
    };
    let Ok(FileType::Dir(mut directory)) = dir.into_type() else {
        return;
    };
    while let Ok(Some(info)) = directory.read_entry_boxed() {
        let name = info.file_name().to_string();
        if name.ends_with(".conf") {
            if let Ok(cname) = CString16::try_from(name.as_str()) {
                if let Some(parsed) = parse_bls_file(&mut directory, &cname) {
                    out.push(parsed);
                }
            }
        }
    }
}

fn parse_bls_file(
    directory: &mut uefi::proto::media::file::Directory,
    name: &uefi::CStr16,
) -> Option<BlsEntry> {
    let file = directory.open(name, FileMode::Read, FileAttribute::empty()).ok()?;
    let FileType::Regular(mut regular) = file.into_type().ok()? else {
        return None;
    };
    let info = regular.get_boxed_info::<FileInfo>().ok()?;
    let mut data = vec![0u8; info.file_size() as usize];
    regular.read(&mut data).ok()?;
    parse_bls_text(core::str::from_utf8(&data).ok()?)
}

fn parse_bls_text(text: &str) -> Option<BlsEntry> {
    let mut title = String::from("Linux");
    let mut linux = String::new();
    let mut initrd = None;
    let mut options = String::new();
    for line in text.lines() {
        if let Some((k, v)) = line.split_once(' ') {
            match k {
                "title" => title = v.to_string(),
                "linux" | "efi" => linux = v.to_string(),
                "initrd" => initrd = Some(v.to_string()),
                "options" => options = push_options(&options, v),
                _ => {}
            }
        }
    }
    if linux.is_empty() {
        None
    } else {
        Some(BlsEntry {
            title,
            linux,
            initrd,
            options,
        })
    }
}

fn push_options(existing: &str, more: &str) -> String {
    if existing.is_empty() {
        more.to_string()
    } else {
        format!("{existing} {more}")
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
        let n = (b0 << 16) | (b1 << 8) | b2;
        out.push(TABLE[((n >> 18) & 63) as usize] as char);
        out.push(TABLE[((n >> 12) & 63) as usize] as char);
        if i + 1 < input.len() {
            out.push(TABLE[((n >> 6) & 63) as usize] as char);
        } else {
            out.push('=');
        }
        if i + 2 < input.len() {
            out.push(TABLE[(n & 63) as usize] as char);
        } else {
            out.push('=');
        }
        i += 3;
    }
    out
}