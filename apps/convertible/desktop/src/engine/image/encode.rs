use std::io::Cursor;

use glycin::{Creator, MemoryFormat, MimeType};
use image::codecs::bmp::BmpEncoder;
use image::codecs::ico::{IcoEncoder, IcoFrame};
use image::codecs::png::{CompressionType, FilterType, PngEncoder};
use image::{DynamicImage, ExtendedColorType, GenericImageView, ImageEncoder, ImageFormat};
use img_parts::{Bytes, DynImage, ImageEXIF, ImageICC};
use jpeg_encoder::{ColorType as JpegColor, Encoder as JpegEncoder};

use super::decode::{Metadata, glycin_block_on};
use super::{edit, gif};
use crate::engine::error::{Failure, Result};

const ICON_SIZES: [u32; 5] = [16, 32, 48, 128, 256];

pub struct Settings {
    pub quality: u8,
    pub lossless: bool,
}

pub const fn is_lossy(id: &str) -> bool {
    matches!(
        id.as_bytes(),
        b"jpeg" | b"webp" | b"avif" | b"heic" | b"jxl"
    )
}

pub fn encode(image: &DynamicImage, id: &str, settings: &Settings) -> Result<Vec<u8>> {
    match id {
        "png" => png(image),
        "jpeg" => jpeg(image, settings.quality),
        "webp" => webp(image, settings),
        "gif" => gif::still(image),
        "avif" => creator(image, MimeType::AVIF, settings),
        "heic" => creator(image, MimeType::HEIC, settings),
        "jxl" => creator(
            &DynamicImage::ImageRgb8(image.to_rgb8()),
            MimeType::JXL,
            settings,
        ),
        "ico" => ico(image),
        "bmp" => bmp(image),
        "tiff" => written(image, ImageFormat::Tiff),
        "tga" => written(
            &DynamicImage::ImageRgba8(image.to_rgba8()),
            ImageFormat::Tga,
        ),
        "qoi" => written(
            &DynamicImage::ImageRgba8(image.to_rgba8()),
            ImageFormat::Qoi,
        ),
        "pnm" => written(&DynamicImage::ImageRgb8(image.to_rgb8()), ImageFormat::Pnm),
        "exr" => written(
            &DynamicImage::ImageRgba32F(image.to_rgba32f()),
            ImageFormat::OpenExr,
        ),
        "hdr" => written(
            &DynamicImage::ImageRgb32F(image.to_rgb32f()),
            ImageFormat::Hdr,
        ),
        _ => Err(Failure::unsupported("", id)),
    }
}

fn written(image: &DynamicImage, format: ImageFormat) -> Result<Vec<u8>> {
    let mut out = Cursor::new(Vec::new());
    image.write_to(&mut out, format).map_err(Failure::damaged)?;
    Ok(out.into_inner())
}

fn png(image: &DynamicImage) -> Result<Vec<u8>> {
    let float = matches!(
        image,
        DynamicImage::ImageRgba32F(_) | DynamicImage::ImageRgb32F(_)
    );
    let deep;
    let source = if float {
        deep = DynamicImage::ImageRgba16(image.to_rgba16());
        &deep
    } else {
        image
    };
    let (width, height) = source.dimensions();
    let mut out = Vec::new();
    PngEncoder::new_with_quality(&mut out, CompressionType::Default, FilterType::Adaptive)
        .write_image(source.as_bytes(), width, height, source.color().into())
        .map_err(Failure::damaged)?;
    Ok(out)
}

fn jpeg(image: &DynamicImage, quality: u8) -> Result<Vec<u8>> {
    let flat = flattened(image);
    let (width, height) = (flat.width() as u16, flat.height() as u16);
    let mut out = Vec::new();
    let mut encoder = JpegEncoder::new(&mut out, quality.clamp(1, 100));
    encoder.set_progressive(true);
    encoder.set_optimized_huffman_tables(true);
    encoder
        .encode(flat.as_raw(), width, height, JpegColor::Rgb)
        .map_err(Failure::damaged)?;
    Ok(out)
}

fn flattened(image: &DynamicImage) -> image::RgbImage {
    if !image.color().has_alpha() {
        return image.to_rgb8();
    }
    let source = image.to_rgba8();
    let mut flat = image::RgbImage::new(source.width(), source.height());
    for (target, pixel) in flat.pixels_mut().zip(source.pixels()) {
        let alpha = u16::from(pixel[3]);
        for channel in 0..3 {
            target[channel] =
                ((u16::from(pixel[channel]) * alpha + 255 * (255 - alpha)) / 255) as u8;
        }
    }
    flat
}

fn webp(image: &DynamicImage, settings: &Settings) -> Result<Vec<u8>> {
    let rgba = image.to_rgba8();
    let encoder = webp::Encoder::from_rgba(&rgba, rgba.width(), rgba.height());
    let encoded = if settings.lossless {
        encoder.encode_lossless()
    } else {
        encoder.encode(f32::from(settings.quality))
    };
    Ok(encoded.to_vec())
}

fn bmp(image: &DynamicImage) -> Result<Vec<u8>> {
    let rgba = image.to_rgba8();
    let mut out = Vec::new();
    let color = if image.color().has_alpha() {
        ExtendedColorType::Rgba8
    } else {
        ExtendedColorType::Rgb8
    };
    let rgb;
    let bytes: &[u8] = if image.color().has_alpha() {
        rgba.as_raw()
    } else {
        rgb = image.to_rgb8();
        rgb.as_raw()
    };
    BmpEncoder::new(&mut out)
        .encode(bytes, rgba.width(), rgba.height(), color)
        .map_err(Failure::damaged)?;
    Ok(out)
}

fn ico(image: &DynamicImage) -> Result<Vec<u8>> {
    let longest = image.width().max(image.height());
    let square = longest.min(256);
    let mut sizes: Vec<u32> = ICON_SIZES
        .into_iter()
        .filter(|size| *size < square)
        .collect();
    sizes.push(square);
    let frames = sizes
        .into_iter()
        .map(|size| {
            let scaled = edit::scaled_to_edge(image, size)?.into_rgba8();
            IcoFrame::as_png(
                &scaled,
                scaled.width(),
                scaled.height(),
                ExtendedColorType::Rgba8,
            )
            .map_err(Failure::damaged)
        })
        .collect::<Result<Vec<_>>>()?;
    let mut out = Vec::new();
    IcoEncoder::new(&mut out)
        .encode_images(&frames)
        .map_err(Failure::damaged)?;
    Ok(out)
}

fn creator(image: &DynamicImage, mime: MimeType, settings: &Settings) -> Result<Vec<u8>> {
    let (width, height) = image.dimensions();
    let (format, bytes) = if image.color().has_alpha() {
        (MemoryFormat::R8g8b8a8, image.to_rgba8().into_raw())
    } else {
        (MemoryFormat::R8g8b8, image.to_rgb8().into_raw())
    };
    let quality = if settings.lossless {
        100
    } else {
        settings.quality
    };
    glycin_block_on(async move {
        let mut creator = Creator::new(mime).await.map_err(Failure::damaged)?;
        creator
            .add_frame(width, height, format, bytes)
            .map_err(Failure::damaged)?;
        let _ = creator.set_encoding_quality(quality);
        let encoded = creator.create().await.map_err(Failure::damaged)?;
        Ok(encoded.data_full())
    })
}

pub fn embed(encoded: Vec<u8>, id: &str, metadata: &Metadata) -> Vec<u8> {
    if !matches!(id, "jpeg" | "png" | "webp") {
        return encoded;
    }
    let Ok(Some(mut container)) = DynImage::from_bytes(Bytes::from(encoded.clone())) else {
        return encoded;
    };
    container.set_icc_profile(metadata.icc.clone().map(Bytes::from));
    container.set_exif(metadata.exif.clone().map(Bytes::from));
    let mut out = Vec::with_capacity(encoded.len());
    match container.encoder().write_to(&mut out) {
        Ok(_) => out,
        Err(_) => encoded,
    }
}
