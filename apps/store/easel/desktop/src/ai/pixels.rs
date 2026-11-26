use fast_image_resize::images::Image;
use fast_image_resize::{FilterType, PixelType, ResizeAlg, ResizeOptions, Resizer};

use crate::files::failed;

pub fn resize(
    pixels: &[u8],
    from: (u32, u32),
    to: (u32, u32),
    channels: u8,
) -> Result<Vec<u8>, String> {
    if from == to {
        return Ok(pixels.to_vec());
    }
    let kind = if channels == 1 {
        PixelType::U8
    } else {
        PixelType::U8x4
    };
    let source = Image::from_vec_u8(from.0, from.1, pixels.to_vec(), kind).map_err(failed)?;
    let mut target = Image::new(to.0, to.1, kind);
    let options = ResizeOptions::new()
        .resize_alg(ResizeAlg::Convolution(FilterType::Lanczos3))
        .use_alpha(false);
    Resizer::new()
        .resize(&source, &mut target, &options)
        .map_err(failed)?;
    Ok(target.into_vec())
}

pub fn planar(
    rgba: &[u8],
    width: usize,
    height: usize,
    mean: [f32; 3],
    deviation: [f32; 3],
) -> Vec<f32> {
    let plane = width * height;
    let mut out = vec![0.0; plane * 3];
    for (index, pixel) in rgba.as_chunks::<4>().0.iter().enumerate() {
        let alpha = f32::from(pixel[3]).max(1.0) / 255.0;
        for channel in 0..3 {
            let value = f32::from(pixel[channel]) / 255.0 / alpha;
            out[channel * plane + index] = (value.min(1.0) - mean[channel]) / deviation[channel];
        }
    }
    out
}

pub fn interleaved(
    planes: &[f32],
    width: usize,
    height: usize,
    scale: f32,
    alpha: &[u8],
) -> Vec<u8> {
    let plane = width * height;
    let mut out = vec![0; plane * 4];
    for index in 0..plane {
        let a = alpha[index];
        for channel in 0..3 {
            let value = (planes[channel * plane + index] * scale).clamp(0.0, 255.0);
            out[index * 4 + channel] = (value * f32::from(a) / 255.0).round() as u8;
        }
        out[index * 4 + 3] = a;
    }
    out
}
