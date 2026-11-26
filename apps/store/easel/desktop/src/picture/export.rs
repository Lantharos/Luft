use luft_i18n::t;
use std::io::Write;
use std::path::PathBuf;

use fast_image_resize::images::Image;
use fast_image_resize::{FilterType, PixelType, ResizeAlg, ResizeOptions, Resizer};
use serde::Deserialize;
use specta::Type;

use super::encode::{self, Format};
use crate::files::{failed, write_atomically};
use crate::format::{TILE, TILE_BYTES};
use crate::l10n::L10N;

pub struct Export {
    path: PathBuf,
    format: Format,
    quality: u8,
    source: (u32, u32),
    size: (u32, u32),
    pixels: Vec<u8>,
}

#[derive(Deserialize, Type)]
#[serde(rename_all = "camelCase")]
pub struct Begin {
    pub path: String,
    pub format: Format,
    pub quality: u8,
    pub source_width: u32,
    pub source_height: u32,
    pub width: u32,
    pub height: u32,
}

#[derive(Deserialize, Type)]
pub struct Tiles {
    pub id: u32,
    pub indices: Vec<u32>,
}

impl Export {
    pub fn new(begin: Begin) -> Self {
        Self {
            path: PathBuf::from(begin.path),
            format: begin.format,
            quality: begin.quality,
            source: (begin.source_width, begin.source_height),
            size: (begin.width.max(1), begin.height.max(1)),
            pixels: vec![0; begin.source_width as usize * begin.source_height as usize * 4],
        }
    }

    pub fn add_tiles(&mut self, indices: &[u32], raw: &[u8]) -> Result<(), String> {
        if raw.len() != indices.len() * TILE_BYTES {
            return Err(t!(L10N, "easel-error-tiles-short"));
        }
        let (width, height) = (self.source.0 as usize, self.source.1 as usize);
        let cols = width.div_ceil(TILE);
        for (&index, tile) in indices.iter().zip(raw.as_chunks::<TILE_BYTES>().0) {
            let left = (index as usize % cols) * TILE;
            let top = (index as usize / cols) * TILE;
            let span = TILE.min(width.saturating_sub(left)) * 4;
            for row in 0..TILE.min(height.saturating_sub(top)) {
                let target = ((top + row) * width + left) * 4;
                self.pixels[target..target + span]
                    .copy_from_slice(&tile[row * TILE * 4..row * TILE * 4 + span]);
            }
        }
        Ok(())
    }

    pub fn write(self) -> Result<(), String> {
        let (width, height) = self.size;
        let mut pixels = if self.size == self.source {
            self.pixels
        } else {
            let source =
                Image::from_vec_u8(self.source.0, self.source.1, self.pixels, PixelType::U8x4)
                    .map_err(failed)?;
            let mut target = Image::new(width, height, PixelType::U8x4);
            let options = ResizeOptions::new()
                .resize_alg(ResizeAlg::Convolution(FilterType::Lanczos3))
                .use_alpha(false);
            Resizer::new()
                .resize(&source, &mut target, &options)
                .map_err(failed)?;
            target.into_vec()
        };
        encode::unpremultiply(&mut pixels);
        let encoded = encode::encode(self.format, width, height, pixels, self.quality)?;
        write_atomically(&self.path, |file| file.write_all(&encoded).map_err(failed))
    }
}
