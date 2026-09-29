use std::fs;
use std::hash::{DefaultHasher, Hash, Hasher};
use std::path::{Path, PathBuf};
use std::time::UNIX_EPOCH;

use gio::prelude::*;
use image::imageops::FilterType;
use image::{DynamicImage, ImageDecoder, ImageReader};
use luft_app::portal::{self, Filter};

const EXTENSIONS: [&str; 4] = ["jpg", "jpeg", "png", "webp"];
const SIZE: u32 = 512;

fn failed(error: impl std::fmt::Display) -> String {
    error.to_string()
}

pub fn choose() -> Result<Option<PathBuf>, String> {
    let Some(uri) = portal::open_file(
        "Choose a Picture",
        Filter {
            name: "Images",
            patterns: EXTENSIONS
                .iter()
                .map(|extension| format!("*.{extension}"))
                .collect(),
        },
    )?
    else {
        return Ok(None);
    };
    let source = gio::File::for_uri(&uri)
        .path()
        .ok_or("This picture can't be opened")?;
    square(&source).map(Some)
}

fn decode(source: &Path) -> Result<DynamicImage, String> {
    let mut decoder = ImageReader::open(source)
        .map_err(failed)?
        .with_guessed_format()
        .map_err(failed)?
        .into_decoder()
        .map_err(failed)?;
    let orientation = decoder.orientation().map_err(failed)?;
    let mut image = DynamicImage::from_decoder(decoder).map_err(failed)?;
    image.apply_orientation(orientation);
    Ok(image)
}

fn square(source: &Path) -> Result<PathBuf, String> {
    let metadata = fs::metadata(source).map_err(failed)?;
    let mut hasher = DefaultHasher::new();
    source.hash(&mut hasher);
    metadata.len().hash(&mut hasher);
    metadata
        .modified()
        .ok()
        .and_then(|modified| modified.duration_since(UNIX_EPOCH).ok())
        .map(|modified| modified.as_secs())
        .hash(&mut hasher);
    let cache = dirs::cache_dir()
        .ok_or("There is no cache folder")?
        .join("com.lantharos.settings")
        .join("pictures");
    let target = cache.join(format!("{:016x}.png", hasher.finish()));
    if !target.exists() {
        let picture = decode(source)?.resize_to_fill(SIZE, SIZE, FilterType::Lanczos3);
        fs::create_dir_all(&cache).map_err(failed)?;
        picture.save(&target).map_err(failed)?;
    }
    Ok(target)
}
