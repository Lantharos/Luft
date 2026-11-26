use std::fs;
use std::path::Path;

use half::f16;
use rawler::Orientation;
use rawler::imgop::develop::{Intermediate, ProcessingStep, RawDevelop};
use rayon::prelude::*;

use super::decode::Decoded;
use crate::files::{cache_file, failed};

const LINEAR: [ProcessingStep; 7] = [
    ProcessingStep::Rescale,
    ProcessingStep::Demosaic,
    ProcessingStep::FujiRotate,
    ProcessingStep::CropActiveArea,
    ProcessingStep::WhiteBalance,
    ProcessingStep::Calibrate,
    ProcessingStep::CropDefault,
];

const PIXEL_BYTES: usize = 8;

fn rgb(intermediate: Intermediate) -> (Vec<[f32; 3]>, usize, usize) {
    match intermediate {
        Intermediate::Monochrome(pixels) => {
            let (width, height) = (pixels.width, pixels.height);
            (
                pixels.data.into_iter().map(|value| [value; 3]).collect(),
                width,
                height,
            )
        }
        Intermediate::ThreeColor(pixels) => {
            let (width, height) = (pixels.width, pixels.height);
            (pixels.into_inner(), width, height)
        }
        Intermediate::FourColor(pixels) => {
            let (width, height) = (pixels.width, pixels.height);
            (
                pixels
                    .into_inner()
                    .into_iter()
                    .map(|[r, g, b, _]| [r, g, b])
                    .collect(),
                width,
                height,
            )
        }
    }
}

fn turned(orientation: Orientation) -> bool {
    matches!(
        orientation,
        Orientation::Transpose
            | Orientation::Rotate90
            | Orientation::Transverse
            | Orientation::Rotate270
    )
}

fn source(orientation: Orientation, x: usize, y: usize, width: usize, height: usize) -> usize {
    let (sx, sy) = match orientation {
        Orientation::HorizontalFlip => (width - 1 - x, y),
        Orientation::Rotate180 => (width - 1 - x, height - 1 - y),
        Orientation::VerticalFlip => (x, height - 1 - y),
        Orientation::Transpose => (y, x),
        Orientation::Rotate90 => (y, height - 1 - x),
        Orientation::Transverse => (width - 1 - y, height - 1 - x),
        Orientation::Rotate270 => (width - 1 - y, x),
        Orientation::Normal | Orientation::Unknown => (x, y),
    };
    sy * width + sx
}

pub fn decode_raw(path: &Path) -> Result<Decoded, String> {
    let raw = rawler::decode_file(path).map_err(failed)?;
    let orientation = raw.orientation;
    let developed = RawDevelop::new_with(&LINEAR)
        .develop_intermediate(&raw)
        .map_err(failed)?;
    drop(raw);
    let (pixels, width, height) = rgb(developed);
    let (out_width, out_height) = if turned(orientation) {
        (height, width)
    } else {
        (width, height)
    };
    let mut bytes = vec![0u8; out_width * out_height * PIXEL_BYTES];
    bytes
        .par_chunks_mut(out_width * PIXEL_BYTES)
        .enumerate()
        .for_each(|(y, row)| {
            for (x, out) in row.as_chunks_mut::<PIXEL_BYTES>().0.iter_mut().enumerate() {
                let [r, g, b] = pixels[source(orientation, x, y, width, height)];
                for (channel, value) in [r, g, b, 1.0].into_iter().enumerate() {
                    out[channel * 2..channel * 2 + 2]
                        .copy_from_slice(&f16::from_f32(value).to_le_bytes());
                }
            }
        });
    let target = cache_file("raw")?;
    fs::write(&target, bytes).map_err(failed)?;
    Ok(Decoded::new(target, out_width as u32, out_height as u32))
}
