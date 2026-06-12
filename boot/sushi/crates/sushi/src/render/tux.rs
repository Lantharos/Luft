//! Linux logo fallback (Tux) — used when no OEM/firmware asset is available.

use crate::core::Color;
use crate::display::FrameBuffer;

const TUX_W: i32 = 80;
const TUX_H: i32 = 96;

pub fn draw_linux_logo(frame: &mut FrameBuffer, x: i32, y: i32, w: u32, h: u32) {
    for py in 0..h {
        for px in 0..w {
            let tx = (px as i32 * TUX_W) / w as i32 - TUX_W / 2;
            let ty = (py as i32 * TUX_H) / h as i32 - TUX_H / 2;
            if let Some(color) = tux_sample(tx, ty) {
                frame.put_pixel((x + px as i32) as u32, (y + py as i32) as u32, color);
            }
        }
    }
}

fn tux_sample(x: i32, y: i32) -> Option<u32> {
    // Feet
    if in_ellipse(x + 18, y - 38, 12, 7) || in_ellipse(x - 18, y - 38, 12, 7) {
        return Some(rgb(252, 140, 36));
    }
    // Tail
    if in_ellipse(x + 30, y + 6, 10, 16) && x > 8 {
        return Some(rgb(20, 20, 24));
    }
    // Main body
    if in_ellipse(x, y + 2, 30, 36) {
        if in_ellipse(x, y + 10, 18, 24) {
            return Some(rgb(245, 245, 248));
        }
        return Some(rgb(20, 20, 24));
    }
    // Head
    if in_ellipse(x, y - 24, 24, 22) {
        if in_ellipse(x + 10, y - 30, 6, 8) || in_ellipse(x - 10, y - 30, 6, 8) {
            return Some(rgb(245, 245, 248));
        }
        if in_ellipse(x, y - 18, 10, 8) {
            return Some(rgb(245, 245, 248));
        }
        return Some(rgb(20, 20, 24));
    }
    // Beak
    if in_ellipse(x, y - 12, 5, 4) && y > -18 {
        return Some(rgb(252, 160, 48));
    }
    // Eyes
    if (x + 9).abs() + (y + 28).abs() < 4 || (x - 9).abs() + (y + 28).abs() < 4 {
        return Some(rgb(20, 20, 24));
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

fn rgb(r: u8, g: u8, b: u8) -> u32 {
    Color {
        r,
        g,
        b,
        a: 255,
    }
    .to_argb32()
}