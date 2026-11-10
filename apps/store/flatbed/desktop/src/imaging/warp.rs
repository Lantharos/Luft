use image::{RgbImage, imageops};
use rayon::prelude::*;

use super::geometry::{Quad, homography};

const PAPER: [u8; 3] = [255, 255, 255];

pub fn cut(source: &RgbImage, quad: &Quad) -> RgbImage {
    if *quad == Quad::WHOLE {
        return source.clone();
    }
    let (width, height) = source.dimensions();
    let (out_width, out_height) = quad.straightened_size(width, height);
    let map = homography(
        f64::from(out_width),
        f64::from(out_height),
        quad.in_pixels(width, height),
    );
    let mut out = RgbImage::new(out_width, out_height);
    let row_bytes = out_width as usize * 3;
    out.par_chunks_mut(row_bytes)
        .enumerate()
        .for_each(|(row, pixels)| {
            let y = row as f64 + 0.5;
            for (column, pixel) in pixels.as_chunks_mut::<3>().0.iter_mut().enumerate() {
                let x = column as f64 + 0.5;
                let w = map[6] * x + map[7] * y + map[8];
                let u = (map[0] * x + map[1] * y + map[2]) / w - 0.5;
                let v = (map[3] * x + map[4] * y + map[5]) / w - 0.5;
                *pixel = sample(source, u, v);
            }
        });
    out
}

fn sample(source: &RgbImage, u: f64, v: f64) -> [u8; 3] {
    let (width, height) = source.dimensions();
    if u < -0.5 || v < -0.5 || u > f64::from(width) - 0.5 || v > f64::from(height) - 0.5 {
        return PAPER;
    }
    let (x0, y0) = (u.floor().max(0.0), v.floor().max(0.0));
    let (fx, fy) = (
        (u - x0).clamp(0.0, 1.0) as f32,
        (v - y0).clamp(0.0, 1.0) as f32,
    );
    let (x0, y0) = (x0 as u32, y0 as u32);
    let (x1, y1) = ((x0 + 1).min(width - 1), (y0 + 1).min(height - 1));
    let at = |x: u32, y: u32| source.get_pixel(x, y).0;
    let (a, b, c, d) = (at(x0, y0), at(x1, y0), at(x0, y1), at(x1, y1));
    std::array::from_fn(|channel| {
        let top = f32::from(a[channel]) * (1.0 - fx) + f32::from(b[channel]) * fx;
        let bottom = f32::from(c[channel]) * (1.0 - fx) + f32::from(d[channel]) * fx;
        (top * (1.0 - fy) + bottom * fy).round() as u8
    })
}

pub fn rotate_quarter(image: RgbImage, turns: u8) -> RgbImage {
    match turns % 4 {
        1 => imageops::rotate90(&image),
        2 => imageops::rotate180(&image),
        3 => imageops::rotate270(&image),
        _ => image,
    }
}
