//! Load and draw OEM/firmware logos with Linux fallback.

use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use crate::core::{LogoSource, SushiVisualState};
use crate::display::FrameBuffer;

use super::bmp::{bmp_dimensions, decode_bmp, DecodedBmp};
use super::font;

static LOGO_CACHE: Mutex<Option<(PathBuf, DecodedBmp)>> = Mutex::new(None);

const OEM_PATHS: &[&str] = &[
    "/sys/firmware/acpi/bgrt/image",
    "/run/sushi/bgrt.bmp",
    "/usr/share/sushi/oem/logo.bmp",
    "/usr/lib/sushi/oem/logo.bmp",
];

pub const LINUX_LOGO_NATIVE: (u32, u32) = (80, 96);
pub const SUSHI_FALLBACK_NATIVE: (u32, u32) = (80, 24);
const SUSHI_FALLBACK_TEXT: &str = "SUSHI";

pub fn draw_logo(frame: &mut FrameBuffer, state: &SushiVisualState) {
    if let Some(path) = state.logo.path.as_deref() {
        if try_draw_bmp_path(frame, state, path) {
            return;
        }
    }

    if matches!(
        state.logo.source,
        LogoSource::Firmware | LogoSource::OemAsset
    ) {
        for path in OEM_PATHS {
            if try_draw_bmp_path(frame, state, path) {
                return;
            }
        }
    }

    draw_sushi_fallback(frame, state);
}

fn try_draw_bmp_path(frame: &mut FrameBuffer, state: &SushiVisualState, path: &str) -> bool {
    if !Path::new(path).exists() {
        return false;
    }
    let Ok(mut cache) = LOGO_CACHE.lock() else {
        return false;
    };
    let path_buf = PathBuf::from(path);
    if cache
        .as_ref()
        .map(|(cached_path, _)| cached_path.as_path() != path_buf.as_path())
        .unwrap_or(true)
    {
        let Ok(data) = fs::read(&path_buf) else {
            return false;
        };
        let Some(bmp) = decode_bmp(&data) else {
            return false;
        };
        *cache = Some((path_buf, bmp));
    }
    let Some((_, bmp)) = cache.as_ref() else {
        return false;
    };
    blit_logo(frame, bmp, state);
    true
}

fn blit_logo(frame: &mut FrameBuffer, bmp: &DecodedBmp, state: &SushiVisualState) {
    let r = state.logo_rect;
    if r.w == 0 || r.h == 0 || bmp.width == 0 || bmp.height == 0 {
        return;
    }

    let upscale = r.w > bmp.width || r.h > bmp.height;
    for dy in 0..r.h {
        for dx in 0..r.w {
            let u = (dx as f32 + 0.5) * bmp.width as f32 / r.w as f32 - 0.5;
            let v = (dy as f32 + 0.5) * bmp.height as f32 / r.h as f32 - 0.5;
            let color = if upscale {
                // 1:1 center crop when layout somehow exceeds native firmware asset.
                bmp.argb_at(
                    u.round().clamp(0.0, (bmp.width - 1) as f32) as u32,
                    v.round().clamp(0.0, (bmp.height - 1) as f32) as u32,
                )
            } else {
                bmp.sample_bilinear(u, v)
            };
            frame.put_pixel((r.x + dx as i32) as u32, (r.y + dy as i32) as u32, color);
        }
    }
}

fn draw_sushi_fallback(frame: &mut FrameBuffer, state: &SushiVisualState) {
    let r = state.logo_rect;
    let color = crate::core::Color::SUSHI_TEXT.to_argb32();
    let scale = fit_text_scale(SUSHI_FALLBACK_TEXT, r.w, r.h);
    font::draw_text_scaled(frame, r.x, r.y, r.w, r.h, SUSHI_FALLBACK_TEXT, scale, color);
}

fn fit_text_scale(text: &str, w: u32, h: u32) -> u32 {
    let glyph_w = 8u32;
    let glyph_h = 8u32;
    let spacing = 1u32;
    let text_w = text.len() as u32 * (glyph_w + spacing) - spacing;
    if text_w == 0 || glyph_h == 0 {
        return 1;
    }
    let scale_w = w / text_w;
    let scale_h = h / glyph_h;
    scale_w.max(1).min(scale_h.max(1)).max(1)
}

pub fn probe_oem_asset() -> Option<(String, u32, u32)> {
    for path in OEM_PATHS {
        if !Path::new(path).exists() {
            continue;
        }
        let Ok(data) = fs::read(path) else {
            continue;
        };
        if let Some((w, h)) = bmp_dimensions(&data) {
            if decode_bmp(&data).is_some() {
                return Some((path.to_string(), w, h));
            }
        }
    }
    None
}