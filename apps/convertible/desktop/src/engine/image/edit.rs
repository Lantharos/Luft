use fast_image_resize::{FilterType, ResizeAlg, ResizeOptions, Resizer};
use image::imageops;
use image::{ColorType, DynamicImage, GenericImageView, Rgba, RgbaImage};
use rayon::prelude::*;

use super::marks;
use crate::engine::error::{Failure, Result};
use crate::engine::job::{Edits, Options, Rect};

pub fn apply(mut image: DynamicImage, edits: &Edits, options: &Options) -> Result<DynamicImage> {
    image = orient(image, edits);
    if edits.adjusts() {
        image = adjust(image, edits);
    }
    if !edits.marks.is_empty() {
        let mut canvas = image.into_rgba8();
        marks::apply(&mut canvas, &edits.marks)?;
        image = DynamicImage::ImageRgba8(canvas);
    }
    if let Some(crop) = edits.crop {
        image = cropped(&image, crop);
    }
    fit(image, options.width, options.height)
}

fn orient(image: DynamicImage, edits: &Edits) -> DynamicImage {
    let image = match edits.rotate % 360 {
        90 => image.rotate90(),
        180 => image.rotate180(),
        270 => image.rotate270(),
        _ => image,
    };
    let image = if edits.flip_horizontal {
        image.fliph()
    } else {
        image
    };
    if edits.flip_vertical {
        image.flipv()
    } else {
        image
    }
}

pub fn cropped(image: &DynamicImage, area: Rect) -> DynamicImage {
    let (width, height) = image.dimensions();
    let x = (area.x.round().max(0.0) as u32).min(width.saturating_sub(1));
    let y = (area.y.round().max(0.0) as u32).min(height.saturating_sub(1));
    let right = ((area.x + area.width).round() as u32).clamp(x + 1, width);
    let bottom = ((area.y + area.height).round() as u32).clamp(y + 1, height);
    image.crop_imm(x, y, right - x, bottom - y)
}

fn lookup(edits: &Edits) -> [u8; 256] {
    let brightness = 1.0 + edits.brightness;
    let contrast = 1.0 + edits.contrast;
    std::array::from_fn(|value| {
        let bright = value as f64 / 255.0 * brightness;
        let contrasted = (bright.clamp(0.0, 1.0) - 0.5) * contrast + 0.5;
        (contrasted.clamp(0.0, 1.0) * 255.0).round() as u8
    })
}

fn saturate(pixel: &mut [u8], amount: f64) {
    let (red, green, blue) = (
        f64::from(pixel[0]),
        f64::from(pixel[1]),
        f64::from(pixel[2]),
    );
    let (s, r, g, b) = (1.0 + amount, 0.2126, 0.7152, 0.0722);
    let mix = |red_part: f64, green_part: f64, blue_part: f64| {
        (red * red_part + green * green_part + blue * blue_part)
            .clamp(0.0, 255.0)
            .round() as u8
    };
    pixel[0] = mix(r + (1.0 - r) * s, g - g * s, b - b * s);
    pixel[1] = mix(r - r * s, g + (1.0 - g) * s, b - b * s);
    pixel[2] = mix(r - r * s, g - g * s, b + (1.0 - b) * s);
}

fn adjust(image: DynamicImage, edits: &Edits) -> DynamicImage {
    let mut canvas = image.into_rgba8();
    let table = lookup(edits);
    let saturation = edits.saturation;
    canvas.par_chunks_mut(4).for_each(|pixel| {
        for channel in &mut pixel[..3] {
            *channel = table[*channel as usize];
        }
        if saturation != 0.0 {
            saturate(pixel, saturation);
        }
    });
    DynamicImage::ImageRgba8(canvas)
}

pub fn fit(image: DynamicImage, width: Option<u32>, height: Option<u32>) -> Result<DynamicImage> {
    let (source_width, source_height) = image.dimensions();
    let ratio = f64::from(source_width) / f64::from(source_height);
    let (target_width, target_height) = match (width, height) {
        (Some(width), Some(height)) => (width, height),
        (Some(width), None) => (width, (f64::from(width) / ratio).round().max(1.0) as u32),
        (None, Some(height)) => ((f64::from(height) * ratio).round().max(1.0) as u32, height),
        (None, None) => return Ok(image),
    };
    if (target_width, target_height) == (source_width, source_height) {
        return Ok(image);
    }
    resized(&image, target_width, target_height)
}

pub fn resized(image: &DynamicImage, width: u32, height: u32) -> Result<DynamicImage> {
    let color = image.color();
    let source = match color {
        ColorType::Rgb8 | ColorType::L8 => DynamicImage::ImageRgb8(image.to_rgb8()),
        ColorType::Rgba32F | ColorType::Rgb32F => image.clone(),
        _ => DynamicImage::ImageRgba8(image.to_rgba8()),
    };
    let mut target = DynamicImage::new(width, height, source.color());
    let mut resizer = Resizer::new();
    let options = ResizeOptions::new().resize_alg(ResizeAlg::Convolution(FilterType::Lanczos3));
    resizer
        .resize(&source, &mut target, &options)
        .map_err(Failure::damaged)?;
    Ok(target)
}

pub fn scaled_to_edge(image: &DynamicImage, edge: u32) -> Result<DynamicImage> {
    let (width, height) = image.dimensions();
    let longest = width.max(height);
    if longest <= edge {
        return Ok(image.clone());
    }
    let scale = f64::from(edge) / f64::from(longest);
    let width = (f64::from(width) * scale).round().max(1.0) as u32;
    let height = (f64::from(height) * scale).round().max(1.0) as u32;
    resized(image, width, height)
}

pub fn blur_region(canvas: &mut RgbaImage, area: Rect, strength: f64) {
    let (width, height) = canvas.dimensions();
    let x = (area.x.max(0.0) as u32).min(width.saturating_sub(1));
    let y = (area.y.max(0.0) as u32).min(height.saturating_sub(1));
    let region_width = ((area.width as u32).max(1)).min(width - x);
    let region_height = ((area.height as u32).max(1)).min(height - y);
    let region = imageops::crop_imm(canvas, x, y, region_width, region_height).to_image();
    let blurred = imageops::fast_blur(&region, strength as f32);
    imageops::replace(canvas, &blurred, i64::from(x), i64::from(y));
}

pub fn fill_region(canvas: &mut RgbaImage, area: Rect, color: Rgba<u8>) {
    let (width, height) = canvas.dimensions();
    let left = (area.x.floor().max(0.0) as u32).min(width);
    let top = (area.y.floor().max(0.0) as u32).min(height);
    let right = ((area.x + area.width).ceil().max(0.0) as u32).min(width);
    let bottom = ((area.y + area.height).ceil().max(0.0) as u32).min(height);
    for y in top..bottom {
        for x in left..right {
            canvas.put_pixel(x, y, color);
        }
    }
}
