#![no_main]
#![no_std]

extern crate alloc;

mod linux_boot;
mod tpm;
mod tpm2;

use alloc::format;
use alloc::string::{String, ToString};
use alloc::vec;
use alloc::vec::Vec;

use linux_boot::{boot as boot_linux_image, LinuxEntry};
use uefi::boot;
use uefi::cstr16;
use uefi::prelude::*;
use core::fmt::Write as _;
use uefi::proto::console::gop::{BltOp, BltPixel, GraphicsOutput, PixelFormat};
use uefi::proto::console::serial::Serial;
use uefi::table::boot::SearchType;
use uefi::proto::loaded_image::LoadedImage;
use uefi::proto::media::file::{File, FileAttribute, FileInfo, FileMode, FileType};
use uefi::proto::media::fs::SimpleFileSystem;
use uefi::table::boot::{AllocateType, MemoryType};
use uefi::{CString16, Handle, Identify};

pub(crate) const SUSHI_VENDOR_GUID: uefi::Guid = uefi::guid!("a7b3c4d5-e6f7-4890-abcd-ef1234567890");

// Must match crates/sushi/src/core.rs + render/spinner.rs exactly.
const SPINNER_ACTIVITY_PX: usize = 56;
const SPINNER_ARC_RAD: f32 = core::f32::consts::FRAC_PI_2;
const SPINNER_STROKE_PX: f32 = 3.5;
const SPINNER_AA_FRINGE: f32 = 1.25;
const SPINNER_RADIUS_INSET: usize = 4;
const SPINNER_ROTATIONS_PER_SEC: f32 = 0.9;
const SPINNER_FRAME_US: u32 = 16_666;
const SPINNER_BOOT_FRAMES: usize = 90;

struct BootScene {
    width: u32,
    height: u32,
    stride: usize,
    format: PixelFormat,
    spinner_phase: f32,
}

#[entry]
fn efi_main() -> Status {
    uefi::helpers::init().unwrap();

    let loaded = boot::open_protocol_exclusive::<LoadedImage>(boot::image_handle()).unwrap();
    let device = loaded.device().unwrap();
    let (gop_device, mut scene) = init_gop_scene(device).unwrap_or((
        find_gop_handle().unwrap_or(device),
        BootScene {
            width: 1920,
            height: 1080,
            stride: 1920,
            format: PixelFormat::Bgr,
            spinner_phase: 0.0,
        },
    ));

    let entries = collect_bls_entries(device);
    boot_log(&format!("SushiBoot: GOP {}x{}", scene.width, scene.height));

    // Paint immediately — cover the firmware splash before anything else.
    let _ = draw_boot_scene(gop_device, &scene);
    boot_log("SushiBoot: first frame is up");

    for frame in 0..SPINNER_BOOT_FRAMES {
        let elapsed = frame as f32 * SPINNER_FRAME_US as f32 / 1_000_000_000.0;
        scene.spinner_phase = (elapsed * SPINNER_ROTATIONS_PER_SEC) % 1.0;
        let _ = draw_boot_scene(gop_device, &scene);
        boot::stall(SPINNER_FRAME_US as usize);
    }

    store_sushi_state(&scene);
    let entry = if entries.is_empty() {
        BlsEntry {
            title: String::from("Sushi Linux"),
            linux: String::from("vmlinuz"),
            initrd: Some(String::from("initramfs.img")),
            options: String::from("rd.sushi=1"),
        }
    } else {
        entries[0].clone()
    };

    boot_log(&format!("SushiBoot: booting {}", entry.title));

    let spin_size = SPINNER_ACTIVITY_PX;
    let (_, _, _, _logo_h, spin_x, spin_y) = boot_layout(&scene);
    let state_json = format!(
        concat!(
            r#"{{"version":1,"stage":1,"width":{},"height":{},"#,
            r#""spinner_phase":{},"mode":0,"flags":128,"#,
            r#""ax":{},"ay":{},"aw":{},"ah":{}}}"#
        ),
        scene.width,
        scene.height,
        scene.spinner_phase,
        spin_x,
        spin_y,
        spin_size,
        spin_size
    );
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

    // Last GOP frame stays on screen until the kernel owns the display.
    scene.spinner_phase = spinner_phase_at_handoff(&scene);
    let _ = draw_boot_scene(gop_device, &scene);

    let linux = LinuxEntry {
        linux: &entry.linux,
        initrd: entry.initrd.as_deref(),
        cmdline: &cmdline,
    };

    if let Some(initrd) = &entry.initrd {
        boot_log(&format!("SushiBoot: initrd {initrd}"));
    }
    boot_log("SushiBoot: handing off!");

    match boot_linux_image(device, &linux) {
        Ok(()) => Status::SUCCESS,
        Err(err) => {
            boot_log(&format!("SushiBoot: boot failed: {err:?}"));
            Status::LOAD_ERROR
        }
    }
}

fn spinner_phase_at_handoff(_scene: &BootScene) -> f32 {
    let elapsed = SPINNER_BOOT_FRAMES as f32 * SPINNER_FRAME_US as f32 / 1_000_000_000.0;
    (elapsed * SPINNER_ROTATIONS_PER_SEC) % 1.0
}

fn ensure_kernel_logo_suppressed(cmdline: &mut String) {
    for flag in [
        "fbcon.logo=0",
        "fbcon.logo_centerscreen=0",
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

/// Log to serial only — never scribble on the GOP splash.
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

fn find_gop_handle() -> Option<Handle> {
    boot::get_handle_for_protocol::<GraphicsOutput>().ok()
}

fn init_gop_scene(fallback_device: Handle) -> Option<(Handle, BootScene)> {
    if let Ok(handles) = boot::locate_handle_buffer(SearchType::ByProtocol(&GraphicsOutput::GUID))
    {
        for &handle in handles.iter() {
            if let Ok(scene) = init_scene(handle) {
                return Some((handle, scene));
            }
        }
    }
    init_scene(fallback_device).ok().map(|scene| (fallback_device, scene))
}

fn init_scene(device: Handle) -> uefi::Result<BootScene> {
    let gop = boot::open_protocol_exclusive::<GraphicsOutput>(device)?;
    let info = gop.current_mode_info();
    let (width, height) = info.resolution();
    Ok(BootScene {
        width: width as u32,
        height: height as u32,
        stride: info.stride(),
        format: info.pixel_format(),
        spinner_phase: 0.0,
    })
}

fn store_sushi_state(scene: &BootScene) {
    let json = format!(
        concat!(
            r#"{{"version":1,"boot_id":"00000000-0000-0000-0000-000000000001","#,
            r#""stage":0,"width":{},"height":{},"scale":1.0,"#,
            r#""spinner_phase":{},"mode":0,"flags":0,"status_text":""}}"#
        ),
        scene.width,
        scene.height,
        scene.spinner_phase
    );
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

fn boot_layout(scene: &BootScene) -> (usize, usize, usize, usize, usize, usize) {
    let max_logo_w = (scene.width / 3).clamp(160, 480) as usize;
    let max_logo_h = (scene.height / 2).clamp(120, 500) as usize;
    let (logo_w, logo_h) = fit_contain(80, 96, max_logo_w, max_logo_h);
    let spin_size = SPINNER_ACTIVITY_PX;
    let gap = 28usize;
    let block_h = logo_h + gap + spin_size;
    let block_top = (scene.height as usize).saturating_sub(block_h) / 2;
    let logo_x = (scene.width as usize).saturating_sub(logo_w) / 2;
    let spin_x = (scene.width as usize).saturating_sub(spin_size) / 2;
    let spin_y = block_top + logo_h + gap;
    (logo_x, block_top, logo_w, logo_h, spin_x, spin_y)
}

fn fit_contain(iw: usize, ih: usize, max_w: usize, max_h: usize) -> (usize, usize) {
    if iw == 0 || ih == 0 || max_w == 0 || max_h == 0 {
        return (max_w, max_h);
    }
    let scale_w = max_w * 1000 / iw;
    let scale_h = max_h * 1000 / ih;
    let mut scale = scale_w.min(scale_h);
    if iw > 96 || ih > 96 {
        scale = scale.min(1000);
    }
    (
        (iw * scale / 1000).max(1),
        (ih * scale / 1000).max(1),
    )
}

fn draw_boot_scene(device: Handle, scene: &BootScene) -> uefi::Result<()> {
    let mut gop = boot::open_protocol_exclusive::<GraphicsOutput>(device)?;
    let _ = gop.blt(BltOp::VideoFill {
        color: BltPixel::new(0, 0, 0),
        dest: (0, 0),
        dims: (scene.width as usize, scene.height as usize),
    });
    let mut frame = gop.frame_buffer();

    let (logo_x, logo_y, logo_w, logo_h, spin_x, spin_y) = boot_layout(scene);
    draw_linux_logo(&mut frame, scene, logo_x, logo_y, logo_w, logo_h);
    draw_arc_spinner(&mut frame, scene, spin_x, spin_y);
    Ok(())
}

fn draw_linux_logo(
    frame: &mut uefi::proto::console::gop::FrameBuffer<'_>,
    scene: &BootScene,
    x: usize,
    y: usize,
    w: usize,
    h: usize,
) {
    for py in 0..h {
        for px in 0..w {
            let tx = (px as i32 * 80) / w as i32 - 40;
            let ty = (py as i32 * 96) / h as i32 - 48;
            if let Some(color) = tux_color(tx, ty) {
                draw_rect(frame, scene, x + px, y + py, 1, 1, color);
            }
        }
    }
}

/// Same renderer as `crates/sushi/src/render/spinner.rs` (float arc + round caps + AA).
fn draw_arc_spinner(
    frame: &mut uefi::proto::console::gop::FrameBuffer<'_>,
    scene: &BootScene,
    _spin_x: usize,
    spin_y: usize,
) {
    let spin_size = SPINNER_ACTIVITY_PX;
    let cx = scene.width as f32 * 0.5;
    let cy = spin_y as f32 + spin_size as f32 * 0.5;
    let radius = (spin_size / 2).saturating_sub(SPINNER_RADIUS_INSET) as f32;
    let half = SPINNER_STROKE_PX * 0.5;
    let rotation = scene.spinner_phase * core::f32::consts::TAU - core::f32::consts::FRAC_PI_2;

    let cap0_x = cx + radius * libm::cosf(rotation);
    let cap0_y = cy + radius * libm::sinf(rotation);
    let cap1_x = cx + radius * libm::cosf(rotation + SPINNER_ARC_RAD);
    let cap1_y = cy + radius * libm::sinf(rotation + SPINNER_ARC_RAD);

    let pad = libm::ceilf(radius + half + SPINNER_AA_FRINGE + 1.0) as i32;
    let cx_i = cx as i32;
    let cy_i = cy as i32;
    let x0 = (cx_i - pad).max(0);
    let y0 = (cy_i - pad).max(0);
    let x1 = (cx_i + pad).min(scene.width as i32);
    let y1 = (cy_i + pad).min(scene.height as i32);

    for py in y0..y1 {
        for px in x0..x1 {
            let fx = px as f32 + 0.5;
            let fy = py as f32 + 0.5;
            let dx = fx - cx;
            let dy = fy - cy;
            let dist = libm::sqrtf(dx * dx + dy * dy);
            let ring = (dist - radius).abs();

            let arc_cov = {
                let mut angle = libm::atan2f(dy, dx) - rotation;
                angle = angle - core::f32::consts::TAU * libm::floorf(angle / core::f32::consts::TAU);
                if angle <= SPINNER_ARC_RAD {
                    stroke_coverage(ring, half)
                } else {
                    0.0
                }
            };

            let d0x = fx - cap0_x;
            let d0y = fy - cap0_y;
            let d1x = fx - cap1_x;
            let d1y = fy - cap1_y;
            let cap0 = stroke_coverage(libm::sqrtf(d0x * d0x + d0y * d0y), half);
            let cap1 = stroke_coverage(libm::sqrtf(d1x * d1x + d1y * d1y), half);

            let coverage = arc_cov.max(cap0).max(cap1);
            if coverage <= 0.0 {
                continue;
            }

            let alpha = libm::roundf(coverage * 255.0).clamp(0.0, 255.0) as u8;
            if alpha == 0 {
                continue;
            }

            let offset = (py as usize * scene.stride + px as usize) * 4;
            write_pixel_alpha(frame, scene, offset, (255, 255, 255), alpha);
        }
    }
}

fn stroke_coverage(dist_from_centerline: f32, half: f32) -> f32 {
    let outer = half + SPINNER_AA_FRINGE;
    1.0 - smoothstep(half - 0.25, outer, dist_from_centerline)
}

fn smoothstep(edge0: f32, edge1: f32, x: f32) -> f32 {
    if edge0 >= edge1 {
        return 0.0;
    }
    let mut t = (x - edge0) / (edge1 - edge0);
    if t < 0.0 {
        t = 0.0;
    } else if t > 1.0 {
        t = 1.0;
    }
    t * t * (3.0 - 2.0 * t)
}

fn write_pixel_alpha(
    frame: &mut uefi::proto::console::gop::FrameBuffer<'_>,
    scene: &BootScene,
    offset: usize,
    color: (u8, u8, u8),
    alpha: u8,
) {
    if alpha == 0 {
        return;
    }
    if alpha == 255 {
        write_pixel(frame, scene, offset, color);
        return;
    }
    let scale = alpha as u16;
    let r = (color.0 as u16 * scale / 255) as u8;
    let g = (color.1 as u16 * scale / 255) as u8;
    let b = (color.2 as u16 * scale / 255) as u8;
    write_pixel(frame, scene, offset, (r, g, b));
}

fn draw_rect(
    frame: &mut uefi::proto::console::gop::FrameBuffer<'_>,
    scene: &BootScene,
    x: usize,
    y: usize,
    w: usize,
    h: usize,
    color: (u8, u8, u8),
) {
    for row in 0..h {
        for col in 0..w {
            let px = x + col;
            let py = y + row;
            if px >= scene.width as usize || py >= scene.height as usize {
                continue;
            }
            let offset = (py * scene.stride + px) * 4;
            write_pixel(frame, scene, offset, color);
        }
    }
}

fn write_pixel(
    frame: &mut uefi::proto::console::gop::FrameBuffer<'_>,
    scene: &BootScene,
    offset: usize,
    color: (u8, u8, u8),
) {
    unsafe {
        match scene.format {
            PixelFormat::Bgr => {
                frame.write_byte(offset, color.2);
                frame.write_byte(offset + 1, color.1);
                frame.write_byte(offset + 2, color.0);
                frame.write_byte(offset + 3, 0);
            }
            _ => {
                frame.write_byte(offset, color.0);
                frame.write_byte(offset + 1, color.1);
                frame.write_byte(offset + 2, color.2);
                frame.write_byte(offset + 3, 0);
            }
        }
    }
}

fn tux_color(x: i32, y: i32) -> Option<(u8, u8, u8)> {
    if in_ellipse(x + 18, y - 38, 12, 7) || in_ellipse(x - 18, y - 38, 12, 7) {
        return Some((252, 140, 36));
    }
    if in_ellipse(x + 30, y + 6, 10, 16) && x > 8 {
        return Some((20, 20, 24));
    }
    if in_ellipse(x, y + 2, 30, 36) {
        if in_ellipse(x, y + 10, 18, 24) {
            return Some((245, 245, 248));
        }
        return Some((20, 20, 24));
    }
    if in_ellipse(x, y - 24, 24, 22) {
        if in_ellipse(x + 10, y - 30, 6, 8) || in_ellipse(x - 10, y - 30, 6, 8) {
            return Some((245, 245, 248));
        }
        if in_ellipse(x, y - 18, 10, 8) {
            return Some((245, 245, 248));
        }
        return Some((20, 20, 24));
    }
    if in_ellipse(x, y - 12, 5, 4) && y > -18 {
        return Some((252, 160, 48));
    }
    if (x + 9).abs() + (y + 28).abs() < 4 || (x - 9).abs() + (y + 28).abs() < 4 {
        return Some((20, 20, 24));
    }
    None
}

fn in_ellipse(x: i32, y: i32, rx: i32, ry: i32) -> bool {
    if rx == 0 || ry == 0 {
        return false;
    }
    let dx = (x * 100) / rx;
    let dy = (y * 100) / ry;
    dx * dx + dy * dy <= 100 * 100
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