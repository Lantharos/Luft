//! Minimal BMP decoder for firmware/OEM boot logos (24-bit, top-down).

use relay_core::Color;

#[derive(Debug, Clone)]
pub struct DecodedBmp {
    pub width: u32,
    pub height: u32,
    pub pixels: Vec<u8>,
}

impl DecodedBmp {
    pub fn argb_at(&self, x: u32, y: u32) -> u32 {
        let idx = ((y * self.width + x) * 4) as usize;
        if idx + 3 >= self.pixels.len() {
            return Color::RELAY_BG.to_argb32();
        }
        let b = self.pixels[idx];
        let g = self.pixels[idx + 1];
        let r = self.pixels[idx + 2];
        Color {
            r,
            g,
            b,
            a: 255,
        }
        .to_argb32()
    }

    /// Bilinear sample — used when scaling firmware logos down (never upscaled).
    pub fn sample_bilinear(&self, u: f32, v: f32) -> u32 {
        if self.width == 0 || self.height == 0 {
            return Color::RELAY_BG.to_argb32();
        }
        let max_x = (self.width - 1) as f32;
        let max_y = (self.height - 1) as f32;
        let u = u.clamp(0.0, max_x);
        let v = v.clamp(0.0, max_y);

        let x0 = u.floor() as u32;
        let y0 = v.floor() as u32;
        let x1 = (x0 + 1).min(self.width - 1);
        let y1 = (y0 + 1).min(self.height - 1);
        let tx = u - x0 as f32;
        let ty = v - y0 as f32;

        let c00 = self.rgb_at(x0, y0);
        let c10 = self.rgb_at(x1, y0);
        let c01 = self.rgb_at(x0, y1);
        let c11 = self.rgb_at(x1, y1);

        let top = lerp_rgb(c00, c10, tx);
        let bot = lerp_rgb(c01, c11, tx);
        let (r, g, b) = lerp_rgb(top, bot, ty);
        Color {
            r,
            g,
            b,
            a: 255,
        }
        .to_argb32()
    }

    fn rgb_at(&self, x: u32, y: u32) -> (u8, u8, u8) {
        let idx = ((y * self.width + x) * 4) as usize;
        (
            self.pixels[idx + 2],
            self.pixels[idx + 1],
            self.pixels[idx],
        )
    }
}

fn lerp_rgb(a: (u8, u8, u8), b: (u8, u8, u8), t: f32) -> (u8, u8, u8) {
    let t = t.clamp(0.0, 1.0);
    let inv = 1.0 - t;
    (
        (a.0 as f32 * inv + b.0 as f32 * t).round() as u8,
        (a.1 as f32 * inv + b.1 as f32 * t).round() as u8,
        (a.2 as f32 * inv + b.2 as f32 * t).round() as u8,
    )
}

pub fn bmp_dimensions(data: &[u8]) -> Option<(u32, u32)> {
    if data.len() < 26 || &data[0..2] != b"BM" {
        return None;
    }
    let width = i32::from_le_bytes(data[18..22].try_into().ok()?) as u32;
    let height_raw = i32::from_le_bytes(data[22..26].try_into().ok()?);
    if width == 0 || height_raw == 0 {
        return None;
    }
    Some((width, height_raw.unsigned_abs()))
}

pub fn decode_bmp(data: &[u8]) -> Option<DecodedBmp> {
    if data.len() < 54 || &data[0..2] != b"BM" {
        return None;
    }
    let data_offset = u32::from_le_bytes(data[10..14].try_into().ok()?) as usize;
    let width = i32::from_le_bytes(data[18..22].try_into().ok()?) as u32;
    let height_raw = i32::from_le_bytes(data[22..26].try_into().ok()?);
    let bpp = u16::from_le_bytes(data[28..30].try_into().ok()?);
    if width == 0 || height_raw == 0 || bpp != 24 {
        return None;
    }
    let top_down = height_raw < 0;
    let height = height_raw.unsigned_abs();
    let row_bytes = ((width * 3 + 3) / 4) * 4;
    let mut pixels = vec![0u8; (width * height * 4) as usize];

    for row in 0..height {
        let src_y = if top_down { row } else { height - 1 - row };
        let src_off = data_offset + (src_y as usize) * row_bytes as usize;
        if src_off + row_bytes as usize > data.len() {
            break;
        }
        for col in 0..width {
            let src = src_off + (col as usize) * 3;
            let dst = ((row * width + col) * 4) as usize;
            pixels[dst] = data[src];
            pixels[dst + 1] = data[src + 1];
            pixels[dst + 2] = data[src + 2];
            pixels[dst + 3] = 0xff;
        }
    }

    Some(DecodedBmp {
        width,
        height,
        pixels,
    })
}