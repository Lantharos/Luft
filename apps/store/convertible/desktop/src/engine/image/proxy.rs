use std::fs;
use std::path::Path;

use image::DynamicImage;

use super::decode;
use super::edit;
use super::encode::{self, Settings};
use crate::engine::error::Result;
use crate::engine::formats::Format;

const PROXY_QUALITY: u8 = 88;

pub fn write(source: &Path, format: &Format, edge: u32, out: &Path) -> Result<(u32, u32)> {
    let decoded = decode::decode(source, format)?;
    let dimensions = (decoded.image.width(), decoded.image.height());
    store(&decoded.image, edge, out)?;
    Ok(dimensions)
}

pub fn store(image: &DynamicImage, edge: u32, out: &Path) -> Result<()> {
    let scaled = edit::scaled_to_edge(image, edge)?;
    let id = "webp";
    let settings = Settings {
        quality: PROXY_QUALITY,
        lossless: false,
    };
    fs::write(out, encode::encode(&scaled, id, &settings)?)?;
    Ok(())
}
