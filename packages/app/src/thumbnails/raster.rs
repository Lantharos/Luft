use std::path::Path;

use fast_image_resize::images::Image;
use fast_image_resize::{FilterType, PixelType, ResizeAlg, ResizeOptions, Resizer};
use image::{DynamicImage, ImageDecoder, ImageReader, Limits, RgbaImage};

const MAX_ALLOCATION: u64 = 768 * 1024 * 1024;
const MAX_FILE_BYTES: u64 = 256 * 1024 * 1024;

const DECODED_TYPES: [&str; 14] = [
    "image/png",
    "image/apng",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/vnd.microsoft.icon",
    "image/tiff",
    "image/x-tga",
    "image/qoi",
    "image/x-portable-anymap",
    "image/x-portable-bitmap",
    "image/x-portable-graymap",
    "image/x-portable-pixmap",
];

pub fn decodes(mime: &str, bytes: u64) -> bool {
    bytes <= MAX_FILE_BYTES && DECODED_TYPES.contains(&mime)
}

pub fn render(path: &Path, max: u32) -> Result<RgbaImage, String> {
    let mut reader = ImageReader::open(path)
        .and_then(ImageReader::with_guessed_format)
        .map_err(|error| error.to_string())?;
    let mut limits = Limits::default();
    limits.max_alloc = Some(MAX_ALLOCATION);
    reader.limits(limits);
    let mut decoder = reader.into_decoder().map_err(|error| error.to_string())?;
    let orientation = decoder.orientation().map_err(|error| error.to_string())?;
    let mut image = DynamicImage::from_decoder(decoder).map_err(|error| error.to_string())?;
    image.apply_orientation(orientation);
    fit(image, max)
}

pub fn fit(image: DynamicImage, max: u32) -> Result<RgbaImage, String> {
    let source = image.into_rgba8();
    let (width, height) = source.dimensions();
    if width <= max && height <= max {
        return Ok(source);
    }
    let scale = max as f64 / width.max(height) as f64;
    let target_width = ((width as f64 * scale).round() as u32).max(1);
    let target_height = ((height as f64 * scale).round() as u32).max(1);
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
    RgbaImage::from_raw(target_width, target_height, target.into_vec())
        .ok_or_else(|| "Could not build the thumbnail".to_string())
}
