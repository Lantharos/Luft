use std::borrow::Cow;
use std::io::Write;

use gif::{DisposalMethod, Encoder, Frame, Repeat};
use image::DynamicImage;
use imagequant::RGBA;

use crate::engine::error::{Failure, Result};

const QUANTIZE_SPEED: i32 = 6;
const MAX_COLORS: u32 = 256;

pub struct Quantized {
    pub palette: Vec<u8>,
    pub transparent: Option<u8>,
    pub indices: Vec<u8>,
}

pub fn quantize(rgba: &[u8], width: u32, height: u32) -> Result<Quantized> {
    let mut attributes = imagequant::new();
    attributes
        .set_speed(QUANTIZE_SPEED)
        .map_err(Failure::damaged)?;
    attributes
        .set_max_colors(MAX_COLORS)
        .map_err(Failure::damaged)?;
    let pixels: Vec<RGBA> = rgba
        .as_chunks::<4>()
        .0
        .iter()
        .map(|[red, green, blue, alpha]| RGBA::new(*red, *green, *blue, *alpha))
        .collect();
    let mut source = attributes
        .new_image(pixels, width as usize, height as usize, 0.0)
        .map_err(Failure::damaged)?;
    let mut result = attributes.quantize(&mut source).map_err(Failure::damaged)?;
    let (colors, indices) = result.remapped(&mut source).map_err(Failure::damaged)?;
    let transparent = colors
        .iter()
        .position(|color| color.a == 0)
        .map(|index| index as u8);
    let palette = colors
        .iter()
        .flat_map(|color| [color.r, color.g, color.b])
        .collect();
    Ok(Quantized {
        palette,
        transparent,
        indices,
    })
}

pub struct Writer<W: Write> {
    encoder: Encoder<W>,
}

impl<W: Write> Writer<W> {
    pub fn new(out: W, width: u16, height: u16) -> Result<Self> {
        let mut encoder = Encoder::new(out, width, height, &[]).map_err(Failure::damaged)?;
        encoder
            .set_repeat(Repeat::Infinite)
            .map_err(Failure::damaged)?;
        Ok(Self { encoder })
    }

    pub fn push(&mut self, rgba: &[u8], width: u16, height: u16, delay_ms: u32) -> Result<()> {
        let quantized = quantize(rgba, u32::from(width), u32::from(height))?;
        let frame = Frame {
            width,
            height,
            delay: (delay_ms / 10).clamp(1, u32::from(u16::MAX)) as u16,
            buffer: Cow::Owned(quantized.indices),
            palette: Some(quantized.palette),
            transparent: quantized.transparent,
            dispose: DisposalMethod::Background,
            ..Frame::default()
        };
        self.encoder.write_frame(&frame).map_err(Failure::damaged)
    }
}

pub fn still(image: &DynamicImage) -> Result<Vec<u8>> {
    let rgba = image.to_rgba8();
    let (width, height) = (rgba.width() as u16, rgba.height() as u16);
    let mut out = Vec::new();
    Writer::new(&mut out, width, height)?.push(&rgba, width, height, 0)?;
    Ok(out)
}
