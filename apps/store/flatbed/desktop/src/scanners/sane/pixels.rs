use image::RgbImage;
use jpeg_encoder::{ColorType, Encoder};

const PREVIEW_WIDTH: u32 = 600;
const PREVIEW_QUALITY: u8 = 70;
const ASSUMED_PROPORTION: f32 = 1.414;

pub struct Assembly {
    width: u32,
    lines: i32,
    bytes_per_line: usize,
    depth: u32,
    colour: bool,
    pub dpi: f32,
    data: Vec<u8>,
}

impl Assembly {
    pub fn new(
        width: u32,
        lines: i32,
        bytes_per_line: u32,
        depth: u32,
        colour: bool,
        dpi: f32,
    ) -> Self {
        let capacity = if lines > 0 {
            lines as usize * bytes_per_line as usize
        } else {
            0
        };
        Self {
            width,
            lines,
            bytes_per_line: bytes_per_line.max(1) as usize,
            depth,
            colour,
            dpi,
            data: Vec::with_capacity(capacity),
        }
    }

    pub fn push(&mut self, bytes: &[u8]) {
        self.data.extend_from_slice(bytes);
    }

    fn rows(&self) -> u32 {
        (self.data.len() / self.bytes_per_line) as u32
    }

    fn pixel(&self, row: u32, column: u32) -> [u8; 3] {
        let line = &self.data[row as usize * self.bytes_per_line..][..self.bytes_per_line];
        let column = column as usize;
        let channels = if self.colour { 3 } else { 1 };
        let value = |channel: usize| match self.depth {
            1 => {
                let bit = column * channels + channel;
                if line[bit / 8] & (0x80 >> (bit % 8)) == 0 {
                    255
                } else {
                    0
                }
            }
            16 => line[(column * channels + channel) * 2 + 1],
            _ => line[column * channels + channel],
        };
        if self.colour {
            [value(0), value(1), value(2)]
        } else {
            [value(0); 3]
        }
    }

    pub fn finish(self) -> RgbImage {
        let rows = self.rows().max(1);
        RgbImage::from_fn(self.width, rows, |x, y| image::Rgb(self.pixel(y, x)))
    }

    pub fn preview(&self) -> Option<Vec<u8>> {
        let step = self.width.div_ceil(PREVIEW_WIDTH).max(1);
        let (width, rows) = (self.width / step, self.rows() / step);
        let total = if self.lines > 0 {
            self.lines as u32
        } else {
            (self.width as f32 * ASSUMED_PROPORTION) as u32
        };
        let height = (total / step).max(rows).max(1);
        let mut pixels = vec![255; (width * height * 3) as usize];
        for y in 0..rows {
            for x in 0..width {
                let at = ((y * width + x) * 3) as usize;
                pixels[at..at + 3].copy_from_slice(&self.pixel(y * step, x * step));
            }
        }
        let mut out = Vec::new();
        Encoder::new(&mut out, PREVIEW_QUALITY)
            .encode(
                &pixels,
                u16::try_from(width).ok()?,
                u16::try_from(height).ok()?,
                ColorType::Rgb,
            )
            .ok()?;
        Some(out)
    }
}
