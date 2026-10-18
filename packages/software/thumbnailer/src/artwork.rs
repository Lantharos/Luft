use std::io::Cursor;
use std::path::Path;

use fast_image_resize::images::Image;
use fast_image_resize::{FilterType, PixelType, ResizeAlg, ResizeOptions, Resizer};
use image::{ImageFormat, RgbaImage};
use luft_software::appimage::{Icon, IconSize};
use resvg::tiny_skia::{Pixmap, Transform};
use resvg::usvg::{Options, Tree};

pub fn best(icons: Vec<Icon>, size: u32) -> Option<Icon> {
    icons.into_iter().min_by_key(|icon| match icon.size {
        IconSize::Pixels(pixels) if pixels >= size => (0, pixels),
        IconSize::Scalable => (1, 0),
        IconSize::Pixels(pixels) => (2, u32::MAX - pixels),
    })
}

pub fn write(icon: &Icon, size: u32, output: &Path) -> Result<(), String> {
    let png = match icon.size {
        IconSize::Scalable => rasterize(&icon.bytes, size)?,
        IconSize::Pixels(pixels) if pixels <= size => icon.bytes.clone(),
        IconSize::Pixels(_) => downscale(&icon.bytes, size)?,
    };
    std::fs::write(output, png).map_err(|error| error.to_string())
}

fn rasterize(svg: &[u8], size: u32) -> Result<Vec<u8>, String> {
    let tree = Tree::from_data(svg, &Options::default()).map_err(|error| error.to_string())?;
    let natural = tree.size();
    let scale = size as f32 / natural.width().max(natural.height());
    let pixels = |length: f32| ((length * scale).round() as u32).max(1);
    let mut pixmap = Pixmap::new(pixels(natural.width()), pixels(natural.height()))
        .ok_or("The icon has no area")?;
    resvg::render(
        &tree,
        Transform::from_scale(scale, scale),
        &mut pixmap.as_mut(),
    );
    pixmap.encode_png().map_err(|error| error.to_string())
}

fn downscale(png: &[u8], size: u32) -> Result<Vec<u8>, String> {
    let source = image::load_from_memory_with_format(png, ImageFormat::Png)
        .map_err(|error| error.to_string())?
        .into_rgba8();
    let (width, height) = source.dimensions();
    let scale = size as f64 / width.max(height) as f64;
    let pixels = |length: u32| ((length as f64 * scale).round() as u32).max(1);
    let (target_width, target_height) = (pixels(width), pixels(height));
    let source = Image::from_vec_u8(width, height, source.into_raw(), PixelType::U8x4)
        .map_err(|error| error.to_string())?;
    let mut target = Image::new(target_width, target_height, PixelType::U8x4);
    Resizer::new()
        .resize(
            &source,
            &mut target,
            &ResizeOptions::new().resize_alg(ResizeAlg::Convolution(FilterType::Lanczos3)),
        )
        .map_err(|error| error.to_string())?;
    let image = RgbaImage::from_raw(target_width, target_height, target.into_vec())
        .ok_or("The icon could not be resized")?;
    let mut encoded = Cursor::new(Vec::new());
    image
        .write_to(&mut encoded, ImageFormat::Png)
        .map_err(|error| error.to_string())?;
    Ok(encoded.into_inner())
}
