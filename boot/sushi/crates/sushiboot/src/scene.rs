//! Boot splash scene: BGRT logo, SUSHI fallback, spinner, and GOP present.

use alloc::format;
use alloc::string::String;
use alloc::vec;
use alloc::vec::Vec;

use uefi::proto::console::gop::{BltOp, BltPixel, BltRegion, GraphicsOutput, PixelFormat};

use crate::bmp::{self, DecodedBmp};
use crate::bgrt;
use crate::font;

// Must match crates/sushi/src/core.rs + render/spinner.rs exactly.
pub const SPINNER_ACTIVITY_PX: usize = 56;
const SPINNER_ARC_RAD: f32 = core::f32::consts::FRAC_PI_2;
const SPINNER_STROKE_PX: f32 = 3.5;
const SPINNER_AA_FRINGE: f32 = 1.25;
const SPINNER_RADIUS_INSET: usize = 4;
pub const SPINNER_ROTATIONS_PER_SEC: f32 = 0.9;
/// Must match `sushi::SPINNER_FRAME_INTERVAL_US`.
pub const SPINNER_FRAME_US: u32 = 16_666;
/// Minimum visible spin time before loading the kernel (~3s at 60fps).
pub const MIN_ANIM_FRAMES: u64 = 180;

pub const LOGO_SOURCE_FIRMWARE: u8 = 0;
pub const LOGO_SOURCE_FALLBACK: u8 = 3;
pub const BGRT_LINUX_PATH: &str = "/sys/firmware/acpi/bgrt/image";

const SUSHI_FALLBACK_NATIVE_W: u32 = 80;
const SUSHI_FALLBACK_NATIVE_H: u32 = 24;
const SUSHI_TEXT: &str = "SUSHI";
const SUSHI_TEXT_COLOR: (u8, u8, u8) = (230, 234, 242);

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum LogoKind {
    Firmware,
    Fallback,
}

pub struct BootScene {
    pub width: u32,
    pub height: u32,
    pixels: Vec<BltPixel>,
    pub spinner_phase: f32,
    pub logo_kind: LogoKind,
    pub logo_native_w: u32,
    pub logo_native_h: u32,
    logo_bmp: Option<DecodedBmp>,
    pub logo_rect: (usize, usize, usize, usize),
    pub activity_rect: (usize, usize, usize, usize),
    pub animation_frames: u64,
}

impl BootScene {
    pub fn new(width: u32, height: u32) -> Self {
        let mut scene = Self {
            width,
            height,
            pixels: vec![BltPixel::new(0, 0, 0); (width as usize) * (height as usize)],
            spinner_phase: 0.0,
            logo_kind: LogoKind::Fallback,
            logo_native_w: SUSHI_FALLBACK_NATIVE_W,
            logo_native_h: SUSHI_FALLBACK_NATIVE_H,
            logo_bmp: None,
            logo_rect: (0, 0, 0, 0),
            activity_rect: (0, 0, SPINNER_ACTIVITY_PX, SPINNER_ACTIVITY_PX),
            animation_frames: 0,
        };
        scene.load_logo();
        scene.relayout();
        scene
    }

    fn load_logo(&mut self) {
        if let Some(blob) = bgrt::load_bgrt_bmp() {
            if let Some(decoded) = bmp::decode_bmp(&blob) {
                self.logo_native_w = decoded.width;
                self.logo_native_h = decoded.height;
                self.logo_kind = LogoKind::Firmware;
                self.logo_bmp = Some(decoded);
                return;
            }
        }
        self.logo_kind = LogoKind::Fallback;
        self.logo_native_w = SUSHI_FALLBACK_NATIVE_W;
        self.logo_native_h = SUSHI_FALLBACK_NATIVE_H;
        self.logo_bmp = None;
    }

    pub fn relayout(&mut self) {
        let (logo_x, logo_y, logo_w, logo_h, spin_x, spin_y) =
            boot_layout(self.width, self.height, self.logo_native_w, self.logo_native_h);
        self.logo_rect = (logo_x, logo_y, logo_w, logo_h);
        self.activity_rect = (spin_x, spin_y, SPINNER_ACTIVITY_PX, SPINNER_ACTIVITY_PX);
    }

    pub fn phase_from_frame(frame: u64) -> f32 {
        let elapsed = frame as f32 * SPINNER_FRAME_US as f32 / 1_000_000.0;
        (elapsed * SPINNER_ROTATIONS_PER_SEC) % 1.0
    }

    pub fn advance_frame(&mut self) {
        self.animation_frames += 1;
        self.spinner_phase = Self::phase_from_frame(self.animation_frames);
    }

    pub fn handoff_json(&self) -> String {
        let (lx, ly, lw, lh) = self.logo_rect;
        let (ax, ay, aw, ah) = self.activity_rect;
        let logo_source = match self.logo_kind {
            LogoKind::Firmware => LOGO_SOURCE_FIRMWARE,
            LogoKind::Fallback => LOGO_SOURCE_FALLBACK,
        };
        let mut json = format!(
            concat!(
                r#"{{"version":1,"stage":1,"width":{},"height":{},"#,
                r#""spinner_phase":{},"mode":0,"flags":128,"#,
                r#""ax":{},"ay":{},"aw":{},"ah":{},"#,
                r#""lx":{},"ly":{},"lw":{},"lh":{},"#,
                r#""logo_source":{},"logo_native_w":{},"logo_native_h":{}"#
            ),
            self.width,
            self.height,
            self.spinner_phase,
            ax,
            ay,
            aw,
            ah,
            lx,
            ly,
            lw,
            lh,
            logo_source,
            self.logo_native_w,
            self.logo_native_h,
        );
        if self.logo_kind == LogoKind::Firmware {
            json.push_str(&format!(r#","logo_path":"{BGRT_LINUX_PATH}""#));
        }
        json.push('}');
        json
    }

    pub fn store_state_json(&self) -> String {
        format!(
            concat!(
                r#"{{"version":1,"boot_id":"00000000-0000-0000-0000-000000000001","#,
                r#""stage":0,"width":{},"height":{},"scale":1.0,"#,
                r#""spinner_phase":{},"mode":0,"flags":0,"status_text":""}}"#
            ),
            self.width,
            self.height,
            self.spinner_phase
        )
    }

    pub fn draw_and_present(&mut self, gop: &mut GraphicsOutput) -> uefi::Result<()> {
        self.draw_scene(gop, true)
    }

    /// Static logo splash for kernel handoff — no spinner so a brief pause does not look frozen.
    pub fn draw_handoff_and_present(&mut self, gop: &mut GraphicsOutput) -> uefi::Result<()> {
        self.draw_scene(gop, false)
    }

    fn draw_scene(&mut self, gop: &mut GraphicsOutput, show_spinner: bool) -> uefi::Result<()> {
        self.clear();
        self.draw_logo();
        if show_spinner {
            self.draw_spinner();
        }
        self.present(gop)
    }

    fn clear(&mut self) {
        for px in self.pixels.iter_mut() {
            *px = BltPixel::new(0, 0, 0);
        }
    }

    fn present(&self, gop: &mut GraphicsOutput) -> uefi::Result<()> {
        let info = gop.current_mode_info();
        let (w, h) = (self.width as usize, self.height as usize);
        let fmt = info.pixel_format();

        match fmt {
            PixelFormat::BltOnly => gop.blt(BltOp::BufferToVideo {
                buffer: &self.pixels,
                src: BltRegion::Full,
                dest: (0, 0),
                dims: (w, h),
            }),
            _ => {
                // Ramfb: CPU writes land in the framebuffer, but an explicit blit
                // ensures OVMF/QEMU push the scanout to the display device.
                self.present_to_framebuffer(gop, fmt, w, h, info.stride());
                gop.blt(BltOp::BufferToVideo {
                    buffer: &self.pixels,
                    src: BltRegion::Full,
                    dest: (0, 0),
                    dims: (w, h),
                })
            }
        }
    }

    fn present_to_framebuffer(
        &self,
        gop: &mut GraphicsOutput,
        fmt: PixelFormat,
        w: usize,
        h: usize,
        stride: usize,
    ) {
        let mut fb = gop.frame_buffer();
        for y in 0..h {
            for x in 0..w {
                let px = &self.pixels[y * w + x];
                let off = (y * stride + x) * 4;
                unsafe {
                    match fmt {
                        PixelFormat::Bgr => {
                            fb.write_byte(off, px.blue);
                            fb.write_byte(off + 1, px.green);
                            fb.write_byte(off + 2, px.red);
                            fb.write_byte(off + 3, 0);
                        }
                        PixelFormat::Rgb => {
                            fb.write_byte(off, px.red);
                            fb.write_byte(off + 1, px.green);
                            fb.write_byte(off + 2, px.blue);
                            fb.write_byte(off + 3, 0);
                        }
                        _ => {}
                    }
                }
            }
        }
    }

    fn put_pixel(&mut self, x: usize, y: usize, r: u8, g: u8, b: u8) {
        if x >= self.width as usize || y >= self.height as usize {
            return;
        }
        let idx = y * self.width as usize + x;
        self.pixels[idx] = BltPixel::new(r, g, b);
    }

    fn put_pixel_alpha(&mut self, x: usize, y: usize, r: u8, g: u8, b: u8, alpha: u8) {
        if alpha == 0 {
            return;
        }
        if alpha == 255 {
            self.put_pixel(x, y, r, g, b);
            return;
        }
        let scale = alpha as u16;
        self.put_pixel(
            x,
            y,
            (r as u16 * scale / 255) as u8,
            (g as u16 * scale / 255) as u8,
            (b as u16 * scale / 255) as u8,
        );
    }

    fn draw_logo(&mut self) {
        let (x, y, w, h) = self.logo_rect;
        match self.logo_kind {
            LogoKind::Firmware => {
                if let Some(bmp) = self.logo_bmp.clone() {
                    self.draw_bmp_logo(&bmp, x, y, w, h);
                }
            }
            LogoKind::Fallback => {
                let scale = font::fit_scale(SUSHI_TEXT, w, h);
                self.draw_sushi_text(x, y, w, h, scale);
            }
        }
    }

    fn draw_sushi_text(&mut self, x: usize, y: usize, w: usize, h: usize, scale: usize) {
        let mut put = |px: usize, py: usize, r: u8, g: u8, b: u8| {
            self.put_pixel(px, py, r, g, b);
        };
        font::draw_text_scaled(
            &mut put,
            x,
            y,
            w,
            h,
            SUSHI_TEXT,
            scale,
            SUSHI_TEXT_COLOR,
        );
    }

    fn draw_bmp_logo(&mut self, bmp: &DecodedBmp, x: usize, y: usize, w: usize, h: usize) {
        if w == 0 || h == 0 || bmp.width == 0 || bmp.height == 0 {
            return;
        }
        let upscale = w > bmp.width as usize || h > bmp.height as usize;
        for dy in 0..h {
            for dx in 0..w {
                let u = (dx as f32 + 0.5) * bmp.width as f32 / w as f32 - 0.5;
                let v = (dy as f32 + 0.5) * bmp.height as f32 / h as f32 - 0.5;
                let (r, g, b) = if upscale {
                    bmp.sample_bilinear(
                        libm::roundf(u).clamp(0.0, (bmp.width - 1) as f32),
                        libm::roundf(v).clamp(0.0, (bmp.height - 1) as f32),
                    )
                } else {
                    bmp.sample_bilinear(u, v)
                };
                self.put_pixel(x + dx, y + dy, r, g, b);
            }
        }
    }

    fn draw_spinner(&mut self) {
        let (spin_x, spin_y, spin_size, _) = self.activity_rect;
        let cx = self.width as f32 * 0.5;
        let cy = spin_y as f32 + spin_size as f32 * 0.5;
        let radius = (spin_size / 2).saturating_sub(SPINNER_RADIUS_INSET) as f32;
        let half = SPINNER_STROKE_PX * 0.5;
        let rotation =
            self.spinner_phase * core::f32::consts::TAU - core::f32::consts::FRAC_PI_2;

        let cap0_x = cx + radius * libm::cosf(rotation);
        let cap0_y = cy + radius * libm::sinf(rotation);
        let cap1_x = cx + radius * libm::cosf(rotation + SPINNER_ARC_RAD);
        let cap1_y = cy + radius * libm::sinf(rotation + SPINNER_ARC_RAD);

        let pad = libm::ceilf(radius + half + SPINNER_AA_FRINGE + 1.0) as i32;
        let cx_i = cx as i32;
        let cy_i = cy as i32;
        let x0 = (cx_i - pad).max(0);
        let y0 = (cy_i - pad).max(0);
        let x1 = (cx_i + pad).min(self.width as i32);
        let y1 = (cy_i + pad).min(self.height as i32);

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
                    angle -= core::f32::consts::TAU
                        * libm::floorf(angle / core::f32::consts::TAU);
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
                self.put_pixel_alpha(px as usize, py as usize, 255, 255, 255, alpha);
            }
        }
        let _ = spin_x;
    }
}

fn boot_layout(
    width: u32,
    height: u32,
    native_w: u32,
    native_h: u32,
) -> (usize, usize, usize, usize, usize, usize) {
    let max_logo_w = (width / 3).clamp(160, 480) as usize;
    let max_logo_h = (height / 2).clamp(120, 500) as usize;
    let (logo_w, logo_h) = fit_contain(native_w as usize, native_h as usize, max_logo_w, max_logo_h);
    let spin_size = SPINNER_ACTIVITY_PX;
    let gap = 28usize;
    let block_h = logo_h + gap + spin_size;
    let block_top = (height as usize).saturating_sub(block_h) / 2;
    let logo_x = (width as usize).saturating_sub(logo_w) / 2;
    let spin_x = (width as usize).saturating_sub(spin_size) / 2;
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