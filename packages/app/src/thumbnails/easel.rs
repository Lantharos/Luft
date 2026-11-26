use std::fs::File;
use std::io::Read;
use std::path::Path;

use image::{ImageFormat, ImageReader, Limits, RgbaImage};

use super::raster;

const MIME: &str = "application/vnd.lantharos.easel";
const EXTENSION: &str = "easel";
const PREVIEW: &str = "preview.png";
const MAX_PREVIEW_BYTES: u64 = 32 << 20;

pub(super) fn is_document(mime: &str, path: &Path) -> bool {
    mime == MIME
        || path
            .extension()
            .is_some_and(|extension| extension == EXTENSION)
}

pub(super) fn render(path: &Path, max: u32) -> Result<RgbaImage, String> {
    let file = File::open(path).map_err(|error| error.to_string())?;
    let mut archive = zip::ZipArchive::new(file).map_err(|error| error.to_string())?;
    let entry = archive
        .by_name(PREVIEW)
        .map_err(|error| error.to_string())?;
    if entry.size() > MAX_PREVIEW_BYTES {
        return Err("The preview is too large".to_string());
    }
    let mut data = Vec::with_capacity(entry.size() as usize);
    entry
        .take(MAX_PREVIEW_BYTES)
        .read_to_end(&mut data)
        .map_err(|error| error.to_string())?;
    let mut reader = ImageReader::with_format(std::io::Cursor::new(data), ImageFormat::Png);
    reader.limits(Limits::default());
    let image = reader.decode().map_err(|error| error.to_string())?;
    raster::fit(image, max)
}
