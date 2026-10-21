use std::io::{Cursor, Read};
use std::path::Path;
use std::sync::Arc;

use flate2::read::GzDecoder;

use fast_image_resize::images::Image;
use fast_image_resize::{FilterType, PixelType, ResizeAlg, ResizeOptions, Resizer};
use image::{ImageFormat, ImageReader, Limits, RgbaImage};
use luft_software::appimage::{Icon, IconSize};
use resvg::tiny_skia::{Pixmap, Transform};
use resvg::usvg::{ImageHrefResolver, Options, Tree};

const MAX_ICON_BYTES: usize = 8 << 20;
const MAX_PNG_SIDE: u32 = 4096;
const GZIP_MAGIC: [u8; 2] = [0x1f, 0x8b];

pub fn best(icons: Vec<Icon>, size: u32) -> Option<Icon> {
    icons.into_iter().min_by_key(|icon| match icon.size {
        IconSize::Pixels(pixels) if pixels >= size => (0, pixels),
        IconSize::Scalable => (1, 0),
        IconSize::Pixels(pixels) => (2, u32::MAX - pixels),
    })
}

pub fn write(icon: &Icon, size: u32, output: &Path) -> Result<(), String> {
    if icon.bytes.len() > MAX_ICON_BYTES {
        return Err("The icon is too large".to_string());
    }
    let png = match icon.size {
        IconSize::Scalable => rasterize(&icon.bytes, size)?,
        IconSize::Pixels(pixels) if pixels <= size => icon.bytes.clone(),
        IconSize::Pixels(_) => downscale(&icon.bytes, size)?,
    };
    std::fs::write(output, png).map_err(|error| error.to_string())
}

fn self_contained() -> Options<'static> {
    let embedded = ImageHrefResolver::default_data_resolver();
    Options {
        image_href_resolver: ImageHrefResolver {
            resolve_data: Box::new(move |mime, data: Arc<Vec<u8>>, options| {
                if data.starts_with(&GZIP_MAGIC) {
                    None
                } else {
                    embedded(mime, data, options)
                }
            }),
            resolve_string: Box::new(|_, _| None),
        },
        ..Options::default()
    }
}

fn inflate(svg: &[u8]) -> Result<Vec<u8>, String> {
    let mut inflated = Vec::new();
    GzDecoder::new(svg)
        .take(MAX_ICON_BYTES as u64 + 1)
        .read_to_end(&mut inflated)
        .map_err(|error| error.to_string())?;
    if inflated.len() > MAX_ICON_BYTES {
        return Err("The icon is too large".to_string());
    }
    Ok(inflated)
}

fn rasterize(svg: &[u8], size: u32) -> Result<Vec<u8>, String> {
    let inflated;
    let svg = if svg.starts_with(&GZIP_MAGIC) {
        inflated = inflate(svg)?;
        &inflated
    } else {
        svg
    };
    let tree = Tree::from_data(svg, &self_contained()).map_err(|error| error.to_string())?;
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
    let mut limits = Limits::default();
    limits.max_image_width = Some(MAX_PNG_SIDE);
    limits.max_image_height = Some(MAX_PNG_SIDE);
    let mut reader = ImageReader::with_format(Cursor::new(png), ImageFormat::Png);
    reader.limits(limits);
    let source = reader
        .decode()
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

#[cfg(test)]
mod tests {
    use super::*;

    fn opaque_png() -> Vec<u8> {
        let mut encoded = Cursor::new(Vec::new());
        RgbaImage::from_pixel(4, 4, image::Rgba([255, 0, 0, 255]))
            .write_to(&mut encoded, ImageFormat::Png)
            .unwrap();
        encoded.into_inner()
    }

    fn centre_alpha(svg: &str) -> u8 {
        let png = rasterize(svg.as_bytes(), 16).unwrap();
        image::load_from_memory_with_format(&png, ImageFormat::Png)
            .unwrap()
            .into_rgba8()
            .get_pixel(8, 8)[3]
    }

    fn with_image(href: &str) -> String {
        format!(
            r#"<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><image href="{href}" width="16" height="16"/></svg>"#
        )
    }

    #[test]
    fn ignores_images_on_disk() {
        let path = std::env::temp_dir().join(format!("luft-artwork-{}.png", std::process::id()));
        std::fs::write(&path, opaque_png()).unwrap();
        let alpha = centre_alpha(&with_image(&path.to_string_lossy()));
        std::fs::remove_file(&path).unwrap();
        assert_eq!(alpha, 0);
    }

    #[test]
    fn renders_embedded_images() {
        let encoded: String = opaque_png()
            .iter()
            .map(|byte| format!("%{byte:02X}"))
            .collect();
        let alpha = centre_alpha(&with_image(&format!("data:image/png,{encoded}")));
        assert_eq!(alpha, 255);
    }
}
