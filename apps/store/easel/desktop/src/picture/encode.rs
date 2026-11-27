use glycin::{Creator, MemoryFormat, MimeType};
use jpeg_encoder::{ColorType, Encoder as JpegEncoder};
use png::{BitDepth, ColorType as PngColor, Compression, Encoder as PngEncoder};
use rayon::prelude::*;
use serde::Deserialize;
use specta::Type;

use super::{loaders_sandbox, on_glycin};
use crate::files::failed;

#[derive(Deserialize, Type, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Format {
    Png,
    Jpeg,
    Webp,
    Avif,
}

pub fn unpremultiply(pixels: &mut [u8]) {
    pixels.par_chunks_exact_mut(4).for_each(|pixel| {
        let alpha = u16::from(pixel[3]);
        if alpha == 0 || alpha == 255 {
            return;
        }
        for channel in &mut pixel[..3] {
            *channel = ((u16::from(*channel) * 255 + alpha / 2) / alpha).min(255) as u8;
        }
    });
}

pub fn png(width: u32, height: u32, rgba: &[u8]) -> Result<Vec<u8>, String> {
    let mut out = Vec::new();
    let mut encoder = PngEncoder::new(&mut out, width, height);
    encoder.set_color(PngColor::Rgba);
    encoder.set_depth(BitDepth::Eight);
    encoder.set_compression(Compression::Fast);
    let mut writer = encoder.write_header().map_err(failed)?;
    writer.write_image_data(rgba).map_err(failed)?;
    writer.finish().map_err(failed)?;
    Ok(out)
}

fn flattened(rgba: &[u8]) -> Vec<u8> {
    rgba.par_chunks_exact(4)
        .flat_map_iter(|pixel| {
            let alpha = u16::from(pixel[3]);
            let over = |channel: u8| {
                ((u16::from(channel) * alpha + 255 * (255 - alpha) + 127) / 255) as u8
            };
            [over(pixel[0]), over(pixel[1]), over(pixel[2])]
        })
        .collect()
}

pub fn encode(
    format: Format,
    width: u32,
    height: u32,
    rgba: Vec<u8>,
    quality: u8,
) -> Result<Vec<u8>, String> {
    match format {
        Format::Png => png(width, height, &rgba),
        Format::Jpeg => {
            let rgb = flattened(&rgba);
            let mut out = Vec::new();
            let mut encoder = JpegEncoder::new(&mut out, quality.clamp(1, 100));
            encoder.set_progressive(true);
            encoder.set_optimized_huffman_tables(true);
            encoder
                .encode(&rgb, width as u16, height as u16, ColorType::Rgb)
                .map_err(failed)?;
            Ok(out)
        }
        Format::Webp => Ok(webp::Encoder::from_rgba(&rgba, width, height)
            .encode(f32::from(quality))
            .to_vec()),
        Format::Avif => on_glycin(move || async move {
            let mut creator = Creator::new(MimeType::AVIF).await.map_err(failed)?;
            creator.sandbox_selector(loaders_sandbox());
            creator
                .add_frame(width, height, MemoryFormat::R8g8b8a8, rgba)
                .map_err(failed)?;
            let _ = creator.set_encoding_quality(quality);
            Ok(creator.create().await.map_err(failed)?.data_full())
        }),
    }
}
