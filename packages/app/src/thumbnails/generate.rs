use std::fs::File;
use std::io::Read;
use std::path::{Path, PathBuf};

use serde::Serialize;

use super::cache::{self, Source, ThumbnailSize};
use super::raster;
use super::system::{Failure, Registry};

const SNIFF_BYTES: usize = 4096;

#[derive(Serialize)]
pub(super) struct Ready {
    path: String,
    thumbnail: Option<String>,
    modified: i64,
}

pub(super) fn thumbnail(
    path: &Path,
    size: ThumbnailSize,
    registry: &Registry,
    cancelled: impl Fn() -> bool,
) -> Option<Ready> {
    let source = Source::new(path.to_path_buf())?;
    if source.is_cache_file() {
        return None;
    }
    let ready = |thumbnail: Option<PathBuf>| Ready {
        path: path.to_string_lossy().into_owned(),
        thumbnail: thumbnail.map(|path| path.to_string_lossy().into_owned()),
        modified: source.mtime,
    };
    if let Some(existing) = cache::lookup(&source, size) {
        return Some(ready(Some(existing)));
    }
    if cache::has_failed(&source) {
        return Some(ready(None));
    }
    let mime = content_type(&source.path);
    let generated = if raster::decodes(&mime, source.bytes) {
        raster::render(&source.path, size.pixels())
    } else {
        let Some(thumbnailer) = registry.find(&mime) else {
            return mime.starts_with("image/").then(|| ready(None));
        };
        match thumbnailer.run(&source, size, cancelled) {
            Ok(output) => {
                let image = image::open(&output).map_err(|error| error.to_string());
                let _ = std::fs::remove_file(&output);
                image.and_then(|image| raster::fit(image, size.pixels()))
            }
            Err(Failure::Cancelled) => return None,
            Err(Failure::Failed(error)) => Err(error),
        }
    };
    match generated.and_then(|image| cache::store(&source, size, &image)) {
        Ok(path) => Some(ready(Some(path))),
        Err(_) => {
            cache::mark_failed(&source);
            Some(ready(None))
        }
    }
}

fn content_type(path: &Path) -> String {
    let (guess, uncertain) = gio::content_type_guess(Some(path), None);
    if !uncertain {
        return guess.to_string();
    }
    let mut data = Vec::with_capacity(SNIFF_BYTES);
    let _ = File::open(path).and_then(|file| file.take(SNIFF_BYTES as u64).read_to_end(&mut data));
    gio::content_type_guess(Some(path), Some(data.as_slice()))
        .0
        .to_string()
}
