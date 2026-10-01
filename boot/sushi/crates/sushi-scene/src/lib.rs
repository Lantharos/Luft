#![no_std]

extern crate alloc;

mod bmp;
pub mod loader;
mod prompt;
mod scene;
mod status;
pub mod text;

pub use bmp::decode_bmp;
pub use prompt::{Prompt, is_shaking};
pub use scene::{Scene, Visuals};
pub use status::Status;
pub use tiny_skia;

use tiny_skia::{Path, PathBuilder};

const LOADER_LOGICAL_SIZE: f32 = 56.0;
const LOADER_GAP_RATIO: f32 = 0.42;

pub const FADE_SECONDS: f32 = 0.3;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct Rect {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
}

impl Rect {
    pub fn right(&self) -> i32 {
        self.x + self.width as i32
    }

    pub fn bottom(&self) -> i32 {
        self.y + self.height as i32
    }

    pub fn clamp_to(&self, width: u32, height: u32) -> Option<Rect> {
        let x0 = self.x.clamp(0, width as i32);
        let y0 = self.y.clamp(0, height as i32);
        let x1 = self.right().clamp(0, width as i32);
        let y1 = self.bottom().clamp(0, height as i32);
        (x1 > x0 && y1 > y0).then(|| Rect {
            x: x0,
            y: y0,
            width: (x1 - x0) as u32,
            height: (y1 - y0) as u32,
        })
    }

    pub fn union(&self, other: &Rect) -> Rect {
        let x = self.x.min(other.x);
        let y = self.y.min(other.y);
        Rect {
            x,
            y,
            width: (self.right().max(other.right()) - x) as u32,
            height: (self.bottom().max(other.bottom()) - y) as u32,
        }
    }
}

/// Where the firmware drew its logo, and on which screen size.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct FirmwareLogo {
    pub x: i32,
    pub y: i32,
    pub width: u32,
    pub height: u32,
    pub screen_width: u32,
    pub screen_height: u32,
}

impl FirmwareLogo {
    pub fn placed_on(&self, width: u32, height: u32) -> Rect {
        if width == self.screen_width && height == self.screen_height {
            return Rect {
                x: self.x,
                y: self.y,
                width: self.width,
                height: self.height,
            };
        }
        let centered = (self.x * 2 + self.width as i32 - self.screen_width as i32).abs() <= 2;
        let x = if centered {
            (width as i32 - self.width as i32) / 2
        } else {
            (self.x as i64 * width as i64 / self.screen_width.max(1) as i64) as i32
        };
        let y = (self.y as i64 * height as i64 / self.screen_height.max(1) as i64) as i32;
        Rect {
            x,
            y,
            width: self.width,
            height: self.height,
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Layout {
    pub width: u32,
    pub height: u32,
    pub scale: f32,
    pub logo: Option<Rect>,
    pub loader_center: (f32, f32),
    pub loader_size: f32,
}

impl Layout {
    pub fn new(width: u32, height: u32, logo: Option<Rect>) -> Self {
        let scale = (height as f32 / 1080.0).clamp(1.0, 2.0);
        let loader_size = libm::roundf(LOADER_LOGICAL_SIZE * scale);
        let loader_y = match logo {
            Some(logo) => {
                let below = logo.bottom() as f32;
                below + (height as f32 - below) * LOADER_GAP_RATIO
            }
            None => height as f32 * 0.5,
        };
        Self {
            width,
            height,
            scale,
            logo,
            loader_center: (width as f32 * 0.5, libm::roundf(loader_y)),
            loader_size,
        }
    }

    pub fn loader_bounds(&self) -> Rect {
        let extent = libm::ceilf(self.loader_size * 0.5 + 2.0 * self.scale) as i32;
        let (cx, cy) = self.loader_center;
        Rect {
            x: cx as i32 - extent,
            y: cy as i32 - extent,
            width: (extent * 2) as u32,
            height: (extent * 2) as u32,
        }
    }
}

pub fn ease(progress: f32) -> f32 {
    let t = progress.clamp(0.0, 1.0);
    t * t * (3.0 - 2.0 * t)
}

pub fn pill(field: tiny_skia::Rect) -> Option<Path> {
    let radius = field.height() / 2.0;
    let handle = radius * 0.552_284_8;
    let (left, top, right, bottom) = (field.left(), field.top(), field.right(), field.bottom());
    let mut path = PathBuilder::new();
    path.move_to(left + radius, top);
    path.line_to(right - radius, top);
    path.cubic_to(
        right - radius + handle,
        top,
        right,
        top + radius - handle,
        right,
        top + radius,
    );
    path.cubic_to(
        right,
        bottom - radius + handle,
        right - radius + handle,
        bottom,
        right - radius,
        bottom,
    );
    path.line_to(left + radius, bottom);
    path.cubic_to(
        left + radius - handle,
        bottom,
        left,
        bottom - radius + handle,
        left,
        bottom - radius,
    );
    path.cubic_to(
        left,
        top + radius - handle,
        left + radius - handle,
        top,
        left + radius,
        top,
    );
    path.close();
    path.finish()
}
