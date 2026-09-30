use std::fs::File;
use std::io::{Cursor, Read};
use std::os::fd::OwnedFd;

use fast_image_resize::{FilterType, ResizeAlg, ResizeOptions, Resizer};
use image::{DynamicImage, ImageDecoder, ImageReader, Limits, RgbImage};
use jpeg_encoder::{ColorType, Encoder};
use jxl_oxide::integration::JxlDecoder;

use crate::error::Error;

const MAX_FILE_BYTES: u64 = 128 << 20;
const MAX_DECODED_BYTES: u64 = 1 << 30;
const MAX_EDGE: u32 = 3840;
const QUALITY: u8 = 90;
const JXL_CODESTREAM: &[u8] = &[0xff, 0x0a];
const JXL_CONTAINER: &[u8] = b"\0\0\0\x0cJXL \r\n\x87\n";

pub fn prepare(source: OwnedFd) -> Result<Vec<u8>, Error> {
    let bytes = read(File::from(source))?;
    let image = decode(&bytes)?;
    encode(&image)
}

fn read(mut file: File) -> Result<Vec<u8>, Error> {
    let unreadable = || Error::invalid("The picture can't be read");
    if !file.metadata().map_err(|_| unreadable())?.is_file() {
        return Err(unreadable());
    }
    let mut bytes = Vec::new();
    (&mut file)
        .take(MAX_FILE_BYTES + 1)
        .read_to_end(&mut bytes)
        .map_err(|_| unreadable())?;
    if bytes.len() as u64 > MAX_FILE_BYTES {
        return Err(Error::unsupported_image("This picture is too large"));
    }
    Ok(bytes)
}

fn decode(bytes: &[u8]) -> Result<RgbImage, Error> {
    let unsupported = |_| Error::unsupported_image("This picture's format isn't supported");
    if bytes.starts_with(JXL_CODESTREAM) || bytes.starts_with(JXL_CONTAINER) {
        let mut decoder = JxlDecoder::new(bytes).map_err(unsupported)?;
        decoder.set_limits(limits()).map_err(unsupported)?;
        return shrink(decoder);
    }
    let mut reader = ImageReader::new(Cursor::new(bytes))
        .with_guessed_format()
        .expect("reading from memory can't fail");
    reader.limits(limits());
    shrink(reader.into_decoder().map_err(unsupported)?)
}

fn limits() -> Limits {
    let mut limits = Limits::default();
    limits.max_alloc = Some(MAX_DECODED_BYTES);
    limits
}

fn shrink(mut decoder: impl ImageDecoder) -> Result<RgbImage, Error> {
    let broken = |_| Error::unsupported_image("This picture couldn't be opened");
    if decoder.total_bytes() > MAX_DECODED_BYTES {
        return Err(Error::unsupported_image("This picture is too large"));
    }
    let orientation = decoder.orientation().map_err(broken)?;
    let full = DynamicImage::from_decoder(decoder)
        .map_err(broken)?
        .into_rgb8();
    let mut image = DynamicImage::ImageRgb8(scale_down(full));
    image.apply_orientation(orientation);
    Ok(image.into_rgb8())
}

fn scale_down(image: RgbImage) -> RgbImage {
    let (width, height) = image.dimensions();
    let long_edge = width.max(height);
    if long_edge <= MAX_EDGE {
        return image;
    }
    let scale = |edge: u32| {
        (f64::from(edge) * f64::from(MAX_EDGE) / f64::from(long_edge))
            .round()
            .max(1.0) as u32
    };
    let mut scaled = RgbImage::new(scale(width), scale(height));
    Resizer::new()
        .resize(
            &image,
            &mut scaled,
            &ResizeOptions::new().resize_alg(ResizeAlg::Convolution(FilterType::CatmullRom)),
        )
        .expect("both images are RGB8");
    scaled
}

fn encode(image: &RgbImage) -> Result<Vec<u8>, Error> {
    let edge = |length: u32| u16::try_from(length).expect("wallpapers are scaled below 65536 px");
    let mut jpeg = Vec::new();
    Encoder::new(&mut jpeg, QUALITY)
        .encode(
            image.as_raw(),
            edge(image.width()),
            edge(image.height()),
            ColorType::Rgb,
        )
        .map_err(|error| {
            eprintln!("Couldn't encode the wallpaper: {error}");
            Error::Failed("The picture couldn't be saved".into())
        })?;
    Ok(jpeg)
}
