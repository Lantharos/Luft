//! Display backend abstraction for Sushi.

pub mod drm;
pub mod fb;

use anyhow::Result;
use thiserror::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PixelFormat {
    Argb8888,
    Xrgb8888,
    Bgra8888,
}

#[derive(Clone)]
pub struct FrameBuffer {
    pub width: u32,
    pub height: u32,
    pub stride: u32,
    pub format: PixelFormat,
    pub pixels: Vec<u8>,
}

impl FrameBuffer {
    pub fn new(width: u32, height: u32, format: PixelFormat) -> Self {
        let bpp = 4;
        let stride = width * bpp;
        Self {
            width,
            height,
            stride,
            format,
            pixels: vec![0u8; (stride * height) as usize],
        }
    }

    pub fn put_pixel(&mut self, x: u32, y: u32, color: u32) {
        if x >= self.width || y >= self.height {
            return;
        }
        let offset = (y * self.stride + x * 4) as usize;
        if offset + 4 > self.pixels.len() {
            return;
        }
        let a = ((color >> 24) & 0xff) as u8;
        let r = ((color >> 16) & 0xff) as u8;
        let g = ((color >> 8) & 0xff) as u8;
        let b = (color & 0xff) as u8;
        let bytes = match self.format {
            PixelFormat::Xrgb8888 => [b, g, r, 0x00],
            PixelFormat::Bgra8888 => [b, g, r, a],
            PixelFormat::Argb8888 => [b, g, r, a],
        };
        self.pixels[offset..offset + 4].copy_from_slice(&bytes);
    }

    /// Alpha-blend a single framebuffer pixel (no sub-pixel spreading).
    pub fn put_pixel_alpha(&mut self, x: u32, y: u32, r: u8, g: u8, b: u8, a: u8) {
        self.blend_pixel_opaque(x, y, r, g, b, a);
    }

    /// Alpha-blend a pixel over the existing framebuffer contents.
    pub fn blend_pixel(&mut self, x: f32, y: f32, r: u8, g: u8, b: u8, a: u8) {
        if a == 0 {
            return;
        }
        let xi = x.floor() as i32;
        let yi = y.floor() as i32;
        let fx = x - xi as f32;
        let fy = y - yi as f32;
        let corners = [
            (0, 0, (1.0 - fx) * (1.0 - fy)),
            (1, 0, fx * (1.0 - fy)),
            (0, 1, (1.0 - fx) * fy),
            (1, 1, fx * fy),
        ];
        for (dx, dy, weight) in corners {
            if weight <= 0.0 {
                continue;
            }
            let px = xi + dx;
            let py = yi + dy;
            if px < 0 || py < 0 || px >= self.width as i32 || py >= self.height as i32 {
                continue;
            }
            let alpha = (a as f32 * weight).round().clamp(0.0, 255.0) as u8;
            self.blend_pixel_opaque(px as u32, py as u32, r, g, b, alpha);
        }
    }

    fn blend_pixel_opaque(&mut self, x: u32, y: u32, r: u8, g: u8, b: u8, a: u8) {
        if a == 0 {
            return;
        }
        if a == 255 {
            self.put_pixel(
                x,
                y,
                ((255u32) << 24) | ((r as u32) << 16) | ((g as u32) << 8) | (b as u32),
            );
            return;
        }
        let offset = (y * self.stride + x * 4) as usize;
        if offset + 4 > self.pixels.len() {
            return;
        }
        let (dst_b, dst_g, dst_r) = match self.format {
            PixelFormat::Xrgb8888 | PixelFormat::Bgra8888 | PixelFormat::Argb8888 => (
                self.pixels[offset],
                self.pixels[offset + 1],
                self.pixels[offset + 2],
            ),
        };
        let inv = 255u16 - a as u16;
        let out_r = ((r as u16 * a as u16 + dst_r as u16 * inv) / 255) as u8;
        let out_g = ((g as u16 * a as u16 + dst_g as u16 * inv) / 255) as u8;
        let out_b = ((b as u16 * a as u16 + dst_b as u16 * inv) / 255) as u8;
        let bytes = match self.format {
            PixelFormat::Xrgb8888 => [out_b, out_g, out_r, 0x00],
            PixelFormat::Bgra8888 => [out_b, out_g, out_r, 255],
            PixelFormat::Argb8888 => [out_b, out_g, out_r, 255],
        };
        self.pixels[offset..offset + 4].copy_from_slice(&bytes);
    }

    pub fn fill_rect(&mut self, x: i32, y: i32, w: u32, h: u32, color: u32) {
        for row in 0..h {
            let py = y + row as i32;
            if py < 0 {
                continue;
            }
            for col in 0..w {
                let px = x + col as i32;
                if px < 0 {
                    continue;
                }
                self.put_pixel(px as u32, py as u32, color);
            }
        }
    }
}

#[derive(Debug, Error)]
pub enum DisplayError {
    #[error("no display backend available")]
    NoBackend,
    #[error("display acquire failed: {0}")]
    AcquireFailed(String),
    #[error("display present failed: {0}")]
    PresentFailed(String),
}

pub trait DisplayBackend: Send {
    fn name(&self) -> &'static str;
    fn width(&self) -> u32;
    fn height(&self) -> u32;
    fn format(&self) -> PixelFormat;
    fn map_frame(&mut self) -> Result<&mut FrameBuffer>;
    fn present(&mut self) -> Result<()>;
    fn blit(&mut self, frame: &FrameBuffer) -> Result<()>;
    /// Copy the live scanout buffer into the draw shadow (fbdev only).
    fn import_scanout(&mut self) -> bool {
        false
    }
}

pub struct DisplayManager {
    backend: Box<dyn DisplayBackend>,
}

impl DisplayManager {
    pub fn from_backend(backend: Box<dyn DisplayBackend>) -> Self {
        Self { backend }
    }

    pub fn backend_name(&self) -> &'static str {
        self.backend.name()
    }

    pub fn dimensions(&self) -> (u32, u32) {
        (self.backend.width(), self.backend.height())
    }

    pub fn render<F>(&mut self, draw: F) -> Result<()>
    where
        F: FnOnce(&mut FrameBuffer),
    {
        let frame = self.backend.map_frame()?;
        draw(frame);
        self.backend.present()
    }

    /// True when the backend mirrored the visible framebuffer into the draw buffer.
    pub fn import_scanout(&mut self) -> bool {
        self.backend.import_scanout()
    }

    pub fn try_handoff(&mut self, new_backend: Box<dyn DisplayBackend>, frame: &FrameBuffer) -> Result<()> {
        let mut new = new_backend;
        new.blit(frame)?;
        new.present()?;
        self.backend = new;
        Ok(())
    }
}